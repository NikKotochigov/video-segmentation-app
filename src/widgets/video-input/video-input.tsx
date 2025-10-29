import { useVideoStreamStore } from '../../stores/video-stream/video-stream.store'
import { useCameraCapture } from '../../shared/lib/hooks/use-camera-capture'
import { VideoPlayer } from '../../shared/ui/video-player/video-player'
import './video-input.css'

export const VideoInput = () => {
  const { originalStream, isCapturing, error } = useVideoStreamStore()
  const { startCapture, stopCapture } = useCameraCapture()

  return (
    <div className="video-input">
      <div className="video-input__controls">
        {!isCapturing ? (
          <button 
            onClick={startCapture}
            className="video-input__button video-input__button--start"
          >
            Включить камеру
          </button>
        ) : (
          <button 
            onClick={stopCapture}
            className="video-input__button video-input__button--stop"
          >
            Остановить
          </button>
        )}
        
        {error && (
          <div className="video-input__error">
            Ошибка: {error}
          </div>
        )}
      </div>

      <VideoPlayer 
        stream={originalStream}
        title="Исходное видео"
        className="video-input__player"
      />
    </div>
  )
}
