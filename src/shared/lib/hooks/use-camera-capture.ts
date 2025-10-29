import { useEffect, useRef } from 'react'
import { useVideoStreamStore } from '../../stores/video-stream/video-stream.store'

const CAMERA_CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user'
  },
  audio: false
}

export const useCameraCapture = () => {
  const { 
    setOriginalStream, 
    setIsCapturing, 
    setError 
  } = useVideoStreamStore()
  
  const streamRef = useRef<MediaStream | null>(null)

  const startCapture = async () => {
    try {
      setIsCapturing(true)
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS)
      streamRef.current = stream
      setOriginalStream(stream)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка доступа к камере'
      setError(errorMessage)
      setIsCapturing(false)
    }
  }

  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setOriginalStream(null)
      setIsCapturing(false)
    }
  }

  useEffect(() => {
    return () => {
      stopCapture()
    }
  }, [])

  return {
    startCapture,
    stopCapture
  }
}
