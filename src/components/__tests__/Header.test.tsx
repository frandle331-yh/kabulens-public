import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';
import type { TabId } from '../Header';

function renderHeader(overrides = {}) {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    activeTab: 'ranking' as TabId,
    onTabChange: vi.fn(),
    watchlistCount: 0,
    dataSource: 'json' as const,
    generatedAt: '2026-03-08T00:00:00.000Z',
    stockCount: 3761,
  };
  const props = { ...defaultProps, ...overrides };
  return { ...render(<Header {...props} />), props };
}

describe('Header', () => {
  it('renders app title KABULENS', () => {
    renderHeader();
    expect(screen.getByText('KABU')).toBeInTheDocument();
    expect(screen.getByText('LENS')).toBeInTheDocument();
  });

  it('renders all 6 tab buttons', () => {
    renderHeader();
    expect(screen.getByText('ランキング')).toBeInTheDocument();
    expect(screen.getByText('ウォッチ')).toBeInTheDocument();
    expect(screen.getByText('銘柄分析')).toBeInTheDocument();
    expect(screen.getByText('比較')).toBeInTheDocument();
    expect(screen.getByText('統計')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('calls onTabChange when tab is clicked', () => {
    const { props } = renderHeader();
    fireEvent.click(screen.getByText('統計'));
    expect(props.onTabChange).toHaveBeenCalledWith('insights');
  });

  it('calls onSearchChange when search input changes', () => {
    const { props } = renderHeader();
    const input = screen.getByPlaceholderText('銘柄名・コード・テーマ...');
    fireEvent.change(input, { target: { value: 'AI' } });
    expect(props.onSearchChange).toHaveBeenCalledWith('AI');
  });

  it('shows watchlist count badge when > 0', () => {
    renderHeader({ watchlistCount: 5 });
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides watchlist count badge when 0', () => {
    renderHeader({ watchlistCount: 0 });
    // Should not show "0" badge
    const badge = screen.queryByText('0');
    expect(badge).not.toBeInTheDocument();
  });

  it('shows stock count and date for json data source', () => {
    renderHeader({ dataSource: 'json', generatedAt: '2026-03-08T00:00:00.000Z', stockCount: 3761 });
    expect(screen.getByText(/3761銘柄/)).toBeInTheDocument();
  });

  it('hides stock count and date for static data source', () => {
    renderHeader({ dataSource: 'static', stockCount: 45 });
    expect(screen.queryByText(/45銘柄/)).not.toBeInTheDocument();
  });

  it('hides stock count and date when generatedAt is null', () => {
    renderHeader({ dataSource: 'json', generatedAt: null, stockCount: 3761 });
    expect(screen.queryByText(/3761銘柄/)).not.toBeInTheDocument();
  });
});
