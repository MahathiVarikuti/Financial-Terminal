import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, PieChart, Plus, Trash2 } from 'lucide-react'
import { TerminalCard } from '../components/ui/TerminalCard'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/InputField'
import { MetricBadge } from '../components/ui/MetricBadge'
import { AllocationChart } from '../components/charts/AllocationChart'
import { capitalApi } from '../lib/api'
import { RISK_LEVELS, formatINR } from '../lib/constants'

interface Project { name: string; cost: string; npv: string; risk: string }

const EMPTY_PROJECT = (): Project => ({ name: '', cost: '', npv: '', risk: 'medium' })

const riskColor: Record<string, string> = {
  low:    'bg-emerald-600/20 text-emerald-300 border-emerald-600/30',
  medium: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
  high:   'bg-rose-600/20 text-rose-300 border-rose-600/30',
}

export default function Capital() {
  const [budget, setBudget]     = useState('1000000')
  const [projects, setProjects] = useState<Project[]>([
    { name: 'Solar Array (Gujarat)',       cost: '3500000', npv: '1800000', risk: 'low'    },
    { name: 'Fleet EV Conversion',         cost: '5200000', npv: '2750000', risk: 'medium' },
    { name: 'AI QC System',                cost: '2100000', npv: '1400000', risk: 'medium' },
    { name: 'Pune Warehouse Automation',   cost: '4600000', npv: '3100000', risk: 'high'   },
    { name: 'R&D Lab Upgrade',             cost: '1800000', npv: '950000',  risk: 'low'    },
  ])
  const [fractional, setFractional] = useState(false)
  const [result, setResult]         = useState<any>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string|null>(null)

  const updateProject = (i: number, field: keyof Project, val: string) => {
    const updated = [...projects]; updated[i] = { ...updated[i], [field]: val }; setProjects(updated)
  }

  const handleRun = async () => {
    setLoading(true); setError(null)
    try {
      const res = await capitalApi.allocate({
        budget: parseFloat(budget),
        projects: projects.filter(p => p.name && p.cost && p.npv).map(p => ({
          name: p.name, cost: parseFloat(p.cost), npv: parseFloat(p.npv), risk: p.risk,
        })),
        fractional,
      })
      setResult(res.data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 py-4">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 border border-cyan-500/50 bg-cyan-900/30 flex items-center justify-center">
            <span className="text-cyan-400 font-bold"><Cpu size={20} /></span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">Capital Allocation Solver</h1>
            <p className="text-sm text-cyan-600 font-mono">0/1 Knapsack DP · NPV Maximisation · Portfolio Optimization</p>
          </div>
        </div>
      </motion.div>

      <TerminalCard delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <div className="w-full md:w-64">
            <InputField id="budget" label="Total Capital Budget" value={budget} onChange={setBudget} type="number" prefix="₹" required />
          </div>
          {/* Mode toggle */}
          <div className="flex items-center gap-3 pb-1">
            <span className="text-sm text-slate-400">Mode:</span>
            <button onClick={() => setFractional(false)}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest border transition-all
                ${!fractional ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500/50' : 'text-slate-500 border-transparent hover:text-cyan-400'}`}>
              0/1 Knapsack
            </button>
            <button onClick={() => setFractional(true)}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest border transition-all
                ${fractional ? 'bg-amber-900/30 text-amber-400 border-amber-500/50' : 'text-slate-500 border-transparent hover:text-amber-400'}`}>
              Fractional
            </button>
          </div>
        </div>

        {/* Projects table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-300">Projects</p>
            <Button variant="ghost" size="sm" onClick={() => setProjects([...projects, EMPTY_PROJECT()])}>
              <Plus size={14}/> Add Project
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/30 text-xs text-cyan-600 uppercase tracking-wider font-bold">
                  <th className="pb-2 text-left">Project Name</th>
                  <th className="pb-2 text-left">Cost (₹)</th>
                  <th className="pb-2 text-left">Expected NPV (₹)</th>
                  <th className="pb-2 text-left">Risk</th>
                  <th className="pb-2"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-600/10">
                {projects.map((p, i) => (
                  <tr key={i} className="group">
                    <td className="py-2 pr-2">
                      <input value={p.name} onChange={(e)=>updateProject(i,'name',e.target.value)}
                        placeholder="Project name" className="input-base text-xs py-1.5 px-2" />
                    </td>
                    <td className="py-2 pr-2">
                      <input value={p.cost} onChange={(e)=>updateProject(i,'cost',e.target.value)}
                        type="number" placeholder="0" className="input-base text-xs py-1.5 px-2 number-font w-28" />
                    </td>
                    <td className="py-2 pr-2">
                      <input value={p.npv} onChange={(e)=>updateProject(i,'npv',e.target.value)}
                        type="number" placeholder="0" className="input-base text-xs py-1.5 px-2 number-font w-28" />
                    </td>
                    <td className="py-2 pr-2">
                      <select value={p.risk} onChange={(e)=>updateProject(i,'risk',e.target.value)}
                        className={`text-xs px-2 py-1.5 rounded-lg border transition-all ${riskColor[p.risk]} bg-transparent outline-none`}>
                        {RISK_LEVELS.map(r=><option key={r.value} value={r.value} className="bg-slate-900">{r.label}</option>)}
                      </select>
                    </td>
                    <td className="py-2">
                      <button onClick={()=>setProjects(projects.filter((_,j)=>j!==i))}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all">
                        <Trash2 size={14}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && <p className="text-sm text-rose-400 mt-3">Error: {error}</p>}
        <div className="mt-5">
          <Button onClick={handleRun} loading={loading} fullWidth size="lg">
            {loading ? 'Solving...' : `Solve ${fractional ? 'Fractional' : '0/1 Knapsack'} Allocation`}
          </Button>
        </div>
      </TerminalCard>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div key="cap-result" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricBadge label="Total NPV Captured" value={formatINR(result.total_npv)} trend="up" size="lg" />
              <MetricBadge label="Capital Used" value={formatINR(result.total_cost)} />
              <MetricBadge label="Budget Utilisation" value={result.utilization_pct?.toFixed(1)} unit="%" trend="neutral" />
              <MetricBadge label="NPV per Rupee" value={result.npv_per_dollar?.toFixed(3)} trend="up" />
            </div>

            {/* Selected + Excluded */}
            <div className="grid md:grid-cols-2 gap-4">
              <TerminalCard animate={false} className="border-emerald-600/20">
                <p className="text-xs text-emerald-400 uppercase tracking-wider font-medium mb-3">✓ Selected Projects ({result.selected?.length})</p>
                <div className="space-y-2">
                  {result.selected?.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-emerald-600/10 last:border-0">
                      <div>
                        <p className="text-sm text-slate-100 font-mono">{p.name}</p>
                        <p className="text-xs text-emerald-600/80">Cost: {formatINR(p.cost)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm number-font text-emerald-400 font-bold">+{formatINR(p.npv)}</p>
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border ${riskColor[p.risk]}`}>{p.risk}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TerminalCard>

              <TerminalCard animate={false} className="border-slate-700/40 opacity-80">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">✗ Excluded Projects ({result.excluded?.length})</p>
                <div className="space-y-2">
                  {result.excluded?.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/20 last:border-0 opacity-60">
                      <div>
                        <p className="text-sm text-slate-400 font-mono">{p.name}</p>
                        <p className="text-xs text-slate-600">Cost: {formatINR(p.cost)}</p>
                      </div>
                      <p className="text-sm number-font text-slate-500 font-bold">{formatINR(p.npv)}</p>
                    </div>
                  ))}
                  {result.excluded?.length === 0 && <p className="text-xs text-slate-600 italic">All projects selected</p>}
                </div>
              </TerminalCard>
            </div>

            <TerminalCard animate={false}>
              <AllocationChart
                selected={result.selected || []}
                excluded={result.excluded || []}
                budget={parseFloat(budget)}
                totalNpv={result.total_npv}
                totalCost={result.total_cost}
              />
            </TerminalCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
