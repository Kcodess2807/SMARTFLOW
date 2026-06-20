interface Props {
  className?: string;
}

/** The SmartFlow mark: a three-lamp signal head with the "go" lamp active. */
export default function SignalMark({ className }: Props) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="SmartFlow"
    >
      <rect x="9.5" y="3" width="13" height="26" rx="3.5" className="fill-ink" />
      <circle cx="16" cy="9" r="2.6" className="fill-stop" />
      <circle cx="16" cy="16" r="2.6" className="fill-amber" />
      <circle cx="16" cy="23" r="2.9" className="fill-go" />
    </svg>
  );
}
