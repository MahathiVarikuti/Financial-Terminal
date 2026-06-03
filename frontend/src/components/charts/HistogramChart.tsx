import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer } from 'recharts'
import { CHART_COLORS, formatINR, formatNumIN } from '../../lib/constants'

interface Props {
  counts: number[]
  bin_edges: number[]
  percentiles?: { p10: number; p50: number; p90: number }
  var_95?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="terminal-card p-3 text-xs space-y-1 border-cyan-500/30">
      <p className="text-slate-300">NPV Range: <span className="number-font font-bold text-cyan-400">{formatINR(d.midpoint)}</span></p>
      <p className="text-slate-400 font-mono">Count: <span className="number-font text-white">{d.count}</span></p>
      <p className="text-slate-400 font-mono">Share: <span className="number-font text-white">{d.pct?.toFixed(1)}%</span></p>
    </div>
  )
}

export function HistogramChart({ counts, bin_edges, percentiles, var_95 }: Props) {
  const total = counts.reduce((a, b) => a + b, 0)

  const data = counts.map((count, i) => ({
    midpoint: (bin_edges[i] + bin_edges[i + 1]) / 2,
    count,
    pct: (count / total) * 100,
  }))

  return (
    <div className="space-y-3">
      <p className="text-xs text-cyan-600 font-bold uppercase tracking-wider mb-2 border-b border-cyan-500/20 pb-1">NPV Probability Distribution</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }} barCategoryGap="2%">
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="midpoint"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${formatNumIN(v / 100000)}L`}
          />
          <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }} />

          {/* P10, P50, P90 vertical reference lines */}
          {percentiles && (
            <>
              <ReferenceLine x={percentiles.p10} stroke={CHART_COLORS.red}    strokeDasharray="4 3" label={{ value: 'P10', position: 'top', fill: CHART_COLORS.red,    fontSize: 10 }} />
              <ReferenceLine x={percentiles.p50} stroke={CHART_COLORS.amber}  strokeDasharray="4 3" label={{ value: 'P50', position: 'top', fill: CHART_COLORS.amber,  fontSize: 10 }} />
              <ReferenceLine x={percentiles.p90} stroke={CHART_COLORS.green}  strokeDasharray="4 3" label={{ value: 'P90', position: 'top', fill: CHART_COLORS.green,  fontSize: 10 }} />
            </>
          )}
          {var_95 !== undefined && (
            <ReferenceLine x={var_95} stroke={CHART_COLORS.red} strokeWidth={2}
              label={{ value: 'VaR 95%', position: 'insideTopLeft', fill: CHART_COLORS.red, fontSize: 10 }} />
          )}

          <Bar dataKey="count" isAnimationActive radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.midpoint >= 0 ? CHART_COLORS.green : CHART_COLORS.red} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
