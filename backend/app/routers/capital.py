import os
from fastapi import APIRouter, HTTPException, Request
from app.models.simulation import CapitalRequest

router = APIRouter()


@router.post("/capital", summary="Capital Allocation Solver")
async def allocate_capital(request: Request, body: CapitalRequest):
    """
    Solve the 0/1 Knapsack problem to maximise total project NPV
    within a fixed capital budget.

    Set fractional=true to use the greedy NPV/Cost ratio approach instead.
    """
    try:
        # Validate: no single project should exceed the total budget
        over_budget = [p.name for p in body.projects if p.cost > body.budget]
        if over_budget:
            raise HTTPException(
                status_code=400,
                detail=f"These projects individually exceed the budget: {over_budget}",
            )

        payload = {
            "budget":     body.budget,
            "projects":   [p.model_dump() for p in body.projects],
            "fractional": body.fractional,
        }

        lambda_client = request.app.state.lambda_client
        function_name = os.getenv("LAMBDA_CAPITAL_SOLVER", "fintech-capital-solver")

        result = await lambda_client.invoke(function_name, payload)

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
