import type { Stock, UIFilters, SortKey } from '../types/stock';
import { TAG_TO_CATEGORY } from '../types/stock';

/**
 * フィルタ条件に基づいて銘柄をフィルタリング
 */
export function filterStocks(stocks: Stock[], filters: UIFilters): Stock[] {
  return stocks.filter((stock) => {
    if (stock.minUnit > filters.maxMinUnit) return false;
    if (filters.sbiBuyableOnly && !stock.sbi_buyable) return false;
    if (filters.exclude_cluster_ids.includes(stock.derived.cluster_id)) return false;
    if (filters.theme !== 'all') {
      const matchesTheme = stock.theme_tags.some(
        (tag) => TAG_TO_CATEGORY[tag] === filters.theme
      );
      if (!matchesTheme) return false;
    }
    return true;
  });
}

/**
 * ソートキーに基づいて銘柄をソート
 */
export function sortStocks(stocks: Stock[], sortKey: SortKey): Stock[] {
  return [...stocks].sort((a, b) => {
    switch (sortKey) {
      case 'tenbagger':
        return b.derived.tenbagger_probability - a.derived.tenbagger_probability;
      case 'momentum':
        return b.scores.momentum - a.scores.momentum;
      case 'theme':
        return b.scores.theme - a.scores.theme;
      case 'growth':
        return b.scores.growth - a.scores.growth;
      case 'price_asc':
        return a.price - b.price;
      case 'minUnit_asc':
        return a.minUnit - b.minUnit;
      default:
        return b.derived.tenbagger_probability - a.derived.tenbagger_probability;
    }
  });
}

/**
 * 検索クエリに合致する銘柄をフィルタ
 */
export function searchStocks(stocks: Stock[], query: string): Stock[] {
  if (!query.trim()) return stocks;
  const q = query.toLowerCase().trim();
  return stocks.filter(
    (s) =>
      s.ticker.includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.theme_tags.some((t) => t.toLowerCase().includes(q)) ||
      s.growth_type.toLowerCase().includes(q)
  );
}
