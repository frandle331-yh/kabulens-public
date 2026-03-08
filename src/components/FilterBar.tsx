import { Filter, RotateCcw, ArrowUpDown, Zap } from 'lucide-react';
import type { UIFilters, SortKey } from '../types/stock';
import { THEME_CATEGORIES, SORT_OPTIONS, DEFAULT_FILTERS } from '../types/stock';

const PRESETS: { label: string; description: string; filters: Partial<UIFilters> }[] = [
  {
    label: 'テンバガー狙い',
    description: '小型・高テンバガー適性・ノイズ除外',
    filters: { maxMinUnit: 100000, sbiBuyableOnly: true, sortKey: 'tenbagger', exclude_cluster_ids: ['noise'] },
  },
  {
    label: '割安成長',
    description: '安い購入額 × 高成長スコア',
    filters: { maxMinUnit: 50000, sbiBuyableOnly: true, sortKey: 'growth', exclude_cluster_ids: ['noise'] },
  },
  {
    label: '高モメンタム',
    description: '需給・勢い順で全銘柄',
    filters: { maxMinUnit: 10000000, sbiBuyableOnly: false, sortKey: 'momentum', exclude_cluster_ids: [] },
  },
];

interface FilterBarProps {
  filters: UIFilters;
  onFilterChange: <K extends keyof UIFilters>(key: K, value: UIFilters[K]) => void;
  onBatchUpdate: (updates: Partial<UIFilters>) => void;
  onReset: () => void;
  resultCount: number;
}

export function FilterBar({ filters, onFilterChange, onBatchUpdate, onReset, resultCount }: FilterBarProps) {
  return (
    <div className="bg-kabulens-card border border-slate-700 rounded-xl p-4 mb-6">
      {/* Presets */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
        <Zap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onBatchUpdate({ ...DEFAULT_FILTERS, ...preset.filters })}
            className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-600 rounded-lg text-slate-300 hover:border-kabulens-accent hover:text-white transition-colors whitespace-nowrap"
            title={preset.description}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Filter className="w-4 h-4" />
          <span>フィルタ</span>
          <span className="text-slate-500">|</span>
          <span className="text-kabulens-accent font-medium">{resultCount}件</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          リセット
        </button>
      </div>
      <div className="flex flex-wrap gap-4">
        {/* 最低購入金額 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">最低購入金額</label>
          <select
            value={filters.maxMinUnit}
            onChange={(e) => onFilterChange('maxMinUnit', Number(e.target.value))}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-kabulens-accent"
          >
            <option value={50000}>5万円以下</option>
            <option value={100000}>10万円以下</option>
            <option value={200000}>20万円以下</option>
            <option value={500000}>50万円以下</option>
            <option value={10000000}>制限なし</option>
          </select>
        </div>

        {/* SBI購入可能 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">SBI証券</label>
          <label className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={filters.sbiBuyableOnly}
              onChange={(e) => onFilterChange('sbiBuyableOnly', e.target.checked)}
              className="rounded accent-kabulens-accent"
            />
            <span className="text-white">購入可能のみ</span>
          </label>
        </div>

        {/* テーマ */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">テーマ</label>
          <select
            value={filters.theme}
            onChange={(e) => onFilterChange('theme', e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-kabulens-accent"
          >
            {THEME_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* ノイズ非表示 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">ノイズ</label>
          <label className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={filters.exclude_cluster_ids.includes('noise')}
              onChange={(e) => {
                const current = filters.exclude_cluster_ids;
                onFilterChange(
                  'exclude_cluster_ids',
                  e.target.checked
                    ? [...current.filter((id) => id !== 'noise'), 'noise']
                    : current.filter((id) => id !== 'noise')
                );
              }}
              className="rounded accent-kabulens-accent"
            />
            <span className="text-white">非表示</span>
          </label>
        </div>

        {/* ソート */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            並び順
          </label>
          <select
            value={filters.sortKey}
            onChange={(e) => onFilterChange('sortKey', e.target.value as SortKey)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-kabulens-accent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
