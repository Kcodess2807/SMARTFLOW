import type { ReactNode } from "react";
import Reveal from "./Reveal";

interface SectionProps {
  id: string;
  /** two-digit plate number, e.g. "01" */
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Editorial section shell: a numbered plate header in the engineering-paper
 * voice (mono micro-label + serif title), with a hairline rule. Semantic
 * <section> with an aria-labelledby heading for screen-reader navigation.
 */
export default function Section({
  id,
  index,
  label,
  title,
  intro,
  children,
  className = "",
}: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`mx-auto w-full max-w-page px-6 py-20 md:px-10 md:py-28 ${className}`}
    >
      <Reveal>
        <header className="border-t border-rule pt-6">
          <div className="flex items-baseline gap-4">
            <span className="microlabel text-go-deep">{index}</span>
            <span className="microlabel">{label}</span>
          </div>
          <h2
            id={headingId}
            className="mt-5 max-w-3xl font-display text-display-sm font-semibold tracking-tight text-ink"
          >
            {title}
          </h2>
          {intro && (
            <p className="mt-5 max-w-prose text-lg leading-relaxed text-graphite">
              {intro}
            </p>
          )}
        </header>
      </Reveal>
      <div className="mt-12 md:mt-16">{children}</div>
    </section>
  );
}
