"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LEVELS, confidenceBand, levelBand, levelRange } from "@/lib/levels";
import { useNumbers } from "@/components/providers";

const LEVEL_BG = ["", "bg-level-1", "bg-level-2", "bg-level-3", "bg-level-4", "bg-level-5"] as const;
const LEVEL_FG = [
  "",
  "text-[var(--level-1-fg)]",
  "text-[var(--level-2-fg)]",
  "text-[var(--level-3-fg)]",
  "text-[var(--level-4-fg)]",
  "text-[var(--level-5-fg)]",
] as const;

export function levelClasses(estimate: number) {
  const b = levelBand(estimate);
  return `${LEVEL_BG[b]} ${LEVEL_FG[b]}`;
}

/** "Advanced (3.8–4.3)". Levels always come with a range, never a percentage. */
export function LevelLabel({ estimate, confidence, range, className }: { estimate: number; confidence: number; range?: [number, number]; className?: string }) {
  const t = useTranslations("levels");
  const n = useNumbers();
  const [lo, hi] = range ?? levelRange(estimate, confidence);
  return (
    <span className={cn("text-sm", className)}>
      <span className="font-medium text-text">{t(String(levelBand(estimate)))}</span>{" "}
      {/* Ranges read low→high in both directions. */}
      <span className="text-secondary tabular">(<bdi dir="ltr">{n.range(lo, hi)}</bdi>)</span>
    </span>
  );
}

/**
 * Five segments on the single-hue ramp, with the estimate's range marked.
 * Segments up to the estimate are filled; the range shows uncertainty.
 */
export function LevelMeter({
  estimate,
  confidence,
  label,
  range,
  showLabel = true,
  className,
}: {
  estimate: number;
  confidence: number;
  label: string;
  /** Explicit range (e.g. from a report's posterior); otherwise derived from confidence. */
  range?: [number, number];
  showLabel?: boolean;
  className?: string;
}) {
  const t = useTranslations("levels");
  const tc = useTranslations("components.level");
  const n = useNumbers();
  const [lo, hi] = range ?? levelRange(estimate, confidence);
  const pct = (v: number) => ((v - 1) / 4) * 100;
  const band = levelBand(estimate);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {showLabel ? (
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-sm text-text">{label}</span>
          <LevelLabel estimate={estimate} confidence={confidence} range={[lo, hi]} className="shrink-0" />
        </div>
      ) : null}
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={Math.round(estimate * 10) / 10}
        aria-valuetext={tc("valueText", {
          level: t(String(band)),
          low: n.level(lo),
          high: n.level(hi),
          confidence: tc(`confidence.${confidenceBand(confidence)}`),
        })}
        className="relative pb-2"
      >
        <div className="flex gap-0.5">
          {LEVELS.map((l) => (
            <span
              key={l}
              className={cn(
                "h-2 flex-1 first:rounded-s-full last:rounded-e-full",
                l <= band ? LEVEL_BG[l] : "bg-level-empty",
              )}
            />
          ))}
        </div>
        <span
          aria-hidden
          className="absolute bottom-0 h-1 rounded-full bg-secondary/50"
          style={{ insetInlineStart: `${pct(lo)}%`, width: `${Math.max(2, pct(hi) - pct(lo))}%` }}
        />
      </div>
    </div>
  );
}

/** A compact chip naming a skill, optionally with its level band. */
export function SkillChip({
  name,
  estimate,
  importance,
  className,
}: {
  name: string;
  estimate?: number;
  importance?: "mustHave" | "niceToHave";
  className?: string;
}) {
  const t = useTranslations("levels");
  const tc = useTranslations("components.skill");
  const n = useNumbers();
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface py-0.5 pe-2.5 ps-1 text-xs text-text",
        estimate === undefined && "ps-2.5",
        className,
      )}
    >
      {estimate !== undefined ? (
        <span
          className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold", levelClasses(estimate))}
          title={t(String(levelBand(estimate)))}
        >
          <span className="sr-only">{t(String(levelBand(estimate)))}: </span>
          <span aria-hidden className="tabular">{n.number(levelBand(estimate))}</span>
        </span>
      ) : null}
      <span className="truncate">{name}</span>
      {importance ? (
        <span className={cn("text-[10px] font-medium", importance === "mustHave" ? "text-accent-text" : "text-tertiary")}>
          {tc(importance)}
        </span>
      ) : null}
    </span>
  );
}

/** Legend for the level ramp. */
export function LevelLegend({ className }: { className?: string }) {
  const t = useTranslations("levels");
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-secondary", className)}>
      {LEVELS.map((l) => (
        <li key={l} className="flex items-center gap-1.5">
          <span className={cn("size-3 rounded-[3px]", LEVEL_BG[l])} aria-hidden />
          {t(String(l))}
        </li>
      ))}
    </ul>
  );
}
