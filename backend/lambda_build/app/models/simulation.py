from pydantic import BaseModel, Field
from typing import Optional
from app.models.economics import CashFlowYear


class MonteCarloRequest(BaseModel):
    initial_investment: float = Field(..., gt=0)
    cash_flows:         list[CashFlowYear] = Field(..., min_length=1)
    marr:               float = Field(..., gt=0, lt=1)
    iterations:         int   = Field(default=50000, ge=1000, le=200000)


class OMHistoryPoint(BaseModel):
    year: int
    cost: float = Field(..., ge=0)


class OptimizerRequest(BaseModel):
    purchase_cost:  float = Field(..., gt=0)
    base_om_cost:   float = Field(..., ge=0)
    om_growth_rate: float = Field(default=0.06, ge=0, le=1)
    marr:           float = Field(..., gt=0, lt=1)
    salvage_rate:   float = Field(default=0.10, ge=0, le=1)
    max_years:      int   = Field(default=15, ge=2, le=30)
    om_history:     Optional[list[OMHistoryPoint]] = None
    ticker:         Optional[str] = None


class CapitalProject(BaseModel):
    name: str
    cost: float = Field(..., gt=0)
    npv:  float
    risk: str = Field(default="medium")


class CapitalRequest(BaseModel):
    budget:     float = Field(..., gt=0)
    projects:   list[CapitalProject] = Field(..., min_length=1, max_length=50)
    fractional: bool = False
