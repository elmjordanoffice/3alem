"use client";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useNumbers } from "@/components/providers";

/**
 * Progress by chapter, never by question count: the assessment adapts, so a
 * count would be wrong and would create pressure.
 */
export function ChapterProgress({
  chapters,
  current,
  className,
}: {
  chapters: string[];
  /** 0-based index of the current chapter. */
  current: number;
  className?: string;
}) {
  const t = useTranslations("components.chapters");
  const n = useNumbers();
  return (
    <nav aria-label={t("label")} className={cn("flex flex-col gap-2", className)}>
      <p className="text-sm text-secondary">
        <span className="font-medium text-text">
          {t("chapterOf", { current: n.number(current + 1), total: n.number(chapters.length) })}
        </span>
        <span aria-hidden> · </span>
        <span>{chapters[current]}</span>
      </p>
      <ol className="flex gap-1">
        {chapters.map((name, i) => {
          const state = i < current ? "done" : i === current ? "current" : "upcoming";
          return (
            <li key={name} className="flex-1" aria-current={state === "current" ? "step" : undefined}>
              <span className="sr-only">
                {name}: {t(state)}
              </span>
              <span
                aria-hidden
                className={cn(
                  "block h-1 rounded-full transition-colors duration-250",
                  state === "done" && "bg-accent",
                  state === "current" && "bg-accent/50",
                  state === "upcoming" && "bg-surface-sunken",
                )}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Vertical chapter list, for the briefing and transitions. */
export function ChapterList({ chapters, current }: { chapters: string[]; current: number }) {
  const t = useTranslations("components.chapters");
  const n = useNumbers();
  return (
    <ol className="flex flex-col">
      {chapters.map((name, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={name} className="flex items-center gap-3 py-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular",
                done && "bg-accent text-accent-foreground",
                active && "bg-accent-subtle text-accent-text ring-1 ring-inset ring-accent",
                !done && !active && "bg-surface-sunken text-tertiary",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : n.number(i + 1)}
            </span>
            <span className={cn("text-sm", active ? "font-medium text-text" : done ? "text-secondary" : "text-tertiary")}>
              {name}
            </span>
            <span className="sr-only">{t(done ? "done" : active ? "current" : "upcoming")}</span>
          </li>
        );
      })}
    </ol>
  );
}
