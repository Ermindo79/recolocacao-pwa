import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contatosService } from '../services/contatos.service'
import { reunioesService } from '../services/reunioes.service'
import { dashboardService } from '../services/dashboard.service'
import type { Contato, Reuniao } from '../types'

export const KEYS = {
  dashboard: ['dashboard'] as const,
  contatos: ['contatos'] as const,
  contato: (id: string) => ['contatos', id] as const,
  reunioes: (contatoId: string) => ['reunioes', contatoId] as const,
}

export function useDashboard() {
  return useQuery({ queryKey: KEYS.dashboard, queryFn: dashboardService.get, staleTime: 1000 * 60 * 2 })
}

export function useContatos() {
  return useQuery({ queryKey: KEYS.contatos, queryFn: contatosService.getAll })
}

export function useContato(id: string) {
  return useQuery({ queryKey: KEYS.contato(id), queryFn: () => contatosService.getById(id), enabled: !!id })
}

export function useReunioes(contatoId: string) {
  return useQuery({ queryKey: KEYS.reunioes(contatoId), queryFn: () => reunioesService.getByContato(contatoId), enabled: !!contatoId })
}

export function useUpdateStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: Contato['pipeline_stage'] }) =>
      contatosService.updateStage(id, stage),
    onMutate: async ({ id, stage }) => {
      await qc.cancelQueries({ queryKey: KEYS.contatos })
      const prev = qc.getQueryData<Contato[]>(KEYS.contatos)
      qc.setQueryData<Contato[]>(KEYS.contatos, (old) =>
        old?.map((c) => (c.id === id ? { ...c, pipeline_stage: stage } : c)) ?? []
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEYS.contatos, ctx.prev)
    },
    onSettled: () => { qc.invalidateQueries({ queryKey: KEYS.contatos }) },
  })
}

export function useCreateReuniao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<Reuniao, 'id' | 'user_id' | 'created_at'>) =>
      reunioesService.create(payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.reunioes(vars.contato_id) })
      qc.invalidateQueries({ queryKey: KEYS.contatos })
      qc.invalidateQueries({ queryKey: KEYS.dashboard })
    },
  })
}
