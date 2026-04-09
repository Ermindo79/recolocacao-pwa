import { supabase } from '../lib/supabase'
import type { DashboardData } from '../types'
import { MOCK_DASHBOARD } from '../data/mock'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL

export const dashboardService = {
  async get(): Promise<DashboardData> {
    if (USE_MOCK) return MOCK_DASHBOARD
    const { data, error } = await supabase.functions.invoke('dashboard')
    if (error) throw error
    return data as DashboardData
  },
}
