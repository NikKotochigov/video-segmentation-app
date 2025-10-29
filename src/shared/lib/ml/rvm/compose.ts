import * as tf from '@tensorflow/tfjs'

export function composeForeground(
  fgr: tf.Tensor, // [1,H,W,3] float32 [0,1]
  pha: tf.Tensor, // [1,H,W,1] float32 [0,1]
  bg: tf.Tensor   // [1,H,W,3] float32 [0,1]
) {
  // com = fgr * pha + bg * (1 - pha)
  return tf.add(tf.mul(fgr, pha), tf.mul(bg, tf.sub(1, pha))) // [1,H,W,3]
}

export function makeSolidBg(h: number, w: number, color: [number, number, number]) {
  // color в [0,1]
  const r = tf.fill([1, h, w, 1], color[0])
  const g = tf.fill([1, h, w, 1], color[1])
  const b = tf.fill([1, h, w, 1], color[2])
  return tf.concat([r, g, b], -1)
}
