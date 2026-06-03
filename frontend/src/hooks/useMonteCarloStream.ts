import { useState, useCallback } from 'react'
import { monteCarloApi } from '../lib/api'

export interface MCResult {
  status: string
  histogram?: { counts: number[]; bin_edges: number[] }
  percentiles?: { p5: number; p10: number; p25: number; p50: number; p75: number; p90: number; p95: number }
  stats?: { mean: number; std: number; prob_positive: number; var_95: number; min: number; max: number }
  iterations?: number
  n_years?: number
  error?: string
}

export function useMonteCarloStream() {
  const [result, setResult]       = useState<MCResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError]         = useState<string | null>(null)

  const runSimulation = useCallback(async (params: object) => {
    setResult(null)
    setError(null)
    setIsRunning(true)
    setStatusMsg('Running Monte Carlo simulation...')

    try {
      const res = await monteCarloApi.simulate(params)
      setResult({ status: 'complete', ...res.data })
      setStatusMsg('Simulation complete')
    } catch (err: any) {
      setError(err.message || 'Simulation failed. Network error or timeout.')
    } finally {
      setIsRunning(false)
    }
  }, [])

  const cancel = useCallback(() => {
    setIsRunning(false)
    setStatusMsg('Cancelled')
  }, [])

  return { result, isRunning, statusMsg, error, runSimulation, cancel }
}
