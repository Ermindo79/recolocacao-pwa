import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContatos } from '../hooks'
import { TopBar } from '../components/layout'
import { Button } from '../components/ui'
import { useUIStore } from '../stores/ui.store'
import { clsx } from '../utils'
import type { ContactType } from '../types'

const TIPOS: { value: ContactType; label: string }[] = [
  { value: 'headhunter', label: 'Headhunter' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'empresa', label: 'Empresa' },
]

const CANAIS = ['whatsapp', 'linkedin', 'email', 'telefone']

export default function ContatoNovoPage() {
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const { data: contatos = [] } = useContatos()

  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [cargo, setCargo] = useState('')
  const [tipo, setTipo] = useState<ContactType>('headhunter')
  const [canal, setCanal] = useState('whatsapp')
  const [primario, setPrimario] = useState(true)
  const [ponteId, setPonteId] = useState('')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)

  const canSave = nome.trim() && (primario || ponteId)

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 400))
      addToast(`${nome} adicionado com sucesso.`)
      navigate('/contatos')
    } catch {
      addToast('Erro ao salvar. Tente novamente.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-white overflow-hidden">
      <TopBar title="Novo contato" back onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto bg-surface px-4 py-4 space-y-4 pb-28">

        {/* Nome */}
        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">
            Nome <span className="text-[#C0392B]">*</span>
          </label>
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome completo"
            autoFocus
            className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Categoria</label>
          <div className="flex gap-2">
            {TIPOS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTipo(value)}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-[12px] font-medium border transition-all',
                  tipo === value
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-ink-2 border-[rgba(26,26,24,0.18)]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Empresa */}
        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Empresa</label>
          <input
            value={empresa}
            onChange={e => setEmpresa(e.target.value)}
            placeholder="Nome da empresa"
            className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent"
          />
        </div>

        {/* Cargo */}
        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Cargo</label>
          <input
            value={cargo}
            onChange={e => setCargo(e.target.value)}
            placeholder="Ex: Managing Partner"
            className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent"
          />
        </div>

        {/* Canal */}
        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Canal principal</label>
          <div className="grid grid-cols-4 gap-2">
            {CANAIS.map(c => (
              <button
                key={c}
                onClick={() => setCanal(c)}
                className={clsx(
                  'py-2 rounded-lg text-[11px] font-medium border capitalize transition-all',
                  canal === c
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-ink-2 border-[rgba(26,26,24,0.18)]'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Primário / Secundário */}
        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Tipo de contato</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPrimario(true)}
              className={clsx(
                'py-3 rounded-xl text-[13px] font-medium border transition-all',
                primario
                  ? 'bg-accent-lt text-accent border-accent'
                  : 'bg-white text-ink-2 border-[rgba(26,26,24,0.18)]'
              )}
            >
              Primário
            </button>
            <button
              onClick={() => setPrimario(false)}
              className={clsx(
                'py-3 rounded-xl text-[13px] font-medium border transition-all',
                !primario
                  ? 'bg-accent-lt text-accent border-accent'
                  : 'bg-white text-ink-2 border-[rgba(26,26,24,0.18)]'
              )}
            >
              Secundário
            </button>
          </div>
          <p className="text-[11px] text-ink-3 mt-1.5">
            {primario
              ? 'Você conhece diretamente esta pessoa.'
              : 'Alguém fez a ponte — indique quem abaixo.'}
          </p>
        </div>

        {/* Ponte — só aparece se secundário */}
        {!primario && (
          <div>
            <label className="text-[12px] font-medium text-ink-3 block mb-1.5">
              Quem fez a ponte? <span className="text-[#C0392B]">*</span>
            </label>
            <select
              value={ponteId}
              onChange={e => setPonteId(e.target.value)}
              className={clsx(
                'w-full h-12 rounded-xl border bg-white px-3.5 text-[14px] outline-none transition-colors',
                !ponteId ? 'border-[#C0392B] text-ink-4' : 'border-[rgba(26,26,24,0.18)] text-ink focus:border-accent'
              )}
            >
              <option value="">Selecionar contato...</option>
              {contatos.map(c => (
                <option key={c.id} value={c.id}>{c.nome} — {c.empresa_nome}</option>
              ))}
            </select>
            {!ponteId && (
              <p className="text-[11px] text-[#C0392B] mt-1">Obrigatório para contato secundário.</p>
            )}
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Contexto (opcional)</label>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Informações importantes sobre esta pessoa, sensibilidades, histórico..."
            rows={3}
            className="w-full rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 py-3 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent resize-none"
          />
        </div>

        {!canSave && nome && (
          <p className="text-[11px] text-[#9A6B1A] bg-[#FDF5E6] px-3 py-2 rounded-lg">
            {!primario && !ponteId ? 'Selecione quem fez a ponte antes de salvar.' : ''}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-white border-t border-[rgba(26,26,24,0.08)] pb-[env(safe-area-inset-bottom)]">
        <Button onClick={handleSave} disabled={!canSave} loading={saving} className="w-full">
          Adicionar contato
        </Button>
      </div>
    </div>
  )
}
