import { supabase } from '../lib/supabase'
import type { Reuniao } from '../types'
import { MOCK_REUNIOES } from '../data/mock'

const USE_MOCK = false

export const reunioesService = {
  async getByContato(contatoId: string): Promise<Reuniao[]> {
    if (USE_MOCK) return MOCK_REUNIOES.filter((r) => r.contato_id === contatoId)
    const { data, error } = await supabase
      .from('reunioes')
      .select('*, contato:contatos(id,nome,empresa_nome,tipo)')
      .eq('contato_id', contatoId)
      .order('data', { ascending: false })
    if (error) throw error
    return data as Reuniao[]
  },

  async create(payload: Omit<Reuniao, 'id' | 'user_id' | 'created_at'>): Promise<Reuniao> {
    if (USE_MOCK) {
      return { ...payload, id: Math.random().toString(36).slice(2), user_id: 'u1', created_at: new Date().toISOString() }
    }
    const { data, error } = await supabase.from('reunioes').insert(payload).select().single()
    if (error) throw error
    return data as Reuniao
  },
}
