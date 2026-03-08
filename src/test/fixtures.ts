import type { Stock, ClusterId, DataQuality } from '../types/stock';

/**
 * テスト用 Stock オブジェクト生成ファクトリ。
 * デフォルト値はテンバガー型の小型グロース銘柄。
 */
export function createMockStock(overrides: Partial<Stock> & Record<string, unknown> = {}): Stock {
  const defaults: Stock = {
    ticker: '9999',
    name: 'テスト株式会社',
    market: '東証グロース',
    price: 1000,
    minUnit: 100000,
    sbi_buyable: true,
    sbi_buyable_override: null,
    trade_status: null,
    regime_id: '2013_2021',
    normalization_version: 'minmax_2013_2021_v1',
    data_quality: 'B' as DataQuality,
    missing_fields: [],

    features: {
      momentum_components: {
        vol_ratio_norm: 0.5,
        ma25_dev_norm: 0.4,
        breakout_ratio: 0.8,
        volatility_norm: 0.6,
      },
    },
    theme_tags: ['AI', 'SaaS'],
    growth_type: 'SaaS型',

    scores: {
      theme: 85,
      growth: 80,
      capital: 65,
      governance: 70,
      momentum: 60,
    },

    derived: {
      tenbagger_probability: 72,
      cluster_id: 'tenbagger' as ClusterId,
      cluster_explanation: 'テスト説明',
    },

    evidence: ['根拠1', '根拠2'],
    risk: 'リスクテスト',
  };

  return { ...defaults, ...overrides };
}

/**
 * 複数の異なる Stock を生成。
 * ティッカーとスコアを自動で変化させる。
 */
export function createMockStocks(count: number): Stock[] {
  return Array.from({ length: count }, (_, i) => {
    const clusterId: ClusterId = i % 4 === 0 ? 'tenbagger'
      : i % 4 === 1 ? 'large_growth'
      : i % 4 === 2 ? 'event_spike'
      : 'noise';

    return createMockStock({
      ticker: String(1000 + i),
      name: `テスト銘柄${i}`,
      price: 500 + i * 100,
      minUnit: (500 + i * 100) * 100,
      sbi_buyable: i % 3 !== 0,
      theme_tags: i % 2 === 0 ? ['AI'] : ['SaaS'],
      scores: {
        theme: 90 - i * 5,
        growth: 80 - i * 3,
        capital: 60 + i * 2,
        governance: 70,
        momentum: 50 + i * 5,
      },
      derived: {
        tenbagger_probability: 80 - i * 10,
        cluster_id: clusterId,
        cluster_explanation: `クラスター説明${i}`,
      },
    });
  });
}
