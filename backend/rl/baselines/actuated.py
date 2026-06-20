"""Actuated baseline.

SUMO's built-in gap-based actuated traffic control: each green is extended while
vehicles keep arriving within a time gap, up to a max-green, then switches. This
is a strong, widely-deployed adaptive baseline -- a much tougher bar than
fixed-time. Implemented by running the env with ``fixed_ts=True`` on the network
variant whose traffic light was compiled with ``--tls.default-type actuated``.
"""
from __future__ import annotations

from .. import config


class ActuatedPolicy:
    """No-op policy; the signal is driven by SUMO's actuated logic."""

    name = "Actuated"
    fixed_ts = True
    net_file = str(config.NET_ACTUATED_FILE)

    def __call__(self, obs, env) -> int:  # noqa: ARG002 - signature parity
        return 0
