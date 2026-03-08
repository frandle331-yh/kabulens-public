// LAYER2: Normalization
// Standard min-max normalization. No proprietary logic.

import type { NormRange } from '../types/stock';

/**
 * Min-max normalization + clamp(0, 1)
 */
export function minMaxNormalize(value: number, range: NormRange): number {
  if (range.max === range.min) return 0.5;
  const normalized = (value - range.min) / (range.max - range.min);
  return clamp(normalized, 0, 1);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
