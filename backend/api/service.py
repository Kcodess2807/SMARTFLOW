"""Service layer: model loading, inference, and simulation.

Keeps all ML/SUMO concerns out of the HTTP layer (``main.py``). The route
handlers call these functions and never touch Stable-Baselines3 or traci
directly.
"""
from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import List, Optional

import numpy as np

from rl import config
from .schemas import PHASE_LABELS, TrafficState

logger = logging.getLogger("smartflow.service")

def _default_model_path() -> str:
    """Prefer an explicit env var, then the freshly trained model, then the
    published model shipped in results/ (so the API works without training)."""
    if os.environ.get("SMARTFLOW_MODEL"):
        return os.environ["SMARTFLOW_MODEL"]
    trained = config.MODELS_DIR / "dqn_v1.zip"
    published = config.BACKEND_DIR / "results" / "dqn_v1.zip"
    return str(trained if trained.exists() else published)


DEFAULT_MODEL_PATH = _default_model_path()


class PolicyService:
    """Loads the trained policy once and serves predictions/simulations."""

    def __init__(self, model_path: str = DEFAULT_MODEL_PATH):
        self.model_path = model_path
        self.model = None

    # ----- lifecycle ----------------------------------------------------- #
    def load(self) -> None:
        """Load the SB3 model if the file exists; stay degraded otherwise."""
        if not Path(self.model_path).exists():
            logger.warning("model file not found at %s; /predict will 503", self.model_path)
            return
        from stable_baselines3 import DQN, PPO  # lazy: avoid torch import at module load

        cls = PPO if Path(self.model_path).name.lower().startswith("ppo") else DQN
        self.model = cls.load(self.model_path)
        logger.info("loaded %s model from %s", cls.__name__, self.model_path)

    @property
    def ready(self) -> bool:
        return self.model is not None

    # ----- inference ----------------------------------------------------- #
    @staticmethod
    def _state_to_obs(state: TrafficState) -> np.ndarray:
        phase_one_hot = [1.0 if state.current_phase == i else 0.0 for i in range(2)]
        min_green = [1.0 if state.min_green_elapsed else 0.0]
        obs = phase_one_hot + min_green + list(state.densities) + list(state.queues)
        return np.asarray(obs, dtype=np.float32)

    def predict(self, state: TrafficState) -> dict:
        """Return the agent's chosen green phase for a traffic snapshot."""
        if not self.ready:
            raise RuntimeError("model not loaded")
        obs = self._state_to_obs(state)
        action, _ = self.model.predict(obs, deterministic=True)
        action = int(action)
        return {
            "action": action,
            "phase": PHASE_LABELS.get(action, f"phase-{action}"),
            "switch": action != state.current_phase,
        }

    # ----- simulation ---------------------------------------------------- #
    def simulate(self, controller: str, seed: int, num_seconds: int) -> dict:
        """Run one episode under the chosen controller and return real metrics."""
        # Imported here so the heavy SUMO/eval stack loads on demand, not at boot.
        from rl.evaluate import run_episode
        from rl.baselines import FixedTimePolicy, ActuatedPolicy, MaxPressurePolicy
        from rl.evaluate import RLPolicy

        if controller == "rl":
            if not self.ready:
                raise RuntimeError("model not loaded")
            policy = RLPolicy(self.model, "RL")
        elif controller == "fixed":
            policy = FixedTimePolicy()
        elif controller == "actuated":
            policy = ActuatedPolicy()
        elif controller == "max_pressure":
            policy = MaxPressurePolicy()
        else:  # pragma: no cover - validated by pydantic
            raise ValueError(f"unknown controller {controller!r}")

        # Temporarily shorten the episode for a responsive API call.
        original = config.ENV_CONFIG["num_seconds"]
        config.ENV_CONFIG["num_seconds"] = num_seconds
        try:
            m = run_episode(policy, seed)
        finally:
            config.ENV_CONFIG["num_seconds"] = original

        return {
            "controller": controller,
            "seed": seed,
            "num_seconds": num_seconds,
            "avg_wait_s": round(m["avg_wait_s"], 2),
            "avg_queue_veh": round(m["avg_queue_veh"], 2),
            "mean_speed_ms": round(m["mean_speed_ms"], 2),
            "throughput_veh": round(m["throughput_veh"], 2),
        }


def load_saved_comparison() -> Optional[List[dict]]:
    """Read the saved RL-vs-baselines table (from evaluate.py), if present."""
    csv_path = config.ARTIFACTS_DIR / "comparison.csv"
    if not csv_path.exists():
        return None
    import csv

    rows: List[dict] = []
    with open(csv_path, newline="") as f:
        for r in csv.DictReader(f):
            rows.append(
                {
                    "controller": r["controller"],
                    "avg_wait_s": float(r["avg_wait_s"]),
                    "avg_timeloss_s": float(r.get("avg_timeloss_s", 0) or 0),
                    "avg_queue_veh": float(r["avg_queue_veh"]),
                    "mean_speed_ms": float(r["mean_speed_ms"]),
                    "throughput_veh": float(r["throughput_veh"]),
                }
            )
    return rows
