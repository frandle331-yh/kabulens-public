interface ScoreBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

const SCORE_COLORS: Record<string, string> = {
  theme: 'bg-purple-500',
  growth: 'bg-green-500',
  capital: 'bg-yellow-500',
  governance: 'bg-blue-500',
  momentum: 'bg-red-500',
};

export function ScoreBar({ label, value, maxValue = 100, color }: ScoreBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const barColor = color || SCORE_COLORS[label.toLowerCase()] || 'bg-kabulens-accent';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-20 text-right shrink-0">{label}</span>
      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-white w-8 text-right font-mono">{value}</span>
    </div>
  );
}
