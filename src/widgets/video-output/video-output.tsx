import { useVideoStreamStore } from '../../stores/video-stream/video-stream.store'
import { VideoPlayer } from '../../shared/ui/video-player/video-player'
import './video-output.css'

export const VideoOutput = () => {
  const { segmentedStream } = useVideoStreamStore()

  return (
    <div className="video-output">
      <div className="video-output__info">
        <span className="video-output__status">
          {segmentedStream ? 'Обработка активна' : 'Ожидание обработки'}
        </span>
      </div>

      <VideoPlayer 
        stream={segmentedStream}
        title="Результат сегментации"
        className="video-output__player"
      />
    </div>
  )
}
