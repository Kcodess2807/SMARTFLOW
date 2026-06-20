import Section from "./Section";
import Reveal from "./Reveal";
import { COMPONENTS, STACK } from "../data/content";

const API_ROUTES = [
  { method: "GET", path: "/health", note: "liveness + model status" },
  { method: "POST", path: "/predict", note: "traffic state → green-phase decision" },
  { method: "POST", path: "/simulate", note: "run an episode, return real metrics" },
  { method: "GET", path: "/metrics", note: "saved RL-vs-baselines comparison" },
];

function ComponentCard({
  area,
  tag,
  items,
}: {
  area: string;
  tag: string;
  items: string[];
}) {
  return (
    <Reveal asChild className="figure-frame p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">{area}</h3>
        <span className="shrink-0 rounded-sm bg-sunken px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-graphite">
          {tag}
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
  return (
    <Section
      id="build"
      index="§5"
      label="Tech & system"
      title="Computer vision, reinforcement learning, and a service to run them."
      intro="SmartFlow is a group project. Camera frames become lane-level demand, a reinforcement-learning agent turns that demand into signal decisions, and a small API serves the trained policy — with hardware priority for emergency vehicles. These are the pieces that make it up."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {COMPONENTS.map((c) => (
          <ComponentCard key={c.area} {...c} />
        ))}
      </div>

      {/* API surface */}
      <Reveal className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="figure-frame overflow-hidden">
          <div className="border-b border-rule px-5 py-3">
            <span className="microlabel">FastAPI surface</span>
          </div>
          <ul className="divide-y divide-rule">
            {API_ROUTES.map((r) => (
              <li key={r.path} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3">
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
