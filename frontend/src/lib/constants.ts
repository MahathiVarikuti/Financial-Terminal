export const CHART_COLORS = {
  cyan:   '#06b6d4',
  blue:   '#3b82f6',
  green:  '#10b981',
  red:    '#f43f5e',
  amber:  '#f59e0b',
  muted:  '#334155',
  grid:   'rgba(6,182,212,0.1)',
}

export const WDV_OPTIONS = [
  { value: 'wdv_10',       label: 'Plant & Mach. (10%)' },
  { value: 'wdv_15',       label: 'Plant & Mach. (15%)' },
  { value: 'wdv_40',       label: 'Computers/EVs (40%)' },
  { value: 'wdv_10_bldg',  label: 'Buildings (10%)'     },
  { value: 'straight_line',label: 'Straight-Line (Cos. Act)' },
]

export const RISK_LEVELS = [
  { value: 'low',    label: 'Low',    color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high',   label: 'High',   color: '#f43f5e' },
]

export const MC_ITERATION_OPTIONS = [10000, 25000, 50000, 100000]

// Indian currency formatter (Lakhs and Crores)
export const formatINR = (value: number | undefined, maxFractions = 0) => {
  if (value === undefined || isNaN(value)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: maxFractions,
    minimumFractionDigits: 0
  }).format(value)
}

// Format number only with en-IN
export const formatNumIN = (value: number | undefined, maxFractions = 0) => {
  if (value === undefined || isNaN(value)) return '—'
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: maxFractions,
  }).format(value)
}
