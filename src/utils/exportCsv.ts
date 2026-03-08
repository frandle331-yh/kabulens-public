import type { Stock } from '../types/stock';

const HEADERS = [
  'コード', '銘柄名', '市場', '株価', '最低購入額', 'SBI購入可',
  'テーマ', '成長', '資本政策', '経営', '需給',
  'テンバガー適性', 'クラスター', 'テーマタグ', 'データ品質',
];

function escapeCsv(value: string | number | boolean): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportStocksCsv(stocks: Stock[], filename = 'kabulens_export.csv') {
  const rows = stocks.map((s) => [
    s.ticker,
    s.name,
    s.market,
    s.price,
    s.minUnit,
    s.sbi_buyable ? 'Yes' : 'No',
    s.scores.theme,
    s.scores.growth,
    s.scores.capital,
    s.scores.governance,
    s.scores.momentum,
    s.derived.tenbagger_probability,
    s.derived.cluster_id,
    s.theme_tags.join('/'),
    s.data_quality,
  ]);

  const csv = [HEADERS, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');

  const bom = '\uFEFF'; // BOM for Excel
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
