import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUIState } from '../useUIState';
import { DEFAULT_FILTERS } from '../../types/stock';

describe('useUIState', () => {
  it('starts with DEFAULT_FILTERS', () => {
    const { result } = renderHook(() => useUIState());
    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
  });

  it('updates a single filter', () => {
    const { result } = renderHook(() => useUIState());
    act(() => result.current.updateFilter('maxMinUnit', 50000));
    expect(result.current.filters.maxMinUnit).toBe(50000);
    // Other filters unchanged
    expect(result.current.filters.sbiBuyableOnly).toBe(DEFAULT_FILTERS.sbiBuyableOnly);
  });

  it('batch updates multiple filters', () => {
    const { result } = renderHook(() => useUIState());
    act(() => result.current.batchUpdate({ maxMinUnit: 30000, sbiBuyableOnly: false }));
    expect(result.current.filters.maxMinUnit).toBe(30000);
    expect(result.current.filters.sbiBuyableOnly).toBe(false);
  });

  it('resets to defaults', () => {
    const { result } = renderHook(() => useUIState());
    act(() => result.current.updateFilter('maxMinUnit', 999));
    act(() => result.current.resetFilters());
    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useUIState());
    act(() => result.current.updateFilter('sortKey', 'momentum'));
    const stored = JSON.parse(localStorage.getItem('kabulens_ui_state') || '{}');
    expect(stored.sortKey).toBe('momentum');
  });

  it('restores from localStorage', () => {
    const saved = { ...DEFAULT_FILTERS, maxMinUnit: 77777 };
    localStorage.setItem('kabulens_ui_state', JSON.stringify(saved));
    const { result } = renderHook(() => useUIState());
    expect(result.current.filters.maxMinUnit).toBe(77777);
  });

  it('falls back to DEFAULT_FILTERS for corrupted localStorage', () => {
    localStorage.setItem('kabulens_ui_state', '<<<invalid-json>>>');
    const { result } = renderHook(() => useUIState());
    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
  });

  it('merges partial saved state with DEFAULT_FILTERS (schema evolution)', () => {
    // Simulate old saved data that only has some fields
    localStorage.setItem('kabulens_ui_state', JSON.stringify({ maxMinUnit: 42000 }));
    const { result } = renderHook(() => useUIState());
    expect(result.current.filters.maxMinUnit).toBe(42000);
    // New fields from DEFAULT_FILTERS should be present
    expect(result.current.filters.sbiBuyableOnly).toBe(DEFAULT_FILTERS.sbiBuyableOnly);
    expect(result.current.filters.sortKey).toBe(DEFAULT_FILTERS.sortKey);
  });
});
