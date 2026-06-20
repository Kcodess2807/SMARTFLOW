"""Fast unit tests for the extracted policy/rollout helpers (no SUMO required)."""
from __future__ import annotations

from rl.policy import algo_name, RLPolicy
from rl.rollout import parse_tripinfo, parse_vehicle_tripinfo


# --------------------------------------------------------------------------- #
# policy.algo_name / RLPolicy
# --------------------------------------------------------------------------- #
def test_algo_name_picks_ppo_or_dqn():
    assert algo_name("artifacts/models/ppo_v1.zip") == "PPO"
    assert algo_name("artifacts/models/dqn_v1.zip") == "DQN"
    assert algo_name("/abs/PPO_RUN.zip") == "PPO"  # case-insensitive


class _StubModel:
    def predict(self, obs, deterministic=True):
        return 1, None


def test_rlpolicy_returns_int_action_and_has_baseline_attrs():
    p = RLPolicy(_StubModel(), "RL")
    assert p(obs=[0.0] * 19, env=None) == 1
    assert p.fixed_ts is False and p.net_file is None and p.name == "RL"


# --------------------------------------------------------------------------- #
# rollout tripinfo parsing
# --------------------------------------------------------------------------- #
_TRIPINFO_XML = """<?xml version="1.0"?>
<tripinfos>
  <tripinfo id="v0" waitingTime="10.0" timeLoss="20.0" duration="100.0"/>
  <tripinfo id="ev0" waitingTime="0.0"  timeLoss="1.0"  duration="40.0"/>
  <tripinfo id="v1" waitingTime="20.0" timeLoss="30.0" duration="120.0"/>
</tripinfos>
"""


def _write(tmp_path):
    p = tmp_path / "tripinfo.xml"
    p.write_text(_TRIPINFO_XML)
    return str(p)


def test_parse_tripinfo_aggregate(tmp_path):
    agg = parse_tripinfo(_write(tmp_path))
    assert agg["throughput_veh"] == 3.0
    assert agg["avg_wait_s"] == (10.0 + 0.0 + 20.0) / 3
    assert agg["avg_timeloss_s"] == (20.0 + 1.0 + 30.0) / 3


def test_parse_vehicle_tripinfo_single(tmp_path):
    ev = parse_vehicle_tripinfo(_write(tmp_path), "ev0")
    assert ev == {"wait_s": 0.0, "timeloss_s": 1.0, "duration_s": 40.0}


def test_parse_vehicle_tripinfo_missing_returns_none(tmp_path):
    assert parse_vehicle_tripinfo(_write(tmp_path), "nope") is None
