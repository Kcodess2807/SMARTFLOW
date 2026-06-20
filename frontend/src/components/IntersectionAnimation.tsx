import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Phase = "NS" | "NS_Y" | "EW" | "EW_Y";

const NEXT: Record<Phase, Phase> = {
  NS: "NS_Y",
  NS_Y: "EW",
  EW: "EW_Y",
  EW_Y: "NS",
};
const DURATION: Record<Phase, number> = { NS: 3200, NS_Y: 900, EW: 3200, EW_Y: 900 };

// Emergency-vehicle preemption: every EV_GAP an EV approaches (alternating axis)
// and the controller overrides the phase to clear it for EV_DUR.
const EV_GAP = 5200;
const EV_DUR = 2600;

const GO = "#157F5B";
const AMBER = "#E08A00";
const STOP = "#C2453C";
const RULE = "#D8D2C4";
const INK = "#14171A";
const GRAPHITE = "#5A6066";
const OFF = "#3a352f"; // dimmed lamp

/** Stacked queued vehicles drawn from a stop line, growing away from the box. */
function Queue({ x, y, dx, dy, show }: { x: number; y: number; dx: number; dy: number; show: boolean }) {
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
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

/** Vehicles flowing along a green lane (rendered only while the lane is active). */
function FlowLane({
  vertical,
  pos,
  from,
  to,
  active,
}: {
  vertical: boolean;
  pos: number;
  from: number;
  to: number;
  active: boolean;
}) {
  if (!active) return null;
  const n = 3;
  const dur = 2.2;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const common = {
          width: vertical ? 10 : 16,
          height: vertical ? 16 : 10,
          rx: 2,
          fill: GRAPHITE,
        };
        const move = { repeat: Infinity, ease: "linear" as const, duration: dur, delay: (i * dur) / n };
        return vertical ? (
          <motion.rect
            key={i}
            x={pos - 5}
            initial={{ y: from }}
            animate={{ y: [from, to] }}
            transition={move}
            {...common}
          />
        ) : (
          <motion.rect
            key={i}
            y={pos - 5}
            initial={{ x: from }}
            animate={{ x: [from, to] }}
            transition={move}
            {...common}
          />
        );
      })}
    </g>
  );
}

/** The emergency vehicle: red, with a pulsing siren + halo, crossing on its axis. */
function EmergencyVehicle({ axis, id }: { axis: "NS" | "EW"; id: number }) {
  const vertical = axis === "NS";
  const pulse = { repeat: Infinity, duration: 0.55, ease: "easeInOut" as const };
  const halo = { repeat: Infinity, duration: 1, ease: "easeOut" as const };
  // local geometry centred on the vehicle; the whole group translates.
  return (
    <motion.g
      key={id}
      initial={vertical ? { y: -40 } : { x: -40 }}
      animate={vertical ? { y: 440 } : { x: 440 }}
      transition={{ duration: EV_DUR / 1000, ease: "linear" }}
    >
      {vertical ? (
        <g transform="translate(183,0)">
          <motion.circle cx={0} cy={0} r={8} fill="none" stroke={STOP} strokeWidth={1.5}
            initial={{ r: 7, opacity: 0.5 }} animate={{ r: 16, opacity: 0 }} transition={halo} />
          <rect x={-6} y={-9} width={12} height={18} rx={2} fill={STOP} />
          <rect x={-6} y={-9} width={12} height={5} rx={1.5} fill="#fff" opacity={0.9} />
          <motion.circle cx={0} cy={-6} r={2} fill="#fff" animate={{ opacity: [1, 0.2, 1] }} transition={pulse} />
        </g>
      ) : (
        <g transform="translate(0,217)">
          <motion.circle cx={0} cy={0} r={8} fill="none" stroke={STOP} strokeWidth={1.5}
            initial={{ r: 7, opacity: 0.5 }} animate={{ r: 16, opacity: 0 }} transition={halo} />
          <rect x={-9} y={-6} width={18} height={12} rx={2} fill={STOP} />
          <rect x={-9} y={-6} width={5} height={12} rx={1.5} fill="#fff" opacity={0.9} />
          <motion.circle cx={-6} cy={0} r={2} fill="#fff" animate={{ opacity: [1, 0.2, 1] }} transition={pulse} />
        </g>
      )}
    </motion.g>
  );
}

export default function IntersectionAnimation() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("NS");
  const [ev, setEv] = useState<{ axis: "NS" | "EW"; id: number } | null>(null);

  // ambient phase cycle
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setPhase((p) => NEXT[p]), DURATION[phase]);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  // emergency-vehicle scheduler (alternating axis), independent of the cycle
  useEffect(() => {
    if (reduce) return;
    let n = 0;
    let on: number;
    let off: number;
    const loop = () => {
      on = window.setTimeout(() => {
        n += 1;
        setEv({ axis: n % 2 === 1 ? "EW" : "NS", id: n });
        off = window.setTimeout(() => {
          setEv(null);
          loop();
        }, EV_DUR);
      }, EV_GAP);
    };
    loop();
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [reduce]);

  const emActive = ev !== null;
  const nsGreen = emActive ? ev!.axis === "NS" : phase === "NS";
  const ewGreen = emActive ? ev!.axis === "EW" : phase === "EW";
  const nsYellow = !emActive && phase === "NS_Y";
  const ewYellow = !emActive && phase === "EW_Y";

  const label = emActive
    ? `PRIORITY · ${ev!.axis} PREEMPT`
    : nsGreen
    ? "NS · GREEN"
    : ewGreen
    ? "EW · GREEN"
    : "TRANSITION";

  return (
    <figure
      className="relative"
      aria-label="Animated intersection: the agent cycles signal phases and preempts the green for an approaching emergency vehicle."
    >
      <svg viewBox="0 0 400 400" className="w-full" role="img">
        {/* blueprint frame ticks */}
        <g stroke={RULE} strokeWidth="1">
          <line x1="20" y1="20" x2="40" y2="20" />
          <line x1="20" y1="20" x2="20" y2="40" />
          <line x1="380" y1="380" x2="360" y2="380" />
          <line x1="380" y1="380" x2="380" y2="360" />
        </g>

        {/* roads */}
        <rect x="165" y="0" width="70" height="400" fill="#ECE8DD" />
        <rect x="0" y="165" width="400" height="70" fill="#ECE8DD" />
        <line x1="200" y1="0" x2="200" y2="400" stroke={RULE} strokeWidth="1" strokeDasharray="6 8" />
        <line x1="0" y1="200" x2="400" y2="200" stroke={RULE} strokeWidth="1" strokeDasharray="6 8" />
        <rect x="165" y="165" width="70" height="70" fill="none" stroke={RULE} strokeWidth="1" />

        {/* ordinary vehicles flowing on the green axis (hidden under the EV's lane) */}
        {!reduce && (
          <>
            <FlowLane vertical pos={183} from={-20} to={420} active={nsGreen && !(emActive && ev!.axis === "NS")} />
            <FlowLane vertical pos={217} from={420} to={-20} active={nsGreen} />
            <FlowLane vertical={false} pos={217} from={-20} to={420} active={ewGreen && !(emActive && ev!.axis === "EW")} />
            <FlowLane vertical={false} pos={183} from={420} to={-20} active={ewGreen} />
          </>
        )}

        {/* queues on the stopped axis */}
        <Queue x={183} y={150} dx={0} dy={-22} show={!nsGreen} />
        <Queue x={217} y={250} dx={0} dy={22} show={!nsGreen} />
        <Queue x={150} y={217} dx={-22} dy={0} show={!ewGreen} />
        <Queue x={250} y={183} dx={22} dy={0} show={!ewGreen} />

        {/* emergency vehicle */}
        {emActive && !reduce && <EmergencyVehicle axis={ev!.axis} id={ev!.id} />}

        {/* signal heads */}
        {[
          { cx: 150, cy: 150, green: nsGreen, yellow: nsYellow },
          { cx: 250, cy: 250, green: nsGreen, yellow: nsYellow },
          { cx: 250, cy: 150, green: ewGreen, yellow: ewYellow },
          { cx: 150, cy: 250, green: ewGreen, yellow: ewYellow },
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.cx - 5} y={s.cy - 12} width={10} height={24} rx={2} fill={INK} />
            <circle cx={s.cx} cy={s.cy - 6} r={2.4} fill={!s.green && !s.yellow ? STOP : OFF} />
            <circle cx={s.cx} cy={s.cy} r={2.4} fill={s.yellow ? AMBER : OFF} />
            <circle cx={s.cx} cy={s.cy + 6} r={2.8} fill={s.green ? GO : OFF} />
          </g>
        ))}
      </svg>

      <figcaption className="mt-4 border-t border-rule pt-3">
        <div className="flex items-center justify-between">
          <span className="microlabel">Live phase</span>
          <span
            className={`font-mono text-xs font-bold tracking-widest ${
              emActive ? "text-stop" : "text-ink"
            }`}
          >
            {label}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <Legend color={GO} label="flow" />
          <Legend color={GRAPHITE} label="queue" />
          <Legend color={STOP} label="priority vehicle" />
        </div>
      </figcaption>
    </figure>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-wider text-graphite">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
  );
}
