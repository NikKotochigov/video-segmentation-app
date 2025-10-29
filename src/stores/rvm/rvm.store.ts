import { create } from 'zustand'
import type { RvmGraphModel } from '../../shared/lib/ml/rvm/load-rvm'

interface RvmStoreState {
  model: RvmGraphModel
  isLoading: boolean
  error: string | null
  setModel: (m: RvmGraphModel) => void
  setIsLoading: (v: boolean) => void
  setError: (e: string | null) => void
}

export const useRvmStore = create<RvmStoreState>((set) => ({
  model: null,
  isLoading: false,
  error: null,
  setModel: (m) => set({ model: m }),
  setIsLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e })
}))
