"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import type { StoryClock as Clock, StoryNote } from "@/lib/hire/story";
import { useLocaleSettings, useNumbers } from "@/components/providers";
import { initials, cn } from "@/lib/utils";

/**
 * The week, alive (see src/lib/hire/story.ts): the scene's moment in the
 * story, a colleague's note about the last scene, and a loading screen that
 * sets the stage. None of it says anything about how an answer went.
 */

/** Day 1 is Monday in English and Sunday in Arabic (a Sunday–Thursday week). */
export function useStoryTime() {
  const { locale } = useLocaleSettings();
  const n = useNumbers();
  return React.useCallback(
    (minutes: number, day?: number) => {
      const hh = n.number(Math.floor(minutes / 60), { minimumIntegerDigits: 2 });
      const mm = n.number(minutes % 60, { minimumIntegerDigits: 2 });
      const time = `${hh}:${mm}`;
      if (day === undefined) return { time, short: "", long: "" };
      const base = Date.UTC(2026, 10, locale === "ar" ? 15 : 16) + (day - 1) * 86_400_000;
      return {
        time,
        short: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(base),
        long: new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(base),
      };
    },
    [locale, n],
  );
}

/** "Mon 09:10", ticking over softly when the moment changes. */
export function StoryClockLabel({ clock, long = false, className }: { clock: Clock; long?: boolean; className?: string }) {
  const t = useTranslations("candidate.story");
  const fmt = useStoryTime();
  const f = fmt(clock.minutes, clock.day);
  return (
    <span className={cn("inline-flex overflow-hidden tabular", className)}>
      <span key={`${clock.day}-${clock.minutes}`} className="clock-tick inline-block">
        {t("at", { weekday: long ? f.long : f.short, time: f.time })}
      </span>
    </span>
  );
}

/** A colleague's message, arriving a moment after the scene opens. */
export function ColleagueNote({ note, tone = "paper", className }: { note: StoryNote; tone?: "ink" | "paper"; className?: string }) {
  const t = useTranslations("candidate.story");
  const fmt = useStoryTime();
  const ink = tone === "ink";
  return (
    <div className={cn("note-in flex items-start gap-2.5", className)} role="note">
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold", ink ? "bg-white text-accent" : "bg-accent text-accent-foreground")} aria-hidden>
        {initials(note.from.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("flex flex-wrap items-baseline gap-x-2 text-xs", ink ? "text-hero-secondary" : "text-tertiary")}>
          <span className={cn("eyebrow", ink ? "text-hero-foreground" : "text-text")}>{t("message")}</span>
          <span>{t("from", { name: note.from.name, time: fmt(note.minutes).time })}</span>
        </p>
        <p
          className={cn(
            "relative mt-1.5 rounded-[14px] rounded-ss-[4px] px-3.5 py-2.5 text-[14px] leading-relaxed",
            ink ? "bg-hero-foreground/[0.08] text-hero-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)]" : "bg-surface-subtle text-text shadow-[inset_0_0_0_1px_var(--border)]",
          )}
          dir="auto"
        >
          {note.text}
        </p>
        {note.from.role ? <p className={cn("mt-1 text-[11px]", ink ? "text-hero-secondary" : "text-tertiary")}>{note.from.role}</p> : null}
      </div>
    </div>
  );
}

const LINES = ["l1", "l2", "l3", "l4", "l5", "l6"] as const;

/** While the week is being set up: the Narrowing, and the office coming to life line by line. */
export function StoryLoading() {
  const t = useTranslations("candidate.loading");
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setI((x) => Math.min(LINES.length - 1, x + 1)), 1800);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center gap-6 py-28 text-center" role="status" aria-live="polite">
      <span className="loading-narrow flex w-20 flex-col-reverse items-center gap-1.5" aria-hidden>
        {[100, 72, 44].map((w, k) => (
          <span key={k} className="block h-3 rounded-full bg-accent" style={{ width: `${w}%`, "--i": k } as React.CSSProperties} />
        ))}
        <span className="block size-3 rounded-full bg-saffron" style={{ "--i": 3 } as React.CSSProperties} />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="font-display text-xl font-extrabold text-text [font-stretch:112%]">{t("title")}</p>
        <p className="h-6 overflow-hidden text-sm text-secondary">
          <span key={i} className="clock-tick inline-block">{t(`lines.${LINES[i]}`)}</span>
        </p>
      </div>
    </div>
  );
}
