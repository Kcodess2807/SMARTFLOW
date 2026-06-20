"""Demonstrate emergency-vehicle preemption with real numbers.

Runs the emergency scenario twice on an identical seed -- once with the base
controller alone, once wrapped with EmergencyPreemptionController -- and reports
the emergency vehicle's waiting time and time loss in each case. Preemption
should cut the emergency vehicle's delay sharply.

Usage (from backend/, project venv):
    python -m rl.emergency_demo                 # base = max-pressure (no model needed)
    python -m rl.emergency_demo --model artifacts/models/dqn_v1.zip   # base = RL
"""
from __future__ import annotations

import argparse
import os
import xml.etree.ElementTree as ET
from typing import Dict, Optional

os.environ.setdefault("LIBSUMO_AS_TRACI", "1")

from . import config
from .env import make_env
from .baselines import MaxPressurePolicy
from .preemption import EmergencyPreemptionController

EV_ID = "ev0"
NUM_SECONDS = 700


def _ev_metrics(tripinfo_path: str, veh_id: str = EV_ID) -> Optional[Dict[str, float]]:
    root = ET.parse(tripinfo_path).getroot()
    for trip in root.findall("tripinfo"):
        if trip.get("id") == veh_id:
            return {
                "wait_s": float(trip.get("waitingTime", 0.0)),
                "timeloss_s": float(trip.get("timeLoss", 0.0)),
                "duration_s": float(trip.get("duration", 0.0)),
            }
    return None


def _run(policy, seed: int, tag: str) -> Dict[str, float]:
    tripinfo = str(config.LOG_DIR / f"emergency_{tag}_{seed}.xml")
    env = make_env(
        reward="queue_wait",
        route_file=str(config.EMERGENCY_ROUTE_FILE),
        seed=seed,
        num_seconds=NUM_SECONDS,
        additional_sumo_cmd=f"--tripinfo-output {tripinfo}",
    )
    if hasattr(policy, "reset"):
        policy.reset()
    obs, _ = env.reset()
    done = False
    while not done:
        obs, _, term, trunc, _ = env.step(policy(obs, env))
        done = term or trunc
    env.close()
    metrics = _ev_metrics(tripinfo) or {"wait_s": float("nan"), "timeloss_s": float("nan")}
    metrics["preemptions"] = float(getattr(policy, "preemption_steps", 0))
    return metrics


def _make_base(model_path: Optional[str]):
    if model_path:
        from stable_baselines3 import DQN, PPO
        from .evaluate import RLPolicy

        cls = PPO if os.path.basename(model_path).lower().startswith("ppo") else DQN
        return RLPolicy(cls.load(model_path), "RL"), "RL"
    return MaxPressurePolicy(), "max-pressure"


def main() -> None:
    p = argparse.ArgumentParser(description="Emergency preemption demo.")
    p.add_argument("--model", default=None, help="optional SB3 model for the base controller")
    p.add_argument("--seed", type=int, default=config.SEED)
    args = p.parse_args()

    base, base_name = _make_base(args.model)
    print(f"[demo] base controller = {base_name}, seed={args.seed}\n")

    without = _run(base, args.seed, "base")
    base2, _ = _make_base(args.model)  # fresh base for the wrapped run
    with_preempt = _run(EmergencyPreemptionController(base2), args.seed, "preempt")

    print(f"Emergency vehicle ({EV_ID}) delay:")
    print(f"  {base_name:<22} wait={without['wait_s']:6.1f}s  timeloss={without['timeloss_s']:6.1f}s")
    print(f"  {base_name + ' + preemption':<22} wait={with_preempt['wait_s']:6.1f}s  "
          f"timeloss={with_preempt['timeloss_s']:6.1f}s  (overrides={with_preempt['preemptions']:.0f})")
    if without["wait_s"] > 0:
        cut = 100 * (without["wait_s"] - with_preempt["wait_s"]) / without["wait_s"]
        print(f"\n  -> preemption cut the emergency vehicle's waiting time by {cut:.0f}%")


if __name__ == "__main__":
    main()
