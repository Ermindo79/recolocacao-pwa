import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
 
interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (v: boolean) => void
  signOut: () => void
}
 
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({
        session,
        user: session?.user ?? null,
      }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => {
        supabase.auth.signOut()
        set({ user: null, session: null })
      },
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ user: s.user, session: s.session }),
    }
  )
)