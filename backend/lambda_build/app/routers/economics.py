from fastapi import APIRouter, HTTPException
from app.models.economics import NPVRequest, BreakevenRequest, DepreciationRequest
from app.services.economics_engine import calculate_npv, calculate_breakeven, calculate_depreciation

router = APIRouter()


@router.post("/npv", summary="NPV & IRR Analysis")
async def npv_analysis(request: NPVRequest):
    """Compute Present Worth (NPV), IRR, and payback period for a cash flow series."""
    try:
        return calculate_npv(
            request.initial_investment,
            request.cash_flows,
            request.discount_rate,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/breakeven", summary="Break-Even Analysis")
async def breakeven_analysis(request: BreakevenRequest):
    """Calculate break-even units, revenue, and contribution margins."""
    try:
        return calculate_breakeven(
            request.fixed_costs,
            request.variable_cost_per_unit,
            request.price_per_unit,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/depreciation", summary="Depreciation Schedule")
async def depreciation_schedule(request: DepreciationRequest):
    """Generate a full depreciation schedule (MACRS or Straight-Line)."""
    try:
        return calculate_depreciation(
            request.cost,
            request.salvage_value,
            request.useful_life,
            request.method,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
