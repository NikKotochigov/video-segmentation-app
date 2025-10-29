import { create } from 'zustand'

interface VideoStreamStore {
  originalStream: MediaStream | null
  segmentedStream: MediaStream | null
  isCapturing: boolean
  error: string | null
  
  // Actions
  setOriginalStream: (stream: MediaStream | null) => void
  setSegmentedStream: (stream: MediaStream | null) => void
  setIsCapturing: (capturing: boolean) => void
  setError: (error: string | null) => void
}

export const useVideoStreamStore = create<VideoStreamStore>((set) => ({
  originalStream: null,
  segmentedStream: null,
  isCapturing: false,
  error: null,
  
  setOriginalStream: (stream) => set({ originalStream: stream }),
  setSegmentedStream: (stream) => set({ segmentedStream: stream }),
  setIsCapturing: (capturing) => set({ isCapturing: capturing }),
  setError: (error) => set({ error })
}))
