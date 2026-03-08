import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import type { Stock, ClusterId } from '../types/stock';

interface InsightsViewProps {
  stocks: Stock[];
}

const CLUSTER_COLORS: Record<ClusterId, string> = {
  tenbagger: '#4ade80',
  large_growth: '#38bdf8',
  event_spike: '#fbbf24',
  noise: '#64748b',
};

const CLUSTER_LABELS: Record<ClusterId, string> = {
  tenbagger: 'テンバガー型',
  large_growth: '大型成長型',
  event_spike: 'イベント急騰型',
  noise: 'ノイズ',
};

export function InsightsView({ stocks }: InsightsViewProps) {
  // Cluster distribution
  const clusterCounts = stocks.reduce((acc, s) => {
    acc[s.derived.cluster_id] = (acc[s.derived.cluster_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(clusterCounts).map(([id, count]) => ({
    name: CLUSTER_LABELS[id as ClusterId] || id,
    value: count,
    color: CLUSTER_COLORS[id as ClusterId] || '#64748b',
  }));

  // Score distribution (tenbagger probability buckets)
  const buckets = [
    { range: '0-20', min: 0, max: 20 },
    { range: '21-40', min: 21, max: 40 },
    { range: '41-60', min: 41, max: 60 },
    { range: '61-80', min: 61, max: 80 },
    { range: '81-100', min: 81, max: 100 },
  ];
  const histData = buckets.map((b) => ({
    range: b.range,
    count: stocks.filter((s) => s.derived.tenbagger_probability >= b.min && s.derived.tenbagger_probability <= b.max).length,
  }));

  // Scatter: tenbagger prob vs minUnit
  const scatterData = stocks.map((s) => ({
    x: s.minUnit / 10000, // 万円
    y: s.derived.tenbagger_probability,
    z: s.scores.momentum,
    name: s.name,
    ticker: s.ticker,
  }));

  // Top 5 by each axis
  const topByAxis = (key: keyof Stock['scores']) =>
    [...stocks].sort((a, b) => b.scores[key] - a.scores[key]).slice(0, 5);

  const formatPrice = (v: number) => `${v}万`;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-kabulens-card border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white">{stocks.length}</div>
          <div className="text-xs text-slate-400 mt-1">総銘柄数</div>
        </div>
        <div className="bg-kabulens-card border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{clusterCounts['tenbagger'] || 0}</div>
          <div className="text-xs text-slate-400 mt-1">テンバガー型</div>
        </div>
        <div className="bg-kabulens-card border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-kabulens-accent">
            {Math.round(stocks.reduce((s, st) => s + st.derived.tenbagger_probability, 0) / stocks.length)}%
          </div>
          <div className="text-xs text-slate-400 mt-1">平均テンバガー適性</div>
        </div>
        <div className="bg-kabulens-card border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">
            {stocks.filter((s) => s.minUnit <= 100000).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">10万円以下</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cluster Pie */}
        <div className="bg-kabulens-card border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">クラスター分布</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                label={({ name, value }) => `${name} (${value})`}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tenbagger Probability Distribution */}
        <div className="bg-kabulens-card border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">テンバガー適性スコア分布</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={histData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} name="銘柄数" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scatter: Price vs Tenbagger */}
      <div className="bg-kabulens-card border border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-1">最低購入額 vs テンバガー適性</h3>
        <p className="text-xs text-slate-500 mb-3">左上ほど「安くて高適性」= 狙い目ゾーン</p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="x" type="number" name="最低購入額"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={formatPrice}
              label={{ value: '最低購入額（万円）', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              dataKey="y" type="number" name="テンバガー適性"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={[0, 100]}
              label={{ value: 'テンバガー適性（%）', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <ZAxis dataKey="z" range={[40, 400]} name="需給・勢い" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#e2e8f0', fontSize: 12 }}
              formatter={(value, name) => {
                if (value == null) return ['-', name ?? ''];
                if (name === '最低購入額') return [`${value}万円`, name];
                if (name === 'テンバガー適性') return [`${value}%`, name];
                return [String(value), name ?? ''];
              }}
              labelFormatter={(_, payload) => {
                const item = payload?.[0]?.payload;
                return item ? `${item.name} (${item.ticker})` : '';
              }}
            />
            <Scatter data={scatterData} fill="#38bdf8" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 by each axis */}
      <div className="bg-kabulens-card border border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-4">軸別トップ5</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {([
            ['theme', 'テーマ適合', 'text-purple-400'],
            ['growth', '成長の型', 'text-green-400'],
            ['capital', '資本政策', 'text-yellow-400'],
            ['governance', '経営一貫性', 'text-blue-400'],
            ['momentum', '需給・勢い', 'text-red-400'],
          ] as [keyof Stock['scores'], string, string][]).map(([key, label, color]) => (
            <div key={key}>
              <h4 className={`text-xs font-medium ${color} mb-2`}>{label}</h4>
              <ol className="space-y-1">
                {topByAxis(key).map((s, i) => (
                  <li key={s.ticker} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate">
                      <span className="text-slate-500 mr-1">{i + 1}.</span>
                      {s.name}
                    </span>
                    <span className="text-white font-mono ml-2">{s.scores[key]}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
