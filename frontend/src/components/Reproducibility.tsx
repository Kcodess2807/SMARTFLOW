import { REPRODUCIBILITY } from "../data/content";

/** Exact commands to reproduce training, evaluation, and serving. */
export default function Reproducibility() {
  return (
    <div className="figure-frame overflow-hidden">
      <div className="border-b border-rule px-5 py-3">
        <span className="microlabel">Reproducibility</span>
      </div>
      <ul className="divide-y divide-rule">
        {REPRODUCIBILITY.steps.map((s) => (
          <li key={s.label} className="px-5 py-3">
            <span className="microlabel">{s.label}</span>
            <code className="mt-1.5 block overflow-x-auto whitespace-pre font-mono text-sm text-ink">
              <span className="select-none text-muted">$ </span>
              {s.cmd}
            </code>
          </li>
        ))}
      </ul>
      <p className="border-t border-rule px-5 py-3 text-xs leading-relaxed text-graphite">
        {REPRODUCIBILITY.note}
      </p>
    </div>
  );
}
