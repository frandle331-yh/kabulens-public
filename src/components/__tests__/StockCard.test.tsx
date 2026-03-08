import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StockCard } from '../StockCard';
import { createMockStock } from '../../test/fixtures';

// Mock RadarChart (uses recharts internally)
vi.mock('../RadarChart', () => ({
  RadarChart: () => <div data-testid="radar-chart" />,
}));

// Mock isCuratedStock to control auto badge rendering
vi.mock('../../hooks/useStocks', () => ({
  isCuratedStock: (ticker: string) => ticker === '3993', // 3993 = curated, others = auto
}));

function renderStockCard(overrides = {}) {
  const stock = createMockStock({
    ticker: '3993',
    name: 'PKSHA Technology',
    price: 2500,
    minUnit: 250000,
    theme_tags: ['AI', 'SaaS'],
    growth_type: 'SaaS型',
    scores: { theme: 85, growth: 80, capital: 65, governance: 70, momentum: 60 },
    derived: { tenbagger_probability: 72, cluster_id: 'tenbagger', cluster_explanation: 'テンバガー構造' },
  });

  const defaultProps = {
    stock,
    rank: 1,
    isWatched: false,
    onToggleWatch: vi.fn(),
    onOpenDetail: vi.fn(),
  };

  const props = { ...defaultProps, ...overrides };
  return { ...render(<StockCard {...props} />), props };
}

describe('StockCard', () => {
  it('renders stock name and ticker', () => {
    renderStockCard();
    expect(screen.getByText('PKSHA Technology')).toBeInTheDocument();
    expect(screen.getByText('3993')).toBeInTheDocument();
  });

  it('renders rank number', () => {
    renderStockCard();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders tenbagger probability', () => {
    renderStockCard();
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  it('renders theme tags', () => {
    renderStockCard();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('SaaS')).toBeInTheDocument();
  });

  it('calls onOpenDetail when card is clicked', () => {
    const { props } = renderStockCard();
    const card = screen.getByText('PKSHA Technology').closest('[class*="cursor-pointer"]')!;
    fireEvent.click(card);
    expect(props.onOpenDetail).toHaveBeenCalledWith(props.stock);
  });

  it('calls onToggleWatch when watch button is clicked', () => {
    const { props } = renderStockCard();
    const watchButton = screen.getByTitle('ウォッチリストに追加');
    fireEvent.click(watchButton);
    expect(props.onToggleWatch).toHaveBeenCalledWith('3993');
    // Should NOT trigger onOpenDetail (stopPropagation)
    expect(props.onOpenDetail).not.toHaveBeenCalled();
  });

  it('shows watched state when isWatched=true', () => {
    renderStockCard({ isWatched: true });
    expect(screen.getByTitle('ウォッチリストから削除')).toBeInTheDocument();
  });

  it('expands details when expand button is clicked', () => {
    renderStockCard();
    const expandButton = screen.getByText('詳細を表示');
    fireEvent.click(expandButton);
    expect(screen.getByText('根拠')).toBeInTheDocument();
    expect(screen.getByText('リスク')).toBeInTheDocument();
    expect(screen.getByText('クラスター分析')).toBeInTheDocument();
  });

  it('hides auto badge for curated stock (ticker=3993)', () => {
    renderStockCard(); // ticker='3993' → isCuratedStock returns true
    expect(screen.queryByText('auto')).not.toBeInTheDocument();
  });

  it('shows auto badge for non-curated stock', () => {
    const stock = createMockStock({
      ticker: '9999',
      name: 'Non-Curated Corp',
    });
    render(
      <StockCard
        stock={stock}
        rank={1}
        isWatched={false}
        onToggleWatch={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    );
    expect(screen.getByText('auto')).toBeInTheDocument();
  });

  it('hides rank badge when rank=0', () => {
    const { container } = renderStockCard({ rank: 0 });
    // rank=0 means no rank badge rendered
    const rankBadge = container.querySelector('.bg-kabulens-accent');
    expect(rankBadge).toBeNull();
  });
});
