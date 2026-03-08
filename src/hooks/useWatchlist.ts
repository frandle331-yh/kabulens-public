import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kabulens_watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch {
      // ignore
    }
  }, [watchlist]);

  const addToWatchlist = useCallback((ticker: string) => {
    setWatchlist((prev) => (prev.includes(ticker) ? prev : [...prev, ticker]));
  }, []);

  const removeFromWatchlist = useCallback((ticker: string) => {
    setWatchlist((prev) => prev.filter((t) => t !== ticker));
  }, []);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
  }, []);

  const isWatched = useCallback(
    (ticker: string) => watchlist.includes(ticker),
    [watchlist]
  );

  return { watchlist, addToWatchlist, removeFromWatchlist, isWatched, clearWatchlist };
}
