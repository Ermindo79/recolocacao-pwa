import { supabase } from '../lib/supabase'
import type { Contato } from '../types'
import { MOCK_CONTATOS } from '../data/mock'

const USE_MOCK = false

export const contatosService = {
  async getAll(): Promise<Contato[]> {
    if (USE_MOCK) return MOCK_CONTATOS.filter((c) => !c.arquivado)
    const { data, error } = await supabase
      .from('v_contatos_calor')
      .select('*')
      .eq('arquivado', false)
      .order('dias_sem_contato', { ascending: false })
    if (error) throw error
    return data as Contato[]
  },

  async getById(id: string): Promise<Contato> {
    if (USE_MOCK) {
      const c = MOCK_CONTATOS.find((c) => c.id === id)
      if (!c) throw new Error('Contato não encontrado')
      return c
    }
    const { data, error } = await supabase
      .from('v_contatos_calor')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Contato
  },

  async create(payload: Omit<Contato, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'calor' | 'dias_sem_contato' | 'followup_vencido'>): Promise<Contato> {
    if (USE_MOCK) throw new Error('Mock mode — use Supabase para criar contatos')
    const { data, error } = await supabase.from('contatos').insert(payload).select().single()
    if (error) throw error
    return data as Contato
  },

  async updateStage(id: string, stage: Contato['pipeline_stage']): Promise<void> {
    if (USE_MOCK) return
    const { error } = await supabase
      .from('contatos')
      .update({ pipeline_stage: stage, stage_updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async update(id: string, payload: Partial<Contato>): Promise<void> {
    if (USE_MOCK) return
    const { error } = await supabase.from('contatos').update(payload).eq('id', id)
    if (error) throw error
  },

  async archive(id: string): Promise<void> {
    if (USE_MOCK) return
    const { error } = await supabase.from('contatos').update({ arquivado: true }).eq('id', id)
    if (error) throw error
  },
}
