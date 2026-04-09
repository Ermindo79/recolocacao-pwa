import { useUIStore } from '../stores/ui.store'
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContatos } from '../hooks'
import { PageWrapper, FAB } from '../components/layout'
import { clsx, formatarData } from '../utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, isToday, parseISO, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { MeetingFormat } from '../types'

interface Evento {
  id: string
  contatoId: string
  contatoNome: string
  data: string
  formato: MeetingFormat
  descricao: string
}

const FORMATO_COR: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ligacao:    { bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]', dot: 'bg-[#378ADD]', label: 'Ligação' },
  mensagem:   { bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]', dot: 'bg-[#378ADD]', label: 'Mensagem' },
  video:      { bg: 'bg-[#EEEDFE]', text: 'text-[#3C3489]', dot: 'bg-[#7F77DD]', label: 'Vídeo' },
  cafe:       { bg: 'bg-[#EAF3DE]', text: 'text-[#27500A]', dot: 'bg-[#639922]', label: 'Café' },
  presencial: { bg: 'bg-[#EAF3DE]', text: 'text-[#27500A]', dot: 'bg-[#639922]', label: 'Presencial' },
}

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export default function CalendarioPage() {
  const navigate = useNavigate()
  const { data: contatos = [] } = useContatos()
  const [mesAtual, setMesAtual] = useState(new Date())
  const [diaSelecionado, setDiaSelecionado] = useState(new Date())
  const [showNovoEvento, setShowNovoEvento] = useState(false)

  // Gera eventos a partir dos próximos passos dos contatos
  const eventos: Evento[] = useMemo(() => {
    return contatos
      .filter(c => c.proximo_passo && c.proximo_passo_data)
      .map(c => ({
        id: c.id,
        contatoId: c.id,
        contatoNome: c.nome,
        data: c.proximo_passo_data!,
        formato: 'presencial' as MeetingFormat,
        descricao: c.proximo_passo!,
      }))
  }, [contatos])

  const diasDoMes = useMemo(() => {
    const inicio = startOfMonth(mesAtual)
    const fim = endOfMonth(mesAtual)
    const dias = eachDayOfInterval({ start: inicio, end: fim })
    const offset = inicio.getDay()
    const vazios = Array(offset).fill(null)
    return [...vazios, ...dias]
  }, [mesAtual])

  const eventosDoDia = useMemo(() => {
    return eventos.filter(e => {
      try { return isSameDay(parseISO(e.data), diaSelecionado) } catch { return false }
    })
  }, [eventos, diaSelecionado])

  const eventosPorDia = useMemo(() => {
    const map = new Map<string, Evento[]>()
    eventos.forEach(e => {
      const key = e.data.split('T')[0]
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    })
    return map
  }, [eventos])

  return (
    <PageWrapper>
      {/* Header */}
      <div className="px-4 pt-5 pb-3 bg-white border-b border-[rgba(26,26,24,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[22px] font-medium text-ink">Calendário</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setMesAtual(m => subMonths(m, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 text-ink-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="m10 4-4 4 4 4" />
              </svg>
            </button>
            <span className="text-[14px] font-medium text-ink capitalize min-w-[120px] text-center">
              {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button onClick={() => setMesAtual(m => addMonths(m, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 text-ink-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="m6 4 4 4-4 4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-1">
          {DIAS_SEMANA.map((d, i) => (
            <div key={i} className="text-center text-[11px] font-medium text-ink-4 py-1">{d}</div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-y-1">
          {diasDoMes.map((dia, i) => {
            if (!dia) return <div key={`v${i}`} />
            const key = format(dia, 'yyyy-MM-dd')
            const temEvento = eventosPorDia.has(key)
            const selecionado = isSameDay(dia, diaSelecionado)
            const hoje = isToday(dia)
            const mesCorreto = isSameMonth(dia, mesAtual)
            const eventosNoDia = eventosPorDia.get(key) ?? []

            return (
              <button
                key={key}
                onClick={() => setDiaSelecionado(dia)}
                className={clsx(
                  'flex flex-col items-center py-1 rounded-xl transition-all',
                  selecionado ? 'bg-accent' : hoje ? 'bg-surface-2' : ''
                )}
              >
                <span className={clsx(
                  'text-[13px] font-medium',
                  selecionado ? 'text-white' : hoje ? 'text-accent' : mesCorreto ? 'text-ink' : 'text-ink-4'
                )}>
                  {format(dia, 'd')}
                </span>
                {temEvento && (
                  <div className="flex gap-0.5 mt-0.5">
                    {eventosNoDia.slice(0, 3).map((e, j) => {
                      const cor = FORMATO_COR[e.formato]
                      return <div key={j} className={clsx('w-1 h-1 rounded-full', selecionado ? 'bg-white/70' : cor.dot)} />
                    })}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Eventos do dia selecionado */}
      <div className="px-4 py-4 pb-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-4 mb-3">
          {format(diaSelecionado, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>

        {eventosDoDia.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[14px] text-ink-3">Nenhum compromisso neste dia.</p>
            <button
              onClick={() => setShowNovoEvento(true)}
              className="text-[13px] font-medium text-accent mt-2 underline underline-offset-2"
            >
              Adicionar compromisso →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {eventosDoDia.map(evento => {
              const cor = FORMATO_COR[evento.formato]
              return (
                <button
                  key={evento.id}
                  onClick={() => navigate(`/contatos/${evento.contatoId}`)}
                  className={clsx('w-full text-left rounded-xl px-3.5 py-3 border active:opacity-80', cor.bg,
                    'border-[rgba(26,26,24,0.08)]')}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={clsx('w-2 h-2 rounded-full shrink-0', cor.dot)} />
                    <span className={clsx('text-[11px] font-medium uppercase tracking-[0.06em]', cor.text)}>
                      {cor.label}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-ink">{evento.contatoNome}</p>
                  <p className="text-[12px] text-ink-3 mt-0.5">{evento.descricao}</p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="px-4 pb-4 flex gap-3 flex-wrap">
        {[
          { label: 'Ligação / Mensagem', dot: 'bg-[#378ADD]' },
          { label: 'Vídeo', dot: 'bg-[#7F77DD]' },
          { label: 'Presencial / Café', dot: 'bg-[#639922]' },
        ].map(({ label, dot }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={clsx('w-2 h-2 rounded-full', dot)} />
            <span className="text-[11px] text-ink-3">{label}</span>
          </div>
        ))}
      </div>

      {/* Modal novo evento */}
      {showNovoEvento && (
        <NovoEventoModal
          data={diaSelecionado}
          contatos={contatos}
          onClose={() => setShowNovoEvento(false)}
          onSave={() => setShowNovoEvento(false)}
        />
      )}

      <FAB onClick={() => setShowNovoEvento(true)} label="Novo compromisso" />
    </PageWrapper>
  )
}

function NovoEventoModal({ data, contatos, onClose, onSave }: {
  data: Date
  contatos: any[]
  onClose: () => void
  onSave: () => void
}) {
  const [contatoId, setContatoId] = useState('')
  const [formato, setFormato] = useState<MeetingFormat>('ligacao')
  const [descricao, setDescricao] = useState('')
  const { addToast } = useUIStore()

  const FORMATOS: { value: MeetingFormat; label: string }[] = [
    { value: 'ligacao', label: 'Ligação' },
    { value: 'mensagem', label: 'Mensagem' },
    { value: 'video', label: 'Vídeo' },
    { value: 'cafe', label: 'Café' },
    { value: 'presencial', label: 'Presencial' },
  ]

  function handleSave() {
    if (!contatoId) return
    addToast('Compromisso adicionado.')
    onSave()
  }

  return (
    <div
      style={{ minHeight: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl px-5 py-5 pb-[env(safe-area-inset-bottom)] space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-medium text-ink">Novo compromisso</p>
          <p className="text-[13px] text-ink-3 capitalize">
            {format(data, "d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Contato</label>
          <select value={contatoId} onChange={e => setContatoId(e.target.value)}
            className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink outline-none">
            <option value="">Selecionar...</option>
            {contatos.map(c => (
              <option key={c.id} value={c.id}>{c.nome} — {c.empresa_nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Tipo</label>
          <div className="flex gap-2 flex-wrap">
            {FORMATOS.map(({ value, label }) => {
              const cor = FORMATO_COR[value]
              return (
                <button key={value} onClick={() => setFormato(value)}
                  className={clsx('px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                    formato === value ? `${cor.bg} ${cor.text} border-transparent` : 'bg-white text-ink-2 border-[rgba(26,26,24,0.18)]')}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Descrição</label>
          <input value={descricao} onChange={e => setDescricao(e.target.value)}
            placeholder="Ex: Café no escritório SP"
            className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent" />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[rgba(26,26,24,0.18)] text-[13px] font-medium text-ink-2">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!contatoId}
            className="flex-1 py-3 rounded-xl bg-accent text-white text-[13px] font-medium disabled:opacity-40">
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}


