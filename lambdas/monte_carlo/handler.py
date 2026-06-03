"""
Monte Carlo NPV Risk Simulator — AWS Lambda Handler
----------------------------------------------------
Runs fully vectorized probabilistic NPV simulations using NumPy.
Invoked programmatically via aiobotocore (NOT via API Gateway).

Event payload:
    {
        "initial_investment": float,       # e.g. 500000
        "cash_flows": [                    # one dict per year
            {"mean": float, "std": float},
            ...
        ],
        "marr": float,                     # e.g. 0.10 for 10%
        "iterations": int                  # default 50000, max 200000
    }

Returns:
    {
        "histogram": {"counts": [...], "bin_edges": [...]},
        "percentiles": {"p5": ..., "p10": ..., "p25": ..., "p50": ..., "p75": ..., "p90": ..., "p95": ...},
        "stats": {"mean": ..., "std": ..., "prob_positive": ..., "var_95": ..., "min": ..., "max": ...},
        "iterations": int,
        "n_years": int
    }
"""

import json
import numpy as np


def lambda_handler(event, context):
    try:
        # ── Parse inputs ──────────────────────────────────────────────────────
        initial_investment = float(event["initial_investment"])
        cash_flow_params = event["cash_flows"]   # list of {mean, std}
        marr = float(event["marr"])
        iterations = int(event.get("iterations", 50000))
        iterations = min(iterations, 200_000)    # hard cap for free-tier safety

        n_years = len(cash_flow_params)
        if n_years == 0:
            return {"error": "cash_flows must contain at least one year"}
        if marr <= -1:
            return {"error": "marr must be greater than -1"}

        # ── Extract mean and std vectors ──────────────────────────────────────
        means = np.array([float(cf["mean"]) for cf in cash_flow_params])
        stds  = np.array([float(cf.get("std", 0.0)) for cf in cash_flow_params])
        # Ensure no negative standard deviations
        stds = np.maximum(stds, 0.0)

        # ── Vectorized Monte Carlo simulation ─────────────────────────────────
        # Shape: (iterations, n_years) — each row is one simulation trial
        sampled_flows = np.random.normal(means, stds, (iterations, n_years))

        # Discount factors for years 1..n  →  shape: (n_years,)
        discount_factors = 1.0 / (1.0 + marr) ** np.arange(1, n_years + 1)

        # NPV for each trial: sum of discounted cash flows minus initial investment
        # Broadcasting: (iterations, n_years) * (n_years,) → sum axis=1 → (iterations,)
        npvs = np.sum(sampled_flows * discount_factors, axis=1) - initial_investment

        # ── Histogram (60 bins for smooth distribution curve) ─────────────────
        counts, bin_edges = np.histogram(npvs, bins=60)

        # ── Percentiles ───────────────────────────────────────────────────────
        pct = np.percentile(npvs, [5, 10, 25, 50, 75, 90, 95])

        # ── Summary statistics ────────────────────────────────────────────────
        prob_positive = float(np.mean(npvs > 0))   # fraction of trials with NPV > 0
        var_95 = float(np.percentile(npvs, 5))     # 5th percentile = Value at Risk (95% confidence)

        return {
            "histogram": {
                "counts":    counts.tolist(),
                "bin_edges": bin_edges.tolist(),
            },
            "percentiles": {
                "p5":  float(pct[0]),
                "p10": float(pct[1]),
                "p25": float(pct[2]),
                "p50": float(pct[3]),
                "p75": float(pct[4]),
                "p90": float(pct[5]),
                "p95": float(pct[6]),
            },
            "stats": {
                "mean":          float(np.mean(npvs)),
                "std":           float(np.std(npvs)),
                "prob_positive": prob_positive,
                "var_95":        var_95,
                "min":           float(np.min(npvs)),
                "max":           float(np.max(npvs)),
            },
            "iterations": iterations,
            "n_years":    n_years,
        }

    except KeyError as e:
        return {"error": f"Missing required field: {e}"}
    except Exception as e:
        return {"error": str(e)}
