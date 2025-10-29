import * as tf from '@tensorflow/tfjs'

export type RvmGraphModel = tf.GraphModel | null

// Загружает TFJS GraphModel RVM и выбирает лучший доступный бэкенд
export async function loadRvmModel(modelUrl: string): Promise<tf.GraphModel> {
  const candidates: Array<'webgpu' | 'webgl' | 'wasm' | 'cpu'> = ['webgpu', 'webgl', 'wasm', 'cpu']

  // Если WebGPU недоступен — не тратить время на попытку
  const hasWebGPU = typeof (navigator as any).gpu !== 'undefined'
  if (!hasWebGPU) {
    candidates.shift() // убрать 'webgpu'
  }

  for (const backend of candidates) {
    try {
      await tf.setBackend(backend)
      await tf.ready()
      break
    } catch {
      // пробуем следующий бэкенд
      continue
    }
  }

  const model = await tf.loadGraphModel(modelUrl)
  return model
}
