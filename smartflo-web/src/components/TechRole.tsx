import Section from "./Section";
import Reveal from "./Reveal";
import { ROLES, STACK } from "../data/content";

const API_ROUTES = [
  { method: "GET", path: "/health", note: "liveness + model status" },
  { method: "POST", path: "/predict", note: "traffic state → green-phase decision" },
  { method: "POST", path: "/simulate", note: "run an episode, return real metrics" },
  { method: "GET", path: "/metrics", note: "saved RL-vs-baselines comparison" },
];

function RoleCard({
  area,
  owner,
  items,
}: {
  area: string;
  owner: "me" | "team";
  items: string[];
}) {
  const mine = owner === "me";
  return (
    <Reveal
      asChild
      className={`figure-frame p-5 ${mine ? "border-l-2 border-l-go" : "opacity-95"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">{area}</h3>
        <span
          className={`shrink-0 rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
            mine ? "bg-go text-white" : "bg-sunken text-graphite"
          }`}
        >
          {mine ? "My work" : "Teammate"}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {items.map((it) => (
          <li key={it} className="text-sm leading-relaxed text-graphite">
            {it}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export default function TechRole() {
  const mine = ROLES.filter((r) => r.owner === "me");
  const team = ROLES.filter((r) => r.owner === "team");

  return (
    <Section
      id="role"
      index="04"
      label="Tech & my role"
      title="What I built — and an honest map of who built the rest."
      intro="SmartFlow is a group project. I own the reinforcement-learning model, the baselines and evaluation, the backend API, and the emergency-preemption logic. The computer-vision detection, the hardware, and the mobile client were built by teammates."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {mine.map((r) => (
          <RoleCard key={r.area} {...r} />
        ))}
      </div>

      <Reveal className="mt-5 grid gap-5 md:grid-cols-3">
        {team.map((r) => (
          <RoleCard key={r.area} {...r} />
        ))}
      </Reveal>

      {/* API surface */}
      <Reveal className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="figure-frame overflow-hidden">
          <div className="border-b border-rule px-5 py-3">
            <span className="microlabel">FastAPI surface</span>
          </div>
          <ul className="divide-y divide-rule">
            {API_ROUTES.map((r) => (
              <li key={r.path} className="flex items-center gap-3 px-5 py-3">
                <span
                  className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold ${
                    r.method === "GET" ? "bg-go-tint text-go-deep" : "bg-amber-tint text-amber-deep"
                  }`}
                >
                  {r.method}
                </span>
                <code className="font-mono text-sm text-ink">{r.path}</code>
                <span className="ml-auto text-right text-xs text-graphite">{r.note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="microlabel">Stack</span>
          <ul className="mt-4 flex flex-wrap gap-2">
            {STACK.map((tech) => (
              <li
                key={tech}
                className="rounded-sm border border-rule bg-surface px-3 py-1.5 font-mono text-sm text-graphite"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
