"""Environment factory for the single-intersection traffic-signal MDP.

Wraps sumo-rl's ``SumoEnvironment`` in single-agent mode so it is a plain
Gymnasium env that Stable-Baselines3 can train on directly.

This is where the original project's core bug is fixed: in the old pygame-based
RL controller (see git history) the agent's action was ignored and the lights
advanced on a wall-clock timer. Here ``env.step(action)`` is handled
by sumo-rl, which *physically* switches the SUMO traffic-light phase to the one
the agent selected (after enforcing yellow + min-green), and the reward is then
computed from the resulting simulation state. The agent genuinely controls the
intersection and the reward responds to its decisions.

MDP definition
--------------
* State  (19 dims): phase one-hot(2) + min-green flag(1)
                    + per-lane density(8) + per-lane queue(8), all in [0, 1].
* Action (Discrete 2): activate NS-green or EW-green next. sumo-rl inserts the
                       yellow transition and enforces min/max green automatically.
* Reward: ``diff-waiting-time`` (built-in) or ``queue_wait`` (custom, default).
"""
from __future__ import annotations

from typing import Callable, Union

from sumo_rl import SumoEnvironment

from . import config
from .rewards import queue_wait, CUSTOM_REWARD_NAME


def _resolve_reward(reward: Union[str, Callable]) -> Union[str, Callable]:
    """Map a reward name to a callable/built-in string sumo-rl understands."""
    if reward == CUSTOM_REWARD_NAME:
        return queue_wait
    return reward  # built-in name, e.g. "diff-waiting-time", or a callable


def make_env(
    *,
    reward: Union[str, Callable] = CUSTOM_REWARD_NAME,
    use_gui: bool = False,
    fixed_ts: bool = False,
    seed: int = config.SEED,
    out_csv_name: str | None = None,
    num_seconds: int | None = None,
    render_mode: str | None = None,
    net_file: str | None = None,
    route_file: str | None = None,
    additional_sumo_cmd: str | None = None,
) -> SumoEnvironment:
    """Build a single-agent ``SumoEnvironment`` for the single intersection.

    Args:
        reward: reward name (``"queue_wait"``, ``"diff-waiting-time"``, ...) or callable.
        use_gui: launch sumo-gui instead of headless sumo (for demos/recording).
        fixed_ts: if True, SUMO runs its own fixed-time program and ignores
            actions -- used to implement the fixed-time / actuated baselines.
        seed: SUMO RNG seed (controls stochastic insertion) for reproducibility.
        out_csv_name: if set, sumo-rl writes per-step metrics to this CSV stem.
        num_seconds: override episode length (defaults to config.ENV_CONFIG).
        render_mode: e.g. "rgb_array" to grab frames for a GIF.
        net_file: override network file (e.g. the actuated-TL variant for the
            actuated baseline). Defaults to the static-TL network.

    Returns:
        A Gymnasium-compatible single-agent environment.
    """
    env_kwargs = dict(config.ENV_CONFIG)
    if num_seconds is not None:
        env_kwargs["num_seconds"] = num_seconds

    return SumoEnvironment(
        net_file=str(net_file or config.NET_FILE),
        route_file=str(route_file or config.ROUTE_FILE),
        single_agent=True,
        reward_fn=_resolve_reward(reward),
        use_gui=use_gui,
        fixed_ts=fixed_ts,
        sumo_seed=seed,
        out_csv_name=out_csv_name,
        render_mode=render_mode,
        sumo_warnings=False,
        additional_sumo_cmd=additional_sumo_cmd,
        **env_kwargs,
    )
