import { TrendingUp, Target, Zap, BarChart3 } from 'lucide-react';
import type { Stock } from '../types/stock';

interface SummaryStatsProps {
  stocks: Stock[];
}

export function SummaryStats({ stocks }: SummaryStatsProps) {
  if (stocks.length === 0) return null;

  const tenbaggerCount = stocks.filter((s) => s.derived.cluster_id === 'tenbagger').length;
  const avgProbability = Math.round(
    stocks.reduce((sum, s) => sum + s.derived.tenbagger_probability, 0) / stocks.length
  );
  const topStock = stocks[0];
  const under5man = stocks.filter((s) => s.minUnit <= 50000).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-kabulens-card border border-slate-700 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-green-400" />
          <span className="text-xs text-slate-400">テンバガー型</span>
        </div>
        <span className="text-xl font-bold text-white">{tenbaggerCount}</span>
        <span className="text-xs text-slate-500 ml-1">/ {stocks.length}銘柄</span>
      </div>

      <div className="bg-kabulens-card border border-slate-700 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-kabulens-accent" />
          <span className="text-xs text-slate-400">平均適性スコア</span>
        </div>
        <span className="text-xl font-bold text-white">{avgProbability}</span>
        <span className="text-xs text-slate-500 ml-1">%</span>
      </div>

      <div className="bg-kabulens-card border border-slate-700 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-slate-400">トップ候補</span>
        </div>
        <span className="text-sm font-bold text-white truncate block">{topStock?.name}</span>
        <span className="text-xs text-kabulens-accent">{topStock?.derived.tenbagger_probability}%</span>
      </div>

      <div className="bg-kabulens-card border border-slate-700 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-slate-400">5万円以下</span>
        </div>
        <span className="text-xl font-bold text-white">{under5man}</span>
        <span className="text-xs text-slate-500 ml-1">銘柄</span>
      </div>
    </div>
  );
}
