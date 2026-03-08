import type { ClusterId } from '../types/stock';

interface ClusterBadgeProps {
  clusterId: ClusterId;
}

const CLUSTER_CONFIG: Record<ClusterId, { label: string; className: string }> = {
  tenbagger: {
    label: 'テンバガー型',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  large_growth: {
    label: '大型成長型',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  event_spike: {
    label: 'イベント急騰型',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  noise: {
    label: 'ノイズ',
    className: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  },
};

export function ClusterBadge({ clusterId }: ClusterBadgeProps) {
  const config = CLUSTER_CONFIG[clusterId];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
