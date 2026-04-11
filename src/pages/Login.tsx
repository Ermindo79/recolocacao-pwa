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
    <div className="min-h-[100dvh] flex flex-col bg-accent">

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">

        {/* Ícone */}
        <div className="w-14 h-14 rounded-2xl border border-white/20 flex items-center justify-center mb-10">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Título com linha */}
        <div className="flex flex-col items-center">
          <span className="font-serif text-[38px] text-white/95 leading-[1.2] tracking-tight">
            Catch Up
          </span>
          <div className="w-12 h-px bg-white/30 my-2.5" />
          <span className="font-serif text-[38px] text-white/95 leading-[1.2] tracking-tight">
            Executivo
          </span>
        </div>

        <p className="text-[11px] text-white/30 tracking-[0.08em] uppercase mt-6">
          Seu processo. Organizado.
        </p>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-t-[28px] px-6 pt-8 pb-10 flex flex-col gap-4">

        {step === 'email' ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <p className="text-[17px] font-medium text-accent mb-1">Entrar</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-ink-3 uppercase tracking-[0.06em]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoFocus
                className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-[#f9fafb] px-3.5 text-[15px] text-ink placeholder:text-ink-4 outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-ink-3 uppercase tracking-[0.06em]">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-12 rounded-xl border border-[rgba(26,26,24,0.18)] bg-[#f9fafb] px-3.5 text-[15px] text-ink placeholder:text-ink-4 outline-none focus:border-accent transition-colors"
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
              Entrar
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
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
              className="text-[12px] text-ink-3 underline underline-offset-2 text-left"
            >
              Usar outro email
            </button>
          </div>
        )}

        {/* Dev bypass */}
        {import.meta.env.DEV && (
          <div className="mt-4 pt-4 border-t border-[rgba(26,26,24,0.08)]">
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

        {/* Rodapé */}
        <div className="flex justify-center pt-2">
          <p className="text-[11px] text-ink-4">Desenvolvido por ECN · v0.8</p>
        </div>
      </div>
    </div>
  )
}
