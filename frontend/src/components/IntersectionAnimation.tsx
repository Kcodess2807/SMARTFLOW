import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Phase = "NS" | "NS_Y" | "EW" | "EW_Y";

const NEXT: Record<Phase, Phase> = {
  NS: "NS_Y",
  NS_Y: "EW",
  EW: "EW_Y",
  EW_Y: "NS",
};
const DURATION: Record<Phase, number> = {
  NS: 3200,
  NS_Y: 900,
  EW: 3200,
  EW_Y: 900,
};

const GO = "#157F5B";
const AMBER = "#E08A00";
const STOP = "#C2453C";
const RULE = "#D8D2C4";
const INK = "#14171A";
const GRAPHITE = "#5A6066";

/** Stacked queued vehicles drawn from a stop line, growing away from the box. */
function Queue({
  x,
  y,
  dx,
  dy,
  show,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  show: boolean;
}) {
  const cars = [0, 1, 2, 3];
  return (
    <g>
      {cars.map((i) => (
        <motion.rect
          key={i}
          x={x + dx * i - 6}
          y={y + dy * i - 4}
          width={12}
          height={8}
          rx={1.5}
          fill={GRAPHITE}
          initial={false}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.4, delay: show ? i * 0.06 : 0 }}
        />
      ))}
    </g>
  );
}

/** Animated directional flow line along an axis the agent has set to green. */
function Flow({
  x1,
  y1,
  x2,
  y2,
  active,
  reduce,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
  reduce: boolean;
}) {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={GO}
      strokeWidth={3}
      strokeLinecap="round"
      strokeDasharray="14 12"
      initial={false}
      animate={
        active && !reduce
          ? { strokeDashoffset: [0, -52], opacity: 1 }
          : { opacity: active ? 0.9 : 0 }
      }
      transition={
        active && !reduce
          ? { duration: 0.7, repeat: Infinity, ease: "linear" }
          : { duration: 0.3 }
      }
    />
  );
}

export default function IntersectionAnimation() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("NS");

  useEffect(() => {
    if (reduce) return; // static NS-green frame
    const t = setTimeout(() => setPhase((p) => NEXT[p]), DURATION[phase]);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  const nsGreen = phase === "NS";
  const nsYellow = phase === "NS_Y";
  const ewGreen = phase === "EW";
  const ewYellow = phase === "EW_Y";

  const phaseLabel = nsGreen
    ? "NS · GREEN"
    : ewGreen
    ? "EW · GREEN"
    : "TRANSITION";

  return (
    <figure className="relative" aria-label="Animated intersection cycling through signal phases as the agent controls it">
      <svg viewBox="0 0 400 400" className="w-full" role="img">
        {/* faint blueprint frame ticks */}
        <g stroke={RULE} strokeWidth="1">
          <line x1="20" y1="20" x2="40" y2="20" />
          <line x1="20" y1="20" x2="20" y2="40" />
          <line x1="380" y1="380" x2="360" y2="380" />
          <line x1="380" y1="380" x2="380" y2="360" />
        </g>

        {/* roads */}
        <rect x="165" y="0" width="70" height="400" fill="#ECE8DD" />
        <rect x="0" y="165" width="400" height="70" fill="#ECE8DD" />
        {/* lane centre lines */}
        <line x1="200" y1="0" x2="200" y2="400" stroke={RULE} strokeWidth="1" strokeDasharray="6 8" />
        <line x1="0" y1="200" x2="400" y2="200" stroke={RULE} strokeWidth="1" strokeDasharray="6 8" />
        {/* intersection box */}
        <rect x="165" y="165" width="70" height="70" fill="none" stroke={RULE} strokeWidth="1" />

        {/* flow on the active (green) axis */}
        <Flow x1={183} y1={0} x2={183} y2={400} active={nsGreen} reduce={!!reduce} />
        <Flow x1={217} y1={400} x2={217} y2={0} active={nsGreen} reduce={!!reduce} />
        <Flow x1={0} y1={217} x2={400} y2={217} active={ewGreen} reduce={!!reduce} />
        <Flow x1={400} y1={183} x2={0} y2={183} active={ewGreen} reduce={!!reduce} />

        {/* queues on the stopped axis */}
        <Queue x={183} y={150} dx={0} dy={-22} show={!nsGreen} />
        <Queue x={217} y={250} dx={0} dy={22} show={!nsGreen} />
        <Queue x={150} y={217} dx={-22} dy={0} show={!ewGreen} />
        <Queue x={250} y={183} dx={22} dy={0} show={!ewGreen} />

        {/* four signal heads at the intersection corners */}
        {[
          { cx: 150, cy: 150, green: nsGreen, yellow: nsYellow }, // N
          { cx: 250, cy: 250, green: nsGreen, yellow: nsYellow }, // S
          { cx: 250, cy: 150, green: ewGreen, yellow: ewYellow }, // E
          { cx: 150, cy: 250, green: ewGreen, yellow: ewYellow }, // W
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.cx - 5} y={s.cy - 12} width={10} height={24} rx={2} fill={INK} />
            <circle cx={s.cx} cy={s.cy - 6} r={2.4} fill={s.green || s.yellow ? "#3a2f2f" : STOP} />
            <circle cx={s.cx} cy={s.cy} r={2.4} fill={s.yellow ? AMBER : "#3a2f2f"} />
            <circle cx={s.cx} cy={s.cy + 6} r={2.8} fill={s.green ? GO : "#2c3530"} />
          </g>
        ))}
      </svg>

      <figcaption className="mt-4 flex items-center justify-between border-t border-rule pt-3">
        <span className="microlabel">Live phase</span>
        <span className="font-mono text-xs font-bold tracking-widest text-ink">
          {phaseLabel}
        </span>
      </figcaption>
    </figure>
  );
}
