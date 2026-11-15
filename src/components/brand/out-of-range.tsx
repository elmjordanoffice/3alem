/** The narrowing range with its estimate fallen off the end of the scale: for "not found" and errors. */
export function OutOfRange({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 60" className={className} aria-hidden>
      <rect x="10" y="29" width="170" height="2" rx="1" fill="var(--mark-muted)" opacity="0.6" />
      {[52.5, 95, 137.5].map((x) => (
        <rect key={x} x={x} y="25" width="1.5" height="10" rx="0.75" fill="var(--mark-muted)" opacity="0.6" />
      ))}
      <rect x="120" y="22" width="60" height="16" rx="8" fill="var(--saffron)" opacity="0.35" />
      <path d="M180 30 C 195 30, 200 44, 212 46" fill="none" stroke="var(--mark-muted)" strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx="220" cy="47" r="7" fill="var(--saffron)" />
      <circle cx="220" cy="47" r="2.6" fill="var(--ink)" />
    </svg>
  );
}
