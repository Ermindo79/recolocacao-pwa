import React, { useState } from 'react'
import { useNarrativaStore } from '../stores/narrativa.store'
import { useUIStore } from '../stores/ui.store'
import { useAuthStore } from '../stores/auth.store'
import { PageWrapper } from '../components/layout'
import { Button } from '../components/ui'
import { formatarData, clsx } from '../utils'

export default function NarrativaPage() {
  const { narrativa, updateNarrativa } = useNarrativaStore()
  const { addToast } = useUIStore()
  const { signOut } = useAuthStore()
  const [editando, setEditando] = useState(false)
  const [draft, setDraft] = useState(narrativa ?? {})
  const [copiado, setCopiado] = useState<number | null>(null)

  function handleEditar() {
    setDraft(narrativa ?? {})
    setEditando(true)
  }

  function handleSalvar() {
    updateNarrativa(draft as Parameters<typeof updateNarrativa>[0])
    setEditando(false)
    addToast('Narrativa atualizada.')
  }

  async function copiarFrase(frase: string, idx: number) {
    await navigator.clipboard.writeText(frase)
    setCopiado(idx)
    setTimeout(() => setCopiado(null), 2000)
  }

  if (!narrativa) return (
    <PageWrapper>
      <div className="px-4 py-8 text-center">
        <p className="text-[15px] font-medium text-ink mb-1">Narrativa ainda não definida.</p>
        <p className="text-[12px] text-ink-3 mb-4">Preencha agora — ela guia todas as conversas.</p>
        <Button onClick={handleEditar}>Definir narrativa</Button>
        <div className="pt-8 mt-8 border-t border-[rgba(26,26,24,0.08)]">
          <button
            onClick={signOut}
            className="w-full text-[13px] text-ink-4 py-2 text-center"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <div className="px-4 pt-5 pb-3 bg-white border-b border-[rgba(26,26,24,0.06)] flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-ink">Perfil</h1>
          <p className="text-[11px] text-ink-4 mt-0.5">
            Versão {narrativa.versao} · atualizada em {formatarData(narrativa.updated_at)}
          </p>
        </div>
        {!editando && (
          <Button variant="ghost" size="sm" onClick={handleEditar}>Editar</Button>
        )}
      </div>

      <div className="px-4 py-4 space-y-3 pb-24">

        <Section label="Posicionamento">
          {editando ? (
            <textarea
              value={(draft as typeof narrativa).posicionamento ?? ''}
              onChange={(e) => setDraft(d => ({ ...d, posicionamento: e.target.value }))}
              className={textareaClass}
              rows={2}
            />
          ) : (
            <p className="text-[14px] text-ink leading-relaxed">{narrativa.posicionamento}</p>
          )}
        </Section>

        <Section label="Narrativa de saída">
          {editando ? (
            <textarea
              value={(draft as typeof narrativa).narrativa_saida ?? ''}
              onChange={(e) => setDraft(d => ({ ...d, narrativa_saida: e.target.value }))}
              className={textareaClass}
              rows={3}
            />
          ) : (
            <p className="text-[14px] text-ink leading-relaxed">{narrativa.narrativa_saida}</p>
          )}
        </Section>

        <Section label="Contextos preferidos">
          <div className="flex gap-2 flex-wrap">
            {narrativa.contextos.map((c, i) => (
              <span key={i} className="text-[11px] font-medium bg-accent-lt text-accent px-2.5 py-1 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </Section>

        <Section label="Setores-alvo">
          <div className="flex gap-2 flex-wrap">
            {narrativa.setores.map((s, i) => (
              <span key={i} className="text-[11px] font-medium bg-surface-2 text-ink-2 px-2.5 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </Section>

        <Section label="Frases aprovadas — toque para copiar">
          <div className="space-y-2">
            {narrativa.frases_aprovadas.map((frase, idx) => (
              <button
                key={idx}
                onClick={() => copiarFrase(frase, idx)}
                className={clsx(
                  'w-full text-left px-3.5 py-3 rounded-xl border transition-all',
                  copiado === idx
                    ? 'bg-[#EBF5F0] border-[rgba(26,107,69,0.2)]'
                    : 'bg-white border-[rgba(26,26,24,0.10)] active:bg-surface-2'
                )}
              >
                <p className={clsx(
                  'text-[13px] leading-relaxed',
                  copiado === idx ? 'text-[#1A6B45]' : 'text-ink-2'
                )}>
                  {frase}
                </p>
                {copiado === idx && (
                  <p className="text-[10px] text-[#1A6B45] font-medium mt-1">Copiado ✓</p>
                )}
              </button>
            ))}
          </div>
        </Section>

        {editando && (
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSalvar} className="flex-1">Salvar narrativa</Button>
            <Button variant="ghost" onClick={() => setEditando(false)}>Cancelar</Button>
          </div>
        )}

        {!editando && (
          <div className="pt-4 border-t border-[rgba(26,26,24,0.08)]">
            <button
              onClick={signOut}
              className="w-full text-[13px] text-ink-4 py-2 text-center hover:text-[#C0392B] transition-colors"
            >
              Sair da conta
            </button>
          </div>
        )}

      </div>
    </PageWrapper>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[rgba(26,26,24,0.10)] rounded-xl px-3.5 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-4 mb-2">{label}</p>
      {children}
    </div>
  )
}

const textareaClass = 'w-full rounded-xl border border-[rgba(26,26,24,0.18)] bg-surface px-3 py-2.5 text-[14px] text-ink outline-none focus:border-accent resize-none'
