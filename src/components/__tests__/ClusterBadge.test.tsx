import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClusterBadge } from '../ClusterBadge';
import type { ClusterId } from '../../types/stock';

describe('ClusterBadge', () => {
  const cases: { clusterId: ClusterId; label: string }[] = [
    { clusterId: 'tenbagger', label: 'テンバガー型' },
    { clusterId: 'large_growth', label: '大型成長型' },
    { clusterId: 'event_spike', label: 'イベント急騰型' },
    { clusterId: 'noise', label: 'ノイズ' },
  ];

  cases.forEach(({ clusterId, label }) => {
    it(`renders "${label}" for clusterId="${clusterId}"`, () => {
      render(<ClusterBadge clusterId={clusterId} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
});
