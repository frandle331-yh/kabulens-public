import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataQualityBadge } from '../DataQualityBadge';

describe('DataQualityBadge', () => {
  it('renders quality label A', () => {
    render(<DataQualityBadge quality="A" missingFields={[]} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders quality label B', () => {
    render(<DataQualityBadge quality="B" missingFields={['gross_margin']} />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders quality label C with warning icon', () => {
    const { container } = render(<DataQualityBadge quality="C" missingFields={['yoy_sales_growth']} />);
    expect(screen.getByText('C')).toBeInTheDocument();
    // AlertTriangle icon should be rendered for quality C
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows missing field count when fields are missing', () => {
    render(<DataQualityBadge quality="B" missingFields={['gross_margin', 'market_cap_billions']} />);
    expect(screen.getByText('(2項目補完)')).toBeInTheDocument();
  });

  it('hides missing field count when no fields missing', () => {
    render(<DataQualityBadge quality="A" missingFields={[]} />);
    expect(screen.queryByText(/項目補完/)).not.toBeInTheDocument();
  });
});
