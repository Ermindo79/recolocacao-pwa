import { formatDistanceToNow, differenceInDays, isPast, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ContactHeat, Contato, PipelineStage } from '../types'
import clsx from 'clsx'

export { clsx }

export function calcularCalor(ultimaInteracaoAt?: string): ContactHeat {
  if (!ultimaInteracaoAt) return 'sem_contato'
  const dias = differenceInDays(new Date(), parseISO(ultimaInteracaoAt))
  if (dias < 5) return 'quente'
  if (dias < 14) return 'morno'
  return 'frio'
}

export function diasSemContato(ultimaInteracaoAt?: string): number {
  if (!ultimaInteracaoAt) return 999
  return differenceInDays(new Date(), parseISO(ultimaInteracaoAt))
}

export function followupVencido(data?: string): boolean {
  if (!data) return false
  return isPast(parseISO(data))
}

export function formatarData(iso: string): string {
  return format(parseISO(iso), "dd/MM", { locale: ptBR })
}

export function formatarDataCompleta(iso: string): string {
  return format(parseISO(iso), "dd 'de' MMMM", { locale: ptBR })
}

export function tempoAtras(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true })
}

export function diasRestantes(iso: string): number {
  return differenceInDays(parseISO(iso), new Date())
}

export function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export const CALOR_CONFIG: Record<ContactHeat, { label: string; className: string }> = {
  quente:      { label: 'Quente',      className: 'bg-[#FDF0EE] text-[#C0392B]' },
  morno:       { label: 'Morno',       className: 'bg-[#FDF5E6] text-[#9A6B1A]' },
  frio:        { label: 'Frio',        className: 'bg-surface-2 text-ink-3' },
  sem_contato: { label: 'Sem contato', className: 'bg-surface-2 text-ink-4' },
  agendado:    { label: 'Agendado',    className: 'bg-accent-lt text-accent' },
}

export const TIPO_CONFIG: Record<string, { label: string; className: string }> = {
  headhunter:  { label: 'Headhunter',  className: 'bg-[#EBF0F7] text-[#1C3D5A]' },
  consultoria: { label: 'Consultoria', className: 'bg-[#EBF5F0] text-[#1A6B45]' },
  empresa:     { label: 'Empresa',     className: 'bg-surface-2 text-ink-2' },
}

export const STAGE_LABELS: Record<PipelineStage, string> = {
  mapeado:      'Mapeado',
  acionado:     'Acionado',
  reuniao:      'Reunião',
  followup:     'Follow-up',
  oportunidade: 'Oportunidade',
  arquivado:    'Arquivado',
}

export const STAGE_ORDER: PipelineStage[] = [
  'mapeado', 'acionado', 'reuniao', 'followup', 'oportunidade', 'arquivado',
]

export function ordenarPorUrgencia(contatos: Contato[]): Contato[] {
  return [...contatos].sort((a, b) => {
    if (a.followup_vencido && !b.followup_vencido) return -1
    if (!a.followup_vencido && b.followup_vencido) return 1
    return (b.dias_sem_contato ?? 0) - (a.dias_sem_contato ?? 0)
  })
}

export function saudacao(nome: string): string {
  const h = new Date().getHours()
  if (h < 12) return `Bom dia, ${nome.split(' ')[0]}.`
  if (h < 18) return `Boa tarde, ${nome.split(' ')[0]}.`
  return `Boa noite, ${nome.split(' ')[0]}.`
}