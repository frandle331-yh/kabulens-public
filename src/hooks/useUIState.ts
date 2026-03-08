import { useState, useEffect, useCallback } from 'react';
import type { UIFilters } from '../types/stock';
import { DEFAULT_FILTERS } from '../types/stock';

const STORAGE_KEY = 'kabulens_ui_state';

export function useUIState() {
  const [filters, setFilters] = useState<UIFilters>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_FILTERS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore parse errors
    }
    return DEFAULT_FILTERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // ignore storage errors
    }
  }, [filters]);

  const updateFilter = useCallback(<K extends keyof UIFilters>(key: K, value: UIFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const batchUpdate = useCallback((updates: Partial<UIFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return { filters, updateFilter, batchUpdate, resetFilters };
}
