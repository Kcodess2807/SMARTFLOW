import { motion, useReducedMotion } from "framer-motion";
import { RESULTS, type MetricKey } from "../data/results";

interface Props {
  metric: MetricKey;
  unit: string;
  betterWhen: "lower" | "higher";
}

/** Horizontal bar chart of one metric across all controllers, RL highlighted. */
export default function BarChart({ metric, unit, betterWhen }: Props) {
  const reduce = useReducedMotion();
  const values = RESULTS.map((r) => r[metric]);
  const max = Math.max(...values);

  // For "throughput" the bars are near-identical; anchor the axis a little below
  // the min so the (small but real) differences stay visible without distorting.
  const min = Math.min(...values);
  const spread = max - min;
  const axisMin = spread / max < 0.05 ? min - spread * 1.4 : 0;
  const range = max - axisMin || 1;

  return (
    <div role="img" aria-label={`${metric} by controller`} className="space-y-3">
      {RESULTS.map((r, i) => {
        const pct = ((r[metric] - axisMin) / range) * 100;
        return (
          <div key={r.controller} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 sm:grid-cols-[9rem_1fr]">
            <div className="text-right">
              <span
                className={`text-sm ${r.isRL ? "font-semibold text-ink" : "text-graphite"}`}
              >
                {r.controller}
              </span>
            </div>
            <div className="relative h-9">
              <div className="absolute inset-0 rounded-sm bg-sunken" aria-hidden="true" />
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-sm ${
                  r.isRL ? "bg-go" : "bg-graphite/55"
                }`}
                initial={reduce ? false : { width: 0 }}
                whileInView={reduce ? undefined : { width: `${pct}%` }}
                animate={reduce ? { width: `${pct}%` } : undefined}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                style={reduce ? { width: `${pct}%` } : undefined}
              />
              <span
                className={`absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm font-bold ${
                  r.isRL ? "text-white" : "text-ink"
                }`}
              >
                {r[metric].toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between pt-1">
        <span className="microlabel">{unit}</span>
        <span className="microlabel">
          {betterWhen === "lower" ? "↓ lower is better" : "↑ higher is better"}
        </span>
      </div>
    </div>
  );
}
