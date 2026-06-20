"""Emergency-vehicle signal preemption.

Wraps any base controller (RL agent, fixed-time, ...) with priority logic: when
an emergency vehicle is detected approaching the intersection, the wrapper
overrides the base decision and holds/serves the green for that approach until
the vehicle has cleared. Otherwise the base controller runs normally.

Hardware tie-in
---------------
In the physical system (see /hardware), an ESP32 + RFID reader detects a tagged
emergency vehicle and raises a signal over USB serial. That serial event is the
real-world trigger for exactly this override. Here, the SUMO "emergency" vehicle
class plays the role of the RFID-tagged vehicle, so the same preemption logic can
be developed and validated in the digital twin before deployment.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from .signal_utils import build_phase_lane_map


class EmergencyPreemptionController:
    """Base controller + emergency-vehicle green priority."""

    name = "RL + preemption"
    fixed_ts = False
    net_file = None

    def __init__(self, base_policy, emergency_vclass: str = "emergency"):
        self.base = base_policy
        self.emergency_vclass = emergency_vclass
        self._phase_lanes: Optional[Dict[int, List[str]]] = None
        self.preemption_steps = 0  # how many decisions were overridden

    def reset(self) -> None:
        self._phase_lanes = None
        self.preemption_steps = 0
        if hasattr(self.base, "reset"):
            self.base.reset()

    def _emergency_phase(self, env) -> Optional[int]:
        """Return the green phase serving an approaching emergency vehicle, if any."""
        sumo = env.sumo
        for phase, lanes in self._phase_lanes.items():
            for lane in lanes:
                for veh in sumo.lane.getLastStepVehicleIDs(lane):
                    if sumo.vehicle.getVehicleClass(veh) == self.emergency_vclass:
                        return phase
        return None

    def __call__(self, obs, env) -> int:
        if self._phase_lanes is None:
            self._phase_lanes = build_phase_lane_map(env)

        phase = self._emergency_phase(env)
        if phase is not None:
            self.preemption_steps += 1
            return phase  # preempt: serve the emergency approach
        return self.base(obs, env)
