import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCreateReuniao, useContatos } from '../hooks'
import { TopBar } from '../components/layout'
import { Button } from '../components/ui'
import { useUIStore } from '../stores/ui.store'
import { clsx } from '../utils'
import { contatosService } from '../services/contatos.service'
import type { MeetingFormat, MeetingTone } from '../types'

const FORMATOS: { value: MeetingFormat; label: string }[] = [
  { value: 'ligacao', label: 'Ligação' },
  { value: 'cafe', label: 'Café' },
  { value: 'video', label: 'Vídeo' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'mensagem', label: 'Mensagem' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email', label: 'E-mail' },
]

const TONS: { value: MeetingTone; label: string; className: string; selectedClass: string }[] = [
  { value: 'muito_positivo', label: 'Muito positivo', className: 'bg-[#EBF5F0] text-[#1A6B45]', selectedClass: 'border-[#1A6B45]' },
  { value: 'aberto',         label: 'Aberto',          className: 'bg-accent-lt text-accent',     selectedClass: 'border-accent' },
  { value: 'neutro',         label: 'Neutro',          className: 'bg-surface-2 text-ink-3',      selectedClass: 'border-ink-3' },
  { value: 'frio',           label: 'Frio',            className: 'bg-[#FDF0EE] text-[#C0392B]',  selectedClass: 'border-[#C0392B]' },
]

const amanha = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function ReuniaoNovaPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { addToast } = useUIStore()
  const { data: contatos = [] } = useContatos()
  const createReuniao = useCreateReuniao()

  const preContatoId = params.get('contato') ?? ''
  const modoAgendar = params.get('agendar') === 'true'
  const preContato = contatos.find(c => c.id === preContatoId)

  const [contatoId, setContatoId] = useState(preContatoId)
  const [data, setData] = useState(modoAgendar ? amanha() : new Date().toISOString().split('T')[0])
  const [formato, setFormato] = useState<MeetingFormat | ''>('')
  const [tom, setTom] = useState<MeetingTone | ''>('')
  const [conteudo, setConteudo] = useState('')
  const [pendencias, setPendencias] = useState('')
  const [proximoPasso, setProximoPasso] = useState('')
  const [proximoPassoData, setProximoPassoData] = useState('')

  const canSave = !!contatoId

  async function handleSave() {
    if (!canSave) return
    try {
      await createReuniao.mutateAsync({
        contato_id: contatoId,
        data,
        formato: formato || undefined,
        tom: tom || undefined,
        conteudo: conteudo || undefined,
        pendencias: pendencias || undefined,
        proximo_passo: proximoPasso.trim() || '',
        proximo_passo_data: proximoPassoData || data,
        agendado: modoAgendar,
      })

      if (modoAgendar) {
        await contatosService.updateStage(contatoId, 'reuniao')
        await contatosService.update(contatoId, {
          proximo_passo: conteudo.trim() || 'Reunião',
          proximo_passo_data: data,
        })
      }

      const nomeContato = contatos.find(c => c.id === contatoId)?.nome ?? ''
      if (modoAgendar) {
        addToast(`Reunião com ${nomeContato.split(' ')[0]} agendada.`)
      } else {
        addToast(`Interação com ${nomeContato.split(' ')[0]} salva.`)
      }
      navigate(`/contatos/${contatoId}`)
    } catch {
      addToast('Erro ao salvar. Tente novamente.', 'error')
    }
  }

  const titulo = modoAgendar
    ? preContato ? `Agendar — ${preContato.nome.split(' ')[0]}` : 'Agendar reunião'
    : preContato ? `Nova interação — ${preContato.nome.split(' ')[0]}` : 'Nova interação'

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-white overflow-hidden">
      <TopBar title={titulo} back onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto bg-surface px-4 py-4 space-y-4 pb-28">

        {!preContatoId && (
          <div>
            <label className="text-[12px] font-medium text-ink-3 block mb-1.5">
              Contato <span className="text-[#C0392B]">*</span>
            </label>
            <select
              value={contatoId}
              onChange={(e) => setContatoId(e.target.value)}
              className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink outline-none focus:border-accent"
            >
              <option value="">Selecionar contato...</option>
              {contatos.map(c => (
                <option key={c.id} value={c.id}>{c.nome} — {c.empresa_nome}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">
            {modoAgendar ? 'Data da reunião' : 'Data'}
          </label>
          <input
            type="date"
            value={data}
            min={modoAgendar ? amanha() : undefined}
            onChange={(e) => setData(e.target.value)}
            className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Formato</label>
          <div className="flex gap-2 flex-wrap">
            {FORMATOS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFormato(f => f === value ? '' : value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all',
                  formato === value
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-ink-2 border-[rgba(26,26,24,0.18)]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {modoAgendar && (
          <div>
            <label className="text-[12px] font-medium text-ink-3 block mb-1.5">
              Notas <span className="text-ink-4">(opcional)</span>
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Tópicos a cobrir, local, contexto..."
              rows={3}
              className="w-full rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 py-3 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent resize-none"
            />
          </div>
        )}

        {modoAgendar && (
          <div className="bg-[#EBF5F0] border border-[rgba(26,107,69,0.15)] rounded-xl px-3.5 py-3">
            <p className="text-[12px] font-medium text-[#1A6B45]">Ao salvar</p>
            <p className="text-[11px] text-[#1A6B45]/80 mt-0.5">
              {preContato?.nome.split(' ')[0] ?? 'O contato'} ficará com calor Agendado e será movido para o stage Reunião no pipeline.
            </p>
          </div>
        )}

        {!modoAgendar && (
          <>
            <div>
              <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Tom da reunião</label>
              <div className="grid grid-cols-2 gap-2">
                {TONS.map(({ value, label, className, selectedClass }) => (
                  <button
                    key={value}
                    onClick={() => setTom(t => t === value ? '' : value)}
                    className={clsx(
                      'py-2 rounded-[10px] text-[12px] font-medium border-[1.5px] transition-all',
                      className,
                      tom === value ? selectedClass : 'border-transparent'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-ink-3 block mb-1.5">O que foi dito</label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Resumo do que rolou: o que foi dito, sinais importantes..."
                rows={4}
                className="w-full rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 py-3 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent resize-none"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Pendências (opcional)</label>
              <input
                value={pendencias}
                onChange={(e) => setPendencias(e.target.value)}
                placeholder="O que ficou para resolver..."
                className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-ink-3 block mb-1.5">
                Próximo passo <span className="text-ink-4">(opcional)</span>
              </label>
              <input
                value={proximoPasso}
                onChange={(e) => setProximoPasso(e.target.value)}
                placeholder="Ex: café presencial em SP em 13/04"
                className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-ink-3 block mb-1.5">
                Data do próximo passo <span className="text-ink-4">(opcional)</span>
              </label>
              <input
                type="date"
                value={proximoPassoData}
                onChange={(e) => setProximoPassoData(e.target.value)}
                className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-ink outline-none focus:border-accent"
              />
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-3 bg-white border-t border-[rgba(26,26,24,0.08)] pb-[env(safe-area-inset-bottom)]">
        <Button
          onClick={handleSave}
          disabled={!canSave}
          loading={createReuniao.isPending}
          className="w-full"
        >
          {modoAgendar ? 'Agendar reunião' : 'Salvar interação'}
        </Button>
      </div>
    </div>
  )
}
