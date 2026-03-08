import { Search, Eye, FileText, TrendingUp, GitCompareArrows, BarChart3, Settings } from 'lucide-react';

export type TabId = 'ranking' | 'watchlist' | 'analysis' | 'compare' | 'insights' | 'settings';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  watchlistCount: number;
  dataSource: 'static' | 'json';
  generatedAt: string | null;
  stockCount: number;
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export function Header({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  watchlistCount,
  dataSource,
  generatedAt,
  stockCount,
}: HeaderProps) {
  return (
    <header className="bg-kabulens-card border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-kabulens-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-kabulens-accent" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                KABU<span className="text-kabulens-accent">LENS</span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-400 mt-0 leading-tight">
                投資構造分析AI
                {dataSource === 'json' && generatedAt && (
                  <span className="ml-2 text-slate-500">
                    {stockCount}銘柄 | 更新: {formatDate(generatedAt)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="relative w-48 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="銘柄名・コード・テーマ..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-kabulens-accent focus:ring-1 focus:ring-kabulens-accent"
            />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
          <button
            onClick={() => onTabChange('ranking')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'ranking'
                ? 'bg-kabulens-accent text-slate-900 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            ランキング
          </button>
          <button
            onClick={() => onTabChange('watchlist')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'watchlist'
                ? 'bg-kabulens-accent text-slate-900 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
            ウォッチ
            {watchlistCount > 0 && (
              <span className="bg-kabulens-accent/20 text-kabulens-accent px-1.5 py-0.5 rounded text-xs font-medium">
                {watchlistCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange('analysis')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analysis'
                ? 'bg-kabulens-accent text-slate-900 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
            銘柄分析
          </button>
          <button
            onClick={() => onTabChange('compare')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'compare'
                ? 'bg-kabulens-accent text-slate-900 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <GitCompareArrows className="w-3.5 h-3.5 md:w-4 md:h-4" />
            比較
          </button>
          <button
            onClick={() => onTabChange('insights')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'insights'
                ? 'bg-kabulens-accent text-slate-900 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            統計
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-kabulens-accent text-slate-900 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Settings className="w-3.5 h-3.5 md:w-4 md:h-4" />
            設定
          </button>
        </nav>
      </div>
    </header>
  );
}
