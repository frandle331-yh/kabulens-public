# KABULENS

東証上場3,700銘柄超を多層パイプラインで構造分析し、テンバガー候補を抽出するスクリーナー。

React 19 + TypeScript + Vite で構築。完全クライアントサイド動作、GitHub Pages で静的ホスティング。

> **本リポジトリについて**: スコアリングエンジンはデモ用の簡易パラメータを使用しています。本番環境では J-Quants API の実データに対してキャリブレーション済みモデルを適用します。

---

## アーキテクチャ

```
┌──────────────────────────────────────────────────────┐
│  L1: 事実層         J-Quants API → 生特徴量          │
│                     株価・出来高・財務・上場情報       │
├──────────────────────────────────────────────────────┤
│  L2: 計算層         正規化 → モメンタム →             │
│                     クラスター分類 → テンバガー確率   │
├──────────────────────────────────────────────────────┤
│  L3: 解釈層         LLM テーマ分類（Claude API）+    │
│                     専門家キュレーション（42銘柄）     │
├──────────────────────────────────────────────────────┤
│  UI: 表示層         React 19 + Tailwind + Recharts   │
│  （本リポジトリ）    フィルタ / ソート / 比較 / CSV   │
└──────────────────────────────────────────────────────┘
```

各層は明確な境界を持ち、独立してテスト・差し替え・アップグレードが可能:

- **L1** — 市場データの取得とキャッシュ（OHLCV、決算、上場区分）
- **L2** — 特徴量の正規化と4クラスター分類（`tenbagger` / `large_growth` / `event_spike` / `noise`）。ルールベースの if/else 優先チェーンで判定
- **L3** — Claude API によるバッチテーマ分類 + 専門家による手動オーバーライド
- **UI** — `stocks-data.json` 1ファイルを読み込み、全処理をクライアントサイドで実行

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React 19 + TypeScript（strict モード） |
| ビルド | Vite 5 |
| スタイリング | Tailwind CSS 3（カスタムダークテーマ） |
| チャート | Recharts 3（レーダー・棒・円） |
| アイコン | Lucide React |
| テスト | Vitest 4 + Testing Library + jsdom |
| デプロイ | GitHub Pages（静的配信） |

## 機能

### ランキング・フィルタ
- 6軸ソート（テンバガー適性、モメンタム、テーマ適合、成長の型、株価、最低購入額）
- 多次元フィルタ：購入額上限、SBI購入可否、テーマカテゴリ、クラスター除外
- ワンクリックプリセット（「テンバガー狙い」「割安成長」「高モメンタム」）
- 全文検索（銘柄コード・名前・テーマタグ・成長タイプ横断）

### ウォッチリスト
- localStorage による永続化
- どの画面からでも追加・削除
- 専用タブで一覧表示

### 銘柄分析
- 5軸レーダーチャート付き詳細モーダル
- AI 生成エビデンス（最大3件、各120文字制限）
- リスク評価とクラスター解説
- データ品質バッジ（A/B/C — フィールド充足度に基づく）

### 比較ビュー
- 最大4銘柄の横並び比較
- スコアバー・レーダーの同期表示

### 統計ダッシュボード
- KPI 集計：テンバガー候補数、平均確率、5万円以下で買える銘柄数
- テーマ分布・クラスター構成チャート

### キーボードショートカット
- `1`-`6` タブ切替 / `/` 検索フォーカス / `Esc` モーダル閉じる

## コンポーネント設計

```
App.tsx
├── Header              検索・タブ・メタデータ
├── FilterBar           プリセット・フィルタ・ソート
├── SummaryStats        KPI カード
├── RankingView         銘柄リスト
│   └── StockCard       個別銘柄カード
│       ├── ClusterBadge
│       ├── DataQualityBadge
│       └── ScoreBar
├── WatchlistView       ウォッチリスト
├── AnalysisPanel       詳細分析 + レーダーチャート
│   └── RadarChart
├── CompareView         横並び比較
├── InsightsView        統計・チャート
├── SettingsView        設定・プリセット管理
└── StockDetailModal    詳細オーバーレイ
```

### 設計原則

**関心の分離** — UI コンポーネントはエンジンを直接呼ばない。データは hooks（`useStocks` → `useUIState` → フィルタユーティリティ）を経由し、コンポーネントは加工済みの props を受け取る。

**型駆動開発** — `Stock` インターフェース（119行）が唯一の正。全コンポーネント・フック・ユーティリティがこの型に対して書かれている。`any` 型はゼロ。

**不変状態** — フィルタ・ソート操作は常に新しい配列を返す。`useMemo` で依存が変わったときだけ再計算。

**導出状態 > 同期状態** — `selectedStock` は `selectedTicker + allStocks` から `useMemo` で導出。`useEffect` で同期しない。URL パラメータが状態の源。

**グレースフルデグラデーション** — `stocks-data.json` の読み込みに失敗した場合、組み込みの静的データ（45銘柄）にフォールバック。エラー画面にならない。

## スコアリングエンジン

生の市場特徴量を決定論的パイプラインで処理:

```typescript
// 入力: 銘柄ごとの市場データ
interface RawFeatures {
  vol_ratio: number;         // 出来高比率（5日平均 / 60日平均）
  ma25_dev: number;          // 25日移動平均乖離率
  breakout_ratio: number;    // 52週高値への接近度（0-1）
  volatility: number;        // 20日ヒストリカルボラティリティ
  market_cap_billions: number; // 時価総額（億円）
  yoy_sales_growth?: number; // YoY 売上成長率
  gross_margin?: number;     // 粗利率
}

// 出力: スコアリング済み銘柄
interface Stock {
  // スコア（各 0-100）
  scores: {
    theme: number;      // L3: テーマ適合度
    growth: number;     // L3: 成長パターン
    capital: number;    // L3: 資本政策
    governance: number; // L3: 経営一貫性
    momentum: number;   // L2: 需給・勢い（数式算出）
  };

  // 分類
  derived: {
    tenbagger_probability: number;  // 0-100 構造類似度
    cluster_id: ClusterId;          // 4分類ルールベース
    cluster_explanation: string;    // 最大120文字
  };

  // 品質
  data_quality: 'A' | 'B' | 'C';   // フィールド充足度
  missing_fields: string[];
}
```

主要な設計判断:

- **欠損補完は `??` を使い `||` を使わない** — `0`（ゼロ成長=実績値）と `null`（未取得）を区別する
- **クラスター判定は if/else 優先チェーン** — テンバガー候補がモメンタムが高いからといって `event_spike` に誤分類されない
- **テンバガー確率にモメンタムを含めない** — 「今上がっているか」と「テンバガー構造か」は別概念
- **データ品質デバフ** — 欠損フィールドが多い銘柄にペナルティを課し、低データ銘柄の不当な高ランク入りを防止

## テスト

```
9 ファイル — 73 テスト — 全 pass

src/components/__tests__/
  ClusterBadge.test.tsx      4件  クラスター別ラベル表示
  DataQualityBadge.test.tsx  5件  A/B/C 表示・補完フィールドツールチップ
  ScoreBar.test.tsx          4件  ラベル・値・パーセンテージ・色
  StockCard.test.tsx        11件  表示・クリック・ウォッチ・キュレーションバッジ
  Header.test.tsx            9件  タブ・検索・バッジ・データソース分岐
  SummaryStats.test.tsx      5件  KPI 計算・エッジケース

src/hooks/__tests__/
  useWatchlist.test.ts       8件  CRUD・重複防止・localStorage・破損データ耐性
  useUIState.test.ts         8件  フィルタ操作・永続化・スキーマ進化

src/utils/__tests__/
  filters.test.ts           19件  フィルタ・ソート・検索の組合せ
```

テスト設計方針:
- **コンポーネントテスト** — Testing Library でロール・テキストベースでクエリ（実装詳細に依存しない）
- **フックテスト** — `renderHook` + `act` で状態遷移と localStorage 永続化を検証
- **破損データ耐性** — 不正な localStorage JSON に対してデフォルト値にフォールバック
- **スキーマ進化** — 旧バージョンの保存データが新しいデフォルトフィールドと正しくマージされる

## セットアップ

```bash
git clone https://github.com/frandle331-yh/kabulens-public.git
cd kabulens-public
npm install
npm run dev       # → http://localhost:5173/kabulens-public/
npm test          # → 73 テスト pass
npm run build     # → dist/（静的デプロイ可）
```

## ディレクトリ構成

```
src/
├── engine/          スコアリングパイプライン（デモパラメータ）
│   ├── pipeline.ts  L2 オーケストレータ: 正規化→スコア→分類
│   ├── momentum.ts  テクニカルモメンタム集計
│   ├── cluster.ts   ルールベース 4 分類
│   ├── tenbagger.ts 構造類似度スコアリング
│   ├── normalize.ts Min-Max 正規化 + clamp
│   └── validation.ts スキーマ検証 + データ品質判定
├── components/      15 コンポーネント（計 2,900 行）
├── hooks/           3 カスタムフック（データ・状態・ウォッチリスト）
├── utils/           フィルタ / ソート / 検索 / CSV エクスポート
├── types/           Stock インターフェース + フィルタ型定義
├── data/            静的フォールバックデータ（45 銘柄）
└── test/            テストセットアップ + モックファクトリ
```

## ライセンス

本プロジェクトはポートフォリオ・教育目的で公開しています。
スコアリングエンジンのパラメータは簡易デモ版です。
