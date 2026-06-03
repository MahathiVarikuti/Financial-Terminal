import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, PieChart, Plus, Trash2 } from 'lucide-react'
import { TerminalCard } from '../components/ui/TerminalCard'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/InputField'
import { MetricBadge } from '../components/ui/MetricBadge'
import { HistogramChart } from '../components/charts/HistogramChart'
import { useMonteCarloStream } from '../hooks/useMonteCarloStream'
import { useMarketData } from '../hooks/useMarketData'
import { MC_ITERATION_OPTIONS, formatINR, formatNumIN } from '../lib/constants'

interface CashFlowRow { mean: string; std: string }

const fmt = (v: number | undefined) => formatINR(v, 0)

export default function MonteCarlo() {
  const { macroRates } = useMarketData()
  const { result, isRunning, statusMsg, error, runSimulation, cancel } = useMonteCarloStream()

  const [investment, setInvestment]   = useState('500000')
  const [marr, setMarr]               = useState('')
  const [iterations, setIterations]   = useState(50000)
  const [rows, setRows]               = useState<CashFlowRow[]>([
    { mean: '120000', std: '20000' },
    { mean: '150000', std: '25000' },
    { mean: '180000', std: '30000' },
    { mean: '200000', std: '35000' },
    { mean: '220000', std: '40000' },
  ])

  const effectiveMarr = marr || (macroRates?.repo_rate ? (macroRates.repo_rate / 100).toFixed(4) : '0.065')

  const handleRun = () => {
    runSimulation({
      initial_investment: parseFloat(investment),
      cash_flows: rows.map(r => ({ mean: parseFloat(r.mean), std: parseFloat(r.std) })),
      marr: parseFloat(effectiveMarr),
      iterations,
    })
  }

  const updateRow = (i: number, field: keyof CashFlowRow, val: string) => {
    const updated = [...rows]; updated[i] = { ...updated[i], [field]: val }; setRows(updated)
  }

  const pct = result?.percentiles
  const stats = result?.stats

  return (
    <div className="space-y-6 py-4">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 border border-cyan-500/50 bg-cyan-900/30 flex items-center justify-center">
            <span className="text-cyan-400 font-bold"><PieChart size={20} /></span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">Monte Carlo Risk Analysis</h1>
            <p className="text-sm text-cyan-600 font-mono">Probabilistic NPV · Value at Risk · P10/P50/P90</p>
          </div>
        </div>
      </motion.div>

      <TerminalCard>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Simulation Parameters</h2>
        {macroRates && (
          <p className="text-xs text-slate-500 mb-4">
            Note: MARR pre-filled from live RBI Repo Rate: <span className="text-cyan-400 font-bold">{macroRates.repo_rate?.toFixed(2) ?? 'N/A'}%</span>
          </p>
        )}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <InputField id="mc-inv" label="Initial Investment" value={investment} onChange={setInvestment} type="number" prefix="₹" required />
          <InputField id="mc-marr" label="Cost of Capital / Discount Rate" value={effectiveMarr} onChange={setMarr} type="number" suffix="%" step={0.001} helper="Auto-filled from RBI Repo Rate" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Iterations</label>
            <div className="flex gap-2">
              {MC_ITERATION_OPTIONS.map(opt => (
                <button key={opt} onClick={() => setIterations(opt)}
                  className={`flex-1 py-2 rounded-none text-xs font-bold uppercase tracking-widest transition-all border
                    ${iterations === opt ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500/50' : 'border-transparent text-slate-500 hover:text-cyan-400'}`}>
                  {opt >= 1000 ? `${opt/1000}K` : opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cash flow rows */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-300">Annual Cash Flows (Probabilistic)</p>
            <Button variant="ghost" size="sm" onClick={() => setRows([...rows, { mean: '0', std: '0' }])}>
              <Plus size={14}/> Add Year
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 px-1 font-mono uppercase tracking-widest">
            <span>Year</span><span>Expected (Mean ₹)</span><span>Uncertainty (Std Dev ₹)</span>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm text-slate-400 pl-1 font-mono">Year {i+1}</span>
              <InputField id={`mean-${i}`} label="" value={row.mean} onChange={(v)=>updateRow(i,'mean',v)} type="number" prefix="₹" />
              <div className="flex gap-1 items-center">
                <InputField id={`std-${i}`} label="" value={row.std} onChange={(v)=>updateRow(i,'std',v)} type="number" prefix="±₹" />
                {rows.length > 1 && (
                  <button onClick={() => setRows(rows.filter((_,j)=>j!==i))} className="text-slate-600 hover:text-rose-400 p-1 flex-shrink-0 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <Button onClick={handleRun} loading={isRunning} fullWidth disabled={isRunning}>
            {isRunning ? 'Running Simulation...' : `Run ${(iterations/1000).toFixed(0)}K Simulations`}
          </Button>
          {isRunning && <Button variant="danger" onClick={cancel}>Cancel</Button>}
        </div>
      </TerminalCard>

      {/* Status banner */}
      <AnimatePresence>
        {(isRunning || statusMsg) && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            className={`terminal-card px-4 py-3 flex items-center gap-3 border ${isRunning ? 'border-cyan-500/30' : 'border-emerald-500/30'}`}>
            {isRunning && <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute h-full w-full bg-cyan-400 opacity-75"/>
              <span className="relative h-2 w-2 bg-cyan-500"/>
            </span>}
            <p className="text-sm text-cyan-400 font-mono">[{statusMsg}]</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="terminal-card p-4 border-rose-500/50">
          <p className="text-sm text-rose-400 font-mono">Error: {error}</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result?.status === 'complete' && pct && stats && (
          <motion.div key="mc-results" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricBadge label="Median NPV (P50)" value={fmt(pct.p50)} trend={pct.p50 >= 0 ? 'up' : 'down'} size="lg" />
              <MetricBadge label="Prob. Positive NPV" value={`${(stats.prob_positive * 100).toFixed(1)}`} unit="%" trend={stats.prob_positive > 0.5 ? 'up' : 'down'} size="lg" />
              <MetricBadge label="P90 Upside" value={fmt(pct.p90)} trend="up" />
              <MetricBadge label="VaR (95%)" value={fmt(stats.var_95)} trend="down" />
            </div>

            <TerminalCard animate={false}>
              <HistogramChart
                counts={result.histogram!.counts}
                bin_edges={result.histogram!.bin_edges}
                percentiles={{ p10: pct.p10, p50: pct.p50, p90: pct.p90 }}
                var_95={stats.var_95}
              />
            </TerminalCard>

            {/* Percentile table */}
            <TerminalCard animate={false}>
              <p className="text-xs text-cyan-600 font-bold uppercase tracking-wider mb-3">Full Percentile Distribution — {result.iterations?.toLocaleString()} trials</p>
              <div className="grid grid-cols-7 gap-2 text-center">
                {(['p5','p10','p25','p50','p75','p90','p95'] as const).map(k => (
                  <div key={k} className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase font-mono">[{k}]</p>
                    <p className={`text-sm font-semibold number-font ${pct[k] >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {formatNumIN(pct[k]/100000)}L
                    </p>
                  </div>
                ))}
              </div>
            </TerminalCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
