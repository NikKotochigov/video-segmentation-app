import { Box, Button, Alert, Stack, Typography } from '@mui/material'
import { useVideoStreamStore } from '../../stores/video-stream/video-stream.store'
import { useCameraCapture } from '../../shared/lib/hooks/use-camera-capture'
import { VideoSurface } from '../../shared/ui/video-surface/video-surface'

export const VideoInput = () => {
  const { originalStream, isCapturing, error } = useVideoStreamStore()
  const { startCapture, stopCapture } = useCameraCapture()

  return (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {!isCapturing ? (
            <Button variant="contained" color="success" onClick={startCapture}>
              Включить камеру
            </Button>
          ) : (
            <Button variant="contained" color="error" onClick={stopCapture}>
              Остановить
            </Button>
          )}
          {error && <Alert severity="error">Ошибка: {error}</Alert>}
        </Stack>
      </Box>
      <Box sx={{ flex: 1, minHeight: 240 }}>
        <VideoSurface stream={originalStream} title={<Typography variant="subtitle2">Исходное видео</Typography>} />
      </Box>
    </Stack>
  )
}
