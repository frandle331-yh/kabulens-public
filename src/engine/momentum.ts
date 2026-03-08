// LAYER2: Momentum Score (Demo)
//
// Computes a composite momentum score from normalized technical indicators.
// Production implementation uses calibrated weights derived from historical analysis.

import type { MomentumComponents } from '../types/stock';
import { clamp } from './normalize';

/**
 * Compute momentum score from normalized components.
 * Demo: equal-weight average. Production uses optimized weights.
 */
export function calculateMomentum(components: MomentumComponents): number {
  const raw =
    components.vol_ratio_norm * 25 +
    components.ma25_dev_norm * 25 +
    components.breakout_ratio * 25 +
    components.volatility_norm * 25;

  return clamp(Math.floor(raw), 0, 100);
}
