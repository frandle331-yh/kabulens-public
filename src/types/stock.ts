// KABULENS Data Model — Section 3 of Spec

export type ClusterId = 'tenbagger' | 'large_growth' | 'event_spike' | 'noise';
export type DataQuality = 'A' | 'B' | 'C';
export type TradeStatus = 'supervision' | 'delisting' | 'halt' | null;

export interface MomentumComponents {
  vol_ratio_norm: number;    // 0-1: 出来高5日平均/60日平均の正規化値
  ma25_dev_norm: number;     // 0-1: 25日線乖離率の正規化値
  breakout_ratio: number;    // 0-1: 52週高値への接近度（close / high252）
  volatility_norm: number;   // 0-1: 20日ボラの正規化値（安定=高評価）
}

export interface Features {
  momentum_components: MomentumComponents;
}

export interface Scores {
  theme: number;       // 0-100: テーマ適合
  growth: number;      // 0-100: 成長の型
  capital: number;     // 0-100: 資本政策・株主還元
  governance: number;  // 0-100: 経営の一貫性
  momentum: number;    // 0-100: 需給・勢い（LAYER2数式で算出）
}

export interface Derived {
  tenbagger_probability: number;  // 0-100
  cluster_id: ClusterId;
  cluster_explanation: string;    // max 120 chars
}

export interface Stock {
  ticker: string;
  name: string;
  market: string;
  price: number;
  minUnit: number;             // price * 100
  sbi_buyable: boolean;
  sbi_buyable_override: boolean | null;
  trade_status: TradeStatus;
  regime_id: string;
  normalization_version: string;
  data_quality: DataQuality;
  missing_fields: string[];

  features: Features;
  theme_tags: string[];
  growth_type: string;

  scores: Scores;

  derived: Derived;

  evidence: string[];  // max 3, each max 120 chars
  risk: string;        // max 120 chars
}

// Sort options
export type SortKey = 'tenbagger' | 'momentum' | 'theme' | 'growth' | 'price_asc' | 'minUnit_asc';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'tenbagger', label: 'テンバガー適性' },
  { key: 'momentum', label: '需給・勢い' },
  { key: 'theme', label: 'テーマ適合' },
  { key: 'growth', label: '成長の型' },
  { key: 'price_asc', label: '株価（安い順）' },
  { key: 'minUnit_asc', label: '最低購入額（安い順）' },
];

// UI State — Section 6-0
export interface UIFilters {
  maxMinUnit: number;
  sbiBuyableOnly: boolean;
  theme: string;
  regime_id: string;
  exclude_cluster_ids: ClusterId[];
  sortKey: SortKey;
}

export const DEFAULT_FILTERS: UIFilters = {
  maxMinUnit: 100000,
  sbiBuyableOnly: true,
  theme: 'all',
  regime_id: '2013_2021',
  exclude_cluster_ids: ['noise'],
  sortKey: 'tenbagger',
};

// Theme categories for filtering
export const THEME_CATEGORIES = [
  { id: 'all', label: '全テーマ' },
  { id: 'ai_semi', label: 'AI・半導体' },
  { id: 'defense', label: '防衛・サイバー' },
  { id: 'automation', label: '省人化・自動化' },
  { id: 'saas', label: 'SaaS・クラウド' },
  { id: 'platform', label: 'プラットフォーム' },
] as const;

// Theme tag to category mapping
export const TAG_TO_CATEGORY: Record<string, string> = {
  'AI': 'ai_semi', '半導体': 'ai_semi', '機械学習': 'ai_semi', 'GPU': 'ai_semi',
  '防衛': 'defense', 'サイバーセキュリティ': 'defense', 'セキュリティ': 'defense',
  '省人化': 'automation', '自動化': 'automation', 'ロボティクス': 'automation', 'RPA': 'automation',
  'SaaS': 'saas', 'クラウド': 'saas', 'DX': 'saas',
  'プラットフォーム': 'platform', 'エコシステム': 'platform', 'フィンテック': 'platform',
};

// Normalization table types
export interface NormRange {
  min: number;
  max: number;
}

export interface NormTable {
  [version: string]: {
    [featureKey: string]: NormRange;
  };
}
