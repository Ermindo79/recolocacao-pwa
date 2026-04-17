import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContatos } from '../hooks'
import { PageWrapper, FAB } from '../components/layout'
import { ContactCardSkeleton, ErrorState, EmptyState, SectionHeader, Avatar, CalorBadge } from '../components/ui'
import { ContatoCard } from '../components/contato/ContatoCard'
import { ordenarPorUrgencia, clsx } from '../utils'
import type { Contato, ContactType } from '../types'

type ViewMode = 'pessoas' | 'categorias'

const CATEGORIAS: { key: ContactType; label: string }[] = [
  { key: 'empresa', label: 'Empresas' },
  { key: 'consultoria_estrategia', label: 'Consultorias de Estratégia' },
  { key: 'conselho', label: 'Membros de Conselho de Administração' },
  { key: 'headhunter', label: 'Headhunter' },
]

export default function ContatosPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>('pessoas')
  const [search, setSearch] = useState('')
  const { data: contatos = [], isLoading, error, refetch } = useContatos()

  const filtrados = useMemo(() => {
    const q = search.toLowerCase()
    const lista = q
      ? contatos.filter(c =>
          c.nome.toLowerCase().includes(q) ||
          (c.empresa_nome ?? '').toLowerCase().includes(q)
        )
      : contatos
    return ordenarPorUrgencia(lista)
  }, [contatos, search])

  return (
    <PageWrapper>
      <div className="px-4 pt-5 pb-3 bg-white border-b border-[rgba(26,26,24,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[22px] font-medium text-ink">Contatos</h1>
          <button
            onClick={() => navigate('/contatos/novo')}
            className="w-9 h-9 bg-accent text-white rounded-xl flex items-center justify-center"
          >
            <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M9 3v12M3 9h12" />
            </svg>
          </button>
        </div>

        <div className="flex bg-surface-2 rounded-[10px] p-[3px] gap-[3px] mb-3">
          {(['pessoas', 'categorias'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={clsx(
                'flex-1 py-[7px] rounded-[8px] text-[12px] font-medium transition-all',
                view === v
                  ? 'bg-white text-accent border border-[rgba(26,26,24,0.10)]'
                  : 'text-ink-3'
              )}
            >
              {v === 'pessoas' ? 'Pessoas' : 'Categorias'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white border border-[rgba(26,26,24,0.18)] rounded-xl px-3 h-[38px]">
          <svg width="14" height="14" fill="none" stroke="#9A9A95" strokeWidth="1.8">
            <circle cx="6" cy="6" r="5" /><path d="m11 11-3-3" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou empresa..."
            className="flex-1 text-[13px] text-ink placeholder:text-ink-4 outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-ink-4 text-lg leading-none">×</button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 pb-24 space-y-2">
        {isLoading ? (
          [...Array(5)].map((_, i) => <ContactCardSkeleton key={i} />)
        ) : error ? (
          <ErrorState message="Não foi possível carregar os contatos." onRetry={refetch} />
        ) : view === 'pessoas' ? (
          <ViewPessoas contatos={filtrados} search={search} onNavigate={navigate} />
        ) : (
          <ViewCategorias contatos={filtrados} onNavigate={navigate} />
        )}
      </div>

      <FAB onClick={() => navigate('/contatos/novo')} label="Novo contato" />
    </PageWrapper>
  )
}

function ViewPessoas({ contatos, search, onNavigate }: {
  contatos: Contato[]; search: string; onNavigate: (p: string) => void
}) {
  if (contatos.length === 0) {
    return search ? (
      <EmptyState
        title={`Nenhum resultado para "${search}"`}
        subtitle="Adicionar como novo contato?"
        action={
          <button onClick={() => onNavigate('/contatos/novo')} className="text-[13px] font-medium text-accent underline underline-offset-2">
            Adicionar contato →
          </button>
        }
      />
    ) : (
      <EmptyState
        title="Nenhum contato ainda."
        subtitle="Adicione o primeiro headhunter para começar."
        action={
          <button onClick={() => onNavigate('/contatos/novo')} className="text-[13px] font-medium text-accent underline underline-offset-2">
            Adicionar primeiro contato →
          </button>
        }
      />
    )
  }
  return <div className="space-y-2">{contatos.map((c) => <ContatoCard key={c.id} contato={c} />)}</div>
}

function ViewCategorias({ contatos, onNavigate }: { contatos: Contato[]; onNavigate: (p: string) => void }) {
  const [expandedEmpresa, setExpandedEmpresa] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      {CATEGORIAS.map(({ key, label }) => {
        const grupo = contatos.filter(c => c.tipo === key)
        if (grupo.length === 0) return null

        return (
          <div key={key}>
            <SectionHeader label={`${label} · ${grupo.length}`} />
            {key === 'empresa' ? (
              <EmpresasGroup
                contatos={grupo}
                expanded={expandedEmpresa}
                onToggle={setExpandedEmpresa}
                onNavigate={onNavigate}
              />
            ) : (
              <div className="space-y-2">
                {grupo.map((c) => <ContatoCard key={c.id} contato={c} />)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EmpresasGroup({ contatos, expanded, onToggle, onNavigate }: {
  contatos: Contato[]
  expanded: string | null
  onToggle: (id: string | null) => void
  onNavigate: (p: string) => void
}) {
  const porEmpresa = useMemo(() => {
    const map = new Map<string, Contato[]>()
    for (const c of contatos) {
      const key = c.empresa_nome ?? 'Sem empresa'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return [...map.entries()]
  }, [contatos])

  return (
    <div className="space-y-2">
      {porEmpresa.map(([empresa, pessoas]) => {
        const isOpen = expanded === empresa
        return (
          <div key={empresa} className="bg-white border border-[rgba(26,26,24,0.10)] rounded-xl overflow-hidden">
            <button
              onClick={() => onToggle(isOpen ? null : empresa)}
              className="w-full flex items-center justify-between px-3.5 py-3 active:bg-surface text-left"
            >
              <div>
                <p className="text-[13px] font-medium text-ink">{empresa}</p>
                <p className="text-[11px] text-ink-3">{pessoas[0]?.empresa?.setor ?? 'Empresa'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium bg-accent-lt text-accent px-2 py-0.5 rounded-full">
                  {pessoas.length} {pessoas.length === 1 ? 'pessoa' : 'pessoas'}
                </span>
                <svg width="14" height="14" fill="none" stroke="#9A9A95" strokeWidth="1.8" strokeLinecap="round"
                  className={clsx('transition-transform', isOpen ? 'rotate-180' : '')}>
                  <path d="m3 6 5 5 5-5" />
                </svg>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-[rgba(26,26,24,0.08)] px-3.5 py-1">
                {pessoas.map((c) => (
                  <button key={c.id} onClick={() => onNavigate(`/contatos/${c.id}`)}
                    className="w-full flex items-center gap-3 py-2.5 border-b border-[rgba(26,26,24,0.06)] last:border-0 active:opacity-70"
                  >
                    <Avatar nome={c.nome} size="sm" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[12px] font-medium text-ink truncate">{c.nome}</p>
                      <p className="text-[10px] text-ink-3 mt-0.5">
                        {c.contato_primario ? 'Primário' : `via ${c.ponte_contato?.nome ?? '—'}`}
                      </p>
                    </div>
                    <CalorBadge calor={c.calor ?? 'sem_contato'} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
