import { cn } from "@/lib/utils";

export type FitLevel = "STRONG" | "GOOD" | "PARTIAL" | "WEAK";

/** Role fit on the single-hue scale: darker means a closer match. Never red/green. */
const FIT_STYLE: Record<FitLevel, string> = {
  STRONG: "bg-level-5 text-[var(--level-5-fg)]",
  GOOD: "bg-level-4 text-[var(--level-4-fg)]",
  PARTIAL: "bg-level-2 text-[var(--level-2-fg)]",
  WEAK: "bg-surface-sunken text-secondary ring-1 ring-inset ring-border",
};

export function FitPill({ fit, label, className }: { fit: FitLevel; label: string; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-xs font-semibold", FIT_STYLE[fit], className)}>
      {/* The strongest match carries the estimate dot. */}
      {fit === "STRONG" ? <span className="size-1.5 rounded-full bg-saffron" aria-hidden /> : null}
      {label}
    </span>
  );
}
