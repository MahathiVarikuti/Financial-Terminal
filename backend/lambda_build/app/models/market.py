from pydantic import BaseModel
from typing import Optional


class AssetData(BaseModel):
    ticker:           str
    name:             str
    price:            Optional[float]
    currency:         str
    change_pct:       Optional[float]
    week52_high:      Optional[float]
    week52_low:       Optional[float]
    market_cap:       Optional[float]
    pe_ratio:         Optional[float]
    beta:             Optional[float]
    volatility_annual: Optional[float]


class MacroRates(BaseModel):
    fed_funds_rate:    float
    treasury_10yr:     float
    cpi_level:         float
    unemployment_rate: float
    last_updated:      str
