import { AlertTriangle } from 'lucide-react';
import type { DataQuality } from '../types/stock';

interface DataQualityBadgeProps {
  quality: DataQuality;
  missingFields: string[];
}

const QUALITY_CONFIG: Record<DataQuality, { label: string; className: string }> = {
  A: { label: 'A', className: 'bg-green-500/20 text-green-400' },
  B: { label: 'B', className: 'bg-yellow-500/20 text-yellow-400' },
  C: { label: 'C', className: 'bg-red-500/20 text-red-400' },
};

export function DataQualityBadge({ quality, missingFields }: DataQualityBadgeProps) {
  const config = QUALITY_CONFIG[quality];

  return (
    <div className="flex items-center gap-1">
      <span className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold ${config.className}`}>
        {config.label}
      </span>
      {quality === 'C' && <AlertTriangle className="w-3 h-3 text-red-400" />}
      {missingFields.length > 0 && (
        <span className="text-xs text-slate-500" title={`欠損: ${missingFields.join(', ')}`}>
          ({missingFields.length}項目補完)
        </span>
      )}
    </div>
  );
}
