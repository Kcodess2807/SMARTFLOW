"""Shared helpers for reasoning about the traffic light's phases and lanes."""
from __future__ import annotations

from typing import Dict, List


def build_phase_lane_map(env) -> Dict[int, List[str]]:
    """Map each green-phase index -> the incoming lanes it serves green.

    Works for any single-intersection sumo-rl env by reading the TL's controlled
    links and the green-phase signal strings, so it does not hardcode the
    NS/EW phase semantics.
    """
    ts = env.traffic_signals[env.ts_ids[0]]
    links = env.sumo.trafficlight.getControlledLinks(ts.id)  # per signal index
    phase_lanes: Dict[int, List[str]] = {}
    for i, phase in enumerate(ts.green_phases):
        served: List[str] = []
        for j, signal in enumerate(phase.state):
            if signal in ("G", "g") and j < len(links) and links[j]:
                served.append(links[j][0][0])  # incoming lane of this link
        phase_lanes[i] = list(dict.fromkeys(served))  # dedupe, keep order
    return phase_lanes
