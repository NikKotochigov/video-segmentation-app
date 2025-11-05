import * as tf from '@tensorflow/tfjs';
import { GraphModel, Scalar } from '@tensorflow/tfjs';
import { IVideoSegmentOptions, RecurrentState } from './types.ts';

export class VideoSegment {
  private static instance: VideoSegment | null = null;

  private model: GraphModel | null;
  private readonly downsampleRatio: Scalar;
  private recurrentState: RecurrentState;
  private bgBitmap: ImageBitmap | null;
  private frameCount: number = 0;
  private frameSkip: number;
  private lastBgReload: number;
  private lastBitmap: ImageBitmap | null;
  private canvas: OffscreenCanvas | HTMLCanvasElement | null;
  private ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

  private constructor(options: IVideoSegmentOptions) {
    this.model = null;
    this.downsampleRatio = tf.scalar(options.downsample ?? 0.4, 'float32');
    this.recurrentState = {
      r1i: tf.zeros([1, 1, 1, 1], 'float32'),
      r2i: tf.zeros([1, 1, 1, 1], 'float32'),
      r3i: tf.zeros([1, 1, 1, 1], 'float32'),
      r4i: tf.zeros([1, 1, 1, 1], 'float32'),
    };
    this.bgBitmap = null;
    this.canvas = null;
    this.ctx = null;
    this.frameSkip = options.frameSkip ?? 0;
    this.lastBitmap = null;
    this.lastBgReload = 0; // время последней перезагрузки фона
  }

  static getInstance(): VideoSegment {
    if (!VideoSegment.instance) {
      VideoSegment.instance = new VideoSegment({ downsample: 0.4, frameSkip: 1 });
    }
    return VideoSegment.instance;
  }

  async loadModel(modelUrl: string) {
    const candidates: Array<'webgpu' | 'webgl' | 'wasm' | 'cpu'> = [
      'webgpu',
      'webgl',
      'wasm',
      'cpu',
    ];

    // Если WebGPU недоступен — не тратить время на попытку
    const hasWebGPU = typeof (navigator as any).gpu !== 'undefined';
    if (!hasWebGPU) {
      candidates.shift(); // убрать 'webgpu'
    }

    console.info('[RVM] Backends candidates:', candidates);

    for (const backend of candidates) {
      const t0 = performance.now();
      try {
        await tf.setBackend(backend);
        await tf.ready();
        const dt = (performance.now() - t0).toFixed(1);
        console.info(`[RVM] Backend selected: ${backend} (ready in ${dt}ms)`);
        break;
      } catch (e) {
        const dt = (performance.now() - t0).toFixed(1);
        console.warn(`[RVM] Backend failed: ${backend} (after ${dt}ms)`, e);
        continue;
      }
    }

    console.info('[RVM] Loading model from:', modelUrl);
    const t1 = performance.now();
    this.model = await tf.loadGraphModel(modelUrl);
    const tLoad = (performance.now() - t1).toFixed(1);
    console.info('[RVM] Model loaded in', tLoad, 'ms');
    console.info(
      '[RVM] Model inputs:',
      this.model.inputs.map((i) => i.name)
    );
    console.info(
      '[RVM] Model outputs:',
      this.model.outputs.map((o) => o.name)
    );
  }

  async setBackground(pngUrl: string) {
    // cache-buster - добавил проверку наличия '?'
    const url = pngUrl.includes('?') ? pngUrl : `${pngUrl}?t=${Date.now()}`;
    const img = new Image();
    img.src = url;
    await img.decode();
    if (this.bgBitmap) this.bgBitmap.close?.();
    this.bgBitmap = await createImageBitmap(img);
    console.log('✅ Background loaded:', url);
  }

  async reloadBackground(pngUrl = 'wallpaper.png') {
    // чтобы не перезагружать слишком часто
    const now = Date.now();
    if (now - this.lastBgReload < 1500) return;
    this.lastBgReload = now;
    await this.setBackground(pngUrl);
  }

  async predict(frameLike: VideoFrame | HTMLVideoElement) {
    if (!this.model) throw new Error('Model not loaded');
    if (!this.bgBitmap) {
      // Если фон не установлен, пытаемся загрузить дефолтный
      await this.reloadBackground('wallpaper.png');
      if (!this.bgBitmap) {
        // Если и это не помогло, используем черный фон, чтобы избежать краша
        console.warn('Background bitmap is null, skipping segmentation.');
        if (frameLike instanceof VideoFrame) return await createImageBitmap(frameLike);
        return frameLike;
      }
    }

    this.frameCount++;
    if (this.frameSkip > 0 && this.frameCount % this.frameSkip !== 0 && this.lastBitmap)
      return this.lastBitmap;

    // 🔁 автообновление фона (если файл поменялся)
    await this.reloadBackground('wallpaper.png');

    let bitmap;
    if (frameLike instanceof VideoFrame) bitmap = await createImageBitmap(frameLike);
    else bitmap = frameLike;

    const src = tf.tidy(() => tf.browser.fromPixels(bitmap).toFloat().div(255).expandDims(0));
    if (frameLike instanceof VideoFrame) { // @ts-ignore
      bitmap.close();
    }

    // Проверка размера state и входных данных
    // В RVM часто возникает ошибка, если state имеет неправильный размер (например, [1,1,1,1] после инициализации)
    // Но при первом запуске модель должна сама определить размер.
    // Здесь оставляем оригинальную логику, предполагая, что tf.zeros корректно обрабатывается при первом вызове.

    // @ts-ignore
    const [fgr, pha, r1o, r2o, r3o, r4o] = await this.model.executeAsync(
      { src, ...this.recurrentState, downsample_ratio: this.downsampleRatio },
      ['fgr', 'pha', 'r1o', 'r2o', 'r3o', 'r4o']
    );

    tf.dispose(this.recurrentState);
    this.recurrentState = { r1i: r1o, r2i: r2o, r3i: r3o, r4i: r4o };

    const rgba = tf.tidy(() => {
      const rgb = fgr.squeeze(0).mul(255).clipByValue(0, 255).cast('int32');
      const a = pha.squeeze(0).mul(255).clipByValue(0, 255).cast('int32');
      return tf.concat([rgb, a], -1);
    });

    const [h, w] = rgba.shape.slice(0, 2);
    const pixels = new Uint8ClampedArray(await rgba.data());
    const fgImageData = new ImageData(pixels, w, h);
    const fgBitmap = await createImageBitmap(fgImageData);
    tf.dispose([src, fgr, pha, rgba]);

    if (!this.canvas) {
      this.canvas =
        typeof OffscreenCanvas !== 'undefined'
          ? new OffscreenCanvas(w, h)
          : Object.assign(document.createElement('canvas'), { width: w, height: h });
      // @ts-ignore
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    this.ctx?.clearRect(0, 0, w, h);
    this.ctx?.drawImage(this.bgBitmap, 0, 0, w, h);
    this.ctx?.drawImage(fgBitmap, 0, 0, w, h);
    fgBitmap.close();

    const outBitmap =
      this.canvas instanceof OffscreenCanvas
        ? this.canvas.transferToImageBitmap()
        : await createImageBitmap(this.canvas);

    if (this.lastBitmap) this.lastBitmap.close?.();
    this.lastBitmap = outBitmap;
    return outBitmap;
  }

  dispose() {
    if (this.model) {
      this.model.dispose?.();
      this.model = null;
    }
    tf.dispose(this.downsampleRatio);
    tf.dispose(this.recurrentState);
    if (this.bgBitmap) {
      this.bgBitmap.close();
      this.bgBitmap = null;
    }
    if (this.lastBitmap) {
      this.lastBitmap.close();
      this.lastBitmap = null;
    }
    this.canvas = null;
    this.ctx = null;
  }
}
