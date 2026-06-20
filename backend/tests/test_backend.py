"""Fast unit tests for the SmartFlow backend (no SUMO required).

Run from backend/ with the project venv:
    python -m pytest tests/ -q

These cover the pure logic: reward maths, API input validation, and the
state->observation construction. The SUMO env itself is exercised by the smoke
test in tests/test_env.py (marked slow).
"""
from __future__ import annotations

from types import SimpleNamespace

import pytest

from rl.rewards import queue_wait
from api.schemas import TrafficState
from api.service import PolicyService


# --------------------------------------------------------------------------- #
# Reward function
# --------------------------------------------------------------------------- #
def _fake_ts(queue, wait):
    """Minimal stand-in for a sumo_rl.TrafficSignal."""
    return SimpleNamespace(
        get_lanes_queue=lambda: list(queue),
        get_accumulated_waiting_time_per_lane=lambda: list(wait),
    )


def test_queue_wait_penalises_standing_queue():
    # No waiting-time change; reward should be -alpha * mean(queue).
    ts = _fake_ts(queue=[0.5, 0.5, 0.5, 0.5], wait=[0.0, 0.0, 0.0, 0.0])
    r = queue_wait(ts, alpha=0.5)
    assert r == pytest.approx(-0.5 * 0.5)


def test_queue_wait_rewards_reduced_waiting():
    ts = _fake_ts(queue=[0.0, 0.0], wait=[0.0, 0.0])
    ts._smartflow_last_wait = 5.0  # previous wait was higher -> improvement
    r = queue_wait(ts, alpha=0.5)
    # diff = 5.0 - 0.0 ; queue term = 0  -> positive reward
    assert r == pytest.approx(5.0)


def test_queue_wait_tracks_state_across_calls():
    ts = _fake_ts(queue=[0.0], wait=[200.0])  # 200/100 = 2.0 scaled
    queue_wait(ts)  # first call sets last_wait = 2.0
    assert ts._smartflow_last_wait == pytest.approx(2.0)


# --------------------------------------------------------------------------- #
# API input validation
# --------------------------------------------------------------------------- #
def test_traffic_state_valid():
    s = TrafficState(densities=[0.1] * 8, queues=[0.2] * 8, current_phase=1)
    assert s.current_phase == 1


def test_traffic_state_rejects_wrong_lane_count():
    with pytest.raises(ValueError):
        TrafficState(densities=[0.1] * 5, queues=[0.2] * 8)


def test_traffic_state_rejects_out_of_range():
    with pytest.raises(ValueError):
        TrafficState(densities=[1.5] * 8, queues=[0.2] * 8)


def test_traffic_state_rejects_bad_phase():
    with pytest.raises(ValueError):
        TrafficState(densities=[0.1] * 8, queues=[0.2] * 8, current_phase=3)


# --------------------------------------------------------------------------- #
# State -> observation construction (must match the env's 19-dim layout)
# --------------------------------------------------------------------------- #
def test_state_to_obs_layout():
    state = TrafficState(
        densities=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
        queues=[0.0] * 8,
        current_phase=1,
        min_green_elapsed=True,
    )
    obs = PolicyService._state_to_obs(state)
    assert obs.shape == (19,)
    # phase one-hot for phase 1 -> [0, 1], then min-green flag 1
    assert list(obs[:3]) == [0.0, 1.0, 1.0]
    assert list(obs[3:11]) == pytest.approx(state.densities)
    assert list(obs[11:19]) == pytest.approx(state.queues)
