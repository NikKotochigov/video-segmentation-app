import { Box, Paper, Stack } from '@mui/material'
import { ReactNode, useEffect, useRef } from 'react'

interface Props {
  stream: MediaStream | null
  title: ReactNode
}

export const VideoSurface = ({ stream, title }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null)

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
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>{title}</Box>
      <Paper elevation={0} sx={{ flex: 1, position: 'relative', bgcolor: 'black', overflow: 'hidden' }}>
        <Box component="video" ref={videoRef} autoPlay playsInline muted sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {!stream && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
            Нет видеопотока
          </Box>
        )}
      </Paper>
    </Stack>
  )
}
