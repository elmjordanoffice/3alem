import { cn } from "@/lib/utils";

/** The estimate after each stage of the week, tightening towards 3.9. */
export const STAGES = [
  { scene: 0, low: 1, high: 5, est: 3 },
  { scene: 2, low: 1.8, high: 4.8, est: 3.3 },
  { scene: 4, low: 2.6, high: 4.6, est: 3.6 },
  { scene: 6, low: 3.2, high: 4.4, est: 3.8 },
  { scene: 9, low: 3.6, high: 4.2, est: 3.9 },
] as const;

/* Geometry, in viewBox units. Levels 1–5 run bottom to top. */
const W = 560;
const H = 236;
const X0 = 40;
const X1 = 538;
const Y5 = 18;
const Y1 = 202;
const yAt = (level: number) => Y1 - ((level - 1) / 4) * (Y1 - Y5);
const xAt = (i: number) => X0 + (i / (STAGES.length - 1)) * (X1 - X0);
const r1 = (n: number) => Math.round(n * 10) / 10;

/** A smooth line through the points (Catmull–Rom as cubic Béziers). */
export function curve(pts: [number, number][], lead: "M" | "L" = "M") {
  let d = `${lead}${r1(pts[0]![0])},${r1(pts[0]![1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r1(c1[0]!)},${r1(c1[1]!)} ${r1(c2[0]!)},${r1(c2[1]!)} ${r1(p2[0])},${r1(p2[1])}`;
  }
  return d;
}

/**
 * One skill across the week: the band of plausible levels as a glowing area,
 * violet while it is wide and warming to coral as it narrows, the estimate as
 * a bright line, and a coral dot with a soft halo where it lands. Time runs
 * with the reading direction (right to left in Arabic), like the app's own
 * charts; the level scale reads bottom to top. Reveals once along the time
 * axis; still under reduced motion. Decorative: give the figure around it a
 * text alternative.
 */
export function NarrowingChart({ rtl, id, labels }: { rtl: boolean; id: string; labels: { start: string; scene: (n: number) => string; low: string; high: string } }) {
  const X = (x: number) => (rtl ? W - x : x);
  const upper = STAGES.map((s, i) => [X(xAt(i)), yAt(s.high)] as [number, number]);
  const lower = STAGES.map((s, i) => [X(xAt(i)), yAt(s.low)] as [number, number]);
  const est = STAGES.map((s, i) => [X(xAt(i)), yAt(s.est)] as [number, number]);
  const area = `${curve(upper)} ${curve([...lower].reverse(), "L")} Z`;
  const end = est[est.length - 1]!;
  const last = STAGES.length - 1;

  return (
    <div aria-hidden>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible">
          <defs>
            <linearGradient id={`${id}-band`} gradientUnits="userSpaceOnUse" x1={X(X0)} y1="0" x2={X(X1)} y2="0">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.16} />
              <stop offset="55%" stopColor="var(--chart-1)" stopOpacity={0.42} />
              <stop offset="100%" stopColor="var(--signal)" stopOpacity={0.62} />
            </linearGradient>
            <linearGradient id={`${id}-edge`} gradientUnits="userSpaceOnUse" x1={X(X0)} y1="0" x2={X(X1)} y2="0">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--signal)" stopOpacity={0.9} />
            </linearGradient>
            <filter id={`${id}-blur`} x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>
          {/* Grid: one line per level, solid at the ends of the scale */}
          {[1, 2, 3, 4, 5].map((l) => (
            <line key={l} x1={X(X0)} x2={X(X1)} y1={yAt(l)} y2={yAt(l)} stroke="var(--chart-grid)" strokeWidth={1} strokeDasharray={l === 1 || l === 5 ? undefined : "4 6"} />
          ))}
          <g className="r-reveal">
            <path d={area} fill={`url(#${id}-band)`} filter={`url(#${id}-blur)`} opacity={0.85} />
            <path d={area} fill={`url(#${id}-band)`} />
            <path d={curve(upper)} fill="none" stroke={`url(#${id}-edge)`} strokeWidth={1.5} />
            <path d={curve(lower)} fill="none" stroke={`url(#${id}-edge)`} strokeWidth={1.5} />
            <path d={curve(est)} fill="none" stroke="var(--accent)" strokeWidth={6} strokeLinecap="round" opacity={0.45} filter={`url(#${id}-blur)`} />
            <path d={curve(est)} fill="none" stroke="var(--text)" strokeWidth={2.25} strokeLinecap="round" />
            {est.slice(0, -1).map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r={4} fill="var(--surface)" stroke="var(--text)" strokeWidth={2} />
            ))}
          </g>
          <circle className="r-halo" cx={end[0]} cy={end[1]} r={8} fill="var(--signal)" />
          <circle className="r-pop" cx={end[0]} cy={end[1]} r={7.5} fill="var(--signal)" stroke="var(--surface)" strokeWidth={3} style={{ filter: "drop-shadow(0 0 8px var(--signal))" }} />
        </svg>
        {/* Level numbers on the start side; the scale's words at the far end, where the band has narrowed away. */}
        {[1, 2, 3, 4, 5].map((l) => (
          <span key={l} className="absolute start-0 -translate-y-1/2 text-[11px] leading-none text-tertiary tabular" style={{ top: `${(yAt(l) / H) * 100}%` }}>
            {l}
          </span>
        ))}
        <span className="absolute end-0 -translate-y-full pb-1 text-[11px] leading-none text-tertiary rtl:text-xs" style={{ top: `${(Y5 / H) * 100}%` }}>
          {labels.high}
        </span>
        <span className="absolute end-0 -translate-y-full pb-1 text-[11px] leading-none text-tertiary rtl:text-xs" style={{ top: `${(Y1 / H) * 100}%` }}>
          {labels.low}
        </span>
      </div>
      {/* Stages along the time axis */}
      <div className="relative mt-2 h-5 text-[11px] text-tertiary rtl:text-xs">
        {STAGES.map((s, i) => (
          <span
            key={s.scene}
            className={cn("absolute top-0 whitespace-nowrap", i % 2 === 1 && "max-sm:hidden", i === 0 ? "" : i === last ? "-translate-x-full rtl:translate-x-full" : "-translate-x-1/2 rtl:translate-x-1/2", i === last && "font-semibold text-text")}
            style={{ insetInlineStart: `${((i === 0 ? X0 - 6 : i === last ? X1 + 8 : xAt(i)) / W) * 100}%` }}
          >
            {s.scene === 0 ? labels.start : labels.scene(s.scene)}
          </span>
        ))}
      </div>
    </div>
  );
}
