import * as tf from '@tensorflow/tfjs'

export type Recurrent = {
  r1: tf.Tensor | null
  r2: tf.Tensor | null
  r3: tf.Tensor | null
  r4: tf.Tensor | null
}

export type RvmOutputs = { fgr: tf.Tensor; pha: tf.Tensor; rec: Recurrent }

export function createRvmRunner(model: tf.GraphModel, downsample = 0.25) {
  const rec: Recurrent = { r1: null, r2: null, r3: null, r4: null }
  const ds = tf.scalar(downsample)

  const runOnce = async (video: HTMLVideoElement): Promise<RvmOutputs> => {
    // Преобразуем кадр в float32 [0,1]
    const src = tf.expandDims(tf.browser.fromPixels(video).toFloat().div(255))

    const inputs: Record<string, tf.Tensor> = {
      src,
      r1i: rec.r1 ?? tf.zeros([1, 1, 1, 1]),
      r2i: rec.r2 ?? tf.zeros([1, 1, 1, 1]),
      r3i: rec.r3 ?? tf.zeros([1, 1, 1, 1]),
      r4i: rec.r4 ?? tf.zeros([1, 1, 1, 1]),
      downsample_ratio: ds,
    }

    // Динамические узлы требуют executeAsync
    const out = await model.executeAsync(inputs, ['fgr', 'pha', 'r1o', 'r2o', 'r3o', 'r4o']) as tf.Tensor[]
    const [fgr, pha, r1o, r2o, r3o, r4o] = out

    // Обновляем рекуррентные состояния
    rec.r1?.dispose(); rec.r2?.dispose(); rec.r3?.dispose(); rec.r4?.dispose()
    rec.r1 = r1o; rec.r2 = r2o; rec.r3 = r3o; rec.r4 = r4o

    // Освобождаем входной кадр
    src.dispose()

    return { fgr, pha, rec }
  }

  const dispose = () => {
    rec.r1?.dispose(); rec.r2?.dispose(); rec.r3?.dispose(); rec.r4?.dispose()
    ds.dispose()
  }

  return { runOnce, dispose }
}
