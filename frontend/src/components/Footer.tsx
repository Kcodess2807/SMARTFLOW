import { Github } from "lucide-react";
import { LINKS } from "../data/content";
import { HEADLINE } from "../data/results";
import Reveal from "./Reveal";

export default function Footer() {
  return (
    <footer className="border-t border-rule bg-surface">
      <div className="mx-auto max-w-page px-6 py-16 md:px-10 md:py-20">
        <Reveal>
          <div className="font-display text-xl font-semibold text-ink">
            SmartFlow
          </div>
          <p className="mt-4 max-w-prose font-display text-2xl font-medium leading-snug text-ink">
            A traffic signal that learns to clear the queue —{" "}
            <span className="text-go-deep">
              {HEADLINE.waitReductionVsFixed}% less waiting
            </span>{" "}
            than fixed-time control.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-go"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              View the code
            </a>
            <a
              href="#results"
              className="inline-flex items-center gap-2 rounded border border-ink px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              See the results
            </a>
            <a
              href="#top"
              className="inline-flex items-center gap-2 rounded px-5 py-3 text-sm font-semibold text-graphite transition-colors hover:text-ink"
            >
              Back to top
            </a>
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col items-start justify-between gap-2 border-t border-rule pt-6 text-sm text-graphite md:flex-row md:items-center">
          <p className="font-mono text-xs">
            SmartFlow · a group project · RL traffic-signal control
          </p>
          <p className="font-mono text-xs text-muted">
            Results from SUMO · seeds 42 / 7 / 123 · no figures invented
          </p>
        </div>
      </div>
    </footer>
  );
}
