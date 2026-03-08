// LAYER2: Tenbagger Probability (Demo)
//
// Structural similarity score: how closely a stock matches historical
// tenbagger patterns. This is NOT a price prediction.
//
// Production uses a multi-factor model with calibrated weights.
// Demo uses simplified scoring for illustration.

import type { DataQuality } from '../types/stock';
import { clamp } from './normalize';

/**
 * Calculate tenbagger structural similarity score.
 * Demo: simplified model. Production uses proprietary weight optimization.
 */
export function calculateTenbaggerProbability(
  marketCapBillions: number,
  yoySalesGrowth: number | null,
  themeScore: number,
  dataQuality: DataQuality
): number {
  // Smaller market cap → higher tenbagger potential (log scale)
  const mcap = Math.max(marketCapBillions, 1);
  const capSizeScore = clamp(
    100 - Math.log10(mcap) * 25,
    0,
    100
  );

  // Revenue growth rate
  const yoy = yoySalesGrowth ?? 0.10;
  const growthScore = clamp(yoy * 200, 0, 100);

  // Theme relevance (supplementary factor)
  const themeScoreClamped = clamp(themeScore, 0, 100);

  let probability =
    capSizeScore * 0.34 +
    growthScore * 0.33 +
    themeScoreClamped * 0.33;

  // Data quality penalty
  if (dataQuality === 'C') {
    probability *= 0.85;
  }

  return clamp(Math.floor(probability), 0, 100);
}
