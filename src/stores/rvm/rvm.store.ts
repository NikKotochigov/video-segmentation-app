import { create } from 'zustand'
import type { RvmGraphModel } from '../../shared/lib/ml/rvm/load-rvm'

const DEFAULT_STATE = {
  model: null as RvmGraphModel,
  isLoading: false,
  error: null as string | null,
}

interface RvmStoreState extends typeof DEFAULT_STATE {
  setModel: (m: RvmGraphModel) => void
  setIsLoading: (v: boolean) => void
  setError: (e: string | null) => void
}

export const useRvmStore = create<RvmStoreState>((set) => ({
  ...DEFAULT_STATE,
  setModel: (m) => set({ model: m }),
  setIsLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),
}))
