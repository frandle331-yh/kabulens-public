import { X, Plus, Eye, EyeOff } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Stock, Scores } from '../types/stock';
import { ClusterBadge } from './ClusterBadge';

interface CompareViewProps {
  stocks: Stock[];
  compareList: string[];
  onAddToCompare: (ticker: string) => void;
  onRemoveFromCompare: (ticker: string) => void;
  isWatched: (ticker: string) => boolean;
  onToggleWatch: (ticker: string) => void;
  onOpenDetail: (stock: Stock) => void;
}

const COLORS = ['#38bdf8', '#4ade80', '#fbbf24', '#f87171'];

const AXIS_LABELS: Record<keyof Scores, string> = {
  theme: 'テーマ',
  growth: '成長',
  capital: '資本政策',
  governance: '経営',
  momentum: '需給',
};

export function CompareView({ stocks, compareList, onAddToCompare, onRemoveFromCompare, isWatched, onToggleWatch, onOpenDetail }: CompareViewProps) {
  const selectedStocks = compareList
    .map((t) => stocks.find((s) => s.ticker === t))
    .filter((s): s is Stock => s !== undefined);

  const radarData = (Object.keys(AXIS_LABELS) as (keyof Scores)[]).map((key) => {
    const point: Record<string, string | number> = { axis: AXIS_LABELS[key] };
    selectedStocks.forEach((stock, i) => {
      point[`stock${i}`] = stock.scores[key];
    });
    return point;
  });

  const formatPrice = (price: number) =>
    price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Stock Selector */}
      <div className="bg-kabulens-card border border-slate-700 rounded-xl p-4">
        <h2 className="text-sm font-medium text-slate-300 mb-3">
          比較銘柄を選択（最大4銘柄）
        </h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedStocks.map((stock, i) => (
            <div
              key={stock.ticker}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border"
              style={{ borderColor: COLORS[i], color: COLORS[i], backgroundColor: `${COLORS[i]}15` }}
            >
              <span className="font-medium">{stock.name}</span>
              <span className="text-xs opacity-70">{stock.ticker}</span>
              <button
                onClick={() => onRemoveFromCompare(stock.ticker)}
                className="hover:opacity-70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        {compareList.length < 4 && (
          <div className="flex flex-wrap gap-1.5">
            {stocks
              .filter((s) => !compareList.includes(s.ticker))
              .slice(0, 12)
              .map((stock) => (
                <button
                  key={stock.ticker}
                  onClick={() => onAddToCompare(stock.ticker)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 hover:border-kabulens-accent hover:text-white transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {stock.name}
                </button>
              ))}
          </div>
        )}
      </div>

      {selectedStocks.length >= 2 && (
        <>
          {/* Radar Comparison */}
          <div className="bg-kabulens-card border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">スコア比較レーダー</h3>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                {selectedStocks.map((stock, i) => (
                  <Radar
                    key={stock.ticker}
                    name={stock.name}
                    dataKey={`stock${i}`}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Legend
                  wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Table */}
          <div className="bg-kabulens-card border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">項目</th>
                    {selectedStocks.map((stock, i) => (
                      <th key={stock.ticker} className="text-center px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenDetail(stock)}
                            className="text-xs font-medium hover:underline"
                            style={{ color: COLORS[i] }}
                          >
                            {stock.name}
                          </button>
                          <button
                            onClick={() => onToggleWatch(stock.ticker)}
                            className={`p-0.5 rounded transition-colors ${
                              isWatched(stock.ticker)
                                ? 'text-kabulens-accent'
                                : 'text-slate-500 hover:text-white'
                            }`}
                            title={isWatched(stock.ticker) ? 'ウォッチ解除' : 'ウォッチ追加'}
                          >
                            {isWatched(stock.ticker) ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700/50">
                    <td className="text-xs text-slate-400 px-4 py-2">株価</td>
                    {selectedStocks.map((s) => (
                      <td key={s.ticker} className="text-center text-xs text-white px-4 py-2">
                        {formatPrice(s.price)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="text-xs text-slate-400 px-4 py-2">最低購入額</td>
                    {selectedStocks.map((s) => (
                      <td key={s.ticker} className="text-center text-xs text-white px-4 py-2">
                        {formatPrice(s.minUnit)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-700/50 bg-kabulens-accent/5">
                    <td className="text-xs text-kabulens-accent font-medium px-4 py-2">テンバガー適性</td>
                    {selectedStocks.map((s) => (
                      <td key={s.ticker} className="text-center text-sm font-bold text-kabulens-accent px-4 py-2">
                        {s.derived.tenbagger_probability}%
                      </td>
                    ))}
                  </tr>
                  {(Object.keys(AXIS_LABELS) as (keyof Scores)[]).map((key) => (
                    <tr key={key} className="border-b border-slate-700/50">
                      <td className="text-xs text-slate-400 px-4 py-2">{AXIS_LABELS[key]}</td>
                      {selectedStocks.map((s) => {
                        const maxVal = Math.max(...selectedStocks.map((ss) => ss.scores[key]));
                        const isMax = s.scores[key] === maxVal;
                        return (
                          <td
                            key={s.ticker}
                            className={`text-center text-xs px-4 py-2 ${isMax ? 'text-kabulens-accent font-bold' : 'text-white'}`}
                          >
                            {s.scores[key]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-b border-slate-700/50">
                    <td className="text-xs text-slate-400 px-4 py-2">クラスター</td>
                    {selectedStocks.map((s) => (
                      <td key={s.ticker} className="text-center px-4 py-2">
                        <ClusterBadge clusterId={s.derived.cluster_id} />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="text-xs text-slate-400 px-4 py-2">データ品質</td>
                    {selectedStocks.map((s) => (
                      <td key={s.ticker} className="text-center text-xs text-white px-4 py-2">
                        {s.data_quality}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedStocks.length < 2 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          2銘柄以上選択すると比較チャートが表示されます
        </div>
      )}
    </div>
  );
}
