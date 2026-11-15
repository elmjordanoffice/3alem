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
  return <span className={cn("inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-medium", FIT_STYLE[fit], className)}>{label}</span>;
}
