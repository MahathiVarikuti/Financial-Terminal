"""
Capital Allocation Solver — AWS Lambda Handler
----------------------------------------------
Solves the 0/1 Knapsack problem to maximize total NPV within a fixed budget,
or uses the greedy fractional approach for continuous (fractional) mode.

The DP table is built using NumPy vectorized row operations for speed.

Event payload:
    {
        "budget": float,
        "projects": [
            {"name": str, "cost": float, "npv": float, "risk": str},
            ...
        ],
        "fractional": bool    # default false → 0/1 Knapsack
    }

Returns:
    {
        "selected":       [...],
        "excluded":       [...],
        "total_npv":      float,
        "total_cost":     float,
        "budget":         float,
        "utilization_pct":float,
        "npv_per_dollar": float,
        "method":         "knapsack_01" | "fractional_greedy"
    }
"""

import json
import numpy as np


def _fractional_greedy(budget: float, projects: list) -> dict:
    """Greedy selection by NPV/Cost ratio — optimal for fractional relaxation."""
    sorted_projects = sorted(
        projects,
        key=lambda p: p["npv"] / p["cost"] if p["cost"] > 0 else 0,
        reverse=True
    )
    selected  = []
    remaining = budget
    total_npv = 0.0

    for p in sorted_projects:
        if p["cost"] <= remaining:
            selected.append(p)
            remaining -= p["cost"]
            total_npv += p["npv"]

    selected_names = {p["name"] for p in selected}
    excluded = [p for p in projects if p["name"] not in selected_names]
    total_cost = budget - remaining

    return {
        "selected":        selected,
        "excluded":        excluded,
        "total_npv":       round(total_npv, 2),
        "total_cost":      round(total_cost, 2),
        "budget":          budget,
        "utilization_pct": round(total_cost / budget * 100, 1) if budget > 0 else 0.0,
        "npv_per_dollar":  round(total_npv / total_cost, 4) if total_cost > 0 else 0.0,
        "method":          "fractional_greedy",
    }


def _knapsack_01(budget: float, projects: list) -> dict:
    """
    0/1 Knapsack DP using NumPy vectorized row operations.
    
    Scaling strategy: find the GCD of all costs and budget (rounded to nearest
    dollar), then divide through so the DP table stays under ~2M cells.
    This handles both small ($1K) and large ($1M+) budgets safely.
    """
    import math as _math

    # Round everything to nearest dollar — sub-dollar precision is irrelevant for CapEx
    budget_int  = max(1, round(budget))
    costs_round = [max(1, round(p["cost"])) for p in projects]

    # Find GCD of budget + all costs to reduce table size
    all_vals = [budget_int] + costs_round
    g = all_vals[0]
    for v in all_vals[1:]:
        g = _math.gcd(g, v)

    # Also cap so W (number of columns) stays ≤ 500_000
    max_cols  = 500_000
    W_raw     = budget_int // g
    if W_raw > max_cols:
        # Increase GCD divisor until table fits
        g = max(g, -(-budget_int // max_cols))  # ceiling division
    
    W         = budget_int // g
    costs_int = [max(1, c // g) for c in costs_round]
    npv_vals  = [p["npv"] for p in projects]
    n         = len(projects)

    # dp[w] = max NPV achievable with capacity w (1-D rolling array)
    dp   = np.zeros(W + 1, dtype=np.float64)
    keep = np.zeros((n, W + 1), dtype=bool)

    for i in range(n):
        w_i = costs_int[i]
        v_i = npv_vals[i]
        if w_i > W:
            continue   # project costs more than entire budget — skip

        prev = dp.copy()
        updated  = prev[:W - w_i + 1] + v_i
        improved = updated > dp[w_i:]
        dp[w_i:][improved] = updated[improved]
        keep[i, w_i:][improved] = True

    # ── Backtrack ─────────────────────────────────────────────────────────────
    selected_indices = []
    w = W
    for i in range(n - 1, -1, -1):
        if w >= costs_int[i] and keep[i, w]:
            selected_indices.append(i)
            w -= costs_int[i]

    selected   = [projects[i] for i in selected_indices]
    excluded   = [p for i, p in enumerate(projects) if i not in selected_indices]
    total_cost = sum(p["cost"] for p in selected)
    total_npv  = sum(p["npv"]  for p in selected)

    return {
        "selected":        selected,
        "excluded":        excluded,
        "total_npv":       round(total_npv, 2),
        "total_cost":      round(total_cost, 2),
        "budget":          budget,
        "utilization_pct": round(total_cost / budget * 100, 1) if budget > 0 else 0.0,
        "npv_per_dollar":  round(total_npv / total_cost, 4) if total_cost > 0 else 0.0,
        "method":          "knapsack_01",
    }


def lambda_handler(event, context):
    try:
        budget     = float(event["budget"])
        projects   = event["projects"]
        fractional = bool(event.get("fractional", False))

        if budget <= 0:
            return {"error": "Budget must be positive"}
        if not projects:
            return {"error": "At least one project is required"}
        if len(projects) > 50:
            return {"error": "Maximum 50 projects supported"}

        # Validate project structure
        for p in projects:
            if p.get("cost", 0) <= 0:
                return {"error": f"Project '{p.get('name', '?')}' must have a positive cost"}
            if "npv" not in p:
                return {"error": f"Project '{p.get('name', '?')}' is missing 'npv'"}

        if fractional:
            return _fractional_greedy(budget, projects)
        else:
            return _knapsack_01(budget, projects)

    except KeyError as e:
        return {"error": f"Missing required field: {e}"}
    except Exception as e:
        return {"error": str(e)}
