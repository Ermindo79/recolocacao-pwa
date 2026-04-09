import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Narrativa } from '../types'
import { MOCK_NARRATIVA } from '../data/mock'

interface NarrativaState {
  narrativa: Narrativa | null
  setNarrativa: (n: Narrativa) => void
  updateNarrativa: (partial: Partial<Narrativa>) => void
}

export const useNarrativaStore = create<NarrativaState>()(
  persist(
    (set) => ({
      narrativa: MOCK_NARRATIVA,
      setNarrativa: (narrativa) => set({ narrativa }),
      updateNarrativa: (partial) =>
        set((state) => ({
          narrativa: state.narrativa
            ? { ...state.narrativa, ...partial, versao: state.narrativa.versao + 1, updated_at: new Date().toISOString() }
            : null,
        })),
    }),
    { name: 'narrativa-store' }
  )
)
