"""Train a traffic-signal control agent on the single-intersection SUMO env.

One command, reproducible (fixed seed), TensorBoard logging, and an automatic
learning-curve plot (reward vs. training steps).

Examples
--------
    # from the backend/ directory, using the project venv
    python -m rl.train --algo dqn --timesteps 100000
    python -m rl.train --algo ppo --timesteps 100000 --tag run2

TensorBoard:
    tensorboard --logdir backend/artifacts/logs
"""
from __future__ import annotations

import argparse
import os

# Enable libsumo (~8x faster than pure-python traci) for headless training.
# Must be set before sumo_rl is imported. Harmless if libsumo is unavailable.
os.environ.setdefault("LIBSUMO_AS_TRACI", "1")

import numpy as np
from stable_baselines3 import DQN, PPO
from stable_baselines3.common.monitor import Monitor
from stable_baselines3.common.utils import set_random_seed

from . import config
from .env import make_env

ALGOS = {"dqn": DQN, "ppo": PPO}
PARAMS = {"dqn": config.DQN_PARAMS, "ppo": config.PPO_PARAMS}


def _plot_learning_curve(monitor_csv: str, out_png: str, title: str) -> None:
    """Plot per-episode reward (and a moving average) vs. cumulative timesteps."""
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import pandas as pd

    # Monitor CSV: first line is a JSON header comment, then r,l,t columns.
    df = pd.read_csv(monitor_csv, skiprows=1)
    if df.empty:
        print(f"[warn] no episodes logged in {monitor_csv}; skipping plot")
        return
    steps = df["l"].cumsum()
    rewards = df["r"]
    window = max(1, min(10, len(rewards) // 3))
    rolling = rewards.rolling(window=window, min_periods=1).mean()

    plt.figure(figsize=(8, 5))
    plt.plot(steps, rewards, alpha=0.3, label="episode reward")
    plt.plot(steps, rolling, linewidth=2, label=f"rolling mean (w={window})")
    plt.xlabel("training timesteps")
    plt.ylabel("episode reward")
    plt.title(title)
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(out_png, dpi=120)
    plt.close()
    print(f"[ok] learning curve -> {out_png}")


def train(
    algo: str,
    timesteps: int,
    reward: str,
    seed: int,
    tag: str,
) -> str:
    """Train one agent and return the path to the saved model."""
    algo = algo.lower()
    if algo not in ALGOS:
        raise ValueError(f"--algo must be one of {list(ALGOS)}")

    run_name = f"{algo}_{tag}" if tag else algo
    set_random_seed(seed)

    monitor_path = str(config.LOG_DIR / f"{run_name}_monitor.csv")
    env = Monitor(make_env(reward=reward, seed=seed), filename=monitor_path)

    model_cls = ALGOS[algo]
    model = model_cls(
        "MlpPolicy",
        env,
        seed=seed,
        verbose=1,
        tensorboard_log=str(config.LOG_DIR),
        **PARAMS[algo],
    )

    print(f"[train] {run_name}: {timesteps} timesteps, reward={reward}, seed={seed}")
    model.learn(total_timesteps=timesteps, tb_log_name=run_name, progress_bar=True)

    model_path = str(config.MODELS_DIR / f"{run_name}.zip")
    model.save(model_path)
    env.close()
    print(f"[ok] model -> {model_path}")

    _plot_learning_curve(
        monitor_path,
        str(config.PLOTS_DIR / f"{run_name}_learning_curve.png"),
        title=f"{algo.upper()} learning curve (reward={reward})",
    )
    return model_path


def main() -> None:
    p = argparse.ArgumentParser(description="Train a SUMO traffic-signal RL agent.")
    p.add_argument("--algo", default="dqn", choices=list(ALGOS))
    p.add_argument("--timesteps", type=int, default=config.DEFAULT_TOTAL_TIMESTEPS)
    p.add_argument("--reward", default="queue_wait",
                   help="reward name: queue_wait | diff-waiting-time | queue | pressure | average-speed")
    p.add_argument("--seed", type=int, default=config.SEED)
    p.add_argument("--tag", default="", help="optional suffix for the run/model name")
    args = p.parse_args()

    np.random.seed(args.seed)
    train(args.algo, args.timesteps, args.reward, args.seed, args.tag)


if __name__ == "__main__":
    main()
