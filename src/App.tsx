import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { useUIStore } from './stores/ui.store'
import Router from './router'

function OfflineDetector() {
  const setOffline = useUIStore((s) => s.setOffline)
  React.useEffect(() => {
    const handleOnline  = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOffline])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineDetector />
      <Router />
    </QueryClientProvider>
  )
}
