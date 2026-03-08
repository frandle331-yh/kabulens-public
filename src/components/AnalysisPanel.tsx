import { useState } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import type { Stock } from '../types/stock';
import { StockCard } from './StockCard';
import { processStock, type RawFeatures } from '../engine/pipeline';

interface AnalysisPanelProps {
  isWatched: (ticker: string) => boolean;
  onToggleWatch: (ticker: string) => void;
  onOpenDetail: (stock: Stock) => void;
}

// Phase1: IR文章から簡易的に構造を推定するデモ
// Phase2以降: Claude APIで自動解釈
function parseIRText(text: string): {
  themeTags: string[];
  growthType: string;
  scores: { theme: number; growth: number; capital: number; governance: number };
  evidence: string[];
  risk: string;
  clusterExplanation: string;
} {
  const lower = text.toLowerCase();

  // テーマタグ推定
  const themeTags: string[] = [];
  if (lower.includes('ai') || lower.includes('人工知能')) themeTags.push('AI');
  if (lower.includes('saas') || lower.includes('サブスクリプション')) themeTags.push('SaaS');
  if (lower.includes('半導体') || lower.includes('semiconductor')) themeTags.push('半導体');
  if (lower.includes('dx') || lower.includes('デジタルトランスフォーメーション')) themeTags.push('DX');
  if (lower.includes('クラウド') || lower.includes('cloud')) themeTags.push('クラウド');
  if (lower.includes('防衛') || lower.includes('セキュリティ')) themeTags.push('セキュリティ');
  if (lower.includes('省人化') || lower.includes('自動化') || lower.includes('ロボ')) themeTags.push('省人化');
  if (lower.includes('フィンテック') || lower.includes('fintech') || lower.includes('決済')) themeTags.push('フィンテック');
  if (themeTags.length === 0) themeTags.push('未分類');

  // 成長型推定
  let growthType = '不明';
  if (lower.includes('saas') || lower.includes('arr')) growthType = 'SaaS型';
  else if (lower.includes('プラットフォーム')) growthType = 'プラットフォーム型';
  else if (lower.includes('m&a') || lower.includes('買収')) growthType = 'コンソリデーション型';
  else if (lower.includes('独占') || lower.includes('シェア')) growthType = 'ニッチ独占型';

  // スコア推定（キーワード出現頻度ベースの簡易版）
  const themeScore = Math.min(95, 50 + themeTags.length * 12);
  const growthScore = lower.includes('成長') || lower.includes('増収') ? 75 : 55;
  const capitalScore = lower.includes('自社株買い') ? 80 : lower.includes('増資') ? 30 : 55;
  const govScore = lower.includes('roe') || lower.includes('中期経営') ? 75 : 55;

  // テキストから最初の3文を根拠として抽出
  const sentences = text
    .split(/[。\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && s.length <= 120);
  const evidence = sentences.slice(0, 3);
  if (evidence.length === 0) evidence.push('IR文章から根拠を抽出できませんでした');

  // リスク
  const riskSentence = sentences.find((s) => s.includes('リスク') || s.includes('課題') || s.includes('懸念'));
  const risk = riskSentence || 'IR文章からリスク情報を特定できませんでした。個別確認が必要です。';

  return {
    themeTags,
    growthType,
    scores: { theme: themeScore, growth: growthScore, capital: capitalScore, governance: govScore },
    evidence,
    risk,
    clusterExplanation: `IR文章から推定。${themeTags.join('・')}関連の${growthType}として分類。`,
  };
}

export function AnalysisPanel({ isWatched, onToggleWatch, onOpenDetail }: AnalysisPanelProps) {
  const [ticker, setTicker] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [irText, setIrText] = useState('');
  const [price, setPrice] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Stock | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = () => {
    if (!ticker || !companyName || !irText || !price) {
      setError('全項目を入力してください');
      return;
    }

    setError('');
    setAnalyzing(true);

    // 擬似的な非同期処理（Phase2以降はClaude APIを使用）
    setTimeout(() => {
      try {
        const parsed = parseIRText(irText);
        const priceNum = Number(price);

        // 生の特徴量（Phase1: デフォルト値。Phase2以降はAPIから取得）
        const rawFeatures: RawFeatures = {
          vol_ratio: 1.5,
          ma25_dev: 0.03,
          breakout_ratio: 0.5,  // デフォルト値（Phase2以降はAPIから取得）
          volatility: 0.25,
          market_cap_billions: priceNum * 100 * 10000 / 100000000, // 概算
          yoy_sales_growth: irText.includes('増収') ? 0.25 : undefined,
          gross_margin: irText.includes('高粗利') || irText.includes('saas') ? 0.70 : undefined,
        };

        const stock = processStock(
          {
            ticker,
            name: companyName,
            market: '東証（推定）',
            price: priceNum,
            sbi_buyable_override: null,
            trade_status: null,
            regime_id: '2013_2021',
            theme_tags: parsed.themeTags,
            growth_type: parsed.growthType,
            scores: parsed.scores,
            evidence: parsed.evidence,
            risk: parsed.risk,
            cluster_explanation: parsed.clusterExplanation,
          },
          rawFeatures
        );

        setResult(stock);
      } catch {
        setError('分析中にエラーが発生しました。入力内容を確認してください。');
      } finally {
        setAnalyzing(false);
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="bg-kabulens-card border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-kabulens-accent" />
          <h2 className="text-lg font-bold text-white">銘柄分析</h2>
          <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">Phase 1</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          銘柄情報とIR文章を入力すると、構造分析を実行します。Phase2以降はAPIから自動取得＋Claude APIで解釈します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">銘柄コード</label>
            <input
              type="text"
              placeholder="例: 4755"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-kabulens-accent"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">会社名</label>
            <input
              type="text"
              placeholder="例: 楽天グループ"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-kabulens-accent"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">現在株価（円）</label>
            <input
              type="number"
              placeholder="例: 950"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-kabulens-accent"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-slate-400 block mb-1">
            IR文章 / 決算要旨 / 事業説明（貼り付け）
          </label>
          <textarea
            placeholder="IR資料、決算短信、事業説明文などをここに貼り付けてください..."
            value={irText}
            onChange={(e) => setIrText(e.target.value)}
            rows={6}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-kabulens-accent resize-y"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 mb-4">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 bg-kabulens-accent text-slate-900 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-kabulens-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              分析中...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              構造分析を実行
            </>
          )}
        </button>
      </div>

      {result && (
        <div>
          <h3 className="text-sm text-slate-400 mb-3">分析結果</h3>
          <StockCard
            stock={result}
            rank={0}
            isWatched={isWatched(result.ticker)}
            onToggleWatch={onToggleWatch}
            onOpenDetail={onOpenDetail}
          />
        </div>
      )}
    </div>
  );
}
