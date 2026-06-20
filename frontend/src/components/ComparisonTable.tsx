import { RESULTS, METRICS } from "../data/results";

/** Full RL-vs-baselines comparison; RL row highlighted, best value per column marked. */
export default function ComparisonTable() {
  const best = Object.fromEntries(
    METRICS.map((m) => {
      const vals = RESULTS.map((r) => r[m.key]);
      return [m.key, m.betterWhen === "lower" ? Math.min(...vals) : Math.max(...vals)];
    })
  );

  return (
    <div className="figure-frame overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          RL agent versus fixed-time, actuated, and max-pressure baselines across
          all measured metrics.
        </caption>
        <thead>
          <tr className="border-b border-rule text-left">
            <th scope="col" className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted">
              Controller
            </th>
            {METRICS.map((m) => (
              <th
                key={m.key}
                scope="col"
                className="px-5 py-3 text-right font-mono text-xs uppercase tracking-widest text-muted"
              >
                {m.label}
                <span className="ml-1 normal-case text-rule">
                  {m.betterWhen === "lower" ? "↓" : "↑"}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RESULTS.map((r) => (
            <tr
              key={r.controller}
              className={`border-b border-rule last:border-0 ${
                r.isRL ? "bg-go-tint" : ""
              }`}
            >
              <th
                scope="row"
                className={`px-5 py-3 text-left font-sans font-medium ${
                  r.isRL ? "text-go-deep" : "text-ink"
                }`}
              >
                {r.controller}
                {r.isRL && (
                  <span className="ml-2 rounded-sm bg-go px-1.5 py-0.5 align-middle font-mono text-[10px] uppercase tracking-wider text-white">
                    learned
                  </span>
                )}
              </th>
              {METRICS.map((m) => {
                const v = r[m.key];
                const isBest = v === best[m.key];
                return (
                  <td
                    key={m.key}
                    className={`px-5 py-3 text-right font-mono ${
                      isBest ? "font-bold text-ink" : "text-graphite"
                    }`}
                  >
                    {v.toLocaleString()}
                    {isBest && <span className="ml-1 text-go">●</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
