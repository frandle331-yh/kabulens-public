import { Download } from 'lucide-react';
import type { Stock } from '../types/stock';
import { StockCard } from './StockCard';
import { exportStocksCsv } from '../utils/exportCsv';

interface RankingViewProps {
  stocks: Stock[];
  isWatched: (ticker: string) => boolean;
  onToggleWatch: (ticker: string) => void;
  onOpenDetail: (stock: Stock) => void;
}

export function RankingView({ stocks, isWatched, onToggleWatch, onOpenDetail }: RankingViewProps) {
  if (stocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-sm">条件に合致する銘柄がありません</p>
        <p className="text-slate-500 text-xs mt-1">フィルタ条件を変更してみてください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => exportStocksCsv(stocks)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          CSV出力
        </button>
      </div>
      {stocks.map((stock, index) => (
        <StockCard
          key={stock.ticker}
          stock={stock}
          rank={index + 1}
          isWatched={isWatched(stock.ticker)}
          onToggleWatch={onToggleWatch}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
}
