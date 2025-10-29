import * as tf from '@tensorflow/tfjs'

export type RvmGraphModel = tf.GraphModel | null

export interface RvmModelState {
  model: RvmGraphModel
  isLoading: boolean
  error: string | null
}

const DEFAULT_STATE: RvmModelState = {
  model: null,
  isLoading: false,
  error: null,
}

// URL должен указывать на model.json, размещенный на CDN/GitHub Pages/сервере
// Пример: '/models/rvm_mobilenetv3_tfjs_int8/model.json'
export async function loadRvmModel(modelUrl: string): Promise<tf.GraphModel> {
  // Выбираем оптимальный бэкенд: webgpu -> webgl -> wasm -> cpu
  // Пытаться включить WebGPU, если доступен
  try {
    if (await tf.backend().ready) {
      // no-op if already ready
    }
  } catch {}

  const backends = ['webgpu', 'webgl', 'wasm', 'cpu'] as const
  for (const b of backends) {
    try {
      // @ts-ignore - dynamic backend selection string
      await tf.setBackend(b)
      await tf.ready()
      break
    } catch {}
  }

  const model = await tf.loadGraphModel(modelUrl)
  // прогрев модели нулевым тензором подходящей формы потребуется после выяснения входных размеров
  return model
}
