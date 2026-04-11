import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/auth.store'
import { AppShell } from './components/layout'

import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import PipelinePage from './pages/Pipeline'
import ContatosPage from './pages/Contatos'
import ContatoDetalhePage from './pages/ContatoDetalhe'
import ContatoNovoPage from './pages/ContatoNovo'
import ReuniaoNovaPage from './pages/ReuniaoNova'
import NarrativaPage from './pages/Narrativa'
import CalendarioPage from './pages/Calendario'
import ReuniaoPage from './pages/ReuniaoPrep'

const DEV_BYPASS = false

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isSessionExpired, signOut } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user && isSessionExpired()) {
      signOut()
      navigate('/login')
    }
  }, [user, isLoading, isSessionExpired, signOut, navigate])

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-surface">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!DEV_BYPASS && !user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AuthListener() {
  const { setSession, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setSession, setLoading])

  return null
}

export default function Router() {
  return (
    <BrowserRouter>
      <AuthListener />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <AppShell>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/pipeline" element={<PipelinePage />} />
                  <Route path="/contatos" element={<ContatosPage />} />
                  <Route path="/contatos/novo" element={<ContatoNovoPage />} />
                  <Route path="/contatos/:id" element={<ContatoDetalhePage />} />
                  <Route path="/reuniao/nova" element={<ReuniaoNovaPage />} />
                  <Route path="/reuniao/prep/:id" element={<ReuniaoPage />} />
                  <Route path="/narrativa" element={<NarrativaPage />} />
                  <Route path="/calendario" element={<CalendarioPage />} />
                </Routes>
              </AppShell>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
