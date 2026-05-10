import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks'
import { PageWrapper, FAB } from '../components/layout'
import {
  MetricCardSkeleton, ContactCardSkeleton,
  SectionHeader, ErrorState, EmptyState
} from '../components/ui'
import { FollowUpCard } from '../components/contato/ContatoCard'
import { ContatoCard } from '../components/contato/ContatoCard'
import { saudacao, diasRestantes, clsx } from '../utils'
import type { EventoAgenda, PendenciaAberta } from '../types'

const FORMATO_COR: Record<string, { bg: string; text: string; dot: string }> = {
  ligacao:    { bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]', dot: 'bg-[#378ADD]' },
  mensagem:   { bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]', dot: 'bg-[#378ADD]' },
  video:      { bg: 'bg-[#EEEDFE]', text: 'text-[#3C3489]', dot: 'bg-[#7F77DD]' },
  cafe:       { bg: 'bg-[#EAF3DE]', text: 'text-[#27500A]', dot: 'bg-[#639922]' },
  presencial: { bg: 'bg-[#EAF3DE]', text: 'text-[#27500A]', dot: 'bg-[#639922]' },
  linkedin:   { bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]', dot: 'bg-[#378ADD]' },
  email:      { bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]', dot: 'bg-[#378ADD]' },
  default:    { bg: 'bg-accent-lt',  text: 'text-accent',    dot: 'bg-accent' },
}

const FORMATO_LABEL: Record<string, string> = {
  ligacao:    'Ligação',
  cafe:       'Café',
  video:      'Vídeo',
  mensagem:   'Mensagem',
  presencial: 'Presencial',
}

function getCor(evento: EventoAgenda) {
  if (evento.formato && FORMATO_COR[evento.formato]) return FORMATO_COR[evento.formato]
  if (evento.tipo === 'reuniao') return FORMATO_COR.video
  return FORMATO_COR.default
}

function getLabel(evento: EventoAgenda) {
  const fmtLabel = evento.formato ? FORMATO_LABEL[evento.formato] : null
  if (evento.tipo === 'reuniao') return fmtLabel ? `Reunião · ${fmtLabel}` : 'Reunião'
  return fmtLabel ? `Próximo passo · ${fmtLabel}` : 'Próximo passo'
}

function EventoCard({ evento }: { evento: EventoAgenda }) {
  const navigate = useNavigate()
  const cor = getCor(evento)
  const label = getLabel(evento)
  const dias = diasRestantes(evento.data)
  const diasLabel = dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `em ${dias} dias`

  return (
    <button
      onClick={() => navigate(`/contatos/${evento.contato_id}`)}
      className={clsx('w-full text-left rounded-xl px-3.5 py-3 border border-[rgba(26,26,24,0.08)] active:opacity-80 transition-opacity', cor.bg)}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={clsx('w-2 h-2 rounded-full shrink-0', cor.dot)} />
        <span className={clsx('text-[10px] font-medium uppercase tracking-[0.06em]', cor.text)}>
          {label}
        </span>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={clsx('text-[13px] font-medium truncate', cor.text)}>{evento.contato_nome}</p>
          {evento.empresa_nome && (
            <p className={clsx('text-[11px] mt-0.5 opacity-70', cor.text)}>{evento.empresa_nome}</p>
          )}
          {evento.descricao && evento.tipo === 'proximo_passo' && (
            <p className={clsx('text-[11px] mt-1 opacity-80 line-clamp-2', cor.text)}>{evento.descricao}</p>
          )}
        </div>
        <span className={clsx('text-[11px] font-medium shrink-0', cor.text)}>{diasLabel}</span>
      </div>
    </button>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useDashboard()

  const nomeUsuario = 'Ermindo'

  return (
    <PageWrapper>
      <div className="px-4 pt-5 pb-3 bg-white border-b border-[rgba(26,26,24,0.06)]">
        <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-4 mb-0.5">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-[22px] font-medium text-ink leading-tight">
          {saudacao(nomeUsuario)}
        </h1>
        {data && data.followups_vencidos.length > 0 && (
          <p className="text-[13px] text-ink-3 mt-1">
            {data.followups_vencidos.length === 1
              ? '1 contato precisa de atenção hoje.'
              : `${data.followups_vencidos.length} contatos precisam de atenção hoje.`}
          </p>
        )}
      </div>

      <div className="px-4 py-4 space-y-5 pb-24">
        <div>
          <SectionHeader label="Esta semana" />
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => <MetricCardSkeleton key={i} />)}
            </div>
          ) : error ? null : data ? (
            <div className="grid grid-cols-3 gap-2">
              <MetricCard value={data.metricas.contatos_ativos} label="Contatos na base" />
              <MetricCard value={data.metricas.reunioes_agendadas} label="Reuniões" />
              <MetricCard value={data.metricas.followups_agendados} label="Follow-ups" alert={data.metricas.followups_agendados > 0} />
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div>
            <SectionHeader label="Atenção" />
            <div className="space-y-2">
              <ContactCardSkeleton />
              <ContactCardSkeleton />
            </div>
          </div>
        ) : error ? (
          <ErrorState message="Não foi possível carregar os dados." onRetry={refetch} />
        ) : data && data.followups_vencidos.length > 0 ? (
          <div>
            <SectionHeader label="Atenção" count={data.followups_vencidos.length} />
            <div className="space-y-2">
              {data.followups_vencidos.map((c) => (
                <FollowUpCard key={c.id} contato={c} />
              ))}
            </div>
          </div>
        ) : data ? (
          <div className="bg-[#EBF5F0] border border-[rgba(26,107,69,0.15)] rounded-xl px-3.5 py-3">
            <p className="text-[13px] font-medium text-[#1A6B45]">Nenhum follow-up pendente.</p>
            <p className="text-[11px] text-[#1A6B45]/70 mt-0.5">Processo em dia.</p>
          </div>
        ) : null}

        {data && data.proximos_agenda.length > 0 && (
          <div>
            <SectionHeader label="Próximos 7 dias" count={data.proximos_agenda.length} />
            <div className="space-y-2">
              {data.proximos_agenda.map((evento) => (
                <EventoCard key={evento.id} evento={evento} />
              ))}
            </div>
          </div>
        )}

{data && data.pendencias_abertas.length > 0 && (
          <div>
            <SectionHeader label="Pendências em aberto" count={data.pendencias_abertas.length} />
            <div className="space-y-2">
              {data.pendencias_abertas.map((p) => (
                <PendenciaCard key={p.contato_id} pendencia={p} />
              ))}
            </div>
          </div>
        )}

        {data && data.contatos_frios.length > 0 && (
          <div>
            <SectionHeader label="Silêncios" count={data.contatos_frios.length} />
            <div className="space-y-2">
              {data.contatos_frios.map((c) => (
                <ContatoCard key={c.id} contato={c} showPrioridade={false} />
              ))}
            </div>
          </div>
        )}

        {data && !isLoading &&
          data.followups_vencidos.length === 0 &&
          data.proximos_agenda.length === 0 &&
          data.contatos_frios.length === 0 && (
          <EmptyState
            title="Processo ainda sem contatos."
            subtitle="Adicione o primeiro headhunter para começar."
            action={
              <button
                onClick={() => navigate('/contatos')}
                className="text-[13px] font-medium text-accent underline underline-offset-2"
              >
                Adicionar contato →
              </button>
            }
          />
        )}
      </div>

      <FAB onClick={() => navigate('/reuniao/nova')} label="Registrar reunião" />
    </PageWrapper>
  )
}

function MetricCard({ value, label, alert }: { value: number; label: string; alert?: boolean }) {
  return (
    <div className="bg-surface-2 rounded-xl p-3">
      <p className={clsx('font-serif text-[26px] leading-none mb-0.5', alert ? 'text-[#9A6B1A]' : 'text-ink')}>
        {value}
      </p>
      <p className="text-[10px] text-ink-4 leading-tight">{label}</p>
    </div>
  )
}

function PendenciaCard({ pendencia }: { pendencia: PendenciaAberta }) {
  const navigate = useNavigate()
  const data = pendencia.data
    ? new Date(pendencia.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    : ''

  return (
    <button
      onClick={() => navigate(`/contatos/${pendencia.contato_id}`)}
      className="w-full text-left bg-white border border-[rgba(26,26,24,0.10)] rounded-xl px-3.5 py-3 active:opacity-80 transition-opacity"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-[13px] font-medium text-ink truncate">{pendencia.contato_nome}</p>
        <span className="text-[10px] text-ink-4 shrink-0">{data}</span>
      </div>
      {pendencia.empresa_nome && (
        <p className="text-[11px] text-ink-3 mb-2">{pendencia.empresa_nome}</p>
      )}
      <div className="bg-[#FDF5E6] border border-[rgba(154,107,26,0.15)] rounded-lg px-2.5 py-1.5">
        <p className="text-[11px] text-[#9A6B1A]">{pendencia.pendencia}</p>
      </div>
    </button>
  )
}
