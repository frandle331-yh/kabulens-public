import { describe, it, expect } from 'vitest';
import { filterStocks, sortStocks, searchStocks } from '../filters';
import { createMockStock, createMockStocks } from '../../test/fixtures';
import type { UIFilters } from '../../types/stock';
import { DEFAULT_FILTERS } from '../../types/stock';

// ---------- filterStocks ----------

describe('filterStocks', () => {
  const stocks = [
    createMockStock({ ticker: '1001', minUnit: 50000, sbi_buyable: true, theme_tags: ['AI'], derived: { tenbagger_probability: 80, cluster_id: 'tenbagger', cluster_explanation: '' } }),
    createMockStock({ ticker: '1002', minUnit: 200000, sbi_buyable: true, theme_tags: ['SaaS'], derived: { tenbagger_probability: 60, cluster_id: 'large_growth', cluster_explanation: '' } }),
    createMockStock({ ticker: '1003', minUnit: 80000, sbi_buyable: false, theme_tags: ['AI', '半導体'], derived: { tenbagger_probability: 70, cluster_id: 'event_spike', cluster_explanation: '' } }),
    createMockStock({ ticker: '1004', minUnit: 90000, sbi_buyable: true, theme_tags: ['食品'], derived: { tenbagger_probability: 30, cluster_id: 'noise', cluster_explanation: '' } }),
  ];

  it('filters by maxMinUnit', () => {
    const filters: UIFilters = { ...DEFAULT_FILTERS, maxMinUnit: 100000, sbiBuyableOnly: false, exclude_cluster_ids: [] };
    const result = filterStocks(stocks, filters);
    expect(result.map((s) => s.ticker)).toEqual(['1001', '1003', '1004']);
  });

  it('filters by sbiBuyableOnly', () => {
    const filters: UIFilters = { ...DEFAULT_FILTERS, maxMinUnit: 999999, sbiBuyableOnly: true, exclude_cluster_ids: [] };
    const result = filterStocks(stocks, filters);
    expect(result.map((s) => s.ticker)).toEqual(['1001', '1002', '1004']);
  });

  it('filters by exclude_cluster_ids', () => {
    const filters: UIFilters = { ...DEFAULT_FILTERS, maxMinUnit: 999999, sbiBuyableOnly: false, exclude_cluster_ids: ['noise', 'event_spike'] };
    const result = filterStocks(stocks, filters);
    expect(result.map((s) => s.ticker)).toEqual(['1001', '1002']);
  });

  it('filters by theme category', () => {
    const filters: UIFilters = { ...DEFAULT_FILTERS, maxMinUnit: 999999, sbiBuyableOnly: false, exclude_cluster_ids: [], theme: 'ai_semi' };
    const result = filterStocks(stocks, filters);
    // AI and 半導体 map to 'ai_semi'
    expect(result.map((s) => s.ticker)).toEqual(['1001', '1003']);
  });

  it('passes all with theme=all', () => {
    const filters: UIFilters = { ...DEFAULT_FILTERS, maxMinUnit: 999999, sbiBuyableOnly: false, exclude_cluster_ids: [], theme: 'all' };
    const result = filterStocks(stocks, filters);
    expect(result).toHaveLength(4);
  });

  it('combines multiple filters', () => {
    const filters: UIFilters = { ...DEFAULT_FILTERS, maxMinUnit: 100000, sbiBuyableOnly: true, exclude_cluster_ids: ['noise'], theme: 'all' };
    const result = filterStocks(stocks, filters);
    expect(result.map((s) => s.ticker)).toEqual(['1001']);
  });
});

// ---------- sortStocks ----------

describe('sortStocks', () => {
  const stocks = createMockStocks(4);

  it('sorts by tenbagger probability descending', () => {
    const sorted = sortStocks(stocks, 'tenbagger');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].derived.tenbagger_probability).toBeGreaterThanOrEqual(sorted[i].derived.tenbagger_probability);
    }
  });

  it('sorts by momentum descending', () => {
    const sorted = sortStocks(stocks, 'momentum');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].scores.momentum).toBeGreaterThanOrEqual(sorted[i].scores.momentum);
    }
  });

  it('sorts by theme score descending', () => {
    const sorted = sortStocks(stocks, 'theme');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].scores.theme).toBeGreaterThanOrEqual(sorted[i].scores.theme);
    }
  });

  it('sorts by growth score descending', () => {
    const sorted = sortStocks(stocks, 'growth');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].scores.growth).toBeGreaterThanOrEqual(sorted[i].scores.growth);
    }
  });

  it('sorts by price ascending', () => {
    const sorted = sortStocks(stocks, 'price_asc');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].price).toBeLessThanOrEqual(sorted[i].price);
    }
  });

  it('sorts by minUnit ascending', () => {
    const sorted = sortStocks(stocks, 'minUnit_asc');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].minUnit).toBeLessThanOrEqual(sorted[i].minUnit);
    }
  });

  it('does not mutate original array', () => {
    const original = [...stocks];
    sortStocks(stocks, 'tenbagger');
    expect(stocks).toEqual(original);
  });
});

// ---------- searchStocks ----------

describe('searchStocks', () => {
  const stocks = [
    createMockStock({ ticker: '3993', name: 'PKSHA Technology', theme_tags: ['AI', 'SaaS'], growth_type: 'SaaS型' }),
    createMockStock({ ticker: '6920', name: 'レーザーテック', theme_tags: ['半導体'], growth_type: '一般型' }),
    createMockStock({ ticker: '7203', name: 'トヨタ自動車', theme_tags: ['省人化'], growth_type: '一般型' }),
  ];

  it('returns all stocks with empty query', () => {
    expect(searchStocks(stocks, '')).toHaveLength(3);
    expect(searchStocks(stocks, '  ')).toHaveLength(3);
  });

  it('matches by ticker', () => {
    const result = searchStocks(stocks, '3993');
    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe('3993');
  });

  it('matches by name (case insensitive)', () => {
    const result = searchStocks(stocks, 'pksha');
    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe('3993');
  });

  it('matches by theme tag', () => {
    const result = searchStocks(stocks, '半導体');
    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe('6920');
  });

  it('matches by growth_type', () => {
    const result = searchStocks(stocks, 'saas型');
    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe('3993');
  });

  it('returns empty for no match', () => {
    const result = searchStocks(stocks, 'zzzzz');
    expect(result).toHaveLength(0);
  });
});
