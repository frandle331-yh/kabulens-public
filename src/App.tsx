import { useState, useMemo, useCallback, useEffect } from 'react';
import { Header, type TabId } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { SummaryStats } from './components/SummaryStats';
import { RankingView } from './components/RankingView';
import { WatchlistView } from './components/WatchlistView';
import { AnalysisPanel } from './components/AnalysisPanel';
import { CompareView } from './components/CompareView';
import { InsightsView } from './components/InsightsView';
import { SettingsView } from './components/SettingsView';
import { StockDetailModal } from './components/StockDetailModal';
import { useUIState } from './hooks/useUIState';
import { useWatchlist } from './hooks/useWatchlist';
import { useStocks } from './hooks/useStocks';
import { filterStocks, sortStocks, searchStocks } from './utils/filters';
import type { Stock } from './types/stock';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('ranking');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicker, setSelectedTicker] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ticker');
  });
  const [compareList, setCompareList] = useState<string[]>([]);
  const { filters, updateFilter, batchUpdate, resetFilters } = useUIState();
  const { watchlist, addToWatchlist, removeFromWatchlist, isWatched, clearWatchlist } = useWatchlist();
  const { stocks: allStocks, dataSource, generatedAt, stockCount, isLoading } = useStocks();

  // Derive selectedStock from ticker + data (no useEffect needed)
  const selectedStock = useMemo(() => {
    if (!selectedTicker) return null;
    return allStocks.find((s) => s.ticker === selectedTicker) ?? null;
  }, [selectedTicker, allStocks]);

  // Sync URL when modal opens/closes
  const handleOpenDetail = useCallback((stock: Stock) => {
    setSelectedTicker(stock.ticker);
    const url = new URL(window.location.href);
    url.searchParams.set('ticker', stock.ticker);
    window.history.replaceState(null, '', url.toString());
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedTicker(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('ticker');
    window.history.replaceState(null, '', url.toString());
  }, []);

  const handleToggleWatch = (ticker: string) => {
    if (isWatched(ticker)) {
      removeFromWatchlist(ticker);
    } else {
      addToWatchlist(ticker);
    }
  };

  const handleAddToCompare = useCallback((ticker: string) => {
    setCompareList((prev) => (prev.length < 4 && !prev.includes(ticker) ? [...prev, ticker] : prev));
  }, []);

  const handleRemoveFromCompare = useCallback((ticker: string) => {
    setCompareList((prev) => prev.filter((t) => t !== ticker));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const TAB_MAP: Record<string, TabId> = {
      '1': 'ranking', '2': 'watchlist', '3': 'analysis',
      '4': 'compare', '5': 'insights', '6': 'settings',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip when typing in input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Escape' && selectedStock) {
        handleCloseDetail();
        return;
      }

      // "/" focuses search
      if (e.key === '/' && !selectedStock) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="銘柄名"]');
        searchInput?.focus();
        return;
      }

      // Number keys switch tabs
      if (!e.ctrlKey && !e.metaKey && !e.altKey && TAB_MAP[e.key] && !selectedStock) {
        setActiveTab(TAB_MAP[e.key]);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedStock, handleCloseDetail]);

  const filteredStocks = useMemo(() => {
    let stocks = allStocks;
    stocks = searchStocks(stocks, searchQuery);
    stocks = filterStocks(stocks, filters);
    stocks = sortStocks(stocks, filters.sortKey);
    return stocks;
  }, [allStocks, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-kabulens-bg">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        watchlistCount={watchlist.length}
        dataSource={dataSource}
        generatedAt={generatedAt}
        stockCount={stockCount}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading && dataSource === 'static' && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-kabulens-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">銘柄データを読み込み中...</p>
          </div>
        )}

        {activeTab === 'ranking' && !isLoading && (
          <>
            <SummaryStats stocks={filteredStocks} />
            <FilterBar
              filters={filters}
              onFilterChange={updateFilter}
              onBatchUpdate={batchUpdate}
              onReset={resetFilters}
              resultCount={filteredStocks.length}
            />
            <RankingView
              stocks={filteredStocks}
              isWatched={isWatched}
              onToggleWatch={handleToggleWatch}
              onOpenDetail={handleOpenDetail}
            />
          </>
        )}

        {activeTab === 'watchlist' && !isLoading && (
          <WatchlistView
            stocks={allStocks}
            watchlist={watchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            onOpenDetail={handleOpenDetail}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisPanel
            isWatched={isWatched}
            onToggleWatch={handleToggleWatch}
            onOpenDetail={handleOpenDetail}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView
            stocks={allStocks}
            compareList={compareList}
            onAddToCompare={handleAddToCompare}
            onRemoveFromCompare={handleRemoveFromCompare}
            isWatched={isWatched}
            onToggleWatch={handleToggleWatch}
            onOpenDetail={handleOpenDetail}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView stocks={filteredStocks} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            filters={filters}
            onFilterChange={updateFilter}
            onReset={resetFilters}
            onClearWatchlist={clearWatchlist}
            watchlistCount={watchlist.length}
            dataSource={dataSource}
            generatedAt={generatedAt}
            stockCount={stockCount}
          />
        )}
      </main>

      <footer className="border-t border-slate-800 mt-8 py-4 text-center text-xs text-slate-500">
        <div>KABULENS v0.5 — 投資構造分析AI（自分専用）</div>
        <div className="text-slate-600 mt-1">
          ※ スコアは構造的類似度であり、投資判断を推奨するものではありません
        </div>
        <div className="text-slate-600 mt-2 hidden md:block">
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-500 border border-slate-700">1</kbd>-<kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-500 border border-slate-700">6</kbd> タブ切替
          <span className="mx-2">|</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-500 border border-slate-700">/</kbd> 検索
          <span className="mx-2">|</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-500 border border-slate-700">Esc</kbd> 閉じる
        </div>
      </footer>

      {selectedStock && (
        <StockDetailModal
          stock={selectedStock}
          isWatched={isWatched(selectedStock.ticker)}
          onToggleWatch={() => handleToggleWatch(selectedStock.ticker)}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

export default App;
