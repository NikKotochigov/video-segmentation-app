import * as tf from '@tensorflow/tfjs'
import { useEffect, useRef, useState } from 'react'
import { useRvmStore } from '../../stores/rvm/rvm.store'
import { useVideoStreamStore } from '../../stores/video-stream/video-stream.store'
import { createRvmRunner } from '../../shared/lib/ml/rvm/infer-rvm'
import { CanvasSurface } from '../../shared/ui/canvas-surface/canvas-surface'
import { Typography, Stack, ToggleButton, ToggleButtonGroup, Box } from '@mui/material'
import { composeForeground, makeSolidBg } from '../../shared/lib/ml/rvm/compose'

export const RvmInfer = () => {
  const { model } = useRvmStore()
  const { originalStream } = useVideoStreamStore()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [videoReady, setVideoReady] = useState(0)
  const [mode, setMode] = useState<'alpha' | 'compose' | 'foreground'>('alpha')

  const handleMode = (_: any, val: 'alpha' | 'compose' | 'foreground') => {
    if (val) setMode(val)
  }

  // Привязываем источник к скрытому видео и ждём loadedmetadata
  useEffect(() => {
    if (!originalStream) return
    const v = document.createElement('video')
    v.autoplay = true
    v.muted = true
    v.playsInline = true
    v.srcObject = originalStream
    const onLoaded = () => {
      v.play().catch(console.warn)
      videoRef.current = v
      setVideoReady((x) => x + 1)
    }
    v.addEventListener('loadedmetadata', onLoaded)
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded)
      v.srcObject = null
      videoRef.current = null
    }
  }, [originalStream])

  // Цикл инференса стартует, когда готовы и модель, и видео
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!model || !video || !canvas) return

    let running = true
    let raf = 0
    const runner = createRvmRunner(model, 0.25)
    const ctx = canvas.getContext('2d')!

    const loop = async () => {
      if (!running) return
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        try {
          const { fgr, pha } = await runner.runOnce(video)
          const h = pha.shape[1], w = pha.shape[2]

          let outRGB: tf.Tensor
          if (mode === 'alpha') {
            const gray = tf.squeeze(tf.mul(pha, 255)).cast('int32')
            const rgb = tf.stack([gray, gray, gray], -1).cast('int32')
            const a = tf.fill([h, w, 1], 255, 'int32')
            const rgba = tf.concat([rgb, a], -1)
            const data = new ImageData(Uint8ClampedArray.from(rgba.dataSync() as any), w, h)
            if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
            ctx.putImageData(data, 0, 0)
            tf.dispose([gray, rgb, a, rgba])
            tf.dispose([fgr, pha])
          } else {
            // Приводим fgr к [1,H,W,3]
            const fgr3 = fgr
            if (mode === 'foreground') {
              outRGB = fgr3
            } else {
              const bg = makeSolidBg(h, w, [0.0, 0.6, 0.2])
              outRGB = composeForeground(fgr3, pha, bg)
              bg.dispose()
            }
            const u8 = tf.mul(tf.clipByValue(outRGB, 0, 1), 255).cast('int32') // [1,H,W,3]
            const u8s = tf.squeeze(u8, [0]) // [H,W,3]
            const a = tf.fill([h, w, 1], 255, 'int32')
            const rgba = tf.concat([u8s, a], -1)
            const data = new ImageData(Uint8ClampedArray.from(rgba.dataSync() as any), w, h)
            if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
            ctx.putImageData(data, 0, 0)
            tf.dispose([u8, u8s, a, rgba, outRGB, fgr, pha])
          }
        } catch (e) {
          console.warn('[RVM] infer error', e)
        }
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => { running = false; cancelAnimationFrame(raf); runner.dispose() }
  }, [model, videoReady, mode])

  return (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <ToggleButtonGroup size="small" value={mode} exclusive onChange={handleMode}>
          <ToggleButton value="alpha">Альфа</ToggleButton>
          <ToggleButton value="compose">Композиция</ToggleButton>
          <ToggleButton value="foreground">Передний план</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <CanvasSurface
        ref={canvasRef}
        title={<Typography variant="subtitle2">Результат сегментации</Typography>}
      />
    </Stack>
  )
}
