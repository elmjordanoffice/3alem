import type * as React from "react";
import { cn } from "@/lib/utils";

/** A level on the 1–5 scale as a percentage of the track. */
export function pct(v: number) {
  return ((Math.min(5, Math.max(1, v)) - 1) / 4) * 100;
}

/**
 * One range band, drawn in three parts (a body that scales and two round caps
 * that slide) so it can narrow with transforms alone and still come to rest
 * crisp. Place it inside a `.r-track`, which sets `--bh` and the inset; see
 * "The band" in globals.css. `i` staggers it when it animates.
 */
export function Band({ low, high, i = 0, className }: { low: number; high: number; i?: number; className?: string }) {
  const l = pct(low);
  const w = pct(high) - l;
  return (
    <span className={cn("r-band", className)} style={{ "--l": l, "--w": w, "--i": i } as React.CSSProperties}>
      <i className="r-band-m" />
      <i className="r-band-s" />
      <i className="r-band-e" />
    </span>
  );
}

/** Initials in a stone circle, set in the display face (characters never get photos). */
export function Initials({ name, className }: { name: string; className?: string }) {
  const parts = name.trim().split(/\s+/);
  const a = Array.from(parts[0] ?? "")[0] ?? "";
  const b = parts.length > 1 ? (Array.from(parts[parts.length - 1] ?? "")[0] ?? "") : "";
  const joiner = /[؀-ۿ]/.test(a + b) ? "‌" : "";
  return (
    <span aria-hidden className={cn("inline-grid size-8 shrink-0 place-items-center rounded-full bg-[#ebe8e1] font-display text-[11px] font-bold uppercase text-text [font-stretch:112%]", className)}>
      {a + joiner + b}
    </span>
  );
}
