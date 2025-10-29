import { VideoInput } from '../../widgets/video-input/video-input'
import { VideoOutput } from '../../widgets/video-output/video-output'
import './video-segmentation.css'

export const VideoSegmentationPage = () => {
  return (
    <div className="video-segmentation">
      <header className="video-segmentation__header">
        <h1 className="video-segmentation__title">
          Приложение для сегментации видео
        </h1>
      </header>

      <main className="video-segmentation__content">
        <div className="video-segmentation__panel">
          <VideoInput />
        </div>
        
        <div className="video-segmentation__panel">
          <VideoOutput />
        </div>
      </main>
    </div>
  )
}
