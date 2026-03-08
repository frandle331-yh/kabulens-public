import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBar } from '../ScoreBar';

describe('ScoreBar', () => {
  it('renders label and value', () => {
    render(<ScoreBar label="Theme" value={85} />);
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('calculates percentage width correctly', () => {
    const { container } = render(<ScoreBar label="Growth" value={60} maxValue={100} />);
    const bar = container.querySelector('[style]');
    expect(bar).toHaveStyle({ width: '60%' });
  });

  it('clamps percentage to 100%', () => {
    const { container } = render(<ScoreBar label="Test" value={120} maxValue={100} />);
    const bar = container.querySelector('[style]');
    expect(bar).toHaveStyle({ width: '100%' });
  });

  it('uses default maxValue of 100', () => {
    const { container } = render(<ScoreBar label="Test" value={50} />);
    const bar = container.querySelector('[style]');
    expect(bar).toHaveStyle({ width: '50%' });
  });
});
