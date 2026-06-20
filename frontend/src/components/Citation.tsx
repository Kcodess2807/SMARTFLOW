import { REFERENCES } from "../data/content";

interface Props {
  /** reference number(s), e.g. 1 or [3, 4] */
  n: number | number[];
}

/** Inline superscript citation linking to the References section. */
export default function Citation({ n }: Props) {
  const nums = Array.isArray(n) ? n : [n];
  return (
    <sup className="ml-0.5 font-mono text-[0.65em] font-medium text-go-deep">
      [
      {nums.map((num, i) => {
        const ref = REFERENCES.find((r) => r.n === num);
        return (
          <span key={num}>
            {i > 0 && ", "}
            <a
              href={`#ref-${num}`}
              title={ref ? `${ref.authors} (${ref.year})` : undefined}
              className="hover:underline"
            >
              {num}
            </a>
          </span>
        );
      })}
      ]
    </sup>
  );
}
