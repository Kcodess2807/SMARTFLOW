import { Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import { LINKS } from "../data/content";
import { HEADLINE } from "../data/results";
import SignalMark from "./SignalMark";
import Reveal from "./Reveal";

export default function Footer() {
  const contacts = [
    { href: LINKS.ownerGithub, label: "GitHub", icon: Github },
    { href: LINKS.ownerLinkedin, label: "LinkedIn", icon: Linkedin },
    { href: `mailto:${LINKS.ownerEmail}`, label: "Email", icon: Mail },
  ];

  return (
    <footer className="border-t border-rule bg-surface">
      <div className="mx-auto max-w-page px-6 py-16 md:px-10 md:py-20">
        <Reveal>
          <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5 font-display text-xl font-semibold text-ink">
                <SignalMark className="h-6 w-6" />
                SmartFlow
              </div>
              <p className="mt-4 max-w-prose font-display text-2xl font-medium leading-snug text-ink">
                A traffic signal that learns to clear the queue —{" "}
                <span className="text-go">{HEADLINE.waitReductionVsFixed}% less waiting</span>{" "}
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
                  href="#top"
                  className="inline-flex items-center gap-2 rounded border border-ink px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  Back to top
                </a>
              </div>
            </div>

            <div className="md:justify-self-end">
              <span className="microlabel">Built by {LINKS.ownerName}</span>
              <ul className="mt-5 space-y-1">
                {contacts.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 py-1.5 text-ink transition-colors hover:text-go"
                    >
                      <Icon className="h-4 w-4 text-graphite group-hover:text-go" aria-hidden="true" />
                      <span className="font-medium">{label}</span>
                      <ArrowUpRight className="h-4 w-4 text-rule transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-go" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col items-start justify-between gap-2 border-t border-rule pt-6 text-sm text-graphite md:flex-row md:items-center">
          <p className="font-mono text-xs">
            SmartFlow · RL traffic-signal control · group project
          </p>
          <p className="font-mono text-xs text-muted">
            Results from SUMO · seeds 42 / 7 / 123 · no figures invented
          </p>
        </div>
      </div>
    </footer>
  );
}
