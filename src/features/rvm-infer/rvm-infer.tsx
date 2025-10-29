import * as tf from '@tensorflow/tfjs'
import { useEffect, useRef } from 'react'
import { useRvmStore } from '../../stores/rvm/rvm.store'
import { useVideoStreamStore } from '../../stores/video-stream/video-stream.store'
import { createRvmRunner } from '../../shared/lib/ml/rvm/infer-rvm'
import { CanvasSurface } from '../../shared/ui/canvas-surface/canvas-surface'
import { Typography } from '@mui/material'

export const RvmInfer = () => {
  const { model } = useRvmStore()
  const { originalStream } = useVideoStreamStore()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Привязываем источник к скрытому видео, чтобы читать кадры
  useEffect(() => {
    if (!originalStream) return
    const v = document.createElement('video')
    v.autoplay = true
    v.muted = true
    v.playsInline = true
    v.srcObject = originalStream
    videoRef.current = v
    return () => {
      v.srcObject = null
      videoRef.current = null
    }
  }, [originalStream])

  useEffect(() => {
    if (!model || !videoRef.current || !canvasRef.current) return
    let running = true
    let raf = 0
    const runner = createRvmRunner(model, 0.25)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!

    const loop = () => {
      if (!running) return
      const video = videoRef.current!
      if (video.readyState >= 2) {
        tf.engine().startScope()
        try {
          const { pha } = runner.runOnce(video)
          const h = pha.shape[1], w = pha.shape[2]
          const gray = tf.squeeze(tf.mul(pha, 255)).cast('int32') // HxW
          const rgb = tf.stack([gray, gray, gray], -1).cast('int32') // HxWx3
          const a = tf.fill([h, w, 1], 255, 'int32')
          const rgba = tf.concat([rgb, a], -1)
          const data = new ImageData(
            Uint8ClampedArray.from(rgba.dataSync() as any),
            w, h
          )
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w
            canvas.height = h
          }
          ctx.putImageData(data, 0, 0)
          tf.dispose([gray, rgb, a, rgba, pha])
        } catch (e) {
          console.warn('[RVM] infer error', e)
        }
        tf.engine().endScope()
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => { running = false; cancelAnimationFrame(raf); runner.dispose() }
  }, [model])

  return (
    <CanvasSurface
      ref={canvasRef}
      title={<Typography variant="subtitle2">Результат сегментации (альфа)</Typography>}
    />
  )
}
