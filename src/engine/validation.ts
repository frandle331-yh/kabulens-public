// LAYER3: Schema Validation

import type { Stock, DataQuality } from '../types/stock';

const LIMITS = {
  evidence_max_items: 3,
  evidence_max_chars: 120,
  risk_max_chars: 120,
  cluster_explanation_max_chars: 120,
} as const;

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + '\u2026';
}

/**
 * Schema validation + sanitization for LLM-generated fields
 */
export function validateAndSanitize(stock: Stock): Stock {
  const result = { ...stock };
  let quality: DataQuality = stock.data_quality;

  if (result.evidence && result.evidence.length > LIMITS.evidence_max_items) {
    result.evidence = result.evidence.slice(0, LIMITS.evidence_max_items);
  }
  if (result.evidence) {
    result.evidence = result.evidence.map((e) =>
      truncate(e, LIMITS.evidence_max_chars)
    );
  } else {
    result.evidence = [];
    quality = 'C';
  }

  if (result.risk) {
    result.risk = truncate(result.risk, LIMITS.risk_max_chars);
  } else {
    result.risk = '';
    quality = 'C';
  }

  if (result.derived?.cluster_explanation) {
    result.derived = {
      ...result.derived,
      cluster_explanation: truncate(
        result.derived.cluster_explanation,
        LIMITS.cluster_explanation_max_chars
      ),
    };
  }

  if (!result.theme_tags || result.theme_tags.length === 0) {
    result.theme_tags = ['\u672a\u5206\u985e'];
    quality = 'C';
  }
  if (!result.growth_type) {
    result.growth_type = '\u4e0d\u660e';
    quality = 'C';
  }

  result.data_quality = quality;
  return result;
}

/**
 * SBI buyability based on market segment
 */
export function determineSbiBuyable(
  market: string,
  tradeStatus: string | null,
  override: boolean | null
): boolean {
  if (override !== null) return override;

  const buyableMarkets = ['\u6771\u8a3c\u30d7\u30e9\u30a4\u30e0', '\u6771\u8a3c\u30b9\u30bf\u30f3\u30c0\u30fc\u30c9', '\u6771\u8a3c\u30b0\u30ed\u30fc\u30b9'];
  let buyable = buyableMarkets.includes(market);

  if (tradeStatus && ['supervision', 'delisting', 'halt'].includes(tradeStatus)) {
    buyable = false;
  }

  return buyable;
}

/**
 * Data quality grading based on missing field count
 */
export function determineDataQuality(missingFields: string[]): DataQuality {
  const coreFields = ['yoy_sales_growth'];
  const hasMissingCore = missingFields.some((f) => coreFields.includes(f));

  if (missingFields.length === 0) return 'A';
  if (missingFields.length <= 2 && !hasMissingCore) return 'B';
  return 'C';
}
