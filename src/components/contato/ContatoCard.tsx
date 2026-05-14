import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { Contato } from '../../types'
import { Avatar, CalorBadge, PrimarioBadge } from '../ui'
import { clsx, formatarData, STAGE_LABELS } from '../../utils'

interface ContatoCardProps {
  contato: Contato
  showPrioridade?: boolean
  compact?: boolean
}

const STAGE_PILL: Record<string, string> = {
  mapeado:      'bg-surface-2 text-ink-3',
  acionado:     'bg-surface-2 text-ink-2',
  reuniao:      'bg-[#EBF5F0] text-[#1A6B45]',
  followup:     'bg-accent-lt text-accent',
  oportunidade: 'bg-[#EEEDFE] text-[#3C3489]',
  arquivado:    'bg-surface-2 text-ink-4',
}

function getSubtexto(contato: Contato): string {
  if (contato.tipo === 'empresa') {
    return contato.empresa_nome ?? ''
  }
  if (contato.tipo === 'headhunter') {
    return `Headhunter · ${contato.empresa_nome ?? ''}`
  }
  if (contato.tipo === 'conselho') {
    return 'Independent'
  }
  return contato.empresa_nome ?? ''
}

export function ContatoCard({ contato, showPrioridade = true, compact = false }: ContatoCardProps) {
  const navigate = useNavigate()
  const vencido = contato.followup_vencido
  const ponteNome = contato.ponte_contato?.nome?.split(' ')[0] ?? contato.ponte_contato_nome?.split(' ')[0]
  const stageClass = STAGE_PILL[contato.pipeline_stage] ?? 'bg-surface-2 text-ink-3'
  const stageLabel = STAGE_LABELS[contato.pipeline_stage] ?? contato.pipeline_stage

  return (
    <button
      onClick={() => navigate(`/contatos/${contato.id}`)}
      className={clsx(
        'w-full text-left bg-white border rounded-xl flex items-center gap-3 transition-colors active:bg-surface-2',
        vencido
          ? 'border-l-2 border-l-[#C4884A] border-[rgba(26,26,24,0.10)] pl-[11px] pr-[13px] py-[11px]'
          : 'border-[rgba(26,26,24,0.10)] px-[13px] py-[11px]',
        compact ? 'py-2' : ''
      )}
    >
      <Avatar
        nome={contato.nome}
        size={compact ? 'sm' : 'md'}
        calor={contato.calor}
        pipeline={contato.pipeline_stage}
      />

      <div className="flex-1 min-w-0">
        <p className={clsx('font-medium text-ink truncate', compact ? 'text-[12px]' : 'text-[13px]')}>
          {contato.nome}
        </p>
        <p className="text-[11px] text-ink-3 truncate">
          {getSubtexto(contato)}
        </p>
        <span className={clsx('inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full mt-1', stageClass)}>
          {stageLabel}
        </span>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <CalorBadge calor={contato.calor ?? 'sem_contato'} />
        {showPrioridade && (
          <PrimarioBadge
            primario={contato.contato_primario}
            ponteNome={ponteNome}
          />
        )}
      </div>
    </button>
  )
}

export function FollowUpCard({ contato }: { contato: Contato }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/contatos/${contato.id}`)}
      className="w-full text-left bg-[#FDF5E6] border border-[rgba(154,107,26,0.2)] rounded-xl px-3.5 py-3 active:bg-[#FAF0E6] transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-ink truncate">{contato.nome}</p>
          <p className="text-[11px] text-ink-3 mt-0.5 truncate">
            {contato.empresa_nome} · {contato.proximo_passo ?? 'Follow-up pendente'}
          </p>
        </div>
        <span className="text-[11px] font-medium text-[#9A6B1A] bg-[rgba(154,107,26,0.12)] px-2 py-0.5 rounded-full shrink-0">
          {contato.dias_sem_contato}d
        </span>
      </div>
      {contato.proximo_passo_data && (
        <p className="text-[10px] text-[#9A6B1A] mt-1.5">
          Deveria ter sido em {formatarData(contato.proximo_passo_data)}
        </p>
      )}
    </button>
  )
}
