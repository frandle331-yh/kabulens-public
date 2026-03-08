import { Eye } from 'lucide-react';
import type { Stock } from '../types/stock';
import { StockCard } from './StockCard';

interface WatchlistViewProps {
  stocks: Stock[];
  watchlist: string[];
  onRemoveFromWatchlist: (ticker: string) => void;
  onOpenDetail: (stock: Stock) => void;
}

export function WatchlistView({ stocks, watchlist, onRemoveFromWatchlist, onOpenDetail }: WatchlistViewProps) {
  const watchedStocks = stocks.filter((s) => watchlist.includes(s.ticker));

  if (watchedStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">ウォッチリストが空です</p>
        <p className="text-slate-500 text-xs mt-1">
          ランキングから気になる銘柄を追加してください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-400 mb-2">
        {watchedStocks.length}件の銘柄をウォッチ中
      </div>
      {watchedStocks.map((stock, index) => (
        <StockCard
          key={stock.ticker}
          stock={stock}
          rank={index + 1}
          isWatched={true}
          onToggleWatch={onRemoveFromWatchlist}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
}
