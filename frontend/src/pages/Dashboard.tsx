import { motion } from 'framer-motion'
import { Activity, Cpu, PieChart, TrendingUp } from 'lucide-react'
import { ServiceCard } from '../components/ServiceCard'
import { MetricBadge } from '../components/ui/MetricBadge'
import { useMarketData } from '../hooks/useMarketData'

const SERVICES = [
  {
    title:     'Baseline Economics',
    icon:      <Activity size={24} />,
    href:      '/economics',
    categoryText:  'Capital Budgeting',
    categoryColor: 'cyan' as const,
    description: 'Calculates the true time-value-adjusted worth of your investment using live discount rates. Generates Written Down Value (WDV) block depreciation schedules (Income Tax Act) and finds exact break-even.',
  },
  {
    title:     'Monte Carlo Simulator',
    icon:      <PieChart size={24} />,
    href:      '/monte-carlo',
    categoryText:  'Risk Analysis',
    categoryColor: 'blue' as const,
    description: 'Runs up to 100,000 probabilistic NPV simulations to quantify project risk. Shows the full distribution of possible outcomes and calculates Value at Risk at 95% confidence.',
  },
  {
    title:     'Asset Replacement Optimizer',
    icon:      <TrendingUp size={24} />,
    href:      '/optimizer',
    categoryText:  'AI Optimization',
    categoryColor: 'cyan' as const,
    description: 'Uses polynomial regression to model non-linear O&M cost escalation, then finds the ownership horizon that minimises your Equivalent Uniform Annual Cost (EUAC).',
  },
  {
    title:     'Capital Allocator',
    icon:      <Cpu size={24} />,
    href:      '/capital',
    categoryText:  'Portfolio Optimization',
    categoryColor: 'amber' as const,
    description: 'Algorithmically selects the combination of projects that maximises total NPV within your fixed capital budget using dynamic programming — the 0/1 Knapsack problem solved exactly.',
  },
]

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

export default function Dashboard() {
  const { macroRates, macroLoading } = useMarketData()

  const fmt = (v: number | null | undefined, decimals = 2) =>
    (v !== undefined && v !== null) ? Number(v).toFixed(decimals) : undefined

  return (
    <div className="space-y-10 py-6">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 pt-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-cyan-500/30 bg-cyan-900/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">
          Financial Intelligence Engine
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-100 leading-tight tracking-tight">
          Fin<span className="text-cyan-500">Terminal</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          Engineering economics meets probabilistic forecasting. Tailored for Indian enterprise workflows.
        </p>
      </motion.div>

      {/* ── Live Macro Bar ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <MetricBadge label="RBI Repo Rate"   value={fmt(macroRates?.repo_rate)}    unit="%" trend="neutral" loading={macroLoading} />
        <MetricBadge label="USD / INR"       value={fmt(macroRates?.usd_inr)}      unit="₹" trend="neutral" loading={macroLoading} />
        <MetricBadge label="India CPI"       value={fmt(macroRates?.cpi_level, 1)} unit="idx" trend="up"    loading={macroLoading} />
        <MetricBadge label="NIFTY 50"        value={fmt(macroRates?.nifty_50, 0)}  trend="neutral" loading={macroLoading} />
      </motion.div>
      {macroRates && (
        <p className="text-xs text-slate-600 text-center -mt-6">
          Live data from FRED API · Last updated: {macroRates.last_updated}
        </p>
      )}

      {/* ── Service Cards Grid ────────────────────────────────── */}
      <div>
        <h2 className="text-sm text-slate-500 uppercase tracking-widest font-medium mb-6">Available Tools</h2>
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.href} {...s} delay={i * 0.1} />
          ))}
        </motion.div>
      </div>

      {/* ── Tech stack footnote ───────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="text-center pt-4 border-t border-cyan-900/30">
        <p className="text-xs text-slate-600 font-mono tracking-widest">
          REACT · FASTAPI · AWS LAMBDA · NUMPY
        </p>
      </motion.div>
    </div>
  )
}
