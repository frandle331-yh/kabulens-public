import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWatchlist } from '../useWatchlist';

describe('useWatchlist', () => {
  it('starts with empty watchlist', () => {
    const { result } = renderHook(() => useWatchlist());
    expect(result.current.watchlist).toEqual([]);
  });

  it('adds a ticker to watchlist', () => {
    const { result } = renderHook(() => useWatchlist());
    act(() => result.current.addToWatchlist('3993'));
    expect(result.current.watchlist).toEqual(['3993']);
    expect(result.current.isWatched('3993')).toBe(true);
  });

  it('prevents duplicate additions', () => {
    const { result } = renderHook(() => useWatchlist());
    act(() => result.current.addToWatchlist('3993'));
    act(() => result.current.addToWatchlist('3993'));
    expect(result.current.watchlist).toEqual(['3993']);
  });

  it('removes a ticker from watchlist', () => {
    const { result } = renderHook(() => useWatchlist());
    act(() => result.current.addToWatchlist('3993'));
    act(() => result.current.addToWatchlist('6920'));
    act(() => result.current.removeFromWatchlist('3993'));
    expect(result.current.watchlist).toEqual(['6920']);
    expect(result.current.isWatched('3993')).toBe(false);
  });

  it('clears entire watchlist', () => {
    const { result } = renderHook(() => useWatchlist());
    act(() => result.current.addToWatchlist('3993'));
    act(() => result.current.addToWatchlist('6920'));
    act(() => result.current.clearWatchlist());
    expect(result.current.watchlist).toEqual([]);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useWatchlist());
    act(() => result.current.addToWatchlist('3993'));
    const stored = JSON.parse(localStorage.getItem('kabulens_watchlist') || '[]');
    expect(stored).toEqual(['3993']);
  });

  it('restores from localStorage', () => {
    localStorage.setItem('kabulens_watchlist', JSON.stringify(['1234', '5678']));
    const { result } = renderHook(() => useWatchlist());
    expect(result.current.watchlist).toEqual(['1234', '5678']);
  });

  it('falls back to empty array for corrupted localStorage', () => {
    localStorage.setItem('kabulens_watchlist', 'not-valid-json{{{');
    const { result } = renderHook(() => useWatchlist());
    expect(result.current.watchlist).toEqual([]);
  });
});
