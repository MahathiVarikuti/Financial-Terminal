import os
from fastapi import APIRouter, HTTPException, Request
from app.models.simulation import OptimizerRequest
from app.services.market_service import get_asset_data

router = APIRouter()


@router.post("/optimizer", summary="AI Asset Replacement Optimizer")
async def optimize_replacement(request: Request, body: OptimizerRequest):
    """
    Determine the optimal year to replace a degrading physical asset
    by minimising the Equivalent Uniform Annual Cost (EUAC).

    Optionally supply a stock ticker to auto-fetch the current market
    price as a reference for the asset's purchase cost.
    """
    try:
        payload = body.model_dump(exclude_none=True)

        # If ticker provided, enrich payload with live market price
        if body.ticker:
            try:
                asset = get_asset_data(body.ticker)
                payload["asset_info"] = {
                    "ticker":  asset["ticker"],
                    "name":    asset["name"],
                    "price":   asset["price"],
                    "beta":    asset["beta"],
                    "volatility": asset["volatility_annual"],
                }
            except ValueError:
                pass  # Ticker lookup failed — proceed without market data

        # Convert om_history to plain dicts for JSON serialisation
        if payload.get("om_history"):
            payload["om_history"] = [h.model_dump() if hasattr(h, "model_dump") else h
                                     for h in (body.om_history or [])]

        lambda_client = request.app.state.lambda_client
        function_name = os.getenv("LAMBDA_OPTIMIZER", "fintech-optimizer")

        result = await lambda_client.invoke(function_name, payload)

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
