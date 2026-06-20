"""Reward functions for the traffic-signal RL problem.

sumo-rl computes the reward by calling ``reward_fn(traffic_signal)`` once per
agent decision. ``traffic_signal`` (a ``sumo_rl.TrafficSignal``) exposes live
metrics for the controlled intersection, e.g.:

    * get_accumulated_waiting_time_per_lane() -> seconds, per incoming lane
    * get_lanes_queue()  -> halting vehicles / lane capacity, in [0, 1] per lane
    * get_total_queued() -> raw count of halting vehicles
    * get_pressure()     -> (#veh leaving) - (#veh approaching)

We expose the built-in ``diff-waiting-time`` as the starting point and a custom
``queue_wait`` reward used for the showcase agent.

Why a custom reward?
--------------------
``diff-waiting-time`` rewards the *change* in summed accumulated waiting time
between two decisions. It is a sound objective but has two practical drawbacks
for value-based learning (DQN) on a single intersection:

  1. It is sparse/spiky -- it is ~0 while a queue sits still and only spikes when
     a platoon discharges, which gives the Q-network a high-variance target.
  2. It is unbounded and scenario-scale-dependent, so the same hyperparameters do
     not transfer well between light and heavy demand.

``queue_wait`` keeps the responsive waiting-time term but adds a dense, bounded
queue penalty:

    r_t = (W_{t-1} - W_t)  -  alpha * mean_normalised_queue_t

  * ``(W_{t-1} - W_t)`` (W = summed accumulated wait / 100) is positive when the
    last action *reduced* delay -- this is the part that responds to the action.
  * ``mean_normalised_queue_t`` is the average per-lane queue ratio in [0, 1]; it
    is non-zero on every step there is standing traffic, giving a dense signal
    that discourages the agent from starving a congested approach. Being bounded
    keeps the reward scale stable across demand levels.

``alpha`` trades off "clear the existing delay" against "don't let queues grow".
alpha = 0.5 worked well empirically and is the default.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:  # avoid importing sumo_rl at module import time
    from sumo_rl import TrafficSignal


def queue_wait(ts: "TrafficSignal", alpha: float = 0.5) -> float:
    """Hybrid reward: improvement in waiting time minus a standing-queue penalty.

    Bounded queue term + responsive waiting-time term. See module docstring.
    """
    queue = ts.get_lanes_queue()
    mean_queue = sum(queue) / len(queue) if queue else 0.0

    wait = sum(ts.get_accumulated_waiting_time_per_lane()) / 100.0
    last_wait = getattr(ts, "_smartflow_last_wait", 0.0)
    diff_wait = last_wait - wait
    ts._smartflow_last_wait = wait  # per-signal state, reset each episode by sumo-rl

    return diff_wait - alpha * mean_queue


# Name used to select this reward from the CLI / config.
CUSTOM_REWARD_NAME = "queue_wait"
