import { useEffect, useRef, useState } from 'react';
import { useVideoStreamStore } from '../../stores/video-stream/video-stream.store';
import { CanvasSurface } from '../../shared/ui/canvas-surface/canvas-surface';
import { Typography, Stack } from '@mui/material';
import { VideoSegment } from '../../shared/lib/ml/video-segment';

export const RvmInfer = () => {
  const { originalStream } = useVideoStreamStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoReady, setVideoReady] = useState(0);

  // Привязываем источник к скрытому видео и ждём loadedmetadata
  useEffect(() => {
    if (!originalStream) return;
    const v = document.createElement('video');
    v.autoplay = true;
    v.muted = true;
    v.playsInline = true;
    v.srcObject = originalStream;
    const onLoaded = () => {
      v.play().catch(console.warn);
      videoRef.current = v;
      setVideoReady((x) => x + 1);
    };
    v.addEventListener('loadedmetadata', onLoaded);
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded);
      v.srcObject = null;
      videoRef.current = null;
    };
  }, [originalStream]);

  // Цикл инференса стартует, когда готовы и модель, и видео
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let running = true;
    let raf = 0;
    const ctx = canvas.getContext('2d')!;

    let lastFrame = 0;
    const FPS_LIMIT = 30;

    const loop = async () => {
      if (!running) return;
      const now = performance.now();
      if (now - lastFrame < 1000 / FPS_LIMIT) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastFrame = now;

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        try {
          const bmp = await VideoSegment.getInstance().predict(video);
          if (ctx && canvasRef?.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(bmp, 0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        } catch (e) {
          console.warn('[RVM] infer error', e);
        }
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [videoReady]);

  return (
    <Stack sx={{ height: '100%' }}>
      <CanvasSurface
        ref={canvasRef}
        title={<Typography variant="subtitle2">Результат сегментации</Typography>}
      />
    </Stack>
  );
};
