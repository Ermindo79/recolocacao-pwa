import React, { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui'

type LoginStep = 'email' | 'otp'

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(["", "", "", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  async function handleSubmitEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Tempo esgotado. Tente novamente.')), 10000)
    )

    try {
      const result = await Promise.race([
        supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        }),
        timeout,
      ]) as { error: Error | null }

      if (result.error) throw result.error
      setStep('otp')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar código.'
      if (msg.includes('rate') || msg.includes('limit')) {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitOtp(e: React.FormEvent) {
    e.preventDefault()
    const token = otp.join('')
    if (token.length !== 8) return
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Código inválido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 8).split('')
      const newOtp = [...otp]
      digits.forEach((d, i) => { if (i < 8) newOtp[i] = d })
      setOtp(newOtp)
      inputRefs.current[Math.min(digits.length, 7)]?.focus()
      return
    }
    const newOtp = [...otp]
    newOtp[index] = value.replace(/\D/g, '')
    setOtp(newOtp)
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-accent">

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        <div className="w-14 h-14 rounded-2xl border border-white/20 flex items-center justify-center mb-10">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="flex flex-col items-center">
          <span className="font-serif text-[38px] text-white/95 leading-[1.2] tracking-tight">Catch Up</span>
          <div className="w-12 h-px bg-white/30 my-2.5" />
          <span className="font-serif text-[38px] text-white/95 leading-[1.2] tracking-tight">Executivo</span>
        </div>

        <p className="text-[11px] text-white/30 tracking-[0.08em] uppercase mt-6">
          Seu processo. Organizado.
        </p>
      </div>

      <div className="bg-white rounded-t-[28px] px-6 pt-8 pb-10 flex flex-col gap-4">

        {step === 'email' ? (
          <form onSubmit={handleSubmitEmail} className="flex flex-col gap-4">
            <p className="text-[17px] font-medium text-accent">Entrar</p>

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

            <Button type="submit" loading={loading} disabled={!email} className="w-full">
              Entrar
            </Button>
          </form>

        ) : (
          <form onSubmit={handleSubmitOtp} className="flex flex-col gap-4">
            <div>
              <p className="text-[17px] font-medium text-accent mb-1">Código de acesso</p>
              <p className="text-[13px] text-ink-3">
                Enviamos um código para <span className="font-medium text-ink">{email}</span>.
              </p>
            </div>

            <div className="flex gap-2 justify-between">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-10 h-14 rounded-xl border border-[rgba(26,26,24,0.18)] bg-[#f9fafb] text-center text-[22px] font-medium text-accent outline-none focus:border-accent transition-colors"
                />
              ))}
            </div>

            {error && (
              <p className="text-[12px] text-[#C0392B] bg-[#FDF0EE] px-3 py-2 rounded-lg">{error}</p>
            )}

            <Button type="submit" loading={loading} disabled={otp.join('').length !== 8} className="w-full">
              Confirmar
            </Button>

            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(["", "", "", "", "", "", "", ""]); setError('') }}
              className="text-[12px] text-ink-3 underline underline-offset-2 text-center"
            >
              Usar outro email
            </button>
          </form>
        )}

        {import.meta.env.DEV && (
          <div className="mt-4 pt-4 border-t border-[rgba(26,26,24,0.08)]">
            <p className="text-[10px] text-ink-4 mb-2 uppercase tracking-wider">Dev mode</p>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
              Entrar sem auth →
            </Button>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <p className="text-[11px] text-ink-4">Desenvolvido por ECN · v0.8</p>
        </div>
      </div>
    </div>
  )
}
