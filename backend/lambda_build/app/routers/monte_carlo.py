import os
from fastapi import APIRouter, HTTPException, Request

router = APIRouter()

@router.post("/api/monte-carlo")
async def run_monte_carlo(params: dict, request: Request):
    """
    HTTP POST endpoint for Monte Carlo NPV simulation.
    """
    required_fields = ["initial_investment", "cash_flows", "marr"]
    for field in required_fields:
        if field not in params:
            raise HTTPException(status_code=400, detail=f"Missing field: '{field}'")

    if not isinstance(params["cash_flows"], list) or len(params["cash_flows"]) == 0:
        raise HTTPException(status_code=400, detail="cash_flows must be a non-empty list")

    lambda_client = request.app.state.lambda_client
    function_name = os.getenv("LAMBDA_MONTE_CARLO", "fintech-monte-carlo")

    result = await lambda_client.invoke(function_name, params)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result
