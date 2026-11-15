import { cn } from "@/lib/utils";

/**
 * Aalim's signature: an estimate on the 1–5 scale as a band that narrows as
 * evidence comes in. The band is the plausible range; the dot is the estimate;
 * the tick marks the level the role expects.
 */
export function RangeScale({
  low,
  high,
  estimate,
  expected,
  size = "md",
  tone = "accent",
  animate = false,
  className,
  labels,
}: {
  low: number;
  high: number;
  estimate: number;
  expected?: number;
  size?: "sm" | "md" | "lg";
  tone?: "accent" | "ink";
  /** Animate from a wide band to this one, once (respects reduced motion). */
  animate?: boolean;
  className?: string;
  /** Optional labels under levels 1 and 5. */
  labels?: [string, string];
}) {
  const pct = (v: number) => ((Math.min(5, Math.max(1, v)) - 1) / 4) * 100;
  const h = size === "lg" ? "h-3" : size === "sm" ? "h-1.5" : "h-2";
  const dot = size === "lg" ? "size-4" : size === "sm" ? "size-2.5" : "size-3";
  const band = tone === "ink" ? "bg-saffron/85" : "bg-accent/25";
  const fill = tone === "ink" ? "bg-ink-foreground" : "bg-accent";
  const track = tone === "ink" ? "bg-ink-foreground/10" : "bg-level-empty";
  return (
    <div className={cn("w-full", className)} aria-hidden>
      <div className={cn("relative rounded-full", h, track)}>
        {[2, 3, 4].map((l) => (
          <span key={l} className={cn("absolute inset-y-0 w-px", tone === "ink" ? "bg-ink/60" : "bg-background")} style={{ insetInlineStart: `${pct(l)}%` }} />
        ))}
        <span
          className={cn("absolute inset-y-0 rounded-full", band, animate && "range-narrow")}
          style={{ insetInlineStart: `${pct(low)}%`, width: `${Math.max(3, pct(high) - pct(low))}%` }}
        />
        {expected ? <span className={cn("absolute -inset-y-1 w-0.5 rounded-full", tone === "ink" ? "bg-ink-foreground/70" : "bg-text/60")} style={{ insetInlineStart: `calc(${pct(expected)}% - 1px)` }} /> : null}
        <span
          className={cn("absolute top-1/2 -translate-y-1/2 rounded-full ring-2", dot, fill, tone === "ink" ? "ring-ink" : "ring-surface", animate && "range-dot")}
          style={{ insetInlineStart: `calc(${pct(estimate)}% - ${size === "lg" ? 8 : size === "sm" ? 5 : 6}px)` }}
        />
      </div>
      {labels ? (
        <div className={cn("mt-1.5 flex justify-between text-[11px]", tone === "ink" ? "text-ink-secondary" : "text-tertiary")}>
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      ) : null}
    </div>
  );
}
