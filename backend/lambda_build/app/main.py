from dotenv import load_dotenv
load_dotenv()  # Must be first — loads .env before any other import reads os.getenv

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.services.lambda_client import LambdaClient
from app.routers import economics, market_data, monte_carlo, optimizer, capital


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage shared resources across the app lifetime."""
    app.state.lambda_client = LambdaClient()
    yield
    # Nothing to explicitly close — aiobotocore clients are created per-call


app = FastAPI(
    title="FinTech Economics Engine API",
    description=(
        "Real-time financial modeling, Monte Carlo risk simulation, "
        "AI-powered asset replacement optimization, and capital allocation."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
_raw_origins = os.getenv("CORS_ORIGINS", "*")
_origins = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
# Nginx strips /fintech-api/ prefix before forwarding, so routes start from /
app.include_router(economics.router,   prefix="/api/econ",   tags=["Economics"])
app.include_router(market_data.router, prefix="/api/market", tags=["Market Data"])
app.include_router(monte_carlo.router,                       tags=["Monte Carlo"])
app.include_router(optimizer.router,   prefix="/api",        tags=["Optimizer"])
app.include_router(capital.router,     prefix="/api",        tags=["Capital"])


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "fintech-api", "port": 8001}

handler = Mangum(app)
