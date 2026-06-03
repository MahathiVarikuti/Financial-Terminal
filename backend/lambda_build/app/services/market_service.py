"""
Market data service — FRED API + yfinance integration.
Simple in-memory cache (60s TTL) prevents hammering external APIs.
"""

import os
import asyncio
import time
import math
import statistics
from typing import Optional
from datetime import datetime

import httpx
import yfinance as yf

FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"

# ── In-memory cache {key: (data, timestamp)} ─────────────────────────────────
_cache: dict[str, tuple] = {}
CACHE_TTL = 60  # seconds


def _from_cache(key: str):
    if key in _cache:
        data, ts = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
    return None


def _set_cache(key: str, data):
    _cache[key] = (data, time.time())


# ── FRED helpers ──────────────────────────────────────────────────────────────

async def _fetch_fred_series(series_id: str) -> float:
    """Fetch the latest non-missing observation for a FRED series."""
    params = {
        "series_id":  series_id,
        "api_key":    os.getenv("FRED_API_KEY", ""),
        "file_type":  "json",
        "limit":      10,           # fetch last 10 to skip any missing "." values
        "sort_order": "desc",
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(FRED_BASE, params=params)
        resp.raise_for_status()
        observations = resp.json().get("observations", [])
        valid = [o for o in observations if o.get("value") not in (".", "", None)]
        if not valid:
            raise ValueError(f"No data returned for FRED series {series_id}")
        return float(valid[0]["value"])


async def get_macro_rates() -> dict:
    """
    Returns live macro rates from FRED:
      - INTDSRINM193N : RBI Repo Rate
      - DEXINUS       : USD / INR Exchange Rate
      - INDCPIALLMINMEI : India CPI
      - NIFTY 50      : via yfinance
    Results cached for 60 seconds.
    """
    cached = _from_cache("macro_rates")
    if cached:
        return cached

    # Sequential fetches — FRED rate-limits concurrent requests from the same key
    def _safe(v, default=None):
        return float(v) if isinstance(v, (int, float)) else default

    try:
        repo = await _fetch_fred_series("INTDSRINM193N")
    except Exception:
        repo = 6.50

    try:
        usdinr = await _fetch_fred_series("DEXINUS")
    except Exception:
        usdinr = 83.50

    try:
        cpi = await _fetch_fred_series("INDCPIALLMINMEI")
    except Exception:
        cpi = 157.5

    try:
        nifty = get_asset_data("^NSEI")
        nifty_price = nifty.get("price") or 23300.0
    except Exception:
        nifty_price = 23300.0

    result = {
        "repo_rate":         _safe(repo),
        "usd_inr":           _safe(usdinr),
        "cpi_level":         _safe(cpi),
        "nifty_50":          _safe(nifty_price),
        "last_updated":      datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
    }
    _set_cache("macro_rates", result)
    return result


# ── yfinance helpers ──────────────────────────────────────────────────────────

def get_asset_data(ticker: str) -> dict:
    """
    Fetch real-time asset data via yfinance.
    Computes annualised volatility from 1-year daily returns.
    Results cached for 60 seconds per ticker.
    """
    cache_key = f"asset_{ticker.upper()}"
    cached = _from_cache(cache_key)
    if cached:
        return cached

    try:
        t = yf.Ticker(ticker.upper())
        info = t.info or {}
        hist = t.history(period="1y")

        # Annualised historical volatility (σ × √252)
        volatility: Optional[float] = None
        if not hist.empty and "Close" in hist.columns:
            daily_returns = hist["Close"].pct_change().dropna()
            if len(daily_returns) > 1:
                returns_list = list(daily_returns)
                volatility = round(statistics.stdev(returns_list) * math.sqrt(252), 4)

        price = (
            info.get("currentPrice")
            or info.get("regularMarketPrice")
            or info.get("navPrice")
        )
        if price is None and not hist.empty:
            price = float(hist["Close"].iloc[-1])

        result = {
            "ticker":            ticker.upper(),
            "name":              info.get("longName") or info.get("shortName") or ticker.upper(),
            "price":             round(float(price), 4) if price else None,
            "currency":          info.get("currency", "USD"),
            "change_pct":        info.get("regularMarketChangePercent"),
            "week52_high":       info.get("fiftyTwoWeekHigh"),
            "week52_low":        info.get("fiftyTwoWeekLow"),
            "market_cap":        info.get("marketCap"),
            "pe_ratio":          info.get("trailingPE"),
            "beta":              info.get("beta"),
            "volatility_annual": volatility,
        }
        _set_cache(cache_key, result)
        return result

    except Exception as e:
        raise ValueError(f"Could not fetch data for ticker '{ticker}': {e}")
