import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS, formatINR, formatNumIN } from '../../lib/constants'

interface Project { name: string; cost: number; npv: number; risk: string }
interface Props {
  selected: Project[]
  excluded: Project[]
  budget: number
  totalNpv: number
  totalCost: number
}

const PALETTE = ['#7c3aed', '#a78bfa', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="terminal-card p-3 text-xs space-y-1 border-cyan-500/30">
      <p className="text-cyan-400 font-bold mb-1 font-mono">[{label}]</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  )
}

export function AllocationChart({ selected, excluded, budget, totalNpv, totalCost }: Props) {
  const allProjects = [
    ...selected.map((p, i) => ({ ...p, selected: true,  color: PALETTE[i % PALETTE.length] })),
    ...excluded.map((p)    => ({ ...p, selected: false, color: CHART_COLORS.muted })),
  ]

  const utilPct = budget > 0 ? (totalCost / budget) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Budget utilisation bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>Budget Utilisation</span>
          <span className="number-font text-cyan-300 font-bold">{utilPct.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-slate-900 border border-cyan-900/50 rounded-none overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-700"
            style={{ width: `${Math.min(utilPct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-mono">
          <span>{formatINR(totalCost)} used</span>
          <span>{formatINR(budget)} total</span>
        </div>
      </div>

      {/* Bar chart: cost vs NPV per project */}
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={allProjects} margin={{ top: 5, right: 10, left: 10, bottom: 40 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} angle={-30} textAnchor="end" />
          <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${formatNumIN(v/100000)}L`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', paddingTop: '8px', textTransform: 'uppercase' }} />
          <Bar dataKey="cost" name="Cost" radius={[0,0,0,0]}>
            {allProjects.map((p, i) => (
              <Cell key={i} fill={p.selected ? p.color : CHART_COLORS.muted} fillOpacity={p.selected ? 0.9 : 0.35} />
            ))}
          </Bar>
          <Bar dataKey="npv" name="NPV" radius={[0,0,0,0]}>
            {allProjects.map((p, i) => (
              <Cell key={i} fill={p.npv >= 0 ? CHART_COLORS.green : CHART_COLORS.red} fillOpacity={p.selected ? 0.85 : 0.3} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
