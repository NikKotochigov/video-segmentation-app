import { useEffect, useRef, forwardRef } from 'react'
import './video-player.css'

interface VideoPlayerProps {
  stream: MediaStream | null
  title: string
  className?: string
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ stream, title, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    
    // Объединяем внешний ref с внутренним
    const combinedRef = (node: HTMLVideoElement) => {
      videoRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    useEffect(() => {
      const video = videoRef.current
      if (!video) return

      if (stream) {
        video.srcObject = stream
        video.onloadedmetadata = () => {
          video.play().catch(console.error)
        }
      } else {
        video.srcObject = null
      }
    }, [stream])

    return (
      <div className={`video-player ${className || ''}`}>
        <div className="video-player__header">
          <h3 className="video-player__title">{title}</h3>
        </div>
        <div className="video-player__container">
          <video
            ref={combinedRef}
            autoPlay
            playsInline
            muted
            className="video-player__video"
          />
          {!stream && (
            <div className="video-player__placeholder">
              <span>Нет видеопотока</span>
            </div>
          )}
        </div>
      </div>
    )
  }
)

VideoPlayer.displayName = 'VideoPlayer'
