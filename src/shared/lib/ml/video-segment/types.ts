import * as tf from '@tensorflow/tfjs';

export type RecurrentState = Record<string, tf.Tensor>;
export interface IVideoSegmentOptions {
  downsample?: number;
  frameSkip?: number;
}
