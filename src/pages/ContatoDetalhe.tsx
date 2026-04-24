import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContato, useReunioes } from '../hooks'
import { PageWrapper, TopBar, FAB } from '../components/layout'
import { Avatar, CalorBadge, TipoBadge, Skeleton, ErrorState, Button } from '../components/ui'
import { clsx, formatarData, formatarDataCompleta, followupVencido } from '../utils'
import { contatosService } from '../services/contatos.service'
import { useUIStore } from '../stores/ui.store'
import { useQueryClient } from '@tanstack/react-query'
import { KEYS } from '../hooks'
import type { Reuniao, ContactType } from '../types'

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

const TIPOS: { value: ContactType; label: string }[] = [
  { value: 'empresa', label: 'Empresa' },
  { value: 'consultoria_estrategia', label: 'Consultoria' },
  { value: 'private_equity', label: 'Private Equity' },
  { value: 'conselho', label: 'Independente' },
  { value: 'headhunter', label: 'Headhunter' },
]

const TrashIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)

export default function ContatoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const qc = useQueryClient()
  const { data: contato, isLoading, error } = useContato(id ?? '')
  const { data: reunioes = [], isLoading: loadingReunioes } = useReunioes(id ?? '')
  const [editando, setEditando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmandoApagar, setConfirmandoApagar] = useState(false)
  const [apagando, setApagando] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})

  function abrirEdicao() {
    if (!contato) return
    setDraft({
      nome: contato.nome ?? '',
      cargo: contato.cargo ?? '',
      empresa_nome: contato.empresa_nome ?? '',
      notas: contato.notas ?? '',
      proximo_passo: contato.proximo_passo ?? '',
      proximo_passo_data: contato.proximo_passo_data ?? '',
      tipo: contato.tipo ?? 'empresa',
    })
    setEditando(true)
  }

  async function salvarEdicao() {
    if (!contato) return
    setSaving(true)
    try {
      await contatosService.update(contato.id, {
        nome: draft.nome,
        cargo: draft.cargo || undefined,
        empresa_nome: draft.empresa_nome || undefined,
        notas: draft.notas || undefined,
        proximo_passo: draft.proximo_passo || undefined,
        proximo_passo_data: draft.proximo_passo_data || undefined,
        tipo: draft.tipo as ContactType,
      })
      await qc.invalidateQueries({ queryKey: KEYS.contato(contato.id) })
      await qc.invalidateQueries({ queryKey: KEYS.contatos })
      setEditando(false)
      addToast('Contato atualizado.')
    } catch {
      addToast('Erro ao salvar. Tente novamente.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function apagarProximoPasso() {
    if (!contato) return
    try {
      await contatosService.update(contato.id, { proximo_passo: null, proximo_passo_data: null })
      await qc.invalidateQueries({ queryKey: KEYS.contato(contato.id) })
      await qc.invalidateQueries({ queryKey: KEYS.contatos })
      addToast('Próximo passo apagado.')
    } catch {
      addToast('Erro ao apagar. Tente novamente.', 'error')
    }
  }

  async function apagarContato() {
    if (!contato) return
    setApagando(true)
    try {
      await contatosService.delete(contato.id)
      await qc.invalidateQueries({ queryKey: KEYS.contatos })
      addToast('Contato apagado.')
      navigate('/contatos')
    } catch {
      addToast('Erro ao apagar. Tente novamente.', 'error')
      setApagando(false)
    }
  }

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
  const inputClass = 'w-full h-11 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent'
  const labelClass = 'text-[11px] font-medium text-ink-3 block mb-1'

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-white overflow-hidden">
      <TopBar
        back onBack={() => navigate(-1)}
        right={
          editando ? (
            <div className="flex gap-2">
              <button onClick={() => { setEditando(false); setConfirmandoApagar(false) }} className="text-[12px] text-ink-3 px-3 py-1.5">Cancelar</button>
              <Button size="sm" onClick={salvarEdicao} loading={saving}>Salvar</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={abrirEdicao} className="text-[12px] font-medium text-ink-2 px-3 py-1.5 bg-surface-2 rounded-lg">Editar</button>
              <button onClick={() => navigate(`/reuniao/prep/${contato.id}`)} className="text-[12px] font-medium text-accent px-3 py-1.5 bg-accent-lt rounded-lg">Prep →</button>
            </div>
          )
        }
      />

      <div className="flex-1 overflow-y-auto bg-surface">
        <div className="bg-white px-4 pt-4 pb-4 border-b border-[rgba(26,26,24,0.06)]">
          <div className="flex items-center gap-3 mb-3">
            <Avatar nome={contato.nome} size="lg" calor={contato.calor} pipeline={contato.pipeline_stage} />
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
              <button onClick={() => navigate(`/contatos/${contato.ponte_contato!.id}`)}
                className="inline-flex items-center text-[10px] font-medium px-[7px] py-[2px] rounded-full bg-surface-2 text-accent">
                via {contato.ponte_contato.nome}
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-4 space-y-3">

          {editando ? (
            <div className="bg-white border border-[rgba(26,26,24,0.10)] rounded-xl px-3.5 py-3 space-y-3">
              <div>
                <label className={labelClass}>Nome</label>
                <input value={draft.nome} onChange={e => setDraft(d => ({ ...d, nome: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cargo</label>
                <input value={draft.cargo} onChange={e => setDraft(d => ({ ...d, cargo: e.target.value }))} placeholder="Ex: Managing Partner" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Empresa</label>
                <input value={draft.empresa_nome} onChange={e => setDraft(d => ({ ...d, empresa_nome: e.target.value }))} placeholder="Nome da empresa" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Categoria</label>
                <select value={draft.tipo} onChange={e => setDraft(d => ({ ...d, tipo: e.target.value }))}
                  className="w-full h-11 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink outline-none focus:border-accent">
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Próximo passo</label>
                <input value={draft.proximo_passo} onChange={e => setDraft(d => ({ ...d, proximo_passo: e.target.value }))} placeholder="Ex: enviar CV, marcar café..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Data do próximo passo</label>
                <input type="date" value={draft.proximo_passo_data} onChange={e => setDraft(d => ({ ...d, proximo_passo_data: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contexto</label>
                <textarea value={draft.notas} onChange={e => setDraft(d => ({ ...d, notas: e.target.value }))} rows={3}
                  placeholder="Informações importantes..."
                  className="w-full rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 py-3 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent resize-none" />
              </div>

              {/* Apagar contato */}
              <div className="pt-2 border-t border-[rgba(26,26,24,0.08)]">
                {!confirmandoApagar ? (
                  <button onClick={() => setConfirmandoApagar(true)}
                    className="flex items-center gap-2 text-[12px] font-medium text-[#C0392B] py-2 active:opacity-60">
                    <TrashIcon size={13} />
                    Apagar contato
                  </button>
                ) : (
                  <div className="bg-[#FDF0EE] border border-[rgba(192,57,43,0.15)] rounded-xl px-3.5 py-3">
                    <p className="text-[12px] font-medium text-[#C0392B] mb-1">Apagar {contato.nome.split(' ')[0]}?</p>
                    <p className="text-[11px] text-[#C0392B]/70 mb-3">Esta ação não pode ser desfeita. Todo o histórico será perdido.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmandoApagar(false)}
                        className="flex-1 py-2 rounded-lg text-[12px] font-medium text-ink-3 bg-white border border-[rgba(26,26,24,0.12)] active:opacity-60">
                        Cancelar
                      </button>
                      <button onClick={apagarContato} disabled={apagando}
                        className="flex-1 py-2 rounded-lg text-[12px] font-medium text-white bg-[#C0392B] active:opacity-80 disabled:opacity-50">
                        {apagando ? 'Apagando...' : 'Confirmar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Próximo passo */}
              <div className={clsx('rounded-xl px-3.5 py-3 border',
                vencido ? 'bg-[#FDF5E6] border-[rgba(154,107,26,0.2)]'
                : contato.proximo_passo ? 'bg-accent-lt border-[rgba(28,61,90,0.12)]'
                : 'bg-surface-2 border-[rgba(26,26,24,0.08)]'
              )}>
                <div className="flex items-center justify-between mb-1">
                  <p className={clsx('text-[10px] font-medium uppercase tracking-[0.08em]',
                    vencido ? 'text-[#9A6B1A]' : contato.proximo_passo ? 'text-accent' : 'text-ink-4'
                  )}>Próximo passo</p>
                  {contato.proximo_passo && (
                    <button onClick={apagarProximoPasso}
                      className={clsx('p-1 rounded-lg active:opacity-60', vencido ? 'text-[#9A6B1A]' : 'text-accent')}>
                      <TrashIcon size={13} />
                    </button>
                  )}
                </div>
                {contato.proximo_passo ? (
                  <>
                    <p className={clsx('text-[14px] font-medium', vencido ? 'text-[#9A6B1A]' : 'text-ink')}>{contato.proximo_passo}</p>
                    {contato.proximo_passo_data && (
                      <p className={clsx('text-[11px] mt-0.5', vencido ? 'text-[#9A6B1A]/70' : 'text-ink-3')}>
                        {vencido ? `Deveria ter sido em ${formatarDataCompleta(contato.proximo_passo_data)}` : formatarDataCompleta(contato.proximo_passo_data)}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[13px] text-ink-4">Nenhum próximo passo definido.</p>
                )}
              </div>

              {/* Ações rápidas */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => navigate(`/reuniao/nova?contato=${contato.id}`)}
                  className="flex items-center justify-center gap-2 bg-accent text-white rounded-xl py-3 text-[13px] font-medium active:opacity-80">
                  <svg width="16" height="16" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  Registrar
                </button>
                <button onClick={() => navigate(`/reuniao/nova?contato=${contato.id}&agendar=true`)}
                  className="flex items-center justify-center gap-2 bg-[#EBF5F0] text-[#085041] rounded-xl py-3 text-[13px] font-medium active:opacity-80">
                  <svg width="16" height="16" fill="none" stroke="#085041" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="12" height="12" rx="2"/><path d="M8 2v2M4 2v2M2 7h12"/></svg>
                  Agendar
                </button>
              </div>
              <button onClick={() => navigate(`/reuniao/prep/${contato.id}`)}
                className="flex items-center justify-center gap-2 bg-accent-lt text-accent rounded-xl py-3 text-[13px] font-medium active:opacity-80 w-full">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" />
                </svg>
                Prep
              </button>

              {/* Notas */}
              {contato.notas && (
                <div className="bg-white border border-[rgba(26,26,24,0.10)] rounded-xl px-3.5 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-4 mb-1.5">Contexto</p>
                  <p className="text-[13px] text-ink-2 leading-relaxed">{contato.notas}</p>
                </div>
              )}
            </>
          )}

          {/* Histórico */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-4 mb-2">Histórico</p>
            {loadingReunioes ? (
              <div className="space-y-2"><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-16 rounded-xl" /></div>
            ) : reunioes.length === 0 ? (
              <div className="bg-surface-2 rounded-xl px-3.5 py-3">
                <p className="text-[13px] text-ink-4">Nenhuma interação registrada ainda.</p>
              </div>
            ) : (
              <div className="bg-white border border-[rgba(26,26,24,0.10)] rounded-xl divide-y divide-[rgba(26,26,24,0.06)]">
                {reunioes.map((r, i) => <ReuniaoItem key={r.id} reuniao={r} isFirst={i === 0} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReuniaoItem({ reuniao, isFirst }: { reuniao: Reuniao; isFirst: boolean }) {
  const [expandido, setExpandido] = useState(false)
  const tom = reuniao.tom ? TOM_CONFIG[reuniao.tom] : null
  const temTextoLongo = reuniao.conteudo && reuniao.conteudo.length > 120

  return (
    <button onClick={() => setExpandido(e => !e)} className="w-full text-left px-3.5 py-3 active:bg-surface-2 transition-colors">
      <div className="flex items-start gap-2.5">
        <div className={clsx('w-2 h-2 rounded-full mt-1.5 shrink-0', isFirst ? 'bg-accent' : 'bg-surface-3')} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[12px] font-medium text-ink">
              {reuniao.formato ? FORMATO_LABEL[reuniao.formato] : 'Reunião'}
              {tom && <span className={clsx('ml-1.5 font-normal', tom.className)}>· {tom.label}</span>}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-ink-4">{formatarData(reuniao.data)}</span>
              {temTextoLongo && <span className="text-[10px] text-ink-4">{expandido ? '▲' : '▼'}</span>}
            </div>
          </div>
          {reuniao.conteudo && (
            <p className={clsx('text-[12px] text-ink-2 leading-relaxed', !expandido && 'line-clamp-3')}>
              {reuniao.conteudo}
            </p>
          )}
          {reuniao.proximo_passo && (
            <p className="text-[11px] text-ink-3 mt-1">→ {reuniao.proximo_passo}</p>
          )}
        </div>
      </div>
    </button>
  )
}