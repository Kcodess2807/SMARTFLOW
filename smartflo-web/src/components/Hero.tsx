import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Github } from "lucide-react";
import { HERO, LINKS } from "../data/content";
import { HEADLINE } from "../data/results";
import { fadeUp, stagger } from "../lib/motion";
import IntersectionAnimation from "./IntersectionAnimation";

export default function Hero() {
  const reduce = useReducedMotion();
  const container = reduce ? undefined : stagger(0.1);

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="mx-auto grid max-w-page items-center gap-12 px-6 pb-20 pt-16 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:px-10 md:pb-28 md:pt-24"
    >
      <motion.div
        variants={container}
        initial={reduce ? undefined : "hidden"}
        animate={reduce ? undefined : "show"}
      >
        <motion.p variants={fadeUp} className="microlabel">
          {HERO.kicker}
        </motion.p>

        <motion.h1
          id="hero-title"
          variants={fadeUp}
          className="mt-6 font-display text-display-md font-semibold leading-[0.98] tracking-tight text-ink md:text-display-lg"
        >
          {HERO.headline}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-7 max-w-prose text-lg leading-relaxed text-graphite"
        >
          {HERO.sub}
        </motion.p>

        {/* Strongest real result */}
        <motion.div
          variants={fadeUp}
          className="mt-9 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-rule pt-7"
        >
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-semibold tracking-tight text-go">
                −{HEADLINE.waitReductionVsFixed}%
              </span>
            </div>
            <p className="mt-1 max-w-[22ch] text-sm text-graphite">
              average vehicle waiting time vs. a fixed-time controller
            </p>
          </div>
          <div className="font-mono text-sm text-graphite">
            <span className="text-ink">{HEADLINE.rlWait}s</span> RL
            <span className="px-2 text-rule">/</span>
            <span>{HEADLINE.fixedWait}s</span> fixed-time
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
          <a
            href="#results"
            className="inline-flex items-center gap-2 rounded bg-go px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-go-deep"
          >
            View the results
          </a>
          <a
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded border border-ink px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            GitHub
          </a>
        </motion.div>
      </motion.div>

      {/* Domain hero animation */}
      <motion.div
        variants={fadeUp}
        initial={reduce ? undefined : "hidden"}
        animate={reduce ? undefined : "show"}
        className="figure-frame relative p-5 md:p-7"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="microlabel">Fig. 0 — single intersection</span>
          <span className="microlabel text-go">agent-controlled</span>
        </div>
        <IntersectionAnimation />
      </motion.div>

      {/* scroll cue */}
      {!reduce && (
        <motion.a
          href="#approach"
          aria-label="Scroll to approach"
          className="mx-auto hidden text-graphite md:col-span-2 md:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-5 w-5" />
        </motion.a>
      )}
    </section>
  );
}
