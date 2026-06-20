import { Github } from "lucide-react";
import { LINKS } from "../data/content";
import SignalMark from "./SignalMark";

const NAV_ITEMS = [
  { href: "#approach", label: "Approach" },
  { href: "#results", label: "Results" },
  { href: "#architecture", label: "How it works" },
  { href: "#build", label: "System" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-sm">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-page items-center justify-between px-6 md:px-10"
      >
        <a
          href="#top"
          className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-ink"
        >
          <SignalMark className="h-6 w-6" />
          SmartFlow
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="font-mono text-xs uppercase tracking-widest text-graphite transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded border border-ink bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-transparent hover:text-ink"
        >
          <Github className="h-4 w-4" aria-hidden="true" />
          <span>GitHub</span>
        </a>
      </nav>
    </header>
  );
}
