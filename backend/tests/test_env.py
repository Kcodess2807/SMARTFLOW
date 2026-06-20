"""Slow integration test: the SUMO env actually runs and responds to actions.

Requires SUMO + SUMO_HOME. Run explicitly with:
    python -m pytest tests/test_env.py -q -m slow
"""
from __future__ import annotations

import os

import numpy as np
import pytest

os.environ.setdefault("LIBSUMO_AS_TRACI", "1")

pytestmark = pytest.mark.slow


def test_env_obs_action_shapes_and_control():
    from rl.env import make_env

    env = make_env(reward="queue_wait", seed=1, num_seconds=120)
    obs, _ = env.reset()
    assert env.observation_space.shape == (19,)
    assert env.action_space.n == 2
    assert np.asarray(obs).shape == (19,)

    # Drive alternating actions; the controlled signal should change phase,
    # proving the action is applied (the core bug fix vs. the legacy env).
    ts = env.traffic_signals[env.ts_ids[0]]
    phases_seen = set()
    for i in range(20):
        env.step(i % 2)
        phases_seen.add(ts.green_phase)
    env.close()
    assert len(phases_seen) >= 2
