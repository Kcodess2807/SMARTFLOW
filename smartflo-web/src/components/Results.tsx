import { useState } from "react";
import Section from "./Section";
import Reveal from "./Reveal";
import BarChart from "./BarChart";
import ComparisonTable from "./ComparisonTable";
import DemoStrip from "./DemoStrip";
import { METRICS, RESULTS, improvement, EVAL_META } from "../data/results";

export default function Results() {
  const [active, setActive] = useState(0);
  const metric = METRICS[active];

  const deltas = RESULTS.filter((r) => !r.isRL).map((ref) => ({
    name: ref.controller,
    pct: improvement(metric.key, metric.betterWhen, ref),
  }));

  return (
    <Section
      id="results"
      index="02"
      label="Results"
      title="The learned policy beats every classical baseline on the same scenario."
      intro={EVAL_META.note}
    >
      {/* Metric selector */}
      <Reveal>
        <div
          role="tablist"
          aria-label="Metric"
          className="flex flex-wrap gap-2 border-b border-rule pb-5"
        >
          {METRICS.map((m, i) => (
            <button
              key={m.key}
              role="tab"
              aria-selected={i === active}
              aria-controls="metric-panel"
              onClick={() => setActive(i)}
              className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
                i === active
                  ? "border-ink bg-ink text-paper"
                  : "border-rule bg-surface text-graphite hover:border-ink hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Reveal>

      <div
        id="metric-panel"
        role="tabpanel"
        className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]"
      >
        <Reveal className="figure-frame p-6 md:p-8">
          <div className="mb-6 flex items-baseline justify-between">
            <h3 className="font-display text-xl font-semibold text-ink">
              {metric.label}
            </h3>
            <span className="microlabel">Fig. 1 · n = {EVAL_META.seeds.length} seeds</span>
          </div>
          <BarChart metric={metric.key} unit={metric.unit} betterWhen={metric.betterWhen} />
          <p className="mt-6 border-t border-rule pt-4 text-sm leading-relaxed text-graphite">
            {metric.caption}
          </p>
        </Reveal>

        {/* RL deltas for the selected metric */}
        <Reveal className="flex flex-col gap-4">
          <span className="microlabel">RL agent vs. baseline ({metric.label.toLowerCase()})</span>
          {deltas.map((d) => {
            const better = d.pct >= 0;
            return (
              <div
                key={d.name}
                className="figure-frame flex items-center justify-between px-5 py-4"
              >
                <span className="text-sm text-graphite">{d.name}</span>
                <span
                  className={`font-mono text-2xl font-bold ${
                    better ? "text-go" : "text-stop"
                  }`}
                >
                  {better ? "−" : "+"}
                  {Math.abs(d.pct).toFixed(1)}%
                </span>
              </div>
            );
          })}
          <p className="mt-1 text-sm leading-relaxed text-graphite">
            Negative = the agent improved on that controller. The margin over
            max-pressure is small but real — the agent matches the strongest
            hand-built heuristic while learning its policy purely from reward.
          </p>
        </Reveal>
      </div>

      {/* Full comparison table */}
      <Reveal className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="microlabel">Tbl. 1 · full comparison</span>
          <span className="microlabel">mean over seeds {EVAL_META.seeds.join(", ")}</span>
        </div>
        <ComparisonTable />
      </Reveal>

      {/* Honest caveats */}
      <Reveal className="mt-8 figure-frame border-l-2 border-l-amber p-6">
        <span className="microlabel text-amber">Reading the numbers honestly</span>
        <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-graphite md:grid-cols-3">
          <li>
            <strong className="text-ink">Scope.</strong> One 4-way intersection,
            simulated in SUMO over a 1-hour demand profile — not a field
            deployment.
          </li>
          <li>
            <strong className="text-ink">Throughput is saturated.</strong> Every
            controller clears ~2,050 vehicles, so the win shows up in delay and
            queue length, not throughput.
          </li>
          <li>
            <strong className="text-ink">Emergency preemption</strong> is
            implemented and validated in the digital twin; on the tested seed the
            emergency vehicle was already unobstructed, so it is shown as a
            capability, not a headline number.
          </li>
        </ul>
      </Reveal>

      {/* Detection feed demo */}
      <DemoStrip />
    </Section>
  );
}
