import { useState, useEffect } from 'react';
import type { Stock } from '../types/stock';
import { processStock } from '../engine/pipeline';
import type { RawStockEntry } from '../data/rawStockData';
import { rawStockData } from '../data/rawStockData';

interface StocksDataJSON {
  generated_at: string;
  source: string;
  stock_count: number;
  stocks: (RawStockEntry & { data_source?: 'curated' | 'llm' | 'heuristic' })[];
}

interface StocksState {
  stocks: Stock[];
  dataSource: 'static' | 'json';
  generatedAt: string | null;
  stockCount: number;
  isLoading: boolean;
}

function processEntries(entries: (RawStockEntry & { data_source?: 'curated' | 'llm' | 'heuristic' })[]): Stock[] {
  return entries.map((entry) =>
    processStock(
      {
        ticker: entry.ticker,
        name: entry.name,
        market: entry.market,
        price: entry.price,
        sbi_buyable_override: entry.sbi_buyable_override,
        trade_status: entry.trade_status,
        regime_id: entry.regime_id,
        theme_tags: entry.theme_tags,
        growth_type: entry.growth_type,
        scores: entry.scores_l3,
        evidence: entry.evidence,
        risk: entry.risk,
        cluster_explanation: entry.cluster_explanation,
      },
      entry.raw
    )
  );
}

// Process static fallback data once
const staticStocks: Stock[] = processEntries(rawStockData);

export function useStocks(): StocksState {
  const [state, setState] = useState<StocksState>({
    stocks: staticStocks,
    dataSource: 'static',
    generatedAt: null,
    stockCount: staticStocks.length,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadJSON() {
      try {
        const basePath = import.meta.env.BASE_URL ?? '/';
        const res = await fetch(`${basePath}stocks-data.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: StocksDataJSON = await res.json();
        if (!data.stocks || !Array.isArray(data.stocks) || data.stocks.length === 0) {
          throw new Error('Invalid stocks data format');
        }

        const stocks = processEntries(data.stocks);
        if (!cancelled) {
          setState({
            stocks,
            dataSource: 'json',
            generatedAt: data.generated_at,
            stockCount: stocks.length,
            isLoading: false,
          });
        }
      } catch {
        // Fallback to static data
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    }

    loadJSON();
    return () => { cancelled = true; };
  }, []);

  return state;
}

/**
 * Check if a stock is auto-generated (for badge display).
 * Uses the data_source field from JSON or falls back to checking ticker presence.
 */
const curatedTickers = new Set(rawStockData.map((e) => e.ticker));
export function isCuratedStock(ticker: string): boolean {
  return curatedTickers.has(ticker);
}
