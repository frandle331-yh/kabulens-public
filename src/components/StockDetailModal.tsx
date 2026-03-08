import { useEffect } from 'react';
import { X, TrendingUp, AlertCircle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import type { Stock } from '../types/stock';
import { RadarChart } from './RadarChart';
import { ScoreBar } from './ScoreBar';
import { ClusterBadge } from './ClusterBadge';
import { DataQualityBadge } from './DataQualityBadge';

interface StockDetailModalProps {
  stock: Stock;
  isWatched: boolean;
  onToggleWatch: () => void;
  onClose: () => void;
}

export function StockDetailModal({ stock, isWatched, onToggleWatch, onClose }: StockDetailModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  const formatPrice = (price: number) =>
    price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl mx-4 my-8 bg-kabulens-card border border-slate-700 rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-white">{stock.name}</h2>
              <span className="text-sm text-slate-400 font-mono">{stock.ticker}</span>
              <DataQualityBadge quality={stock.data_quality} missingFields={stock.missing_fields} />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>{stock.market}</span>
              <span className="text-slate-600">|</span>
              <span>{stock.growth_type}</span>
              <span className="text-slate-600">|</span>
              <ClusterBadge clusterId={stock.derived.cluster_id} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleWatch}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isWatched
                  ? 'bg-kabulens-accent/20 text-kabulens-accent'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {isWatched ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isWatched ? 'ウォッチ中' : 'ウォッチ'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Price Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-3xl font-bold text-white">{formatPrice(stock.price)}</span>
              <div className="text-sm text-slate-400 mt-1">
                最低購入金額: <span className="text-white font-medium">{formatPrice(stock.minUnit)}</span>
                {stock.sbi_buyable && (
                  <span className="inline-flex items-center gap-1 ml-2 text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    SBI購入可（推定）
                  </span>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 bg-gradient-to-r from-kabulens-accent/20 to-purple-500/20 px-5 py-3 rounded-xl border border-kabulens-accent/30">
                <TrendingUp className="w-6 h-6 text-kabulens-accent" />
                <div>
                  <span className="text-3xl font-bold text-kabulens-accent">
                    {stock.derived.tenbagger_probability}
                  </span>
                  <span className="text-sm text-kabulens-accent/70">%</span>
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">テンバガー適性</span>
            </div>
          </div>

          {/* Theme Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {stock.theme_tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Scores and Radar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">軸別スコア</h3>
              <div className="space-y-2.5">
                <ScoreBar label="テーマ適合" value={stock.scores.theme} color="bg-purple-500" />
                <ScoreBar label="成長の型" value={stock.scores.growth} color="bg-green-500" />
                <ScoreBar label="資本政策" value={stock.scores.capital} color="bg-yellow-500" />
                <ScoreBar label="経営一貫性" value={stock.scores.governance} color="bg-blue-500" />
                <ScoreBar label="需給・勢い" value={stock.scores.momentum} color="bg-red-500" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">スコアレーダー</h3>
              <RadarChart scores={stock.scores} />
            </div>
          </div>

          {/* Momentum Components */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3">需給コンポーネント（LAYER2）</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">出来高比率</div>
                <div className="text-lg font-mono text-white">
                  {stock.features.momentum_components.vol_ratio_norm.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">25日線乖離</div>
                <div className="text-lg font-mono text-white">
                  {stock.features.momentum_components.ma25_dev_norm.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">高値接近</div>
                <div className="text-lg font-mono text-white">
                  {(stock.features.momentum_components.breakout_ratio * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">ボラ安定</div>
                <div className="text-lg font-mono text-white">
                  {stock.features.momentum_components.volatility_norm.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3">根拠（Evidence）</h3>
            <div className="space-y-2">
              {stock.evidence.map((ev, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-slate-800/30 rounded-lg p-3"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-kabulens-accent/20 text-kabulens-accent text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-300">{ev}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-kabulens-red" />
              リスク
            </h3>
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-300">{stock.risk}</p>
            </div>
          </div>

          {/* Cluster Analysis */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-2">クラスター分析</h3>
            <div className="bg-slate-800/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <ClusterBadge clusterId={stock.derived.cluster_id} />
              </div>
              <p className="text-sm text-slate-300">{stock.derived.cluster_explanation}</p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-700">
            <span>レジーム: {stock.regime_id}</span>
            <span>正規化: {stock.normalization_version}</span>
            <a
              href={`https://finance.yahoo.co.jp/quote/${stock.ticker}.T`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-kabulens-accent hover:underline ml-auto"
            >
              Yahoo Finance で見る <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
