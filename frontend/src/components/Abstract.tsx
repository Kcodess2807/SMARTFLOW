import Reveal from "./Reveal";
import Citation from "./Citation";
import { ABSTRACT, CONTRIBUTIONS } from "../data/content";

// Abstract + Contributions — the "paper" entry point right after the hero.
// Carries the headline result in prose so a 30-second scan still lands.
export default function Abstract() {
  return (
    <section
      id="abstract"
      aria-labelledby="abstract-title"
      className="mx-auto w-full max-w-page px-6 py-16 md:px-10 md:py-20"
    >
      <Reveal>
        <div className="border-t border-rule pt-6">
          <h2 id="abstract-title" className="microlabel text-go-deep">
            Abstract
          </h2>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
            <p className="max-w-prose text-lg leading-relaxed text-ink">
              {ABSTRACT}
              <span className="align-baseline">
                <Citation n={[1, 3, 6]} />
              </span>
            </p>

            <div className="lg:border-l lg:border-rule lg:pl-10">
              <h3 className="microlabel">Contributions</h3>
              <ul className="mt-4 space-y-3">
                {CONTRIBUTIONS.map((c, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-graphite">
                    <span className="font-mono text-xs text-go-deep">
                      C{i + 1}
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
