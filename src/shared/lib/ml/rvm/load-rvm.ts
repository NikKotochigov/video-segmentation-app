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

  console.info('[RVM] Backends candidates:', candidates)

  for (const backend of candidates) {
    const t0 = performance.now()
    try {
      await tf.setBackend(backend)
      await tf.ready()
      const dt = (performance.now() - t0).toFixed(1)
      console.info(`[RVM] Backend selected: ${backend} (ready in ${dt}ms)`) 
      break
    } catch (e) {
      const dt = (performance.now() - t0).toFixed(1)
      console.warn(`[RVM] Backend failed: ${backend} (after ${dt}ms)`, e)
      continue
    }
  }

  console.info('[RVM] Loading model from:', modelUrl)
  const t1 = performance.now()
  const model = await tf.loadGraphModel(modelUrl)
  const tLoad = (performance.now() - t1).toFixed(1)
  console.info('[RVM] Model loaded in', tLoad, 'ms')
  console.info('[RVM] Model inputs:', model.inputs.map(i => i.name))
  console.info('[RVM] Model outputs:', model.outputs.map(o => o.name))

  return model
}
