import React from 'react'
import { clsx } from '../../utils'
import type { ContactHeat, PipelineStage } from '../../types'
import { CALOR_CONFIG, TIPO_CONFIG, iniciais } from '../../utils'

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps { label: string; className?: string }
export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center text-[10px] font-medium px-[7px] py-[2px] rounded-full', className)}>
      {label}
    </span>
  )
}

export function CalorBadge({ calor }: { calor: ContactHeat }) {
  const cfg = CALOR_CONFIG[calor]
  return <Badge label={cfg.label} className={cfg.className} />
}

export function TipoBadge({ tipo }: { tipo: string }) {
  const cfg = TIPO_CONFIG[tipo] ?? { label: tipo, className: 'bg-surface-2 text-ink-3' }
  return <Badge label={cfg.label} className={cfg.className} />
}

export function PrimarioBadge({ primario, ponteNome }: { primario: boolean; ponteNome?: string }) {
  if (primario) return <Badge label="Primário" className="bg-accent-lt text-accent" />
  return <Badge label={`via ${ponteNome ?? '—'}`} className="bg-surface-2 text-ink-3" />
}

// ─── Avatar color logic ───────────────────────────────────────────────────────
function getAvatarColor(calor?: ContactHeat, pipeline?: PipelineStage): string {
  // Pipeline rules first
  if (pipeline === 'oportunidade' || pipeline === 'reuniao') return 'bg-[#EBF5F0] text-[#1A6B45]'
  if (pipeline === 'arquivado' || pipeline === 'mapeado') return 'bg-surface-2 text-ink-3'

  // Followup rules
  if (pipeline === 'followup') {
    if (calor === 'agendado' || calor === 'quente') return 'bg-[#EBF5F0] text-[#1A6B45]'
    if (calor === 'morno') return 'bg-accent-lt text-accent'
    if (calor === 'frio') return 'bg-warm-lt text-warm'
    return 'bg-surface-2 text-ink-3'
  }

  // Acionado rules
  if (pipeline === 'acionado') {
    if (calor === 'agendado' || calor === 'quente' || calor === 'morno') return 'bg-warm-lt text-warm'
    return 'bg-surface-2 text-ink-3'
  }

  // Fallback by calor
  if (calor === 'agendado' || calor === 'quente') return 'bg-[#EBF5F0] text-[#1A6B45]'
  if (calor === 'morno') return 'bg-warm-lt text-warm'
  return 'bg-surface-2 text-ink-3'
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
interface AvatarProps {
  nome: string
  size?: 'sm' | 'md' | 'lg'
  calor?: ContactHeat
  pipeline?: PipelineStage
}

export function Avatar({ nome, size = 'md', calor, pipeline }: AvatarProps) {
  const colorClass = (calor || pipeline)
    ? getAvatarColor(calor, pipeline)
    : (() => {
        const AVATAR_COLORS = [
          'bg-accent-lt text-accent',
          'bg-warm-lt text-warm',
          'bg-[#EBF5F0] text-[#1A6B45]',
          'bg-surface-2 text-ink-3',
        ]
        return AVATAR_COLORS[nome.charCodeAt(0) % AVATAR_COLORS.length]
      })()

  const sizeClass = size === 'sm' ? 'w-8 h-8 text-[11px] rounded-[8px]'
    : size === 'lg' ? 'w-12 h-12 text-[16px] rounded-[14px]'
    : 'w-[38px] h-[38px] text-[13px] rounded-[11px]'

  return (
    <div className={clsx('flex items-center justify-center font-medium shrink-0', colorClass, sizeClass)}>
      {iniciais(nome)}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-surface-3 rounded-lg', className)} />
}

export function ContactCardSkeleton() {
  return (
    <div className="bg-white border border-[rgba(26,26,24,0.10)] rounded-xl p-[11px_13px] flex items-center gap-3">
      <Skeleton className="w-[38px] h-[38px] rounded-[11px] shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-24" />
      </div>
      <Skeleton className="h-5 w-12 rounded-full" />
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-surface-3 rounded-xl p-3.5">
      <Skeleton className="h-7 w-8 mb-1" />
      <Skeleton className="h-2.5 w-20" />
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}
export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-[10px] transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none'
  const variants = {
    primary:   'bg-accent text-white border-0',
    secondary: 'bg-transparent text-accent border border-accent',
    ghost:     'bg-surface-2 text-ink-2 border-0',
    danger:    'bg-[#FDF0EE] text-[#C0392B] border-0',
  }
  const sizes = {
    sm: 'text-xs px-3.5 py-[7px]',
    md: 'text-sm px-[22px] py-3',
  }
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" /> : null}
      {children}
    </button>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastItemProps { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }
export function ToastItem({ message, type, onClose }: ToastItemProps) {
  const colors = {
    success: 'bg-[#EBF5F0] text-[#1A6B45] border-[rgba(26,107,69,0.2)]',
    error:   'bg-[#FDF0EE] text-[#C0392B] border-[rgba(192,57,43,0.2)]',
    info:    'bg-accent-lt text-accent border-[rgba(28,61,90,0.2)]',
  }
  return (
    <div className={clsx('flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-medium shadow-sm', colors[type])}>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────
interface EmptyStateProps { icon?: string; title: string; subtitle?: string; action?: React.ReactNode }
export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && <div className="text-4xl mb-3 opacity-40">{icon}</div>}
      <p className="text-[15px] font-medium text-ink-2 mb-1">{title}</p>
      {subtitle && <p className="text-[12px] text-ink-3 mb-4">{subtitle}</p>}
      {action}
    </div>
  )
}

// ─── Error state ─────────────────────────────────────────────────────────────
interface ErrorStateProps { message?: string; onRetry?: () => void }
export function ErrorState({ message = 'Algo deu errado.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <p className="text-[15px] font-medium text-[#C0392B] mb-1">{message}</p>
      {onRetry && <Button variant="ghost" size="sm" onClick={onRetry} className="mt-3">Tentar novamente</Button>}
    </div>
  )
}

// ─── Section header ──────────────────────────────────────────────────────────
export function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-ink-4">{label}</span>
      {count !== undefined && (
        <span className="text-[10px] font-medium bg-accent-lt text-accent px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  )
}

// ─── Offline banner ───────────────────────────────────────────────────────────
export function OfflineBanner() {
  return (
    <div className="bg-[#FDF5E6] text-[#9A6B1A] text-[11px] font-medium px-4 py-2 text-center border-b border-[rgba(154,107,26,0.15)]">
      Sem conexão — mostrando dados salvos
    </div>
  )
}