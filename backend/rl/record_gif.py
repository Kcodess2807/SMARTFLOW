"""Record a short GIF of the trained agent controlling the SUMO intersection.

Drives sumo-gui through traci and captures a screenshot each decision step, then
assembles the frames into a GIF. Uses sumo-gui (not libsumo), so it needs a
desktop/GUI session -- this is a demo/recording tool, not part of training.

Usage (from backend/, project venv):
    python -m rl.record_gif --model artifacts/models/dqn_v1.zip --steps 150
"""
from __future__ import annotations

import argparse
import os

# Must NOT use libsumo here: GUI screenshots require sumo-gui.
os.environ.pop("LIBSUMO_AS_TRACI", None)
os.environ["LIBSUMO_AS_TRACI"] = "0"

import glob

from stable_baselines3 import DQN, PPO

from . import config
from .env import make_env

DEFAULT_VIEW = "View #0"


def _load_model(path: str):
    name = os.path.basename(path).lower()
    return (PPO if name.startswith("ppo") else DQN).load(path)


def record(model_path: str, steps: int, out_gif: str, fps: int = 10) -> None:
    import imageio.v2 as imageio

    frames_dir = config.ARTIFACTS_DIR / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    for old in glob.glob(str(frames_dir / "*.png")):
        os.remove(old)

    model = _load_model(model_path)
    env = make_env(reward="queue_wait", use_gui=True, seed=config.SEED, num_seconds=steps * config.ENV_CONFIG["delta_time"])
    obs, _ = env.reset()

    try:
        env.sumo.gui.setSchema(DEFAULT_VIEW, "real world")
        env.sumo.gui.setZoom(DEFAULT_VIEW, 350)
    except Exception:  # noqa: BLE001 - cosmetic only
        pass

    saved = []
    for i in range(steps):
        frame_path = str(frames_dir / f"frame_{i:04d}.png")
        try:
            env.sumo.gui.screenshot(DEFAULT_VIEW, frame_path)  # written on next step
        except Exception as exc:  # noqa: BLE001
            print(f"[warn] screenshot failed ({exc}); aborting GIF capture")
            break
        action, _ = model.predict(obs, deterministic=True)
        obs, _, term, trunc, _ = env.step(int(action))
        if os.path.exists(frame_path):
            saved.append(frame_path)
        if term or trunc:
            break
    env.close()

    if not saved:
        print("[warn] no frames captured; GIF not created (needs a GUI session)")
        return

    images = [imageio.imread(p) for p in saved]
    imageio.mimsave(out_gif, images, fps=fps, loop=0)
    print(f"[ok] GIF ({len(images)} frames) -> {out_gif}")


def main() -> None:
    p = argparse.ArgumentParser(description="Record a GIF of the trained agent.")
    p.add_argument("--model", default=str(config.MODELS_DIR / "dqn_v1.zip"))
    p.add_argument("--steps", type=int, default=150)
    p.add_argument("--out", default=str(config.PLOTS_DIR / "agent_demo.gif"))
    p.add_argument("--fps", type=int, default=10)
    args = p.parse_args()
    record(args.model, args.steps, args.out, args.fps)


if __name__ == "__main__":
    main()
