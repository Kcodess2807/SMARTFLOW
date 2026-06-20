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
from statistics import mean
from typing import Callable, List

os.environ.setdefault("LIBSUMO_AS_TRACI", "1")

from . import config
from .baselines import FixedTimePolicy, ActuatedPolicy, MaxPressurePolicy
from .policy import RLPolicy, load_model, algo_name
from .rollout import run_episode


# --------------------------------------------------------------------------- #
# Evaluation harness
# --------------------------------------------------------------------------- #
def evaluate(model_path: str, seeds: List[int]) -> "pd.DataFrame":
    import pandas as pd

    model = load_model(model_path)
    rl_name = f"RL ({algo_name(model_path)})"

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


def _to_markdown(df) -> str:
    """Render a DataFrame as a GitHub markdown table without extra deps."""
    try:
        return df.to_markdown()  # uses `tabulate` if available
    except ImportError:
        cols = [df.index.name or "controller", *map(str, df.columns)]
        lines = ["| " + " | ".join(cols) + " |",
                 "| " + " | ".join("---" for _ in cols) + " |"]
        for idx, row in df.iterrows():
            lines.append("| " + " | ".join([str(idx), *[str(v) for v in row.values]]) + " |")
        return "\n".join(lines)


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
    rounded = df.round(2)
    rounded.to_csv(csv_path)
    with open(md_path, "w") as f:
        f.write(_to_markdown(rounded))
    print(f"[ok] table -> {csv_path} and {md_path}")
    _plot_comparison(df, str(config.PLOTS_DIR / "comparison.png"))


if __name__ == "__main__":
    main()
