// Real measured results, transcribed verbatim from the repository.
// Source: backend/results/comparison.csv  (mean over seeds 42, 7, 123)
// Produced by: backend/rl/evaluate.py  on the single-intersection SUMO scenario.
// DO NOT edit these by hand to "improve" them — they must match the repo.

export type MetricKey =
  | "avg_wait_s"
  | "avg_timeloss_s"
  | "avg_queue_veh"
  | "mean_speed_ms"
  | "throughput_veh";

export interface ControllerResult {
  controller: string;
  /** is this the learned RL policy (vs. a baseline)? */
  isRL: boolean;
  /** short note on what kind of controller this is */
  kind: "fixed" | "heuristic" | "learned";
  avg_wait_s: number;
  avg_timeloss_s: number;
  avg_queue_veh: number;
  mean_speed_ms: number;
  throughput_veh: number;
}

export const RESULTS: ControllerResult[] = [
  {
    controller: "Fixed-time",
    isRL: false,
    kind: "fixed",
    avg_wait_s: 11.37,
    avg_timeloss_s: 21.49,
    avg_queue_veh: 7.37,
    mean_speed_ms: 6.48,
    throughput_veh: 2048.67,
  },
  {
    controller: "Actuated",
    isRL: false,
    kind: "heuristic",
    avg_wait_s: 6.87,
    avg_timeloss_s: 16.39,
    avg_queue_veh: 4.55,
    mean_speed_ms: 7.41,
    throughput_veh: 2050,
  },
  {
    controller: "Max-pressure",
    isRL: false,
    kind: "heuristic",
    avg_wait_s: 5.28,
    avg_timeloss_s: 14.5,
    avg_queue_veh: 3.27,
    mean_speed_ms: 7.82,
    throughput_veh: 2050.67,
  },
  {
    controller: "RL (DQN)",
    isRL: true,
    kind: "learned",
    avg_wait_s: 5.14,
    avg_timeloss_s: 14.31,
    avg_queue_veh: 3.19,
    mean_speed_ms: 7.86,
    throughput_veh: 2054,
  },
];

export interface MetricMeta {
  key: MetricKey;
  label: string;
  unit: string;
  /** lower-is-better metrics get the delta sign flipped for "improvement" */
  betterWhen: "lower" | "higher";
  caption: string;
}

export const METRICS: MetricMeta[] = [
  {
    key: "avg_wait_s",
    label: "Avg waiting time",
    unit: "s / veh",
    betterWhen: "lower",
    caption: "Mean seconds each vehicle spends stopped (SUMO tripinfo).",
  },
  {
    key: "avg_queue_veh",
    label: "Avg queue length",
    unit: "veh",
    betterWhen: "lower",
    caption: "Time-averaged number of halted vehicles on the approaches.",
  },
  {
    key: "mean_speed_ms",
    label: "Mean speed",
    unit: "m / s",
    betterWhen: "higher",
    caption: "Time-averaged network speed across all vehicles.",
  },
  {
    key: "throughput_veh",
    label: "Throughput",
    unit: "veh",
    betterWhen: "higher",
    caption: "Vehicles that completed their trip in the hour (demand-saturated).",
  },
];

const fixed = RESULTS[0];
const rl = RESULTS[RESULTS.length - 1];

/** Percentage improvement of the RL agent over a reference controller. */
export function improvement(
  metric: MetricKey,
  betterWhen: "lower" | "higher",
  reference: ControllerResult = fixed
): number {
  const a = reference[metric];
  const b = rl[metric];
  const raw = betterWhen === "lower" ? (a - b) / a : (b - a) / a;
  return raw * 100;
}

// Pre-computed headline deltas (RL vs. fixed-time) — the honest hero numbers.
export const HEADLINE = {
  waitReductionVsFixed: Math.round(improvement("avg_wait_s", "lower")), // 55
  queueReductionVsFixed: Math.round(improvement("avg_queue_veh", "lower")), // 57
  speedGainVsFixed: Math.round(improvement("mean_speed_ms", "higher")), // 21
  waitReductionVsActuated: Math.round(
    improvement("avg_wait_s", "lower", RESULTS[1])
  ), // 25
  rlWait: rl.avg_wait_s, // 5.14
  fixedWait: fixed.avg_wait_s, // 11.37
};

export const EVAL_META = {
  seeds: [42, 7, 123],
  episodeSeconds: 3600,
  scenario: "Single 4-way intersection",
  simulator: "SUMO via sumo-rl",
  note: "Every controller runs the identical scenario and seeds; metrics come from SUMO tripinfo and time-averaged network state.",
};
