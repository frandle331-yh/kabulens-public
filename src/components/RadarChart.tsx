import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { Scores } from '../types/stock';

interface RadarChartProps {
  scores: Scores;
}

const AXIS_LABELS: Record<keyof Scores, string> = {
  theme: 'テーマ',
  growth: '成長',
  capital: '資本政策',
  governance: '経営',
  momentum: '需給',
};

export function RadarChart({ scores }: RadarChartProps) {
  const data = (Object.keys(AXIS_LABELS) as (keyof Scores)[]).map((key) => ({
    axis: AXIS_LABELS[key],
    value: scores[key],
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={false}
          axisLine={false}
        />
        <Radar
          dataKey="value"
          stroke="#38bdf8"
          fill="#38bdf8"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
