export type ContactType = 'empresa' | 'consultoria_estrategia' | 'conselho' | 'headhunter'
export type ContactHeat = 'quente' | 'morno' | 'frio' | 'sem_contato' | 'agendado'
export type MeetingFormat = 'ligacao' | 'cafe' | 'video' | 'mensagem' | 'presencial'
export type MeetingTone = 'muito_positivo' | 'aberto' | 'neutro' | 'frio'
export type PipelineStage =
  | 'mapeado'
  | 'acionado'
  | 'reuniao'
  | 'followup'
  | 'oportunidade'
  | 'arquivado'

export interface Empresa {
  id: string
  user_id: string
  nome: string
  setor?: string
  notas?: string
  created_at: string
}

export interface Contato {
  id: string
  user_id: string
  nome: string
  empresa_nome?: string
  empresa_id?: string
  empresa?: Empresa
  cargo?: string
  tipo: ContactType
  canal?: string
  contato_primario: boolean
  ponte_contato_id?: string
  ponte_contato?: Pick<Contato, 'id' | 'nome'>
  notas?: string
  pipeline_stage: PipelineStage
  stage_updated_at: string
  proximo_passo?: string
  proximo_passo_data?: string
  ultima_interacao_at?: string
  arquivado: boolean
  created_at: string
  updated_at: string
  // computed
  calor?: ContactHeat
  dias_sem_contato?: number
  followup_vencido?: boolean
}

export interface Reuniao {
  id: string
  user_id: string
  contato_id: string
  contato?: Pick<Contato, 'id' | 'nome' | 'empresa_nome' | 'tipo'>
  data: string
  formato?: MeetingFormat
  tom?: MeetingTone
  conteudo?: string
  pendencias?: string
  proximo_passo: string
  proximo_passo_data: string
  created_at: string
}

export interface Narrativa {
  id: string
  user_id: string
  posicionamento?: string
  narrativa_saida?: string
  contextos: string[]
  setores: string[]
  frases_aprovadas: string[]
  versao: number
  updated_at: string
}

export interface DashboardData {
  followups_vencidos: Contato[]
  reunioes_proximas: (Reuniao & { contato: Pick<Contato, 'id' | 'nome' | 'empresa_nome'> })[]
  contatos_frios: Contato[]
  metricas: {
    contatos_ativos: number
    reunioes_semana: number
    followups_pendentes: number
    dias_em_processo: number
  }
}

export type AppError = {
  message: string
  code?: string
}
