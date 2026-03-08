# KABULENS

**TSE (Tokyo Stock Exchange) structural stock screener** built with React 19, TypeScript, and a layered scoring engine.

Analyzes 3,700+ listed stocks through a multi-layer pipeline — from raw market data to cluster classification — and presents results through an interactive, filterable dashboard.

> **Note**: This is a portfolio version. The scoring engine uses simplified demo parameters. The production version runs calibrated models against real J-Quants API data.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  L1: Facts            J-Quants API → raw features       │
│  (Data Ingestion)     OHLCV, financials, listed info    │
├─────────────────────────────────────────────────────────┤
│  L2: Computation      Normalization → Momentum →        │
│  (Scoring Engine)     Cluster Classification →          │
│                       Tenbagger Probability             │
├─────────────────────────────────────────────────────────┤
│  L3: Interpretation   LLM Theme Classification +       │
│  (AI Layer)           Curated Expert Overrides          │
├─────────────────────────────────────────────────────────┤
│  UI: Presentation     React 19 + Tailwind + Recharts   │
│  (This Repository)    Filter / Sort / Compare / Export  │
└─────────────────────────────────────────────────────────┘
```

Each layer has a clear boundary and can be tested, replaced, or upgraded independently:

- **L1** fetches and caches market data (price, volume, financials)
- **L2** normalizes features and classifies stocks into 4 clusters (`tenbagger` / `large_growth` / `event_spike` / `noise`) using a rule-based priority chain
- **L3** assigns investment theme tags using Claude API batch classification, with expert-curated overrides for key stocks
- **UI** consumes a single `stocks-data.json` and renders everything client-side

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 with TypeScript (strict mode) |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 with custom dark theme |
| Charts | Recharts 3 (radar, bar, pie) |
| Icons | Lucide React |
| Testing | Vitest 4 + Testing Library + jsdom |
| Deployment | GitHub Pages (static) |

## Features

### Ranking & Filtering
- 6 sort axes (tenbagger probability, momentum, theme fit, growth, price, min purchase)
- Multi-dimensional filters: purchase amount cap, SBI buyability, theme category, cluster exclusion
- One-click filter presets ("Tenbagger Hunter", "Value Growth", "High Momentum")
- Full-text search across ticker, name, theme tags, and growth type

### Watchlist
- Persistent watchlist via localStorage
- Add/remove from any view
- Dedicated watchlist tab with all stock details

### Stock Analysis
- Per-stock detail modal with 5-axis radar chart
- AI-generated evidence (3 items, 120-char limit each)
- Risk assessment and cluster explanation
- Data quality badge (A/B/C based on field completeness)

### Multi-Stock Comparison
- Side-by-side comparison of up to 4 stocks
- Synchronized score bars and radar overlays

### Insights Dashboard
- Aggregate statistics: tenbagger count, average probability, affordable stocks
- Theme distribution and cluster breakdown charts

### Keyboard Shortcuts
- `1`-`6` tab switching, `/` search focus, `Esc` modal close

## Component Architecture

```
App.tsx
├── Header              (search, tabs, metadata)
├── FilterBar           (presets, filters, sort)
├── SummaryStats        (KPI cards)
├── RankingView         (stock list)
│   └── StockCard       (individual stock)
│       ├── ClusterBadge
│       ├── DataQualityBadge
│       └── ScoreBar
├── WatchlistView
├── AnalysisPanel       (detail + radar chart)
│   └── RadarChart
├── CompareView         (side-by-side)
├── InsightsView        (charts + stats)
├── SettingsView        (config + presets)
└── StockDetailModal    (full detail overlay)
```

### Design Principles

**Separation of concerns** — UI components never call the engine directly. Data flows through hooks (`useStocks` → `useUIState` → filter utils), and components receive pre-processed props.

**Type-driven development** — The `Stock` interface (119 lines) is the single source of truth. Every component, hook, and utility is typed against it. No `any` types in the codebase.

**Immutable state** — All filter/sort operations return new arrays. `useMemo` ensures recomputation only when dependencies change.

**Derived state over synced state** — `selectedStock` is derived from `selectedTicker + allStocks` via `useMemo`, not synchronized via `useEffect`. URL state is the source of truth.

**Graceful degradation** — If `stocks-data.json` fails to load, the app falls back to built-in static data (45 curated stocks). No error screen, no broken state.

## Scoring Engine Interface

The engine processes raw market features through a deterministic pipeline:

```typescript
// Input: raw market data per stock
interface RawFeatures {
  vol_ratio: number;         // Volume 5-day avg / 60-day avg
  ma25_dev: number;          // 25-day moving average deviation
  breakout_ratio: number;    // Proximity to 52-week high (0-1)
  volatility: number;        // 20-day historical volatility
  market_cap_billions: number;
  yoy_sales_growth?: number;
  gross_margin?: number;
}

// Output: fully scored stock
interface Stock {
  // Identity
  ticker: string;
  name: string;
  market: string;

  // Scores (0-100)
  scores: {
    theme: number;      // L3: theme relevance
    growth: number;     // L3: growth pattern fit
    capital: number;    // L3: capital allocation
    governance: number; // L3: management consistency
    momentum: number;   // L2: computed from raw features
  };

  // Classification
  derived: {
    tenbagger_probability: number;  // 0-100, structural similarity
    cluster_id: ClusterId;          // 4-class rule-based
    cluster_explanation: string;    // max 120 chars
  };

  // Quality
  data_quality: 'A' | 'B' | 'C';
  missing_fields: string[];
}
```

Key design decisions:
- **`??` over `||`** for missing data imputation — preserves `0` (real zero growth) vs `null` (unknown)
- **if/else priority chain** for clustering — ensures a tenbagger candidate with high momentum is never misclassified as `event_spike`
- **Momentum excluded from tenbagger probability** — "currently rising" ≠ "structurally a tenbagger"
- **Data quality debuff** — stocks with missing core fields receive probability penalties, preventing low-data stocks from ranking artificially high

## Testing

```
9 test files — 73 tests — all passing

src/components/__tests__/
  ClusterBadge.test.tsx      4 tests   (label mapping per cluster)
  DataQualityBadge.test.tsx  5 tests   (A/B/C display, missing field tooltip)
  ScoreBar.test.tsx          4 tests   (label, value, percentage, color)
  StockCard.test.tsx        11 tests   (render, click, watch, curated badge)
  Header.test.tsx            9 tests   (tabs, search, badges, data source)
  SummaryStats.test.tsx      5 tests   (KPI calculations, edge cases)

src/hooks/__tests__/
  useWatchlist.test.ts       8 tests   (CRUD, dedup, localStorage, corruption)
  useUIState.test.ts         8 tests   (filter ops, persistence, schema evolution)

src/utils/__tests__/
  filters.test.ts           19 tests   (filter, sort, search combinations)
```

Testing strategy:
- **Component tests** use Testing Library — query by role/text, not implementation details
- **Hook tests** use `renderHook` + `act` — verify state transitions and localStorage persistence
- **Corruption resilience** — invalid localStorage JSON gracefully falls back to defaults
- **Schema evolution** — partial saved state merges correctly with new default fields

## Getting Started

```bash
git clone https://github.com/frandle331-yh/kabulens-portfolio.git
cd kabulens-portfolio
npm install
npm run dev       # → http://localhost:5173/kabulens-portfolio/
npm test          # → 73 tests pass
npm run build     # → dist/ (static deployment ready)
```

## Project Structure

```
src/
├── engine/          Scoring pipeline (demo parameters)
│   ├── pipeline.ts  L2 orchestrator: normalize → score → classify
│   ├── momentum.ts  Technical momentum aggregation
│   ├── cluster.ts   Rule-based 4-class classification
│   ├── tenbagger.ts Structural similarity scoring
│   ├── normalize.ts Min-max normalization with clamp
│   └── validation.ts Schema validation + data quality
├── components/      15 React components (2,900 LOC total)
├── hooks/           3 custom hooks (state, watchlist, data loading)
├── utils/           Filter / sort / search / CSV export
├── types/           Stock interface + filter types
├── data/            Static fallback data (45 curated stocks)
└── test/            Test setup + mock factories
```

## License

This project is shared for portfolio and educational purposes.
The scoring engine parameters in this repository are simplified demos.
