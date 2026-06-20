import Section from "./Section";
import Reveal from "./Reveal";

const LIMITATIONS = [
  {
    title: "Single intersection, in simulation",
    body: "Results are for one four-way intersection in SUMO over a one-hour demand profile — not a multi-intersection network or a field deployment.",
  },
  {
    title: "Throughput is saturated",
    body: "Every controller clears ≈ 2,050 vehicles, so the improvement shows up in delay and queue length rather than throughput.",
  },
  {
    title: "Preemption is a validated capability, not a headline number",
    body: "Emergency-vehicle preemption is implemented and validated in the digital twin; on the tested seed the emergency vehicle was already unobstructed, so no delay reduction is claimed.",
  },
  {
    title: "Modest margin over max-pressure",
    body: "The learned policy matches and slightly edges max-pressure; the large gains are versus fixed-time and actuated control, and the seed spread is small but non-zero.",
  },
];

export default function Limitations() {
  return (
    <Section
      id="limitations"
      index="§4"
      label="Limitations"
      title="What these numbers do and don't claim."
      intro="Stating the boundaries of the study plainly — the result is a fair, seeded benchmark on one intersection, not a deployment claim."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {LIMITATIONS.map((l) => (
          <Reveal asChild key={l.title} className="figure-frame border-l-2 border-l-amber p-6">
            <h3 className="font-display text-lg font-semibold text-ink">{l.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-graphite">{l.body}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
