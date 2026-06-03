from fastapi import APIRouter, HTTPException
from app.services.market_service import get_macro_rates, get_asset_data

router = APIRouter()


@router.get("/rates", summary="Live Macro Rates (FRED)")
async def macro_rates():
    """
    Fetch live macroeconomic rates from the Federal Reserve (FRED API):
    - Fed Funds Rate (DFF)
    - 10-Year Treasury Rate (GS10)
    - CPI Level (CPIAUCSL)
    - Unemployment Rate (UNRATE)

    Results are cached for 60 seconds to avoid rate limits.
    """
    try:
        return await get_macro_rates()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"FRED API error: {e}")


@router.get("/asset/{ticker}", summary="Live Asset Data (yfinance)")
async def asset_data(ticker: str):
    """
    Fetch real-time asset pricing and fundamentals via yfinance.
    Returns price, 52-week range, P/E ratio, beta, and annualised volatility.
    """
    try:
        return get_asset_data(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Market data error: {e}")
