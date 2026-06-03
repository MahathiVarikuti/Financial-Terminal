import { useState, useEffect, useCallback } from 'react'
import { marketApi } from '../lib/api'

interface MacroRates {
  repo_rate: number
  usd_inr: number
  cpi_level: number
  nifty_50: number
  last_updated: string
}

interface AssetData {
  ticker: string
  name: string
  price: number | null
  currency: string
  change_pct: number | null
  week52_high: number | null
  week52_low: number | null
  market_cap: number | null
  pe_ratio: number | null
  beta: number | null
  volatility_annual: number | null
}

export function useMarketData() {
  const [macroRates, setMacroRates]     = useState<MacroRates | null>(null)
  const [macroLoading, setMacroLoading] = useState(true)
  const [macroError, setMacroError]     = useState<string | null>(null)

  const [assetData, setAssetData]       = useState<AssetData | null>(null)
  const [assetLoading, setAssetLoading] = useState(false)
  const [assetError, setAssetError]     = useState<string | null>(null)

  // Fetch macro rates on mount
  useEffect(() => {
    marketApi.rates()
      .then((res) => setMacroRates(res.data))
      .catch((err) => setMacroError(err.message))
      .finally(() => setMacroLoading(false))
  }, [])

  const lookupAsset = useCallback((ticker: string) => {
    if (!ticker.trim()) return
    setAssetData(null)
    setAssetError(null)
    setAssetLoading(true)

    marketApi.asset(ticker)
      .then((res) => setAssetData(res.data))
      .catch((err) => setAssetError(err.message))
      .finally(() => setAssetLoading(false))
  }, [])

  return {
    macroRates, macroLoading, macroError,
    assetData, assetLoading, assetError, lookupAsset,
  }
}
