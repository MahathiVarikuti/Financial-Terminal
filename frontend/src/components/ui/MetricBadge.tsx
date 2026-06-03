interface MetricBadgeProps {
  label: string
  value: string | number | null | undefined
  trend?: 'up' | 'down' | 'neutral'
  unit?: string
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const trendColors = {
  up:      'text-cyan-400',
  down:    'text-rose-500',
  neutral: 'text-amber-500',
}

const trendIcons = {
  up:      '▲',
  down:    '▼',
  neutral: '●',
}

export function MetricBadge({ label, value, trend, unit, loading, size = 'md' }: MetricBadgeProps) {
  const valueSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
  const labelSize = size === 'lg' ? 'text-sm'  : 'text-xs'

  return (
    <div className="terminal-card p-4 flex flex-col gap-1">
      <span className={`${labelSize} text-cyan-600 font-bold uppercase tracking-wider`}>[{label}]</span>
      {loading ? (
        <div className={`skeleton h-8 w-24 mt-1`} />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className={`${valueSize} font-semibold number-font ${trend ? trendColors[trend] : 'text-slate-100'}`}>
            {value ?? '—'}
          </span>
          {unit && <span className="text-xs text-slate-500">{unit}</span>}
          {trend && (
            <span className={`text-xs ${trendColors[trend]} ml-auto`}>{trendIcons[trend]}</span>
          )}
        </div>
      )}
    </div>
  )
}
