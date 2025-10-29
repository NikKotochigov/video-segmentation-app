import { Box, Stack, Typography, Chip } from '@mui/material'
import { useVideoStreamStore } from '../../stores/video-stream/video-stream.store'
import { VideoSurface } from '../../shared/ui/video-surface/video-surface'

export const VideoOutput = () => {
  const { segmentedStream } = useVideoStreamStore()

  return (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Chip label={segmentedStream ? 'Обработка активна' : 'Ожидание обработки'} color={segmentedStream ? 'success' : 'default'} />
      </Box>
      <Box sx={{ flex: 1, minHeight: 240 }}>
        <VideoSurface stream={segmentedStream} title={<Typography variant="subtitle2">Результат сегментации</Typography>} />
      </Box>
    </Stack>
  )
}
