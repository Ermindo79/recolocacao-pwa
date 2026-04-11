import { supabase } from '../lib/supabase'
import type { DashboardData, Contato, Reuniao } from '../types'
import { MOCK_DASHBOARD } from '../data/mock'

const USE_MOCK = false

export const dashboardService = {
  async get(): Promise<DashboardData> {
    if (USE_MOCK) return MOCK_DASHBOARD

    try {
      const hoje = new Date().toISOString().split('T')[0]
      const agora = new Date().toISOString()
      const seteDias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const inicioProcesso = new Date('2026-02-05').toISOString()
      const diasEmProcesso = Math.floor(
        (Date.now() - new Date(inicioProcesso).getTime()) / (1000 * 60 * 60 * 24)
      )

      const { data: followupsRaw, error: e1 } = await supabase
        .from('contatos')
        .select('*, empresa:empresas(*), ponte_contato:contatos!ponte_contato_id(id,nome)')
        .eq('arquivado', false)
        .not('proximo_passo_data', 'is', null)
        .lte('proximo_passo_data', hoje)
        .order('proximo_passo_data', { ascending: true })

      if (e1) { console.error('ERRO e1:', e1); throw e1 }

      const { data: reunioesRaw, error: e2 } = await supabase
        .from('reunioes')
        .select('*, contato:contatos(id, nome, empresa_nome)')
        .gte('data', agora)
        .lte('data', seteDias)
        .order('data', { ascending: true })
        .limit(5)

      if (e2) { console.error('ERRO e2:', e2); throw e2 }

      const { data: friosRaw, error: e3 } = await supabase
        .from('v_contatos_calor')
        .select('*')
        .eq('arquivado', false)
        .in('calor', ['frio', 'sem_contato'])
        .order('dias_sem_contato', { ascending: false })
        .limit(5)

      if (e3) { console.error('ERRO e3:', e3); throw e3 }

      const { count: contatosAtivos } = await supabase
        .from('contatos')
        .select('*', { count: 'exact', head: true })
        .eq('arquivado', false)
        .in('pipeline_stage', ['acionado', 'reuniao', 'followup', 'oportunidade'])

      const inicioSemana = new Date()
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
      const { count: reunioesSemana } = await supabase
        .from('reunioes')
        .select('*', { count: 'exact', head: true })
        .gte('data', inicioSemana.toISOString())

      const { count: followupsPendentes } = await supabase
        .from('contatos')
        .select('*', { count: 'exact', head: true })
        .eq('arquivado', false)
        .not('proximo_passo_data', 'is', null)
        .lte('proximo_passo_data', hoje)

      return {
        followups_vencidos: (followupsRaw ?? []) as Contato[],
        reunioes_proximas: (reunioesRaw ?? []) as (Reuniao & {
          contato: Pick<Contato, 'id' | 'nome' | 'empresa_nome'>
        })[],
        contatos_frios: (friosRaw ?? []) as Contato[],
        metricas: {
          contatos_ativos: contatosAtivos ?? 0,
          reunioes_semana: reunioesSemana ?? 0,
          followups_pendentes: followupsPendentes ?? 0,
          dias_em_processo: diasEmProcesso,
        },
      }
    } catch (err) {
      console.error('ERRO DASHBOARD:', err)
      throw err
    }
  },
}