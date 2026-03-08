// LAYER2: Clustering (Demo)
//
// Rule-based stock classification using if/else priority chain.
// Production thresholds are calibrated against historical tenbagger patterns.

import type { ClusterId } from '../types/stock';

export interface ClusterInput {
  marketCapBillions: number;
  yoySalesGrowth: number | null;
  momentumScore: number;
}

/**
 * Rule-based cluster classification.
 * Must evaluate top-down with if/else — first match wins.
 * Demo: simplified thresholds. Production uses calibrated values.
 */
export function classifyCluster(input: ClusterInput): ClusterId {
  const { marketCapBillions, yoySalesGrowth, momentumScore } = input;

  // Priority 1: tenbagger — small-cap + high growth
  if (
    marketCapBillions < 500 &&
    yoySalesGrowth != null &&
    yoySalesGrowth >= 0.20
  ) {
    return 'tenbagger';
  }

  // Priority 2: large_growth — large-cap or mid-cap with growth
  if (
    marketCapBillions >= 2000 ||
    (marketCapBillions >= 500 && yoySalesGrowth != null && yoySalesGrowth >= 0.10)
  ) {
    return 'large_growth';
  }

  // Priority 3: event_spike — momentum-driven
  if (momentumScore >= 65) {
    return 'event_spike';
  }

  // Priority 4: noise (default)
  return 'noise';
}
