import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui'

type LoginStep = 'email' | 'sent'

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) throw error
      setStep('sent')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar link. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface">
      {/* Header */}
      <div className="bg-accent px-6 pt-16 pb-10">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-white/50 mb-2">
          Sistema operacional de
        </p>
        <h1 className="font-serif text-[32px] text-white/95 leading-[1.1]">
          Transição<br />executiva.
        </h1>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col px-5 pt-8">
        {step === 'email' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-[17px] font-medium text-ink mb-1">Entrar</p>
              <p className="text-[13px] text-ink-3">Você receberá um link seguro. Sem senha necessária.</p>
            </div>

            <div>
              <label className="text-[12px] font-medium text-ink-3 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoFocus
                className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-white px-3.5 text-[15px] text-ink placeholder:text-ink-4 outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <p className="text-[12px] text-[#C0392B] bg-[#FDF0EE] px-3 py-2 rounded-lg">{error}</p>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={!email}
              className="w-full"
            >
              Enviar link de acesso
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-accent-lt rounded-xl flex items-center justify-center">
              <svg width="22" height="22" fill="none" stroke="#1C3D5A" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <p className="text-[17px] font-medium text-ink mb-1">Verifique seu email</p>
              <p className="text-[13px] text-ink-3">
                Enviamos um link para <span className="font-medium text-ink">{email}</span>.
                O link expira em 1 hora.
              </p>
            </div>
            <button
              onClick={() => setStep('email')}
              className="text-[12px] text-ink-3 underline underline-offset-2"
            >
              Usar outro email
            </button>
          </div>
        )}

        {/* Dev bypass */}
        {import.meta.env.DEV && (
          <div className="mt-8 pt-6 border-t border-[rgba(26,26,24,0.08)]">
            <p className="text-[10px] text-ink-4 mb-2 uppercase tracking-wider">Dev mode</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              Entrar sem auth →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
