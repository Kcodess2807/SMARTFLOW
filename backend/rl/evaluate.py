"""Evaluate the trained RL agent against non-learning baselines.

Runs the RL policy and each baseline (fixed-time, actuated, max-pressure) over
the *same* traffic scenario and seed, then reports real metrics:

    * avg waiting time per vehicle (s)   - SUMO tripinfo (lower is better)
    * avg time loss per vehicle  (s)     - SUMO tripinfo (lower is better)
    * avg queue length (halted veh)      - time-averaged network state
    * mean speed (m/s)                   - time-averaged network state
    * throughput (vehicles completed)    - SUMO tripinfo count (higher is better)

Outputs a markdown + CSV comparison table and a grouped bar-chart figure.

Usage (from backend/, project venv):
    python -m rl.evaluate --model artifacts/models/dqn_v1.zip
    python -m rl.evaluate --model artifacts/models/dqn_v1.zip --seeds 42 7 123
"""
from __future__ import annotations

import argparse
import os
import xml.etree.ElementTree as ET
from statistics import mean
from typing import Callable, Dict, List

os.environ.setdefault("LIBSUMO_AS_TRACI", "1")

from stable_baselines3 import DQN, PPO

from . import config
from .env import make_env
from .baselines import FixedTimePolicy, ActuatedPolicy, MaxPressurePolicy


# --------------------------------------------------------------------------- #
# RL policy wrapper (parity with the baseline policy interface)
# --------------------------------------------------------------------------- #
class RLPolicy:
    def __init__(self, model, name: str):
        self.model = model
        self.name = name
        self.fixed_ts = False
        self.net_file = None

    def __call__(self, obs, env) -> int:  # noqa: ARG002
        action, _ = self.model.predict(obs, deterministic=True)
        return int(action)


def _load_model(path: str):
    """Load a saved SB3 model, picking DQN/PPO by filename."""
    name = os.path.basename(path).lower()
    cls = PPO if name.startswith("ppo") else DQN
    return cls.load(path)


# --------------------------------------------------------------------------- #
# Evaluation harness
# --------------------------------------------------------------------------- #
def _parse_tripinfo(path: str) -> Dict[str, float]:
    """Aggregate per-vehicle metrics from a SUMO tripinfo XML file."""
    tree = ET.parse(path)
    waits, losses = [], []
    for trip in tree.getroot().findall("tripinfo"):
        waits.append(float(trip.get("waitingTime", 0.0)))
        losses.append(float(trip.get("timeLoss", 0.0)))
    n = len(waits)
    return {
        "throughput_veh": float(n),
        "avg_wait_s": mean(waits) if n else 0.0,
        "avg_timeloss_s": mean(losses) if n else 0.0,
    }


def run_episode(policy, seed: int) -> Dict[str, float]:
    """Run one full episode under ``policy`` and return aggregated metrics."""
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

    trip = _parse_tripinfo(tripinfo)
    return {
        "avg_wait_s": trip["avg_wait_s"],
        "avg_timeloss_s": trip["avg_timeloss_s"],
        "avg_queue_veh": mean(queues) if queues else 0.0,
        "mean_speed_ms": mean(speeds) if speeds else 0.0,
        "throughput_veh": trip["throughput_veh"],
    }


def evaluate(model_path: str, seeds: List[int]) -> "pd.DataFrame":
    import pandas as pd

    model = _load_model(model_path)
    rl_name = "RL (" + ("PPO" if os.path.basename(model_path).lower().startswith("ppo") else "DQN") + ")"

    # A fresh policy instance is built for every seed so any per-env caching
    # (e.g. max-pressure's phase->lane map) is rebuilt against the new env.
    policy_factories: List[Callable[[], object]] = [
        FixedTimePolicy,
        ActuatedPolicy,
        MaxPressurePolicy,
        lambda: RLPolicy(model, rl_name),
    ]

    rows = []
    for factory in policy_factories:
        name = factory().name
        per_seed = []
        for seed in seeds:
            metrics = run_episode(factory(), seed)
            per_seed.append(metrics)
            print(f"  {name:<14} seed={seed}: "
                  f"wait={metrics['avg_wait_s']:.1f}s queue={metrics['avg_queue_veh']:.1f} "
                  f"thru={metrics['throughput_veh']:.0f}")
        agg = {k: mean(d[k] for d in per_seed) for k in per_seed[0]}
        agg["controller"] = name
        rows.append(agg)

    df = pd.DataFrame(rows).set_index("controller")
    df = df[["avg_wait_s", "avg_timeloss_s", "avg_queue_veh", "mean_speed_ms", "throughput_veh"]]
    return df


def _plot_comparison(df, out_png: str) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    metrics = [
        ("avg_wait_s", "Avg waiting time (s)\nlower is better"),
        ("avg_queue_veh", "Avg queue (veh)\nlower is better"),
        ("mean_speed_ms", "Mean speed (m/s)\nhigher is better"),
        ("throughput_veh", "Throughput (veh)\nhigher is better"),
    ]
    fig, axes = plt.subplots(1, len(metrics), figsize=(16, 4.5))
    colors = ["#9aa5b1", "#7b8794", "#52606d", "#2bb673"]
    for ax, (col, title) in zip(axes, metrics):
        vals = df[col]
        ax.bar(range(len(vals)), vals.values, color=colors)
        ax.set_xticks(range(len(vals)))
        ax.set_xticklabels(vals.index, rotation=30, ha="right", fontsize=8)
        ax.set_title(title, fontsize=10)
        ax.grid(axis="y", alpha=0.3)
    fig.suptitle("RL agent vs. baselines (single intersection, identical scenario)", fontsize=12)
    fig.tight_layout()
    fig.savefig(out_png, dpi=120)
    plt.close(fig)
    print(f"[ok] comparison plot -> {out_png}")


def main() -> None:
    p = argparse.ArgumentParser(description="Evaluate RL agent vs. baselines.")
    p.add_argument("--model", default=str(config.MODELS_DIR / "dqn_v1.zip"))
    p.add_argument("--seeds", type=int, nargs="+", default=[config.SEED])
    args = p.parse_args()

    print(f"[eval] model={args.model} seeds={args.seeds}")
    df = evaluate(args.model, args.seeds)

    # Console + markdown + CSV + plot
    print("\n=== Results (mean over seeds) ===")
    print(df.round(2).to_string())
    md_path = config.ARTIFACTS_DIR / "comparison.md"
    csv_path = config.ARTIFACTS_DIR / "comparison.csv"
    df.round(2).to_csv(csv_path)
    with open(md_path, "w") as f:
        f.write(df.round(2).to_markdown())
    print(f"[ok] table -> {csv_path} and {md_path}")
    _plot_comparison(df, str(config.PLOTS_DIR / "comparison.png"))


if __name__ == "__main__":
    main()
