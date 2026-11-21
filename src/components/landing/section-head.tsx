import { cn } from "@/lib/utils";

/**
 * The running head that opens each section: a full-width rule, the section's
 * number and its name, set on the page grid.
 */
export function SectionHead({ index, label, onInk = false }: { index: string; label: string; onInk?: boolean }) {
  return (
    <div className={cn("grid grid-cols-4 items-baseline gap-x-4 border-t pt-4 md:grid-cols-8 lg:grid-cols-12 lg:gap-x-6", onInk ? "border-ink-foreground/35" : "border-text")}>
      <span className="r-index text-[13px]">{index}</span>
      <span className={cn("r-label col-span-3 md:col-span-7 lg:col-span-11", onInk ? "text-ink-secondary" : "text-secondary")}>{label}</span>
    </div>
  );
}
