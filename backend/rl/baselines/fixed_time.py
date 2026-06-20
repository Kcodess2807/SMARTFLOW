"""Fixed-time baseline.

The classic deployed controller: a static cyclic signal plan that never adapts
to traffic. Implemented by running the env with ``fixed_ts=True`` so SUMO follows
the program compiled into ``single.net.xml`` and ignores the agent's actions.
The policy itself is therefore a no-op (returns a constant action).
"""
from __future__ import annotations


class FixedTimePolicy:
    """No-op policy; the signal is driven by SUMO's static program."""

    name = "Fixed-time"
    # Tells the evaluation harness to build the env with fixed_ts=True on the
    # static-TL network.
    fixed_ts = True
    net_file = None  # default static network

    def __call__(self, obs, env) -> int:  # noqa: ARG002 - signature parity
        return 0
