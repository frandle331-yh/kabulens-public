import { RotateCcw } from 'lucide-react';
import type { UIFilters, ClusterId } from '../types/stock';
import { SORT_OPTIONS } from '../types/stock';

interface SettingsViewProps {
  filters: UIFilters;
  onFilterChange: <K extends keyof UIFilters>(key: K, value: UIFilters[K]) => void;
  onReset: () => void;
  onClearWatchlist: () => void;
  watchlistCount: number;
  dataSource: 'static' | 'json';
  generatedAt: string | null;
  stockCount: number;
}

const CLUSTER_OPTIONS: { id: ClusterId; label: string }[] = [
  { id: 'tenbagger', label: 'テンバガー型' },
  { id: 'large_growth', label: '大型成長型' },
  { id: 'event_spike', label: 'イベント急騰型' },
  { id: 'noise', label: 'ノイズ' },
];

const MIN_UNIT_OPTIONS = [
  { value: 50000, label: '5万円以下' },
  { value: 100000, label: '10万円以下' },
  { value: 300000, label: '30万円以下' },
  { value: 500000, label: '50万円以下' },
  { value: 1000000, label: '100万円以下' },
  { value: Infinity, label: '制限なし' },
];

export function SettingsView({
  filters,
  onFilterChange,
  onReset,
  onClearWatchlist,
  watchlistCount,
  dataSource,
  generatedAt,
  stockCount,
}: SettingsViewProps) {
  const handleClusterToggle = (clusterId: ClusterId) => {
    const current = filters.exclude_cluster_ids;
    const next = current.includes(clusterId)
      ? current.filter((id) => id !== clusterId)
      : [...current, clusterId];
    onFilterChange('exclude_cluster_ids', next);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">設定</h2>
        <p className="text-sm text-slate-400">フィルター・表示の既定値を変更できます。設定は自動保存されます。</p>
      </div>

      {/* Filter Defaults */}
      <section className="bg-kabulens-card border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-4">フィルター既定値</h3>

        <div className="space-y-4">
          {/* Max Min Unit */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">最低購入額の上限</label>
            <select
              value={filters.maxMinUnit}
              onChange={(e) => onFilterChange('maxMinUnit', Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kabulens-accent"
            >
              {MIN_UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* SBI Buyable */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-slate-300">SBI購入可のみ表示</label>
              <p className="text-xs text-slate-500 mt-0.5">SBI証券で購入できると推定される銘柄のみ</p>
            </div>
            <button
              onClick={() => onFilterChange('sbiBuyableOnly', !filters.sbiBuyableOnly)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                filters.sbiBuyableOnly ? 'bg-kabulens-accent' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  filters.sbiBuyableOnly ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Default Sort */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">デフォルトの並び順</label>
            <select
              value={filters.sortKey}
              onChange={(e) => onFilterChange('sortKey', e.target.value as UIFilters['sortKey'])}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kabulens-accent"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Cluster Filter */}
      <section className="bg-kabulens-card border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-2">クラスター表示設定</h3>
        <p className="text-xs text-slate-500 mb-4">非表示にするクラスターを選択</p>
        <div className="space-y-2">
          {CLUSTER_OPTIONS.map((cluster) => {
            const excluded = filters.exclude_cluster_ids.includes(cluster.id);
            return (
              <label key={cluster.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!excluded}
                  onChange={() => handleClusterToggle(cluster.id)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-kabulens-accent focus:ring-kabulens-accent focus:ring-offset-0"
                />
                <span className={`text-sm ${excluded ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                  {cluster.label}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-kabulens-card border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-4">データ管理</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-slate-300">ウォッチリスト</span>
              <p className="text-xs text-slate-500 mt-0.5">{watchlistCount}件の銘柄を保存中</p>
            </div>
            <button
              onClick={onClearWatchlist}
              disabled={watchlistCount === 0}
              className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              全削除
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-slate-300">フィルター設定</span>
              <p className="text-xs text-slate-500 mt-0.5">すべてのフィルターを初期値に戻す</p>
            </div>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              リセット
            </button>
          </div>
        </div>
      </section>

      {/* App Info */}
      <section className="bg-kabulens-card border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-3">アプリ情報</h3>
        <div className="space-y-1.5 text-xs text-slate-500">
          <div className="flex justify-between">
            <span>バージョン</span>
            <span className="text-slate-400">v0.5.0</span>
          </div>
          <div className="flex justify-between">
            <span>データソース</span>
            <span className="text-slate-400">
              {dataSource === 'json' ? 'J-Quants Free Plan（12週遅延）' : 'モックデータ（静的）'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>銘柄数</span>
            <span className="text-slate-400">{stockCount}銘柄</span>
          </div>
          {generatedAt && (
            <div className="flex justify-between">
              <span>データ更新日</span>
              <span className="text-slate-400">{new Date(generatedAt).toLocaleDateString('ja-JP')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>正規化テーブル</span>
            <span className="text-slate-400">minmax_2013_2021_v1</span>
          </div>
          <div className="flex justify-between">
            <span>レジーム</span>
            <span className="text-slate-400">2013_2021</span>
          </div>
          <div className="flex justify-between">
            <span>データ保存先</span>
            <span className="text-slate-400">localStorage</span>
          </div>
        </div>
      </section>
    </div>
  );
}
