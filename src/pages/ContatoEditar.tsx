import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useContato, useContatos } from '../hooks'
import { TopBar } from '../components/layout'
import { Button, Skeleton } from '../components/ui'
import { useUIStore } from '../stores/ui.store'
import { clsx } from '../utils'
import type { ContactType } from '../types'

const TIPOS: { value: ContactType; label: string }[] = [
  { value: 'headhunter', label: 'Headhunter' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'empresa', label: 'Empresa' },
]

const CANAIS = ['whatsapp', 'linkedin', 'email', 'telefone']

export default function ContatoEditarPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const { data: contato, isLoading } = useContato(id ?? '')
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

  useEffect(() => {
    if (contato) {
      setNome(contato.nome)
      setEmpresa(contato.empresa_nome ?? '')
      setCargo(contato.cargo ?? '')
      setTipo(contato.tipo)
      setCanal(contato.canal ?? 'whatsapp')
      setPrimario(contato.contato_primario)
      setPonteId(contato.ponte_contato_id ?? '')
      setNotas(contato.notas ?? '')
    }
  }, [contato])

  const canSave = nome.trim() && (primario || ponteId)
  const outrosContatos = contatos.filter(c => c.id !== id)

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 400))
      addToast('Contato atualizado.')
      navigate(`/contatos/${id}`)
    } catch {
      addToast('Erro ao salvar. Tente novamente.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto">
      <TopBar back onBack={() => navigate(-1)} title="Editar contato" />
      <div className="px-4 py-4 space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-white overflow-hidden">
      <TopBar title={`Editar — ${nome.split(' ')[0]}`} back onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto bg-surface px-4 py-4 space-y-4 pb-28">

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Nome <span className="text-[#C0392B]">*</span></label>
          <input value={nome} onChange={e => setNome(e.target.value)}
            className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink outline-none focus:border-accent" />
        </div>

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Categoria</label>
          <div className="flex gap-2">
            {TIPOS.map(({ value, label }) => (
              <button key={value} onClick={() => setTipo(value)}
                className={clsx('flex-1 py-2.5 rounded-xl text-[12px] font-medium border transition-all',
                  tipo === value ? 'bg-accent text-white border-accent' : 'bg-white text-ink-2 border-[rgba(26,26,24,0.18)]')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Empresa</label>
          <input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Nome da empresa"
            className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent" />
        </div>

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Cargo</label>
          <input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ex: Managing Partner"
            className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent" />
        </div>

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Canal principal</label>
          <div className="grid grid-cols-4 gap-2">
            {CANAIS.map(c => (
              <button key={c} onClick={() => setCanal(c)}
                className={clsx('py-2 rounded-lg text-[11px] font-medium border capitalize transition-all',
                  canal === c ? 'bg-accent text-white border-accent' : 'bg-white text-ink-2 border-[rgba(26,26,24,0.18)]')}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Tipo de contato</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setPrimario(true)}
              className={clsx('py-3 rounded-xl text-[13px] font-medium border transition-all',
                primario ? 'bg-accent-lt text-accent border-accent' : 'bg-white text-ink-2 border-[rgba(26,26,24,0.18)]')}>
              Primário
            </button>
            <button onClick={() => setPrimario(false)}
              className={clsx('py-3 rounded-xl text-[13px] font-medium border transition-all',
                !primario ? 'bg-accent-lt text-accent border-accent' : 'bg-white text-ink-2 border-[rgba(26,26,24,0.18)]')}>
              Secundário
            </button>
          </div>
        </div>

        {!primario && (
          <div>
            <label className="text-[12px] font-medium text-ink-3 block mb-1.5">
              Quem fez a ponte? <span className="text-[#C0392B]">*</span>
            </label>
            <select value={ponteId} onChange={e => setPonteId(e.target.value)}
              className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[14px] text-ink outline-none focus:border-accent">
              <option value="">Selecionar contato...</option>
              {outrosContatos.map(c => (
                <option key={c.id} value={c.id}>{c.nome} — {c.empresa_nome}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Contexto</label>
          <textarea value={notas} onChange={e => setNotas(e.target.value)}
            placeholder="Informações importantes, sensibilidades, histórico..."
            rows={3}
            className="w-full rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 py-3 text-[14px] text-ink placeholder:text-ink-4 outline-none focus:border-accent resize-none" />
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-[rgba(26,26,24,0.08)] pb-[env(safe-area-inset-bottom)]">
        <Button onClick={handleSave} disabled={!canSave} loading={saving} className="w-full">
          Salvar alterações
        </Button>
      </div>
    </div>
  )
}
