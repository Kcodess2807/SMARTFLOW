"""Pydantic request/response models for the SmartFlow API.

These define the public contract and provide input validation (lane counts,
value ranges, allowed controllers) before anything reaches the model or SUMO.
"""
from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

N_LANES = 8  # incoming lanes at the single intersection (2 per approach x 4)
PHASE_LABELS = {0: "NS-green", 1: "EW-green"}


class TrafficState(BaseModel):
    """A live traffic snapshot at the intersection -> the agent's policy input.

    ``densities`` and ``queues`` are per incoming lane (length 8), each already
    normalised to [0, 1] exactly as the training environment produces them
    (lane order: N, N, E, E, S, S, W, W).
    """

    densities: List[float] = Field(..., description="per-lane vehicle density [0,1]")
    queues: List[float] = Field(..., description="per-lane halting-queue ratio [0,1]")
    current_phase: int = Field(0, ge=0, le=1, description="0=NS-green, 1=EW-green")
    min_green_elapsed: bool = Field(
        True, description="has the active green met its minimum duration?"
    )

    @field_validator("densities", "queues")
    @classmethod
    def _check_lane_vector(cls, v: List[float]) -> List[float]:
        if len(v) != N_LANES:
            raise ValueError(f"expected {N_LANES} per-lane values, got {len(v)}")
        if any(x < 0.0 or x > 1.0 for x in v):
            raise ValueError("all values must be normalised to [0, 1]")
        return v


class PredictResponse(BaseModel):
    action: int = Field(..., description="green phase to activate next (0 or 1)")
    phase: str = Field(..., description="human-readable phase, e.g. 'NS-green'")
    switch: bool = Field(..., description="True if this differs from current_phase")


class SimulateRequest(BaseModel):
    controller: Literal["rl", "fixed", "actuated", "max_pressure"] = "rl"
    seed: int = 42
    num_seconds: int = Field(
        1000, ge=100, le=3600, description="simulated seconds (shorter = faster response)"
    )


class SimulateResponse(BaseModel):
    controller: str
    seed: int
    num_seconds: int
    avg_wait_s: float
    avg_queue_veh: float
    mean_speed_ms: float
    throughput_veh: float


class ComparisonRow(BaseModel):
    controller: str
    avg_wait_s: float
    avg_timeloss_s: Optional[float] = None
    avg_queue_veh: float
    mean_speed_ms: float
    throughput_veh: float


class MetricsResponse(BaseModel):
    available: bool = Field(..., description="whether a saved evaluation exists")
    results: List[ComparisonRow] = []


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_path: Optional[str] = None
