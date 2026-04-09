import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/auth.store'
import { AppShell } from './components/layout'

import LoginPage        from './pages/Login'
import DashboardPage    from './pages/Dashboard'
import PipelinePage     from './pages/Pipeline'
import ContatosPage     from './pages/Contatos'
import ContatoDetalhePage from './pages/ContatoDetalhe'
import NarrativaPage    from './pages/Narrativa'
import ReuniaoNovaPage  from './pages/ReuniaoNova'

// Dev mode bypass — no Supabase configured yet
const DEV_BYPASS = import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_URL

function AuthGuard() {
  const { user, isLoading, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    if (DEV_BYPASS) { setLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [setSession, setLoading])

  if (isLoading) return (
    <div className="flex items-center justify-center h-[100dvh] bg-surface">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!DEV_BYPASS && !user) return <Navigate to="/login" replace />

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard />,
    children: [
      { path: '/',                element: <DashboardPage /> },
      { path: '/pipeline',        element: <PipelinePage /> },
      { path: '/contatos',        element: <ContatosPage /> },
      { path: '/contatos/:id',    element: <ContatoDetalhePage /> },
      { path: '/narrativa',       element: <NarrativaPage /> },
      { path: '/reuniao/nova',    element: <ReuniaoNovaPage /> },
    ],
  },
])

export default function Router() {
  return <RouterProvider router={router} />
}
