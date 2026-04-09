import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { clsx } from '../../utils'
import { useUIStore } from '../../stores/ui.store'
import { ToastItem, OfflineBanner } from '../ui'

const NAV_ITEMS = [
  {
    to: '/', label: 'Dashboard',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke={active ? '#1C3D5A' : '#9A9A95'} strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="12" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="12" width="7" height="7" rx="1.5" />
        <rect x="12" y="12" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/pipeline', label: 'Pipeline',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke={active ? '#1C3D5A' : '#9A9A95'} strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="5" height="18" rx="2" />
        <rect x="9" y="7" width="5" height="14" rx="2" />
        <rect x="15" y="5" width="5" height="16" rx="2" />
      </svg>
    ),
  },
  {
    to: '/contatos', label: 'Contatos',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke={active ? '#1C3D5A' : '#9A9A95'} strokeWidth="1.8" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: '/calendario', label: 'Agenda',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke={active ? '#1C3D5A' : '#9A9A95'} strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: '/narrativa', label: 'Narrativa',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke={active ? '#1C3D5A' : '#9A9A95'} strokeWidth="1.8" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="12" y2="17" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const location = useLocation()
  return (
    <nav className="bg-white border-t border-[rgba(26,26,24,0.10)] flex justify-around items-center px-1 pb-[env(safe-area-inset-bottom)] pt-2">
      {NAV_ITEMS.map(({ to, label, icon }) => {
        const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
        return (
          <NavLink key={to} to={to} className="flex flex-col items-center gap-[3px] px-2 py-1">
            {icon(active)}
            <span className={clsx('text-[9px] font-medium', active ? 'text-accent' : 'text-ink-4')}>{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

interface TopBarProps {
  title?: string
  back?: boolean
  onBack?: () => void
  right?: React.ReactNode
}
export function TopBar({ title, back, onBack, right }: TopBarProps) {
  return (
    <header className="bg-white border-b border-[rgba(26,26,24,0.08)] px-4 py-3 flex items-center gap-3 min-h-[52px]">
      {back && (
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center -ml-1 text-ink-2">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="m13 17-5-5 5-5" />
          </svg>
        </button>
      )}
      {title && <h1 className="font-medium text-[17px] text-ink flex-1 truncate">{title}</h1>}
      {right && <div className="ml-auto">{right}</div>}
    </header>
  )
}

interface PageWrapperProps { children: React.ReactNode; className?: string }
export function PageWrapper({ children, className }: PageWrapperProps) {
  const isOffline = useUIStore((s) => s.isOffline)
  return (
    <div className={clsx('flex-1 overflow-y-auto bg-surface', className)}>
      {isOffline && <OfflineBanner />}
      {children}
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useUIStore()
  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-white overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        {children}
      </div>
      <BottomNav />
      <div className="absolute bottom-20 left-4 right-4 space-y-2 z-50 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}

interface FABProps { onClick: () => void; label?: string }
export function FAB({ onClick, label }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 w-14 h-14 bg-accent text-white rounded-[18px] flex items-center justify-center active:scale-95 transition-transform"
      aria-label={label ?? 'Adicionar'}
    >
      <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  )
}
