import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, TrendingUp, AlertCircle } from 'lucide-react';
import type { Stock } from '../types/stock';
import { ScoreBar } from './ScoreBar';
import { RadarChart } from './RadarChart';
import { ClusterBadge } from './ClusterBadge';
import { DataQualityBadge } from './DataQualityBadge';
import { isCuratedStock } from '../hooks/useStocks';

interface StockCardProps {
  stock: Stock;
  rank: number;
  isWatched: boolean;
  onToggleWatch: (ticker: string) => void;
  onOpenDetail: (stock: Stock) => void;
}

function getProbabilityColor(prob: number) {
  if (prob >= 70) return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' };
  if (prob >= 50) return { bg: 'bg-kabulens-accent/10', text: 'text-kabulens-accent', border: 'border-kabulens-accent/30' };
  if (prob >= 30) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' };
  return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' };
}

export function StockCard({ stock, rank, isWatched, onToggleWatch, onOpenDetail }: StockCardProps) {
  const [expanded, setExpanded] = useState(false);
  const probColor = getProbabilityColor(stock.derived.tenbagger_probability);
  const curated = isCuratedStock(stock.ticker);

  const formatPrice = (price: number) =>
    price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });

  return (
    <div
      className="bg-kabulens-card border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition-colors cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${(rank - 1) * 50}ms` }}
      onClick={() => onOpenDetail(stock)}
    >
      <div className="p-3 md:p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {rank > 0 && (
              <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-800 text-kabulens-accent font-bold text-xs md:text-sm shrink-0">
                {rank}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                <h3 className="text-sm md:text-base text-white font-bold truncate">{stock.name}</h3>
                <span className="text-xs text-slate-500 font-mono">{stock.ticker}</span>
                <DataQualityBadge quality={stock.data_quality} missingFields={stock.missing_fields} />
                {!curated && (
                  <span className="px-1 py-0.5 bg-slate-700/50 text-slate-500 rounded text-[9px] md:text-[10px]" title="自動生成データ">
                    auto
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
                <span className="text-[10px] md:text-xs text-slate-400">{stock.market}</span>
                <span className="text-[10px] md:text-xs text-slate-600">|</span>
                <span className="text-[10px] md:text-xs text-slate-400">{stock.growth_type}</span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWatch(stock.ticker); }}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
              isWatched
                ? 'bg-kabulens-accent/20 text-kabulens-accent'
                : 'text-slate-500 hover:text-white hover:bg-slate-700'
            }`}
            title={isWatched ? 'ウォッチリストから削除' : 'ウォッチリストに追加'}
          >
            {isWatched ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Price and Tenbagger Score */}
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div>
            <span className="text-base md:text-lg font-bold text-white">{formatPrice(stock.price)}</span>
            <span className="text-[10px] md:text-xs text-slate-400 ml-1.5 md:ml-2">
              最低 {formatPrice(stock.minUnit)}
            </span>
          </div>
          <div className={`flex items-center gap-1 ${probColor.bg} border ${probColor.border} px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg`}>
            <TrendingUp className={`w-3.5 h-3.5 md:w-4 md:h-4 ${probColor.text}`} />
            <span className={`${probColor.text} font-bold text-base md:text-lg`}>
              {stock.derived.tenbagger_probability}
            </span>
            <span className={`text-[10px] md:text-xs ${probColor.text} opacity-70`}>%</span>
          </div>
        </div>

        {/* Theme Tags */}
        <div className="flex flex-wrap gap-1 md:gap-1.5 mb-2 md:mb-3">
          <ClusterBadge clusterId={stock.derived.cluster_id} />
          {stock.theme_tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 md:px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-md text-[10px] md:text-xs"
            >
              {tag}
            </span>
          ))}
          {stock.sbi_buyable && (
            <span className="px-1.5 md:px-2 py-0.5 bg-green-500/10 text-green-400 rounded-md text-[10px] md:text-xs border border-green-500/20">
              SBI可
            </span>
          )}
        </div>

        {/* Score Bars */}
        <div className="space-y-1 md:space-y-1.5">
          <ScoreBar label="テーマ" value={stock.scores.theme} color="bg-purple-500" />
          <ScoreBar label="成長" value={stock.scores.growth} color="bg-green-500" />
          <ScoreBar label="資本政策" value={stock.scores.capital} color="bg-yellow-500" />
          <ScoreBar label="経営" value={stock.scores.governance} color="bg-blue-500" />
          <ScoreBar label="需給" value={stock.scores.momentum} color="bg-red-500" />
        </div>

        {/* Expand Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="flex items-center gap-1 mt-2 md:mt-3 text-[10px] md:text-xs text-slate-400 hover:text-white transition-colors w-full justify-center py-1"
        >
          {expanded ? (
            <><ChevronUp className="w-3 h-3" /> 閉じる</>
          ) : (
            <><ChevronDown className="w-3 h-3" /> 詳細を表示</>
          )}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-700 p-3 md:p-4 bg-slate-800/30" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs text-slate-400 font-medium mb-2">スコアレーダー</h4>
              <RadarChart scores={stock.scores} />
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs text-slate-400 font-medium mb-1.5">根拠</h4>
                <ul className="space-y-1">
                  {stock.evidence.map((ev, i) => (
                    <li key={i} className="text-[11px] md:text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-kabulens-accent shrink-0 mt-0.5">{i + 1}.</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-kabulens-red" />
                  リスク
                </h4>
                <p className="text-[11px] md:text-xs text-kabulens-red/80">{stock.risk}</p>
              </div>
              <div>
                <h4 className="text-xs text-slate-400 font-medium mb-1">クラスター分析</h4>
                <p className="text-[11px] md:text-xs text-slate-300">{stock.derived.cluster_explanation}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
