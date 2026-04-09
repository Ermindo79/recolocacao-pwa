import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContatos, useUpdateStage } from '../hooks'
import { PageWrapper, FAB } from '../components/layout'
import { ContactCardSkeleton, ErrorState, Avatar, CalorBadge } from '../components/ui'
import { useUIStore } from '../stores/ui.store'
import { clsx, STAGE_LABELS, STAGE_ORDER, diasSemContato } from '../utils'
import type { Contato, PipelineStage } from '../types'

const STAGE_ALERT_DAYS: Record<PipelineStage, number> = {
  mapeado: 7, acionado: 5, reuniao: 3, followup: 7, oportunidade: 14, arquivado: 999,
}

export default function PipelinePage() {
  const navigate = useNavigate()
  const { data: contatos = [], isLoading, error, refetch } = useContatos()
  const updateStage = useUpdateStage()
  const { addToast } = useUIStore()
  const [selected, setSelected] = useState<Contato | null>(null)

  const ativos = contatos.filter(c => c.pipeline_stage !== 'arquivado')

  async function moverPara(contato: Contato, novoStage: PipelineStage) {
    setSelected(null)
    try {
      await updateStage.mutateAsync({ id: contato.id, stage: novoStage })
      addToast(`${contato.nome.split(' ')[0]} movido para ${STAGE_LABELS[novoStage]}`)
    } catch {
      addToast('Erro ao mover contato.', 'error')
    }
  }

  return (
    <PageWrapper>
      <div className="px-4 pt-5 pb-3 bg-white border-b border-[rgba(26,26,24,0.06)]">
        <h1 className="text-[22px] font-medium text-ink">Pipeline</h1>
        <p className="text-[12px] text-ink-4 mt-0.5">{ativos.length} contatos ativos</p>
      </div>

      {isLoading ? (
        <div className="px-4 py-4 space-y-2">
          {[...Array(4)].map((_, i) => <ContactCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message="Não foi possível carregar o pipeline." onRetry={refetch} />
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-3 px-4 py-4 min-w-max pb-24">
            {STAGE_ORDER.map((stage) => {
              const cards = ativos.filter(c => c.pipeline_stage === stage)
              return (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  contatos={cards}
                  onCardTap={setSelected}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom sheet ao selecionar card */}
      {selected && (
        <div
          className="absolute inset-0 bg-black/30 z-40 flex flex-col justify-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-t-2xl px-5 py-5 pb-[env(safe-area-inset-bottom)] space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar nome={selected.nome} size="md" />
              <div>
                <p className="text-[15px] font-medium text-ink">{selected.nome}</p>
                <p className="text-[12px] text-ink-3">{selected.empresa_nome}</p>
              </div>
            </div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-4 mb-2">Mover para</p>
            {STAGE_ORDER.filter(s => s !== selected.pipeline_stage).map((stage) => (
              <button
                key={stage}
                onClick={() => moverPara(selected, stage)}
                className="w-full text-left px-4 py-3 rounded-xl bg-surface-2 text-[14px] text-ink font-medium active:bg-surface-3"
              >
                {STAGE_LABELS[stage]}
              </button>
            ))}
            <button
              onClick={() => { setSelected(null); navigate(`/contatos/${selected.id}`) }}
              className="w-full text-left px-4 py-3 rounded-xl bg-accent-lt text-[14px] text-accent font-medium active:opacity-80"
            >
              Ver ficha completa →
            </button>
          </div>
        </div>
      )}

      <FAB onClick={() => navigate('/contatos/novo')} label="Novo contato" />
    </PageWrapper>
  )
}

function KanbanColumn({ stage, contatos, onCardTap }: {
  stage: PipelineStage
  contatos: Contato[]
  onCardTap: (c: Contato) => void
}) {
  const alertDays = STAGE_ALERT_DAYS[stage]
  return (
    <div className="w-[200px] bg-surface-2 rounded-xl p-2.5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <span className="text-[11px] font-medium text-ink-3 uppercase tracking-[0.06em]">
          {STAGE_LABELS[stage]}
        </span>
        <span className={clsx(
          'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
          stage === 'oportunidade'
            ? 'bg-[#EBF5F0] text-[#1A6B45]'
            : 'bg-accent-lt text-accent'
        )}>
          {contatos.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-2 flex-1">
        {contatos.map((c) => {
          const dias = diasSemContato(c.ultima_interacao_at)
          const alerta = dias >= alertDays
          return (
            <button
              key={c.id}
              onClick={() => onCardTap(c)}
              className={clsx(
                'w-full text-left bg-white rounded-[10px] px-3 py-2.5 border active:opacity-70 transition-opacity',
                alerta
                  ? 'border-l-2 border-l-warm border-[rgba(26,26,24,0.08)]'
                  : 'border-[rgba(26,26,24,0.08)]'
              )}
            >
              <p className="text-[12px] font-medium text-ink truncate">{c.nome}</p>
              <p className="text-[10px] text-ink-3 mt-0.5 truncate">{c.empresa_nome}</p>
              {dias < 999 && (
                <p className={clsx('text-[10px] mt-1.5 font-medium', alerta ? 'text-warm' : 'text-ink-4')}>
                  {dias}d
                </p>
              )}
            </button>
          )
        })}

        {contatos.length === 0 && (
          <div className="text-center py-6">
            <p className="text-[11px] text-ink-4">Vazio</p>
          </div>
        )}
      </div>
    </div>
  )
}
