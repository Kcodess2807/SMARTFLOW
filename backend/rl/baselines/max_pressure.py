"""Max-pressure baseline.

A well-known online heuristic for traffic-signal control. At every decision
point it activates the phase with the greatest "pressure" -- here, the most
queued (halting) vehicles waiting on the approaches that phase would serve.
Unlike fixed-time/actuated it genuinely reacts to the current demand split, so
it is the heuristic the learned policy must beat to be interesting.

For an isolated intersection with free-flowing exits we use the standard
simplification pressure(phase) = sum of upstream queue on the lanes the phase
serves (downstream queues stay ~0), computed live from SUMO each step.
"""
from __future__ import annotations

from typing import Dict, List

from ..signal_utils import build_phase_lane_map


class MaxPressurePolicy:
    """Greedy max-pressure controller (acts through the env, fixed_ts=False)."""

    name = "Max-pressure"
    fixed_ts = False
    net_file = None  # default static network; TL is driven by our actions

    def __init__(self) -> None:
        self._phase_lanes: Dict[int, List[str]] | None = None

    def __call__(self, obs, env) -> int:  # noqa: ARG002 - obs unused; reads SUMO live
        if self._phase_lanes is None:
            self._phase_lanes = build_phase_lane_map(env)

        halting = env.sumo.lane.getLastStepHaltingNumber
        pressures = {
            phase: sum(halting(lane) for lane in lanes)
            for phase, lanes in self._phase_lanes.items()
        }
        # Activate the highest-pressure phase (ties -> lowest index, stable).
        return max(pressures, key=lambda p: (pressures[p], -p))

    def reset(self) -> None:
        """Rebuild the phase map on the next call (after env recreation)."""
        self._phase_lanes = None
