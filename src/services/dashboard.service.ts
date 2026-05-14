import { supabase } from '../lib/supabase'
import type { DashboardData, Contato, Reuniao, EventoAgenda, MeetingFormat, PendenciaAberta } from '../types'
import { MOCK_DASHBOARD } from '../data/mock'

const USE_MOCK = false

function detectarFormato(texto: string): MeetingFormat | undefined {
  const t = texto.toLowerCase()
  if (/caf[eé]|presencial|almo[cç]o|jantar/.test(t)) return 'cafe'
  if (/liga[cç][aã]o|ligar|telefone/.test(t)) return 'ligacao'
  if (/v[ií]deo|video|call|zoom|teams|meet/.test(t)) return 'video'
  if (/mensagem|email|e-mail|whatsapp|linkedin/.test(t)) return 'mensagem'
  return undefined
}

export const dashboardService = {
  async get(): Promise<DashboardData> {
    if (USE_MOCK) return { ...MOCK_DASHBOARD, proximos_agenda: [] }

    try {
      const hoje = new Date().toLocaleDateString('sv-SE') // sv-SE retorna formato YYYY-MM-DD no timezone local
      const agora = new Date().toISOString()
      const seteDias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const seteDiasDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const inicioProcesso = new Date('2026-02-05').toISOString()
      const diasEmProcesso = Math.floor(
        (Date.now() - new Date(inicioProcesso).getTime()) / (1000 * 60 * 60 * 24)
      )

      const { data: followupsRaw, error: e1 } = await supabase
        .from('contatos')
        .select('*, empresa:empresas(*), ponte_contato:contatos!ponte_contato_id(id,nome)')
        .eq('arquivado', false)
        .not('proximo_passo_data', 'is', null)
        .lt('proximo_passo_data', hoje)
        .order('proximo_passo_data', { ascending: true })

      if (e1) { console.error('ERRO e1:', e1); throw e1 }

      const { data: reunioesRaw, error: e2 } = await supabase
        .from('reunioes')
        .select('*, contato:contatos(id, nome, empresa_nome)')
        .gte('data', agora)
        .lte('data', seteDias)
        .order('data', { ascending: true })
        .limit(10)

      if (e2) { console.error('ERRO e2:', e2); throw e2 }

      const { data: friosRaw, error: e3 } = await supabase
        .from('v_contatos_calor')
        .select('*')
        .eq('arquivado', false)
        .in('calor', ['frio', 'sem_contato'])
        .neq('pipeline_stage', 'mapeado')
        .order('dias_sem_contato', { ascending: false })
        .limit(5)

      if (e3) { console.error('ERRO e3:', e3); throw e3 }

      const { data: proximosPassosRaw, error: e4 } = await supabase
        .from('contatos')
        .select('id, nome, empresa_nome, proximo_passo, proximo_passo_data')
        .eq('arquivado', false)
        .not('proximo_passo_data', 'is', null)
        .gte('proximo_passo_data', hoje)
        .lte('proximo_passo_data', seteDiasDate)
        .order('proximo_passo_data', { ascending: true })

      if (e4) { console.error('ERRO e4:', e4); throw e4 }

      const idsComReuniao = new Set(
        (reunioesRaw ?? []).map((r: any) => r.contato_id)
      )

      const eventosReuniao: EventoAgenda[] = (reunioesRaw ?? []).map((r: any) => ({
        id: `reuniao-${r.id}`,
        tipo: 'reuniao' as const,
        contato_id: r.contato_id,
        contato_nome: r.contato?.nome ?? '',
        empresa_nome: r.contato?.empresa_nome ?? '',
        data: r.data,
        formato: r.formato ?? undefined,
        descricao: r.conteudo ?? undefined,
      }))

      const eventosProximoPasso: EventoAgenda[] = (proximosPassosRaw ?? [])
        .filter((c: any) => !idsComReuniao.has(c.id))
        .map((c: any) => ({
          id: `pp-${c.id}`,
          tipo: 'proximo_passo' as const,
          contato_id: c.id,
          contato_nome: c.nome,
          empresa_nome: c.empresa_nome ?? '',
          data: c.proximo_passo_data,
          formato: c.proximo_passo ? detectarFormato(c.proximo_passo) : undefined,
          descricao: c.proximo_passo ?? undefined,
        }))

      const proximosAgenda: EventoAgenda[] = [...eventosReuniao, ...eventosProximoPasso]
        .sort((a, b) => a.data.localeCompare(b.data))

      const { count: contatosAtivos } = await supabase
        .from('contatos')
        .select('*', { count: 'exact', head: true })
        .eq('arquivado', false)
        .in('pipeline_stage', ['acionado', 'reuniao', 'followup', 'oportunidade'])

      // Reuniões = futuras com formato presencial/café/vídeo
      const { count: reunioesAgendadas } = await supabase
        .from('reunioes')
        .select('*', { count: 'exact', head: true })
        .gte('data', agora)
        .in('formato', ['cafe', 'presencial', 'video'])

      // Follow-ups via reunioes futuras com formato ligacao/mensagem
      const { count: followupsViaReuniao } = await supabase
        .from('reunioes')
        .select('*', { count: 'exact', head: true })
        .gte('data', agora)
        .in('formato', ['ligacao', 'mensagem'])

      const { data: contatosComReuniaoFutura } = await supabase
        .from('reunioes')
        .select('contato_id')
        .gte('data', agora)

      const idsComReuniaoFutura = (contatosComReuniaoFutura ?? []).map((r: { contato_id: string }) => r.contato_id)

      let proximosPassosSemReuniaoQuery = supabase
        .from('contatos')
        .select('*', { count: 'exact', head: true })
        .eq('arquivado', false)
        .not('proximo_passo_data', 'is', null)
        .gte('proximo_passo_data', hoje)

      if (idsComReuniaoFutura.length > 0) {
        proximosPassosSemReuniaoQuery = proximosPassosSemReuniaoQuery
          .not('id', 'in', `(${idsComReuniaoFutura.join(',')})`)
      }

      const { count: followupsViaProximoPasso } = await proximosPassosSemReuniaoQuery

      const followupsAgendados = (followupsViaReuniao ?? 0) + (followupsViaProximoPasso ?? 0)

      const { count: followupsPendentes } = await supabase
        .from('contatos')
        .select('*', { count: 'exact', head: true })
        .eq('arquivado', false)
        .not('proximo_passo_data', 'is', null)
        .lt('proximo_passo_data', hoje)

      // Buscar contatos com pendências em aberto
      const { data: pendenciasRaw, error: e5 } = await supabase
        .from('reunioes')
        .select('contato_id, id, data, pendencias, contato:contatos(id, nome, empresa_nome)')
        .not('pendencias', 'is', null)
        .neq('pendencias', '')
        .neq('pendencia_concluida', true)
        .order('data', { ascending: false })

      if (e5) { console.error('ERRO e5:', e5); throw e5 }

      // Pegar a pendência mais recente por contato
      const pendenciasMap = new Map<string, PendenciaAberta>()
      ;(pendenciasRaw ?? []).forEach((r: any) => {
        if (!pendenciasMap.has(r.contato_id)) {
          pendenciasMap.set(r.contato_id, {
            contato_id: r.contato_id,
            contato_nome: r.contato?.nome ?? '',
            empresa_nome: r.contato?.empresa_nome ?? '',
            data: r.data,
            reuniao_id: r.id,
            pendencia: r.pendencias,
          })
        }
      })
      const pendenciasAbertas = Array.from(pendenciasMap.values())

      return {
        followups_vencidos: (followupsRaw ?? []) as Contato[],
        reunioes_proximas: (reunioesRaw ?? []) as (Reuniao & {
          contato: Pick<Contato, 'id' | 'nome' | 'empresa_nome'>
        })[],
        proximos_agenda: proximosAgenda,
        pendencias_abertas: pendenciasAbertas,
        contatos_frios: (friosRaw ?? []) as Contato[],
        metricas: {
          contatos_ativos: contatosAtivos ?? 0,
          reunioes_semana: 0,
          followups_pendentes: followupsPendentes ?? 0,
          dias_em_processo: diasEmProcesso,
          reunioes_agendadas: reunioesAgendadas ?? 0,
          followups_agendados: followupsAgendados,
        },
      }
    } catch (err) {
      console.error('ERRO DASHBOARD:', err)
      throw err
    }
  },
}
