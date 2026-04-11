import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const SESSION_DURATION_MS = 4 * 60 * 60 * 1000 // 30 dias

interface AuthState {
  user: User | null
  session: Session | null
  sessionStartedAt: number | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (v: boolean) => void
  signOut: () => void
  isSessionExpired: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      sessionStartedAt: null,
      isLoading: true,

      setUser: (user) => set({ user }),

      setSession: (session) => set({
        session,
        user: session?.user ?? null,
        sessionStartedAt: session ? Date.now() : null,
      }),

      setLoading: (isLoading) => set({ isLoading }),

      signOut: () => {
        supabase.auth.signOut()
        set({ user: null, session: null, sessionStartedAt: null })
      },

      isSessionExpired: () => {
        const { sessionStartedAt } = get()
        if (!sessionStartedAt) return true
        return Date.now() - sessionStartedAt > SESSION_DURATION_MS
      },
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({
        user: s.user,
        session: s.session,
        sessionStartedAt: s.sessionStartedAt,
      }),
    }
  )
)
