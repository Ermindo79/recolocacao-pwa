import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks'
import { PageWrapper, FAB } from '../components/layout'
import {
  MetricCardSkeleton, ContactCardSkeleton,
  SectionHeader, ErrorState, EmptyState
} from '../components/ui'
import { FollowUpCard } from '../components/contato/ContatoCard'
import { ContatoCard } from '../components/contato/ContatoCard'
import { saudacao, formatarDataCompleta, diasRestantes, clsx } from '../utils'
import type { Contato } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useDashboard()

  const nomeUsuario = 'Ermindo'

  return (
    <PageWrapper>
      {/* Header */}
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
        {/* Métricas */}
        <div>
          <SectionHeader label="Esta semana" />
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => <MetricCardSkeleton key={i} />)}
            </div>
          ) : error ? null : data ? (
            <div className="grid grid-cols-3 gap-2">
              <MetricCard
                value={data.metricas.contatos_ativos}
                label="Contatos"
              />
              <MetricCard
                value={data.metricas.reunioes_semana}
                label="Reuniões"
              />
              <MetricCard
                value={data.metricas.followups_pendentes}
                label="Follow-ups"
                alert={data.metricas.followups_pendentes > 0}
              />
            </div>
          ) : null}
        </div>

        {/* Follow-ups vencidos */}
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

        {/* Reuniões próximas */}
        {data && data.reunioes_proximas.length > 0 && (
          <div>
            <SectionHeader label="Próximas 48h" count={data.reunioes_proximas.length} />
            <div className="space-y-2">
              {data.reunioes_proximas.map((r) => {
                const dias = diasRestantes(r.proximo_passo_data ?? r.data)
                return (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/contatos/${r.contato_id}`)}
                    className="w-full text-left bg-accent-lt border border-[rgba(28,61,90,0.12)] rounded-xl px-3.5 py-3 active:opacity-80 transition-opacity"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-accent truncate">
                          {r.contato?.nome}
                        </p>
                        <p className="text-[11px] text-accent/60 mt-0.5">
                          {r.contato?.empresa_nome}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-accent shrink-0">
                        {dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `em ${dias} dias`}
                      </span>
                    </div>
                    {r.proximo_passo && (
                      <p className="text-[11px] text-accent/70 mt-1.5 truncate">{r.proximo_passo}</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Silêncios preocupantes */}
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

        {/* Empty state dia 1 */}
        {data && !isLoading &&
          data.followups_vencidos.length === 0 &&
          data.reunioes_proximas.length === 0 &&
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

      {/* FAB */}
      <FAB onClick={() => navigate('/reuniao/nova')} label="Registrar reunião" />
    </PageWrapper>
  )
}

// ─── Metric card ──────────────────────────────────────────────────────────────
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
