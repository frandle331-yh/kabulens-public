// LAYER2 Pipeline (Demo)
//
// raw features -> normalization -> momentum -> cluster -> tenbagger probability
//
// This is a simplified demo pipeline. The production version uses:
// - Calibrated normalization ranges from historical market data
// - Optimized momentum weights validated against P1-P99 distributions
// - Tenbagger scoring model with proprietary factor weights
//
// The pipeline architecture is identical; only the calibration differs.

import type { Stock, DataQuality, MomentumComponents } from '../types/stock';
import { minMaxNormalize } from './normalize';
import { calculateMomentum } from './momentum';
import { calculateTenbaggerProbability } from './tenbagger';
import { classifyCluster } from './cluster';
import { validateAndSanitize, determineSbiBuyable, determineDataQuality } from './validation';

/** Raw features from market data API */
export interface RawFeatures {
  vol_ratio: number;
  ma25_dev: number;
  breakout_ratio?: number;
  breakout_flag?: 0 | 1;
  volatility: number;
  market_cap_billions: number;
  yoy_sales_growth?: number;
  gross_margin?: number;
}

// Demo normalization ranges (production uses calibrated values from norm_table.json)
const DEMO_RANGES = {
  vol_ratio: { min: 0.3, max: 5.0 },
  ma25_dev: { min: -0.10, max: 0.15 },
  volatility: { min: 0.10, max: 0.60 },
};

const MEDIAN_VALUES: Record<string, number> = {
  vol_ratio: 1.2,
  ma25_dev: 0.02,
  volatility: 0.25,
  yoy_sales_growth: 0.12,
  gross_margin: 0.45,
  market_cap_billions: 800,
};

function fillMissing(raw: RawFeatures): { filled: Required<Omit<RawFeatures, 'breakout_flag'>>; missingFields: string[] } {
  const missingFields: string[] = [];

  const breakoutRatio =
    raw.breakout_ratio ?? (raw.breakout_flag as number | undefined) ?? 0;

  const filled = {
    vol_ratio: raw.vol_ratio,
    ma25_dev: raw.ma25_dev,
    breakout_ratio: breakoutRatio,
    volatility: raw.volatility,
    market_cap_billions: raw.market_cap_billions ?? (() => { missingFields.push('market_cap_billions'); return MEDIAN_VALUES.market_cap_billions; })(),
    yoy_sales_growth: raw.yoy_sales_growth ?? (() => { missingFields.push('yoy_sales_growth'); return MEDIAN_VALUES.yoy_sales_growth; })(),
    gross_margin: raw.gross_margin ?? (() => { missingFields.push('gross_margin'); return MEDIAN_VALUES.gross_margin; })(),
  };

  return { filled, missingFields };
}

/**
 * LAYER2 pipeline: raw features -> normalized scores -> classification
 */
export function runLayer2Pipeline(
  raw: RawFeatures,
  _normVersion: string = 'demo'
): {
  momentum_components: MomentumComponents;
  momentum_score: number;
  cluster_id: ReturnType<typeof classifyCluster>;
  data_quality: DataQuality;
  missing_fields: string[];
} {
  const { filled, missingFields } = fillMissing(raw);

  const vol_ratio_norm = minMaxNormalize(filled.vol_ratio, DEMO_RANGES.vol_ratio);
  const ma25_dev_norm = minMaxNormalize(filled.ma25_dev, DEMO_RANGES.ma25_dev);
  const volatility_norm = 1 - minMaxNormalize(filled.volatility, DEMO_RANGES.volatility);

  const momentum_components: MomentumComponents = {
    vol_ratio_norm,
    ma25_dev_norm,
    breakout_ratio: filled.breakout_ratio,
    volatility_norm,
  };

  const momentum_score = calculateMomentum(momentum_components);

  const cluster_id = classifyCluster({
    marketCapBillions: filled.market_cap_billions,
    yoySalesGrowth: raw.yoy_sales_growth ?? null,
    momentumScore: momentum_score,
  });

  const data_quality = determineDataQuality(missingFields);

  return {
    momentum_components,
    momentum_score,
    cluster_id,
    data_quality,
    missing_fields: missingFields,
  };
}

/**
 * Full stock processing: L1 (facts) + L2 (computation) + L3 (interpretation)
 */
export function processStock(
  base: {
    ticker: string;
    name: string;
    market: string;
    price: number;
    sbi_buyable_override: boolean | null;
    trade_status: string | null;
    regime_id: string;
    theme_tags: string[];
    growth_type: string;
    scores: { theme: number; growth: number; capital: number; governance: number };
    evidence: string[];
    risk: string;
    cluster_explanation: string;
  },
  raw: RawFeatures,
  normVersion: string = 'demo'
): Stock {
  const layer2 = runLayer2Pipeline(raw, normVersion);

  const scores = {
    ...base.scores,
    momentum: layer2.momentum_score,
  };

  const tenbagger_probability = calculateTenbaggerProbability(
    raw.market_cap_billions ?? 800,
    raw.yoy_sales_growth ?? null,
    base.scores.theme,
    layer2.data_quality
  );

  const sbi_buyable = determineSbiBuyable(
    base.market,
    base.trade_status,
    base.sbi_buyable_override
  );

  const stock: Stock = {
    ticker: base.ticker,
    name: base.name,
    market: base.market,
    price: base.price,
    minUnit: base.price * 100,
    sbi_buyable,
    sbi_buyable_override: base.sbi_buyable_override,
    trade_status: base.trade_status as Stock['trade_status'],
    regime_id: base.regime_id,
    normalization_version: normVersion,
    data_quality: layer2.data_quality,
    missing_fields: layer2.missing_fields,
    features: {
      momentum_components: layer2.momentum_components,
    },
    theme_tags: base.theme_tags,
    growth_type: base.growth_type,
    scores,
    derived: {
      tenbagger_probability,
      cluster_id: layer2.cluster_id,
      cluster_explanation: base.cluster_explanation,
    },
    evidence: base.evidence,
    risk: base.risk,
  };

  return validateAndSanitize(stock);
}
