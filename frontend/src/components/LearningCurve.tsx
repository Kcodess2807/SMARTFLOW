import { motion, useReducedMotion } from "framer-motion";
import { LEARNING_CURVE } from "../data/results";

// Native learning curve drawn from real training logs. The rolling-mean path
// "draws on" when scrolled into view (pathLength), respecting reduced motion.
const W = 640;
const H = 320;
const PAD = { l: 48, r: 16, t: 16, b: 36 };

export default function LearningCurve() {
  const reduce = useReducedMotion();
  const data = LEARNING_CURVE;

  const xMax = data[data.length - 1].step;
  const ys = data.flatMap((d) => [d.reward, d.mean]);
  const yMin = Math.floor(Math.min(...ys));
  const yMax = Math.ceil(Math.max(...ys));

  const px = (step: number) =>
    PAD.l + (step / xMax) * (W - PAD.l - PAD.r);
  const py = (val: number) =>
    PAD.t + (1 - (val - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);

  const line = (key: "reward" | "mean") =>
    data.map((d, i) => `${i ? "L" : "M"}${px(d.step).toFixed(1)} ${py(d[key]).toFixed(1)}`).join(" ");

  const yTicks = [yMin, Math.round((yMin + yMax) / 2), yMax];
  const xTicks = [0, xMax / 2, xMax];

  return (
    <figure className="figure-frame p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-display text-xl font-semibold text-ink">
          Training reward
        </h3>
        <span className="microlabel">Fig. 2 · DQN, 100k steps</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Episode reward rising from about -12.4 to -7.7 over 100,000 training steps as the agent learns."
      >
        {/* gridlines + y labels */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.l}
              y1={py(t)}
              x2={W - PAD.r}
              y2={py(t)}
              stroke="#D8D2C4"
              strokeWidth="1"
              strokeDasharray={t === yTicks[0] ? "0" : "3 5"}
            />
            <text
              x={PAD.l - 8}
              y={py(t) + 3}
              textAnchor="end"
              className="fill-muted font-mono"
              style={{ fontSize: 10 }}
            >
              {t}
            </text>
          </g>
        ))}
        {/* x labels */}
        {xTicks.map((t) => (
          <text
            key={t}
            x={px(t)}
            y={H - PAD.b + 18}
            textAnchor="middle"
            className="fill-muted font-mono"
            style={{ fontSize: 10 }}
          >
            {t === 0 ? "0" : `${Math.round(t / 1000)}k`}
          </text>
        ))}

        {/* raw per-episode reward (faint) */}
        <path d={line("reward")} fill="none" stroke="#C9C2B2" strokeWidth="1.5" />

        {/* rolling-mean (bold, draws on) */}
        <motion.path
          d={line("mean")}
          fill="none"
          stroke="#157F5B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={reduce ? undefined : { pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      </svg>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-rule pt-4">
        <span className="flex items-center gap-2 text-sm text-graphite">
          <span className="h-0.5 w-5 rounded bg-go" aria-hidden="true" /> rolling mean (10 ep)
        </span>
        <span className="flex items-center gap-2 text-sm text-graphite">
          <span className="h-0.5 w-5 rounded" style={{ background: "#C9C2B2" }} aria-hidden="true" /> per-episode reward
        </span>
        <span className="microlabel ml-auto">higher (less negative) is better</span>
      </div>
      <figcaption className="mt-4 text-sm leading-relaxed text-graphite">
        Episode reward climbs from ≈ −12.4 to ≈ −7.7 and plateaus — the agent
        converges well within the 100k-step budget.
      </figcaption>
    </figure>
  );
}
