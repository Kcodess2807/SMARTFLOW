import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Section from "./Section";
import Reveal from "./Reveal";
import Citation from "./Citation";
import { ARCHITECTURE, ENV_CONFIG, TRAINING } from "../data/content";
import { fadeUp, VIEWPORT } from "../lib/motion";

const nodeVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

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

export default function Architecture() {
  const reduce = useReducedMotion();
  return (
    <Section
      id="architecture"
      index="§2"
      label="Method & system"
      title="A closed training loop, then a thin API to serve the policy."
      intro={
        <>
          During training the loop runs thousands of times: the agent observes the
          state, picks a phase, SUMO
          <Citation n={3} /> advances the simulation via sumo-rl
          <Citation n={4} />, and the reward feeds the result back. The agent is a
          DQN<Citation n={1} /> (PPO<Citation n={2} /> is also supported) trained
          with Stable-Baselines3<Citation n={5} />. Once trained, the same policy is
          exposed over a small FastAPI service.
        </>
      }
    >
      <Reveal className="figure-frame p-6 md:p-10">
        <motion.ol
          variants={reduce ? undefined : { show: { transition: { staggerChildren: 0.12 } } }}
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={VIEWPORT}
          className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center"
        >
          {ARCHITECTURE.map((node, i) => (
            <Fragment key={node.id}>
              <motion.li
                variants={reduce ? undefined : nodeVariant}
                className="flex-1 rounded-md border border-rule bg-paper p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="microlabel text-go-deep">{`0${i + 1}`}</span>
                  <span className="font-mono text-xs text-muted">{node.id}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                  {node.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-graphite">
                  {node.detail}
                </p>
              </motion.li>

              {i < ARCHITECTURE.length - 1 && (
                <motion.div
                  variants={reduce ? undefined : nodeVariant}
                  aria-hidden="true"
                  className="flex shrink-0 items-center justify-center text-rule lg:rotate-0"
                >
                  <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" />
                </motion.div>
              )}
            </Fragment>
          ))}
        </motion.ol>

        {/* feedback loop annotation */}
        <Reveal className="mt-6 flex items-center gap-3 border-t border-rule pt-5">
          <span aria-hidden="true" className="font-mono text-go-deep">
            ↺
          </span>
          <p className="text-sm text-graphite">
            <span className="font-medium text-ink">Training feedback loop:</span>{" "}
            reward → agent. The reward signal updates the DQN&rsquo;s value estimates,
            so the next decision is a little better than the last.
          </p>
        </Reveal>
      </Reveal>

      <Reveal variants={fadeUp} className="mt-5 grid gap-5 md:grid-cols-2">
        <SpecTable caption="SUMO environment" rows={ENV_CONFIG} />
        <SpecTable caption="Training setup" rows={TRAINING} />
      </Reveal>
    </Section>
  );
}
