"""Non-learning baseline controllers for benchmarking the RL agent.

Every baseline is a callable ``policy(obs, env) -> int`` so it can be dropped
into the same evaluation harness (``rl/evaluate.py``) as the trained agent and
measured on identical traffic scenarios.

  * fixed-time  : SUMO runs the static cyclic program (actions ignored).
  * actuated    : SUMO's built-in gap-based actuated control (actions ignored).
  * max-pressure: greedy heuristic that serves the phase with the most pending
                  demand, decided online from live lane queues.
"""
from .fixed_time import FixedTimePolicy
from .actuated import ActuatedPolicy
from .max_pressure import MaxPressurePolicy

__all__ = ["FixedTimePolicy", "ActuatedPolicy", "MaxPressurePolicy"]
