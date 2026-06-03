import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Search, Plus, Trash2, TrendingUp } from 'lucide-react'
import { TerminalCard } from '../components/ui/TerminalCard'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/InputField'
import { MetricBadge } from '../components/ui/MetricBadge'
import { EuacChart } from '../components/charts/EuacChart'
import { optimizerApi } from '../lib/api'
import { useMarketData } from '../hooks/useMarketData'
import { formatINR } from '../lib/constants'

interface OMPoint { year: string; cost: string }

export default function Optimizer() {
  const { macroRates, assetData, assetLoading, assetError, lookupAsset } = useMarketData()

  const [ticker, setTicker]           = useState('')
  const [purchaseCost, setPurchaseCost] = useState('250000')
  const [baseOM, setBaseOM]           = useState('15000')
  const [omGrowth, setOmGrowth]       = useState('0.06')
  const [marr, setMarr]               = useState('')
  const [salvageRate, setSalvageRate] = useState('0.10')
  const [maxYears, setMaxYears]       = useState('15')
  const [omHistory, setOmHistory]     = useState<OMPoint[]>([])

  const [result, setResult]   = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string|null>(null)

  const effectiveMarr = marr || (macroRates?.repo_rate ? (macroRates.repo_rate / 100).toFixed(4) : '0.065')

  const handleTickerSearch = () => {
    if (ticker.trim()) lookupAsset(ticker.trim())
  }

  const handleRun = async () => {
    setLoading(true); setError(null)
    try {
      const payload: any = {
        purchase_cost:  parseFloat(purchaseCost),
        base_om_cost:   parseFloat(baseOM),
        om_growth_rate: parseFloat(omGrowth),
        marr:           parseFloat(effectiveMarr),
        salvage_rate:   parseFloat(salvageRate),
        max_years:      parseInt(maxYears),
      }
      if (ticker.trim()) payload.ticker = ticker.trim()
      if (omHistory.length >= 3) {
        payload.om_history = omHistory.map(h => ({ year: parseInt(h.year), cost: parseFloat(h.cost) }))
      }
      const res = await optimizerApi.optimize(payload)
      setResult(res.data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 py-4">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 border border-cyan-500/50 bg-cyan-900/30 flex items-center justify-center">
            <span className="text-cyan-400 font-bold"><TrendingUp size={20} /></span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">Asset Replacement Optimizer</h1>
            <p className="text-sm text-cyan-600 font-mono">EUAC Minimisation · AI O&M Modeling · yfinance Integration</p>
          </div>
        </div>
      </motion.div>

      {/* Ticker lookup */}
      <TerminalCard delay={0.1}>
        <p className="text-sm font-semibold text-slate-300 mb-3">Optional: Lookup Asset by Ticker</p>
        <div className="flex gap-3">
          <InputField id="ticker" label="" value={ticker} onChange={setTicker}
            placeholder="e.g. RELIANCE.NS, TATAMOTORS.NS" helper="Fetches live price via yfinance" />
          <div className="flex-shrink-0 mt-0.5">
            <Button onClick={handleTickerSearch} loading={assetLoading} variant="secondary">
              <Search size={14}/> Lookup
            </Button>
          </div>
        </div>
        {assetError && <p className="text-xs text-rose-400 mt-2">{assetError}</p>}
        {assetData && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricBadge label={assetData.name} value={`${assetData.currency} ${assetData.price?.toFixed(2)}`} trend={assetData.change_pct && assetData.change_pct >= 0 ? 'up' : 'down'} />
            <MetricBadge label="52W High" value={assetData.week52_high?.toFixed(2)} unit={assetData.currency} />
            <MetricBadge label="52W Low"  value={assetData.week52_low?.toFixed(2)}  unit={assetData.currency} />
            <MetricBadge label="Ann. Volatility" value={assetData.volatility_annual ? `${(assetData.volatility_annual*100).toFixed(1)}` : 'N/A'} unit="%" trend="neutral" />
          </motion.div>
        )}
      </TerminalCard>

      {/* Main inputs */}
      <TerminalCard delay={0.15}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Asset Parameters</h2>
        {macroRates && (
          <p className="text-xs text-slate-500 mb-4">
            Note: MARR pre-filled from live RBI Repo Rate: <span className="text-cyan-400 font-bold">{macroRates.repo_rate?.toFixed(2) ?? 'N/A'}%</span>
          </p>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField id="pc" label="Purchase Cost" value={purchaseCost} onChange={setPurchaseCost} type="number" prefix="₹"
            helper={assetData ? `Live price: ${assetData.currency} ${assetData.price?.toFixed(2)}` : undefined} />
          <InputField id="bom" label="Year 1 O&M Cost" value={baseOM} onChange={setBaseOM} type="number" prefix="₹" />
          <InputField id="omg" label="O&M Annual Growth Rate" value={omGrowth} onChange={setOmGrowth} type="number" suffix="%" step={0.01} />
          <InputField id="opt-marr" label="Cost of Capital / MARR" value={effectiveMarr} onChange={setMarr} type="number" suffix="%" step={0.001} />
          <InputField id="sr" label="Salvage Rate / Year" value={salvageRate} onChange={setSalvageRate} type="number" suffix="%" step={0.01} helper="e.g. 0.10 = loses 10% of cost per year" />
          <InputField id="my" label="Max Analysis Horizon (yrs)" value={maxYears} onChange={setMaxYears} type="number" min={2} max={30} />
        </div>
      </TerminalCard>

      {/* Optional historical O&M */}
      <TerminalCard delay={0.2}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-slate-300">Historical O&M Data <span className="text-slate-600 text-xs ml-1">(optional — enables AI curve fitting)</span></p>
            <p className="text-xs text-slate-500 mt-0.5">Provide ≥ 3 data points to activate polynomial regression model</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOmHistory([...omHistory, { year: String(omHistory.length+1), cost: '' }])}>
            <Plus size={14}/> Add Point
          </Button>
        </div>
        {omHistory.length === 0 ? (
          <p className="text-xs text-slate-600 italic">No historical data — will use exponential growth model ({(parseFloat(omGrowth)*100).toFixed(0)}%/yr)</p>
        ) : (
          <div className="space-y-2">
            {omHistory.map((h, i) => (
              <div key={i} className="flex gap-3 items-center">
                <InputField id={`omh-yr-${i}`} label="" value={h.year} onChange={(v)=>{const a=[...omHistory];a[i].year=v;setOmHistory(a)}} type="number" prefix="Yr" />
                <InputField id={`omh-c-${i}`} label="" value={h.cost} onChange={(v)=>{const a=[...omHistory];a[i].cost=v;setOmHistory(a)}} type="number" prefix="₹" placeholder="O&M cost" />
                <button onClick={()=>setOmHistory(omHistory.filter((_,j)=>j!==i))} className="text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        )}
      </TerminalCard>

      {error && <div className="terminal-card p-4 border border-rose-500/50"><p className="text-sm text-rose-400 font-mono">Error: {error}</p></div>}
      <Button onClick={handleRun} loading={loading} fullWidth size="lg">
        {loading ? 'Running Optimizer...' : 'Find Optimal Replacement Year'}
      </Button>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div key="opt-result" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-4">
            {/* Hero result */}
            <TerminalCard glow animate={false} className="text-center py-8">
              <p className="text-slate-400 text-sm uppercase tracking-widest mb-2">Optimal Replacement</p>
              <p className="text-7xl font-bold text-cyan-400 text-shadow-glow number-font">{result.optimal_year}</p>
              <p className="text-slate-400 mt-1">years of ownership</p>
              <div className="mt-4 inline-block px-4 py-1.5 border border-cyan-500/30 bg-cyan-900/10 text-cyan-400 text-sm font-bold tracking-widest uppercase">
                Minimum EUAC: {formatINR(result.optimal_euac)}/yr
              </div>
              <div className="mt-3 text-xs text-slate-600">
                Model: {result.model_used === 'polynomial_regression' ? 'Polynomial Regression (ML)' : 'Exponential Growth'}
              </div>
            </TerminalCard>

            <TerminalCard animate={false}>
              <EuacChart data={result.euac_curve} optimalYear={result.optimal_year} />
            </TerminalCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
