from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional


class CashFlowYear(BaseModel):
    """A single year's probabilistic cash flow (used for Monte Carlo)."""
    mean: float = Field(..., description="Expected cash flow for this year")
    std:  float = Field(default=0.0, ge=0, description="Standard deviation (uncertainty)")


class NPVRequest(BaseModel):
    initial_investment: float = Field(..., gt=0, description="Initial capital outlay (positive)")
    cash_flows:         list[float] = Field(..., min_length=1, description="Cash flows per year")
    discount_rate:      float = Field(..., gt=0, lt=1, description="Annual discount rate, e.g. 0.10")

    @field_validator("cash_flows")
    @classmethod
    def at_least_one_year(cls, v):
        if len(v) == 0:
            raise ValueError("Must provide at least one year of cash flows")
        return v


class NPVResponse(BaseModel):
    npv:            float
    irr:            Optional[float]
    is_viable:      bool
    payback_period: Optional[float]
    cash_flows:     list[dict]


class BreakevenRequest(BaseModel):
    fixed_costs:           float = Field(..., ge=0)
    variable_cost_per_unit: float = Field(..., ge=0)
    price_per_unit:        float = Field(..., gt=0)

    @field_validator("price_per_unit")
    @classmethod
    def price_above_variable_cost(cls, v, info):
        if "variable_cost_per_unit" in info.data and v <= info.data["variable_cost_per_unit"]:
            raise ValueError("price_per_unit must exceed variable_cost_per_unit")
        return v


class BreakevenResponse(BaseModel):
    breakeven_units:          float
    breakeven_revenue:        float
    contribution_margin:      float
    contribution_margin_ratio: float


class DepreciationRequest(BaseModel):
    cost:         float = Field(..., gt=0)
    salvage_value: float = Field(default=0.0, ge=0)
    useful_life:  int   = Field(..., ge=1, le=40)
    method:       Literal["wdv_10","wdv_15","wdv_40","wdv_10_bldg","straight_line"]


class DepreciationResponse(BaseModel):
    method:             str
    total_depreciation: float
    schedule:           list[dict]
