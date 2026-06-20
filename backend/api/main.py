"""SmartFlow FastAPI application.

Thin HTTP layer over the service module. Exposes:
    GET  /health    - liveness + whether the policy is loaded
    POST /predict   - given a traffic state, return the agent's signal decision
    POST /simulate  - run an episode under a controller, return real metrics
    GET  /metrics   - latest saved RL-vs-baselines comparison (from evaluate.py)

Run (from backend/, project venv):
    uvicorn api.main:app --reload
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from .schemas import (
    HealthResponse,
    MetricsResponse,
    PredictResponse,
    SimulateRequest,
    SimulateResponse,
    TrafficState,
)
from .service import PolicyService, load_saved_comparison

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("smartflow.api")

service = PolicyService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("starting SmartFlow API; loading policy...")
    service.load()
    yield
    logger.info("shutting down SmartFlow API")


app = FastAPI(
    title="SmartFlow Traffic-Signal RL API",
    description="Reinforcement-learning traffic-signal controller (SUMO + SB3).",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse, tags=["ops"])
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=service.ready,
        model_path=service.model_path if service.ready else None,
    )


@app.post("/predict", response_model=PredictResponse, tags=["inference"])
def predict(state: TrafficState) -> PredictResponse:
    if not service.ready:
        raise HTTPException(
            status_code=503,
            detail="policy not loaded; train a model first (python -m rl.train)",
        )
    try:
        result = service.predict(state)
    except Exception as exc:  # noqa: BLE001 - surface as 500 with context
        logger.exception("prediction failed")
        raise HTTPException(status_code=500, detail=f"prediction failed: {exc}")
    return PredictResponse(**result)


@app.post("/simulate", response_model=SimulateResponse, tags=["inference"])
def simulate(req: SimulateRequest) -> SimulateResponse:
    if req.controller == "rl" and not service.ready:
        raise HTTPException(status_code=503, detail="policy not loaded for controller='rl'")
    try:
        result = service.simulate(req.controller, req.seed, req.num_seconds)
    except Exception as exc:  # noqa: BLE001
        logger.exception("simulation failed")
        raise HTTPException(status_code=500, detail=f"simulation failed: {exc}")
    return SimulateResponse(**result)


@app.get("/metrics", response_model=MetricsResponse, tags=["ops"])
def metrics() -> MetricsResponse:
    rows = load_saved_comparison()
    if rows is None:
        return MetricsResponse(available=False, results=[])
    return MetricsResponse(available=True, results=rows)


@app.exception_handler(ValueError)
async def value_error_handler(_request, exc: ValueError):
    return JSONResponse(status_code=422, content={"detail": str(exc)})
