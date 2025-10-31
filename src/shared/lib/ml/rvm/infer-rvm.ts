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
  const zeros = tf.zeros([1, 1, 1, 1]) // reuse

  const runOnce = async (video: HTMLVideoElement): Promise<RvmOutputs> => {
    await tf.ready()

    // tidy только вокруг синхронных промежуточных операций
    const src = tf.tidy(() => tf.expandDims(tf.browser.fromPixels(video).toFloat().div(255).expandDims(0)))

    // inputs не оборачиваем в tidy — они нужны до конца executeAsync
    const inputs: Record<string, tf.Tensor> = {
      src,
      r1i: rec.r1 ?? zeros,
      r2i: rec.r2 ?? zeros,
      r3i: rec.r3 ?? zeros,
      r4i: rec.r4 ?? zeros,
      downsample_ratio: ds,
    }

    // Важно: executeAsync — вне tidy
    const [fgr, pha, r1o, r2o, r3o, r4o] = await model.executeAsync(
      inputs,
      ['fgr', 'pha', 'r1o', 'r2o', 'r3o', 'r4o']
    ) as tf.Tensor[]

    // Оборачиваем только перераспределение состояний, чтобы зачистить временные объекты
    tf.tidy(() => {
      rec.r1?.dispose(); rec.r2?.dispose(); rec.r3?.dispose(); rec.r4?.dispose()
      // clone возвращает новые тензоры, tidy освободит только временные ссылки
      const nr1 = r1o.clone(); const nr2 = r2o.clone(); const nr3 = r3o.clone(); const nr4 = r4o.clone()
      rec.r1 = nr1; rec.r2 = nr2; rec.r3 = nr3; rec.r4 = nr4
    })

    // Оригиналы выходов состояний нам больше не нужны
    tf.dispose([r1o, r2o, r3o, r4o])

    // src больше не нужен после инференса
    src.dispose()

    // ВНИМАНИЕ: fgr и pha возвращаем вызывающему — он обязан их освободить
    return { fgr, pha, rec }
  }

  const dispose = () => {
    rec.r1?.dispose(); rec.r2?.dispose(); rec.r3?.dispose(); rec.r4?.dispose()
    zeros.dispose()
    ds.dispose()
  }

  return { runOnce, dispose }
}
