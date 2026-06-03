"""
AI Asset Replacement Optimizer — AWS Lambda Handler
----------------------------------------------------
Determines the mathematically optimal year to replace a degrading physical
asset by minimizing the Equivalent Uniform Annual Cost (EUAC).

If historical O&M data (>= 3 points) is provided, uses scikit-learn
PolynomialFeatures + LinearRegression to model the cost trajectory.
Otherwise falls back to exponential growth: base_om * (1 + rate)^year.

Event payload:
    {
        "purchase_cost":  float,       # Initial asset purchase price
        "base_om_cost":   float,       # Year 1 O&M (operations & maintenance) cost
        "om_growth_rate": float,       # Annual O&M escalation rate, e.g. 0.06
        "marr":           float,       # Minimum Attractive Rate of Return, e.g. 0.10
        "salvage_rate":   float,       # Fraction of purchase cost salvaged per year, e.g. 0.10
        "max_years":      int,         # Max ownership horizon to evaluate, default 15
        "om_history": [                # Optional: historical O&M for ML fitting
            {"year": int, "cost": float}, ...
        ]
    }

Returns:
    {
        "euac_curve": [{"year", "euac", "cr_component", "om_component"}, ...],
        "optimal_year": int,
        "optimal_euac": float,
        "om_costs":      [float, ...],
        "salvage_values":[float, ...],
        "model_used":    "polynomial_regression" | "exponential_growth"
    }
"""

import json
import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression


def _capital_recovery_factor(i: float, n: int) -> float:
    """(A/P, i, n) — converts a present sum to a uniform annual series."""
    if i == 0:
        return 1.0 / n
    return i * (1 + i) ** n / ((1 + i) ** n - 1)


def lambda_handler(event, context):
    try:
        # ── Parse inputs ──────────────────────────────────────────────────────
        P          = float(event["purchase_cost"])
        base_om    = float(event["base_om_cost"])
        om_rate    = float(event.get("om_growth_rate", 0.06))
        marr       = float(event["marr"])
        salv_rate  = float(event.get("salvage_rate", 0.10))
        max_years  = int(event.get("max_years", 15))
        om_history = event.get("om_history", [])

        max_years = min(max(max_years, 2), 30)   # clamp 2–30
        years     = np.arange(1, max_years + 1)

        # ── Predict O&M costs ─────────────────────────────────────────────────
        model_used = "exponential_growth"
        if len(om_history) >= 3:
            # Use polynomial regression to model non-linear O&M cost escalation
            hist_years = np.array([h["year"] for h in om_history], dtype=float).reshape(-1, 1)
            hist_costs = np.array([h["cost"] for h in om_history], dtype=float)

            poly = PolynomialFeatures(degree=2, include_bias=True)
            X_poly = poly.fit_transform(hist_years)
            reg = LinearRegression().fit(X_poly, hist_costs)

            future_X = poly.transform(years.reshape(-1, 1))
            om_costs = np.maximum(reg.predict(future_X), 0.0)   # no negative O&M
            model_used = "polynomial_regression"
        else:
            # Exponential growth: C_t = base_om * (1 + om_rate)^t
            om_costs = base_om * (1.0 + om_rate) ** years

        # ── Salvage values: linear decline to zero ────────────────────────────
        # S_n = P * max(0, 1 - salvage_rate * n)
        salvage_values = np.maximum(P * (1.0 - salv_rate * years), 0.0)

        # ── Compute EUAC for each ownership horizon n ─────────────────────────
        euac_curve = []
        for idx, n in enumerate(years):
            S_n = salvage_values[idx]
            crf = _capital_recovery_factor(marr, int(n))

            # Capital Recovery (CR): annualized cost of owning the asset
            #   CR = (P - S_n) * (A/P, marr, n) + S_n * marr
            cr_component = (P - S_n) * crf + S_n * marr

            # O&M: PV of all O&M costs for years 1..n, then annualized
            t_vec     = np.arange(1, n + 1)
            om_pv     = np.sum(om_costs[:n] / (1.0 + marr) ** t_vec)
            om_annual = om_pv * crf   # annualize the PV sum

            euac = cr_component + om_annual
            euac_curve.append({
                "year":         int(n),
                "euac":         round(float(euac), 2),
                "cr_component": round(float(cr_component), 2),
                "om_component": round(float(om_annual), 2),
            })

        # ── Find optimal replacement year ─────────────────────────────────────
        euac_values  = [row["euac"] for row in euac_curve]
        optimal_idx  = int(np.argmin(euac_values))
        optimal_year = euac_curve[optimal_idx]["year"]
        optimal_euac = euac_curve[optimal_idx]["euac"]

        return {
            "euac_curve":     euac_curve,
            "optimal_year":   optimal_year,
            "optimal_euac":   optimal_euac,
            "om_costs":       [round(float(c), 2) for c in om_costs],
            "salvage_values": [round(float(s), 2) for s in salvage_values],
            "model_used":     model_used,
        }

    except KeyError as e:
        return {"error": f"Missing required field: {e}"}
    except Exception as e:
        return {"error": str(e)}
