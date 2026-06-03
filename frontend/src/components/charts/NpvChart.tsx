import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { CHART_COLORS, formatINR, formatNumIN } from '../../lib/constants'

interface CashFlowRow { year: number; cash_flow: number; pv: number; cumulative_pv: number }
interface NpvChartProps {
  data: CashFlowRow[]
  initialInvestment: number
  npv: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="terminal-card p-3 text-xs space-y-1 border-cyan-500/30">
      <p className="text-cyan-400 font-bold mb-2 font-mono">Year {label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  )
}

export function NpvChart({ data, initialInvestment, npv }: NpvChartProps) {
  const isViable = npv > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`px-4 py-2 border text-sm font-bold tracking-widest uppercase number-font
          ${isViable
            ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400'
            : 'bg-rose-900/30 border-rose-500/50 text-rose-500'}`}>
          NPV: {formatINR(npv)}
        </div>
        <span className={`text-xs font-mono uppercase tracking-widest ${isViable ? 'text-emerald-400' : 'text-rose-500'}`}>
          {isViable ? '✓ Viable' : '✗ Destroys Value'}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={CHART_COLORS.cyan} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={CHART_COLORS.blue} stopOpacity={0.2} />
              <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${formatNumIN(v/100000)}L`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', textTransform: 'uppercase' }} />
          <ReferenceLine y={0} stroke={CHART_COLORS.cyan} strokeDasharray="4 4" opacity={0.5} />
          <Area type="linear" dataKey="cumulative_pv" name="Cumulative PV" stroke={CHART_COLORS.cyan} fill="url(#pvGrad)" strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.cyan }} />
          <Area type="linear" dataKey="pv" name="Annual PV" stroke={CHART_COLORS.blue} fill="url(#cfGrad)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
