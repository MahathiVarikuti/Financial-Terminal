import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { CHART_COLORS, formatINR, formatNumIN } from '../../lib/constants'

interface DeprRow { year: number; depreciation: number; book_value: number; accumulated: number }
interface Props { data: DeprRow[]; method: string }

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

export function DepreciationChart({ data, method }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-cyan-600 font-bold uppercase tracking-wider mb-2 border-b border-cyan-500/20 pb-1">Depreciation Schedule — {method.replace(/_/g,' ').toUpperCase()}</p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${formatNumIN(v/100000)}L`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', textTransform: 'uppercase' }} />
          <Bar dataKey="depreciation" name="Annual Depr." fill={CHART_COLORS.cyan} fillOpacity={0.85} radius={[0,0,0,0]} />
          <Line type="linear" dataKey="book_value" name="Written Down Value" stroke={CHART_COLORS.blue} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.blue }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
