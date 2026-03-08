import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryStats } from '../SummaryStats';
import { createMockStock } from '../../test/fixtures';

describe('SummaryStats', () => {
  it('renders nothing for empty stocks', () => {
    const { container } = render(<SummaryStats stocks={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays tenbagger count', () => {
    const stocks = [
      createMockStock({ ticker: '1001', derived: { tenbagger_probability: 80, cluster_id: 'tenbagger', cluster_explanation: '' } }),
      createMockStock({ ticker: '1002', derived: { tenbagger_probability: 60, cluster_id: 'large_growth', cluster_explanation: '' } }),
      createMockStock({ ticker: '1003', derived: { tenbagger_probability: 70, cluster_id: 'tenbagger', cluster_explanation: '' } }),
    ];
    render(<SummaryStats stocks={stocks} />);
    // 2 tenbagger stocks out of 3
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('/ 3銘柄')).toBeInTheDocument();
  });

  it('displays average probability', () => {
    const stocks = [
      createMockStock({ ticker: '1001', derived: { tenbagger_probability: 90, cluster_id: 'tenbagger', cluster_explanation: '' } }),
      createMockStock({ ticker: '1002', derived: { tenbagger_probability: 60, cluster_id: 'large_growth', cluster_explanation: '' } }),
    ];
    render(<SummaryStats stocks={stocks} />);
    // Average: (90+60)/2 = 75
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('displays top stock name', () => {
    const stocks = [
      createMockStock({ ticker: '3993', name: 'PKSHA Technology', derived: { tenbagger_probability: 80, cluster_id: 'tenbagger', cluster_explanation: '' } }),
      createMockStock({ ticker: '6920', name: 'レーザーテック', derived: { tenbagger_probability: 60, cluster_id: 'large_growth', cluster_explanation: '' } }),
    ];
    render(<SummaryStats stocks={stocks} />);
    expect(screen.getByText('PKSHA Technology')).toBeInTheDocument();
  });

  it('displays count of stocks under 50000 yen', () => {
    const stocks = [
      createMockStock({ ticker: '1001', minUnit: 30000, derived: { tenbagger_probability: 80, cluster_id: 'tenbagger', cluster_explanation: '' } }),
      createMockStock({ ticker: '1002', minUnit: 80000, derived: { tenbagger_probability: 60, cluster_id: 'large_growth', cluster_explanation: '' } }),
      createMockStock({ ticker: '1003', minUnit: 45000, derived: { tenbagger_probability: 70, cluster_id: 'tenbagger', cluster_explanation: '' } }),
    ];
    const { container } = render(<SummaryStats stocks={stocks} />);
    // 2 stocks under 50000 — verify via the "5万円以下" card
    const cards = container.querySelectorAll('.bg-kabulens-card');
    const under5manCard = Array.from(cards).find((card) => card.textContent?.includes('5万円以下'));
    expect(under5manCard).toBeDefined();
    const countSpan = under5manCard!.querySelector('.text-xl');
    expect(countSpan?.textContent).toBe('2');
  });
});
