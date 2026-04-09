import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContato, useReunioes } from '../hooks'
import { PageWrapper, TopBar, FAB } from '../components/layout'
import { Avatar, CalorBadge, TipoBadge, Skeleton, ErrorState, Badge } from '../components/ui'
import { clsx, formatarData, formatarDataCompleta, tempoAtras, followupVencido } from '../utils'
import type { Reuniao } from '../types'

const TOM_CONFIG = {
  muito_positivo: { label: 'Muito positivo', className: 'text-[#1A6B45]' },
  aberto:         { label: 'Aberto',          className: 'text-accent' },
  neutro:         { label: 'Neutro',          className: 'text-ink-3' },
  frio:           { label: 'Frio',            className: 'text-[#C0392B]' },
}

const FORMATO_LABEL = {
  ligacao:    'Ligação',
  cafe:       'Café',
  video:      'Vídeo',
  mensagem:   'Mensagem',
  presencial: 'Presencial',
}

export default function ContatoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contato, isLoading, error } = useContato(id ?? '')
  const { data: reunioes = [], isLoading: loadingReunioes } = useReunioes(id ?? '')

  if (isLoading) return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto">
      <TopBar back onBack={() => navigate(-1)} />
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-[14px]" />
          <div className="space-y-2 flex-1"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-28" /></div>
        </div>
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  )

  if (error || !contato) return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto">
      <TopBar back onBack={() => navigate(-1)} title="Contato" />
      <ErrorState message="Contato não encontrado." onRetry={() => navigate(-1)} />
    </div>
  )

  const vencido = contato.proximo_passo_data ? followupVencido(contato.proximo_passo_data) : false

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-white overflow-hidden">
      <TopBar
        back onBack={() => navigate(-1)}
        right={
          <button
            onClick={() => navigate(`/reuniao/prep/${contato.id}`)}
            className="text-[12px] font-medium text-accent px-3 py-1.5 bg-accent-lt rounded-lg"
          >
            Prep →
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-surface">
        {/* Header do contato */}
        <div className="bg-white px-4 pt-4 pb-4 border-b border-[rgba(26,26,24,0.06)]">
          <div className="flex items-center gap-3 mb-3">
            <Avatar nome={contato.nome} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] font-medium text-ink leading-tight truncate">{contato.nome}</h1>
              <p className="text-[12px] text-ink-3 mt-0.5">
                {contato.cargo && `${contato.cargo} · `}{contato.empresa_nome}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <TipoBadge tipo={contato.tipo} />
            <CalorBadge calor={contato.calor ?? 'sem_contato'} />
            {!contato.contato_primario && contato.ponte_contato && (
              <button
                onClick={() => navigate(`/contatos/${contato.ponte_contato!.id}`)}
                className="inline-flex items-center text-[10px] font-medium px-[7px] py-[2px] rounded-full bg-surface-2 text-accent underline-offset-1"
              >
                via {contato.ponte_contato.nome}
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-4 space-y-3">
          {/* Próximo passo */}
          <div className={clsx(
            'rounded-xl px-3.5 py-3 border',
            vencido
              ? 'bg-[#FDF5E6] border-[rgba(154,107,26,0.2)]'
              : contato.proximo_passo
              ? 'bg-accent-lt border-[rgba(28,61,90,0.12)]'
              : 'bg-surface-2 border-[rgba(26,26,24,0.08)]'
          )}>
            <p className={clsx(
              'text-[10px] font-medium uppercase tracking-[0.08em] mb-1',
              vencido ? 'text-[#9A6B1A]' : contato.proximo_passo ? 'text-accent' : 'text-ink-4'
            )}>
              Próximo passo
            </p>
            {contato.proximo_passo ? (
              <>
                <p className={clsx('text-[14px] font-medium', vencido ? 'text-[#9A6B1A]' : 'text-ink')}>
                  {contato.proximo_passo}
                </p>
                {contato.proximo_passo_data && (
                  <p className={clsx('text-[11px] mt-0.5', vencido ? 'text-[#9A6B1A]/70' : 'text-ink-3')}>
                    {vencido
                      ? `Deveria ter sido em ${formatarDataCompleta(contato.proximo_passo_data)}`
                      : formatarDataCompleta(contato.proximo_passo_data)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[13px] text-ink-4">Nenhum próximo passo definido.</p>
            )}
          </div>

          {/* Ações rápidas */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate(`/reuniao/nova?contato=${contato.id}`)}
              className="flex items-center justify-center gap-2 bg-accent text-white rounded-xl py-3 text-[13px] font-medium active:opacity-80"
            >
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Registrar
            </button>
            <button
              onClick={() => navigate(`/reuniao/prep/${contato.id}`)}
              className="flex items-center justify-center gap-2 bg-accent-lt text-accent rounded-xl py-3 text-[13px] font-medium active:opacity-80"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" />
              </svg>
              Prep
            </button>
          </div>

          {/* Notas */}
          {contato.notas && (
            <div className="bg-white border border-[rgba(26,26,24,0.10)] rounded-xl px-3.5 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-4 mb-1.5">Contexto</p>
              <p className="text-[13px] text-ink-2 leading-relaxed">{contato.notas}</p>
            </div>
          )}

          {/* Timeline de reuniões */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-4 mb-2">Histórico</p>
            {loadingReunioes ? (
              <div className="space-y-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : reunioes.length === 0 ? (
              <div className="bg-surface-2 rounded-xl px-3.5 py-3">
                <p className="text-[13px] text-ink-4">Nenhuma interação registrada ainda.</p>
              </div>
            ) : (
              <div className="bg-white border border-[rgba(26,26,24,0.10)] rounded-xl divide-y divide-[rgba(26,26,24,0.06)]">
                {reunioes.map((r, i) => (
                  <ReuniaoItem key={r.id} reuniao={r} isFirst={i === 0} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReuniaoItem({ reuniao, isFirst }: { reuniao: Reuniao; isFirst: boolean }) {
  const tom = reuniao.tom ? TOM_CONFIG[reuniao.tom] : null
  return (
    <div className="px-3.5 py-3">
      <div className="flex items-start gap-2.5">
        <div className={clsx(
          'w-2 h-2 rounded-full mt-1.5 shrink-0',
          isFirst ? 'bg-accent' : 'bg-surface-3'
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[12px] font-medium text-ink">
              {reuniao.formato ? FORMATO_LABEL[reuniao.formato] : 'Reunião'}
              {tom && <span className={clsx('ml-1.5 font-normal', tom.className)}>· {tom.label}</span>}
            </span>
            <span className="text-[10px] text-ink-4 shrink-0">{formatarData(reuniao.data)}</span>
          </div>
          {reuniao.conteudo && (
            <p className="text-[12px] text-ink-2 leading-relaxed line-clamp-3">{reuniao.conteudo}</p>
          )}
          {reuniao.proximo_passo && (
            <p className="text-[11px] text-ink-3 mt-1">→ {reuniao.proximo_passo}</p>
          )}
        </div>
      </div>
    </div>
  )
}
