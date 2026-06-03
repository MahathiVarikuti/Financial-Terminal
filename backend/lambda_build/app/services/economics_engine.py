"""
Pure-Python financial engineering math.
No external dependencies — runs directly in FastAPI (no Lambda needed).
"""

from typing import Optional
import math


def _brentq(f, a: float, b: float, xtol: float = 1e-10, maxiter: int = 200) -> float:
    """
    Pure Python implementation of Brent's root-finding method.
    Finds x in [a, b] such that f(x) ≈ 0.
    Raises ValueError if no sign change is found in [a, b].
    """
    fa, fb = f(a), f(b)
    if fa * fb > 0:
        raise ValueError("f(a) and f(b) must have opposite signs")

    if abs(fa) < abs(fb):
        a, b = b, a
        fa, fb = fb, fa

    c, fc = a, fa
    mflag = True
    s = b
    d = 0.0

    for _ in range(maxiter):
        if abs(b - a) < xtol:
            break

        if fa != fc and fb != fc:
            # Inverse quadratic interpolation
            s = (a * fb * fc / ((fa - fb) * (fa - fc))
               + b * fa * fc / ((fb - fa) * (fb - fc))
               + c * fa * fb / ((fc - fa) * (fc - fb)))
        else:
            # Secant method
            s = b - fb * (b - a) / (fb - fa)

        cond1 = not ((3 * a + b) / 4 < s < b or b < s < (3 * a + b) / 4)
        cond2 = mflag and abs(s - b) >= abs(b - c) / 2
        cond3 = not mflag and abs(s - b) >= abs(c - d) / 2
        cond4 = mflag and abs(b - c) < xtol
        cond5 = not mflag and abs(c - d) < xtol

        if cond1 or cond2 or cond3 or cond4 or cond5:
            s = (a + b) / 2   # Bisection fallback
            mflag = True
        else:
            mflag = False

        fs = f(s)
        d, c, fc = c, b, fb

        if fa * fs < 0:
            b, fb = s, fs
        else:
            a, fa = s, fs

        if abs(fa) < abs(fb):
            a, b = b, a
            fa, fb = fb, fa

    return b


# ── WDV depreciation block rates (Indian Income Tax Act) ──────────────
WDV_RATES: dict[str, float] = {
    "wdv_10":       0.10,  # Plant & Machinery general
    "wdv_15":       0.15,  # Plant & Machinery specific
    "wdv_40":       0.40,  # Computers / Commercial EVs
    "wdv_10_bldg":  0.10,  # Buildings general
}


def calculate_npv(
    initial_investment: float,
    cash_flows: list[float],
    discount_rate: float,
) -> dict:
    """
    Compute NPV, IRR, and discounted payback period.

    Returns detailed year-by-year cash flow table plus summary metrics.
    """
    pv_schedule = []
    cumulative_pv = 0.0
    payback_period: Optional[float] = None
    cumulative_undiscounted = 0.0

    for t, cf in enumerate(cash_flows, start=1):
        pv = cf / (1 + discount_rate) ** t
        cumulative_pv += pv

        # Undiscounted payback tracking
        cumulative_undiscounted += cf
        if payback_period is None and cumulative_undiscounted >= initial_investment:
            # Interpolate exact payback within this year
            excess = cumulative_undiscounted - initial_investment
            payback_period = t - (excess / cf) if cf != 0 else float(t)

        pv_schedule.append({
            "year":          t,
            "cash_flow":     round(cf, 2),
            "pv":            round(pv, 2),
            "cumulative_pv": round(cumulative_pv, 2),
        })

    npv = cumulative_pv - initial_investment

    # ── IRR via Brent's method ────────────────────────────────────────────────
    irr: Optional[float] = None
    try:
        def _npv_at_rate(r: float) -> float:
            return sum(cf / (1 + r) ** t for t, cf in enumerate(cash_flows, 1)) - initial_investment

        irr = _brentq(_npv_at_rate, -0.9999, 10.0)
    except (ValueError, RuntimeError):
        irr = None   # No real IRR solution exists

    return {
        "npv":            round(npv, 2),
        "irr":            round(irr * 100, 4) if irr is not None else None,  # as %
        "is_viable":      npv > 0,
        "payback_period": round(payback_period, 2) if payback_period else None,
        "cash_flows":     pv_schedule,
        "initial_investment": initial_investment,
        "discount_rate":  discount_rate,
    }


def calculate_breakeven(
    fixed_costs: float,
    variable_cost_per_unit: float,
    price_per_unit: float,
) -> dict:
    """Compute break-even units, revenue, and contribution margins."""
    contribution_margin = price_per_unit - variable_cost_per_unit
    if contribution_margin <= 0:
        raise ValueError("Selling price must exceed variable cost per unit.")

    breakeven_units   = fixed_costs / contribution_margin
    breakeven_revenue = breakeven_units * price_per_unit
    cm_ratio          = contribution_margin / price_per_unit

    return {
        "breakeven_units":           round(breakeven_units, 2),
        "breakeven_revenue":         round(breakeven_revenue, 2),
        "contribution_margin":       round(contribution_margin, 2),
        "contribution_margin_ratio": round(cm_ratio, 4),
        "fixed_costs":               fixed_costs,
        "variable_cost_per_unit":    variable_cost_per_unit,
        "price_per_unit":            price_per_unit,
    }


def calculate_depreciation(
    cost: float,
    salvage_value: float,
    useful_life: int,
    method: str,
) -> dict:
    """
    Compute a year-by-year depreciation schedule.

    Supports Indian Income Tax WDV (Written Down Value) block rates and Straight-Line.
    WDV ignores salvage value per Indian IT Act rules.
    """
    schedule = []
    accumulated = 0.0

    if method == "straight_line":
        depreciable_base  = cost - salvage_value
        annual_depr       = depreciable_base / useful_life
        book_value        = cost

        for yr in range(1, useful_life + 1):
            book_value   -= annual_depr
            accumulated  += annual_depr
            schedule.append({
                "year":         yr,
                "depreciation": round(annual_depr, 2),
                "book_value":   round(max(book_value, salvage_value), 2),
                "accumulated":  round(accumulated, 2),
            })
    else:
        # WDV — fixed percentage on opening written down value every year
        rate = WDV_RATES.get(method)
        if not rate:
            raise ValueError(f"Unknown depreciation method: {method}")

        book_value = cost
        for yr in range(1, useful_life + 1):
            depr        = book_value * rate
            book_value -= depr
            accumulated += depr
            schedule.append({
                "year":         yr,
                "depreciation": round(depr, 2),
                "book_value":   round(max(book_value, 0), 2),
                "accumulated":  round(accumulated, 2),
                "wdv_pct":      round(rate * 100, 2),
            })

    total_depreciation = sum(row["depreciation"] for row in schedule)

    return {
        "method":             method,
        "total_depreciation": round(total_depreciation, 2),
        "schedule":           schedule,
        "cost":               cost,
        "salvage_value":      salvage_value,
    }
