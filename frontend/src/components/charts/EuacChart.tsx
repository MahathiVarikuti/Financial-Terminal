import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Legend, ResponsiveContainer, Dot,
} from 'recharts'
import { CHART_COLORS, formatINR, formatNumIN } from '../../lib/constants'

interface EuacRow { year: number; euac: number; cr_component: number; om_component: number }
interface Props { data: EuacRow[]; optimalYear: number }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="terminal-card p-3 text-xs space-y-1 border-cyan-500/30">
      <p className="text-cyan-400 font-bold mb-2 font-mono">[{label}]</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  )
}

// Custom dot that glows green at the optimal year
const OptimalDot = (props: any) => {
  const { cx, cy, payload, optimalYear } = props
  if (payload.year !== optimalYear) return <circle cx={cx} cy={cy} r={3} fill={CHART_COLORS.cyan} />
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={CHART_COLORS.cyan} fillOpacity={0.25} />
      <circle cx={cx} cy={cy} r={5} fill={CHART_COLORS.green} />
    </g>
  )
}

export function EuacChart({ data, optimalYear }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-cyan-600 font-bold uppercase tracking-wider mb-2 border-b border-cyan-500/20 pb-1">EUAC per Ownership Year</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${formatNumIN(v/100000)}L`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', textTransform: 'uppercase' }} />
          <ReferenceLine
            x={optimalYear}
            stroke={CHART_COLORS.cyan}
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{ value: `[Replace Year ${optimalYear}]`, position: 'insideTopRight', fill: CHART_COLORS.cyan, fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }}
          />
          <Line type="linear" dataKey="euac" name="Total EUAC" stroke={CHART_COLORS.cyan} strokeWidth={2.5}
            dot={(props) => <OptimalDot {...props} optimalYear={optimalYear} />} activeDot={{ r: 5 }} />
          <Line type="linear" dataKey="cr_component" name="Capital Recovery" stroke={CHART_COLORS.blue} strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
          <Line type="linear" dataKey="om_component" name="O&M (annualised)" stroke={CHART_COLORS.amber} strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
