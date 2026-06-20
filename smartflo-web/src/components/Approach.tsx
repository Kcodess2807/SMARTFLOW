import { motion, useReducedMotion } from "framer-motion";
import Section from "./Section";
import Reveal from "./Reveal";
import { MDP, ENV_CONFIG, TRAINING } from "../data/content";
import { fadeUp, stagger, VIEWPORT } from "../lib/motion";

function MdpCard({
  step,
  title,
  badge,
  summary,
  items,
  note,
  formula,
}: {
  step: string;
  title: string;
  badge?: string;
  summary: string;
  items: string[];
  note: string;
  formula?: string;
}) {
  return (
    <Reveal asChild className="figure-frame flex flex-col p-6">
      <div className="flex items-center justify-between">
        <span className="microlabel text-go">{step}</span>
        {badge && (
          <span className="rounded-sm bg-sunken px-2 py-1 font-mono text-xs text-graphite">
            {badge}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-graphite">{summary}</p>

      {formula && (
        <p className="mt-5 rounded-sm bg-sunken px-3 py-3 text-center font-mono text-sm text-ink">
          {formula}
        </p>
      )}

      <ul className="mt-5 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-go" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-rule pt-4 text-sm leading-relaxed text-graphite">
        {note}
      </p>
    </Reveal>
  );
}

function SpecTable({
  caption,
  rows,
}: {
  caption: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="figure-frame overflow-hidden">
      <div className="border-b border-rule px-5 py-3">
        <span className="microlabel">{caption}</span>
      </div>
      <dl className="divide-y divide-rule">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-5 py-2.5">
            <dt className="text-sm text-graphite">{r.label}</dt>
            <dd className="font-mono text-sm text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function Approach() {
  const reduce = useReducedMotion();
  return (
    <Section
      id="approach"
      index="01"
      label="Problem & approach"
      title="Framing the intersection as a control problem the agent can learn."
      intro="A fixed-time signal repeats the same schedule no matter the traffic. Here the signal is a reinforcement-learning agent: every few seconds it reads live demand on each lane and decides which direction gets the green. That decision loop is a Markov decision process — a state it observes, an action it takes, and a reward it tries to maximise."
    >
      <motion.div
        variants={reduce ? undefined : stagger(0.1)}
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={VIEWPORT}
        className="grid gap-5 lg:grid-cols-3"
      >
        <MdpCard
          step="State"
          title={MDP.state.title}
          badge={`${MDP.state.dims} dims`}
          summary={MDP.state.summary}
          items={MDP.state.items}
          note={MDP.state.note}
        />
        <MdpCard
          step="Action"
          title={MDP.action.title}
          badge={`${MDP.action.dims} choices`}
          summary={MDP.action.summary}
          items={MDP.action.items}
          note={MDP.action.note}
        />
        <MdpCard
          step="Reward"
          title={MDP.reward.title}
          summary={MDP.reward.summary}
          formula={MDP.reward.formula}
          items={MDP.reward.items}
          note={MDP.reward.note}
        />
      </motion.div>

      <Reveal variants={fadeUp} className="mt-5 grid gap-5 md:grid-cols-2">
        <SpecTable caption="SUMO environment" rows={ENV_CONFIG} />
        <SpecTable caption="Training setup" rows={TRAINING} />
      </Reveal>
    </Section>
  );
}
