"""Trained-policy loading and the RL policy adapter.

Centralises two things that were previously copy-pasted across train/evaluate/
record_gif/emergency_demo and the API:

  * ``load_model`` -- load a saved Stable-Baselines3 model, choosing the
    algorithm (DQN/PPO) from the filename.
  * ``RLPolicy`` -- adapt a trained model to the same ``policy(obs, env) -> int``
    interface the non-learning baselines use, so it drops into the shared
    rollout/evaluation harness.

Deliberately free of heavy or reporting imports (SB3 is imported lazily inside
``load_model``), so the API and the demo scripts can depend on this without
pulling in ``evaluate.py``.
"""
from __future__ import annotations

import os


def algo_name(path: str) -> str:
    """Return 'PPO' or 'DQN' for a model path (used for labels/logging)."""
    return "PPO" if os.path.basename(path).lower().startswith("ppo") else "DQN"


def load_model(path: str):
    """Load a saved SB3 model, choosing DQN/PPO from the filename prefix."""
    from stable_baselines3 import DQN, PPO  # lazy: avoid torch import at module load

    cls = PPO if algo_name(path) == "PPO" else DQN
    return cls.load(path)


class RLPolicy:
    """Adapt a trained SB3 model to the baseline ``policy(obs, env)`` interface."""

    def __init__(self, model, name: str = "RL"):
        self.model = model
        self.name = name
        self.fixed_ts = False
        self.net_file = None

    def __call__(self, obs, env) -> int:  # noqa: ARG002 - env unused, parity with baselines
        action, _ = self.model.predict(obs, deterministic=True)
        return int(action)
