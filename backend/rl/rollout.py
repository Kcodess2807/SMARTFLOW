"""Episode rollout and SUMO tripinfo parsing.

Shared by the evaluation harness (``rl/evaluate.py``) and the API's ``/simulate``
endpoint: run one episode under any ``policy(obs, env) -> int`` controller on the
single intersection and return aggregated metrics. The tripinfo helpers parse
SUMO's per-vehicle output file (the credible source for waiting time / time-loss
/ throughput).
"""
from __future__ import annotations

import xml.etree.ElementTree as ET
from statistics import mean
from typing import Dict, Optional

from . import config
from .env import make_env


def parse_tripinfo(path: str) -> Dict[str, float]:
    """Aggregate per-vehicle metrics from a SUMO tripinfo XML file."""
    waits, losses = [], []
    for trip in ET.parse(path).getroot().findall("tripinfo"):
        waits.append(float(trip.get("waitingTime", 0.0)))
        losses.append(float(trip.get("timeLoss", 0.0)))
    n = len(waits)
    return {
        "throughput_veh": float(n),
        "avg_wait_s": mean(waits) if n else 0.0,
        "avg_timeloss_s": mean(losses) if n else 0.0,
    }


def parse_vehicle_tripinfo(path: str, veh_id: str) -> Optional[Dict[str, float]]:
    """Return a single vehicle's metrics from a SUMO tripinfo XML file, or None."""
    for trip in ET.parse(path).getroot().findall("tripinfo"):
        if trip.get("id") == veh_id:
            return {
                "wait_s": float(trip.get("waitingTime", 0.0)),
                "timeloss_s": float(trip.get("timeLoss", 0.0)),
                "duration_s": float(trip.get("duration", 0.0)),
            }
    return None


def run_episode(policy, seed: int) -> Dict[str, float]:
    """Run one full episode under ``policy`` and return aggregated metrics.

    The controller picks the ``fixed_ts``/``net_file`` of the env via its
    attributes, so fixed-time/actuated baselines and the RL agent all run through
    this same harness on identical scenarios.
    """
    tripinfo = str(config.LOG_DIR / f"tripinfo_{policy.name.replace(' ', '_')}_{seed}.xml")
    env = make_env(
        reward="queue_wait",
        fixed_ts=getattr(policy, "fixed_ts", False),
        net_file=getattr(policy, "net_file", None),
        seed=seed,
        additional_sumo_cmd=f"--tripinfo-output {tripinfo}",
    )
    if hasattr(policy, "reset"):
        policy.reset()

    obs, _ = env.reset()
    queues, speeds = [], []
    done = False
    while not done:
        action = policy(obs, env)
        obs, _, terminated, truncated, info = env.step(action)
        queues.append(info["system_total_stopped"])
        speeds.append(info["system_mean_speed"])
        done = terminated or truncated
    env.close()

    trip = parse_tripinfo(tripinfo)
    return {
        "avg_wait_s": trip["avg_wait_s"],
        "avg_timeloss_s": trip["avg_timeloss_s"],
        "avg_queue_veh": mean(queues) if queues else 0.0,
        "mean_speed_ms": mean(speeds) if speeds else 0.0,
        "throughput_veh": trip["throughput_veh"],
    }
