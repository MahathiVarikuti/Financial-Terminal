import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Plus, Trash2, TrendingUp } from 'lucide-react'
import { TerminalCard } from '../components/ui/TerminalCard'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/InputField'
import { MetricBadge } from '../components/ui/MetricBadge'
import { NpvChart } from '../components/charts/NpvChart'
import { DepreciationChart } from '../components/charts/DepreciationChart'
import { economicsApi, marketApi } from '../lib/api'
import { WDV_OPTIONS, formatINR, formatNumIN } from '../lib/constants'
import { useMarketData } from '../hooks/useMarketData'

type Tab = 'npv' | 'breakeven' | 'depreciation'

export default function Economics() {
  const [tab, setTab] = useState<Tab>('npv')
  const { macroRates } = useMarketData()

  // NPV state
  const [investment, setInvestment] = useState('500000')
  const [discountRate, setDiscountRate] = useState('')
  const [cashFlows, setCashFlows] = useState([100000, 130000, 160000, 180000, 200000].map(String))
  const [npvResult, setNpvResult]   = useState<any>(null)
  const [npvLoading, setNpvLoading] = useState(false)
  const [npvError, setNpvError]     = useState<string|null>(null)

  // Break-even state
  const [fixedCosts, setFixedCosts]     = useState('200000')
  const [varCost, setVarCost]           = useState('45')
  const [price, setPrice]               = useState('80')
  const [beResult, setBeResult]         = useState<any>(null)
  const [beLoading, setBeLoading]       = useState(false)
  const [beError, setBeError]           = useState<string|null>(null)

  // Depreciation state
  const [assetCost, setAssetCost]     = useState('250000')
  const [salvage, setSalvage]         = useState('10000')
  const [life, setLife]               = useState('7')
  const [method, setMethod]           = useState('wdv_10')
  const [deprResult, setDeprResult]   = useState<any>(null)
  const [deprLoading, setDeprLoading] = useState(false)
  const [deprError, setDeprError]     = useState<string|null>(null)

  const effectiveRate = discountRate || (macroRates?.repo_rate ? (macroRates.repo_rate / 100).toFixed(4) : '0.065')

  const runNPV = async () => {
    setNpvLoading(true); setNpvError(null)
    try {
      const res = await economicsApi.npv({
        initial_investment: parseFloat(investment),
        cash_flows: cashFlows.map(Number),
        discount_rate: parseFloat(effectiveRate),
      })
      setNpvResult(res.data)
    } catch (e: any) { setNpvError(e.message) }
    finally { setNpvLoading(false) }
  }

  const runBreakeven = async () => {
    setBeLoading(true); setBeError(null)
    try {
      const res = await economicsApi.breakeven({
        fixed_costs: parseFloat(fixedCosts),
        variable_cost_per_unit: parseFloat(varCost),
        price_per_unit: parseFloat(price),
      })
      setBeResult(res.data)
    } catch (e: any) { setBeError(e.message) }
    finally { setBeLoading(false) }
  }

  const runDepreciation = async () => {
    setDeprLoading(true); setDeprError(null)
    try {
      const res = await economicsApi.depreciation({
        cost: parseFloat(assetCost),
        salvage_value: parseFloat(salvage),
        useful_life: parseInt(life),
        method,
      })
      setDeprResult(res.data)
    } catch (e: any) { setDeprError(e.message) }
    finally { setDeprLoading(false) }
  }

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 border border-cyan-500/50 bg-cyan-900/30 flex items-center justify-center">
            <span className="text-cyan-400 font-bold"><Activity size={20} /></span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">Capital Budgeting</h1>
            <p className="text-sm text-cyan-600 font-mono">NPV · IRR · Break-Even · WDV Block Depreciation</p>
          </div>
        </div>
      </motion.div>

      {/* Tab selector */}
      <div className="flex gap-2 border-b border-cyan-500/20 pb-1">
        {(['npv','breakeven','depreciation'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab-btn ${tab === t ? 'active' : ''}`}>
            {t === 'npv' ? 'NPV Analysis' : t === 'breakeven' ? 'Break-Even' : 'Depreciation'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── NPV TAB ─────────────────────────────────────────── */}
        {tab === 'npv' && (
          <motion.div key="npv" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
            <TerminalCard>
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Investment Parameters</h2>
              {macroRates && (
                <p className="text-xs text-slate-500 mb-4">
                Note: Discount rate pre-filled from live RBI Repo Rate: <span className="text-cyan-400 font-bold">{macroRates.repo_rate?.toFixed(2) ?? 'N/A'}%</span>
                </p>
              )}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <InputField id="investment" label="Initial Investment" value={investment} onChange={setInvestment} type="number" prefix="₹" required />
                <InputField id="rate" label="Discount Rate / Cost of Capital" value={effectiveRate} onChange={setDiscountRate} type="number" suffix="%" step={0.001} helper="Auto-filled from RBI Repo Rate" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-300">Annual Cash Flows</p>
                  <Button variant="ghost" size="sm" onClick={() => setCashFlows([...cashFlows, '0'])}>
                    <Plus size={14}/> Add Year
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {cashFlows.map((cf, i) => (
                    <div key={i} className="relative">
                      <InputField id={`cf-${i}`} label={`Year ${i+1}`} value={cf} onChange={(v) => {const a=[...cashFlows]; a[i]=v; setCashFlows(a)}} type="number" prefix="₹" />
                      {cashFlows.length > 1 && (
                        <button onClick={() => setCashFlows(cashFlows.filter((_,j)=>j!==i))}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-rose-900/80 text-rose-400 border border-rose-500/50 text-xs flex items-center justify-center hover:bg-rose-800">
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {npvError && <p className="text-sm text-rose-400 mt-3">{npvError}</p>}
              <div className="mt-5">
                <Button onClick={runNPV} loading={npvLoading} fullWidth>Calculate NPV & IRR</Button>
              </div>
            </TerminalCard>

            <AnimatePresence>
              {npvResult && (
                <motion.div key="npv-result" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricBadge label="Net Present Value" value={formatINR(npvResult.npv)} trend={npvResult.npv >= 0 ? 'up' : 'down'} size="lg" />
                    <MetricBadge label="IRR" value={npvResult.irr != null ? `${npvResult.irr?.toFixed(2)}` : 'N/A'} unit="%" trend="neutral" />
                    <MetricBadge label="Payback Period" value={npvResult.payback_period ?? 'N/A'} unit="yrs" trend="neutral" />
                    <MetricBadge label="Viability" value={npvResult.is_viable ? 'VIABLE' : 'NOT VIABLE'} trend={npvResult.is_viable ? 'up' : 'down'} />
                  </div>
                  <TerminalCard animate={false}>
                    <NpvChart data={npvResult.cash_flows} initialInvestment={npvResult.initial_investment} npv={npvResult.npv} />
                  </TerminalCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── BREAK-EVEN TAB ──────────────────────────────────── */}
        {tab === 'breakeven' && (
          <motion.div key="be" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
            <TerminalCard>
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Cost Structure</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <InputField id="fc" label="Fixed Costs" value={fixedCosts} onChange={setFixedCosts} type="number" prefix="₹" />
                <InputField id="vc" label="Variable Cost / Unit" value={varCost} onChange={setVarCost} type="number" prefix="₹" />
                <InputField id="ppu" label="Selling Price / Unit" value={price} onChange={setPrice} type="number" prefix="₹" />
              </div>
              {beError && <p className="text-sm text-rose-400 mt-3">{beError}</p>}
              <div className="mt-5"><Button onClick={runBreakeven} loading={beLoading} fullWidth>Calculate Break-Even</Button></div>
            </TerminalCard>

            <AnimatePresence>
              {beResult && (
                <motion.div key="be-result" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricBadge label="Break-Even Units" value={formatNumIN(beResult.breakeven_units)} unit="units" size="lg" />
                  <MetricBadge label="Break-Even Revenue" value={formatINR(beResult.breakeven_revenue)} size="lg" />
                  <MetricBadge label="Contribution Margin" value={formatINR(beResult.contribution_margin)} unit="/unit" trend="up" />
                  <MetricBadge label="CM Ratio" value={`${(beResult.contribution_margin_ratio * 100).toFixed(1)}`} unit="%" trend="up" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── DEPRECIATION TAB ────────────────────────────────── */}
        {tab === 'depreciation' && (
          <motion.div key="depr" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
            <TerminalCard>
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Asset Details</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField id="ac" label="Asset Cost" value={assetCost} onChange={setAssetCost} type="number" prefix="₹" />
                <InputField id="sv" label="Salvage Value" value={salvage} onChange={setSalvage} type="number" prefix="₹" helper="Ignored for IT Act WDV block" />
                <InputField id="ul" label="Useful Life (yrs)" value={life} onChange={setLife} type="number" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-cyan-500 uppercase tracking-wider">Method</label>
                  <select value={method} onChange={(e)=>setMethod(e.target.value)}
                    className="input-base bg-[#020205]">
                    {WDV_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              {deprError && <p className="text-sm text-rose-400 mt-3">{deprError}</p>}
              <div className="mt-5"><Button onClick={runDepreciation} loading={deprLoading} fullWidth>Generate Schedule</Button></div>
            </TerminalCard>

            <AnimatePresence>
              {deprResult && (
                <motion.div key="depr-result" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-4">
                  <MetricBadge label="Total Depreciation" value={formatINR(deprResult.total_depreciation)} size="lg" />
                  <TerminalCard animate={false}>
                    <DepreciationChart data={deprResult.schedule} method={deprResult.method} />
                  </TerminalCard>
                  <TerminalCard animate={false}>
                    <p className="text-xs text-cyan-600 font-bold uppercase tracking-wider mb-3">Full Schedule</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-slate-300">
                        <thead><tr className="border-b border-cyan-500/30 text-cyan-500">
                          <th className="pb-2 text-left">Year</th>
                          <th className="pb-2 text-right">Depreciation</th>
                          <th className="pb-2 text-right">Written Down Value</th>
                          <th className="pb-2 text-right">Accumulated</th>
                        </tr></thead>
                        <tbody>
                          {deprResult.schedule.map((row: any) => (
                            <tr key={row.year} className="border-b border-cyan-900/30 hover:bg-cyan-900/10">
                              <td className="py-2 text-slate-400 font-mono">[{row.year}]</td>
                              <td className="py-2 text-right number-font text-cyan-400 font-bold">{formatINR(row.depreciation)}</td>
                              <td className="py-2 text-right number-font">{formatINR(row.book_value)}</td>
                              <td className="py-2 text-right number-font text-slate-500">{formatINR(row.accumulated)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TerminalCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
