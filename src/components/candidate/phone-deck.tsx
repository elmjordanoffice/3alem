"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, RotateCw } from "lucide-react";
import type { CandidateView, Branding } from "@/lib/hire/candidate-state";
import { QuietTimer } from "@/components/assessment/quiet-timer";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useNumbers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { brandStyle } from "./brand";
import { CoverCard, MaterialCard, TaskHeader } from "./deck-cards";
import { StoryClockLabel, useStoryTime } from "./story";

type ItemView = Extract<CandidateView, { view: "item" }>;

/**
 * The scene as a vertical deck of cards on phones, like a feed: an ink cover
 * for the situation (with art drawn from the scene), one card per document,
 * then the task. The next card peeks in at the bottom. Paging uses the
 * browser's own scroll snapping (smooth, with native momentum on iOS);
 * a slide taller than the screen scrolls inside itself before the next
 * one snaps in. Follow-ups arrive as the last slide and the deck glides to
 * it; the scenario and documents stay above to reread. Earlier scenes are
 * gone: the week only runs forwards.
 */
export function PhoneDeck({
  v,
  label,
  task,
  value,
  submitting,
  error,
  online,
  deadline,
  onExpire,
  onSubmit,
  submitLabel,
  timeUpNote,
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  v: ItemView;
  label: string;
  task: React.ReactNode;
  value: unknown;
  submitting: boolean;
  error: string | null;
  online: boolean;
  deadline: number | null;
  onExpire: () => void;
  onSubmit: () => void;
  submitLabel: string;
  timeUpNote: React.ReactNode;
}) {
  const t = useTranslations("candidate.deck");
  const ti = useTranslations("candidate.item");
  const { item } = v;
  const content = item.content;
  const stage = item.stage;
  const deckRef = React.useRef<HTMLDivElement>(null);
  const [current, setCurrent] = React.useState(0);
  const [typing, setTyping] = React.useState(false);
  const [hint, setHint] = React.useState(false);

  const slides = 1 + content.materials.length + 1;
  const taskIndex = slides - 1;
  const chapter = v.world.chapters[v.chapterIndex]?.title ?? "";
  const fmt = useStoryTime();
  const moment = v.story ? fmt(v.story.clock.minutes, v.story.clock.day) : null;

  const go = React.useCallback(
    (i: number) => {
      const el = deckRef.current?.querySelector<HTMLElement>(`[data-slide="${Math.max(0, Math.min(taskIndex, i))}"]`);
      el?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    },
    [taskIndex],
  );

  // Follow-ups open on the task card; a new scene opens on its cover.
  React.useEffect(() => {
    if (stage === "MAIN") return;
    requestAnimationFrame(() => go(taskIndex));
  }, [stage, taskIndex, go]);

  // Which card is on screen, for the rail (no work on every scroll frame).
  React.useEffect(() => {
    const root = deckRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.slide));
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll("[data-slide]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [slides]);

  // The first time anyone opens a deck on this device, the cover nudges up twice to show it moves.
  React.useEffect(() => {
    try {
      if (localStorage.getItem("aalim:deck-hint")) return;
      localStorage.setItem("aalim:deck-hint", "1");
    } catch {
      return;
    }
    const id = window.setTimeout(() => setHint(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  // Arrow keys, Page keys and Space page through the cards (not while typing).
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("textarea, input, select, [contenteditable='true'], [role='radiogroup'], [role='listbox']")) return;
    if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
      e.preventDefault();
      go(current + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
      e.preventDefault();
      go(current - 1);
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-40 flex flex-col bg-background text-text" style={brandStyle(v.branding.brandColor)}>
      <DeckBar branding={v.branding} chapters={v.world.chapters.map((c) => c.title)} chapter={v.chapterIndex} deadline={deadline} onExpire={onExpire} online={online} clock={v.story?.clock ?? null} />

      {/* While typing, snapping steps aside so the keyboard and caret never fight the pager. */}
      <div
        ref={deckRef}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onFocusCapture={(e) => {
          if ((e.target as HTMLElement).matches("textarea, input, [contenteditable='true']")) setTyping(true);
        }}
        onBlurCapture={() => setTyping(false)}
        role="region"
        aria-label={t("deckLabel")}
        className={cn("deck animate-deck-in relative flex-1 overflow-y-auto overscroll-contain outline-none", typing ? "snap-none" : "snap-y snap-mandatory")}
      >
        <Slide index={0} tone="ink" nudge={hint}>
          <CoverCard title={content.title} scenario={content.scenario} eyebrow={moment ? `${chapter} · ${moment.long} ${moment.time}` : chapter} materials={content.materials} cast={v.world.cast} note={v.story?.note ?? null} />
          <NextHint onClick={() => go(1)} label={content.materials.length ? t("toMaterials", { count: content.materials.length }) : t("toTask")} tone="ink" />
        </Slide>

        {content.materials.map((m, i) => (
          <Slide key={m.id} index={i + 1}>
            <MaterialCard material={m} index={i + 1} total={content.materials.length} org={v.world.companyName} />
            <NextHint onClick={() => go(i + 2)} label={i + 2 === taskIndex ? t("toTask") : t("next")} />
          </Slide>
        ))}

        <Slide index={taskIndex} task>
          <TaskHeader kind={content.task.kind} label={label} stage={stage} />
          <div className="mt-4 flex flex-col gap-3">
            {stage === "TWIST" && content.twist?.change ? (
              <div className="rounded-[14px] border-s-[3px] border-saffron bg-surface-subtle p-4 text-[16px] leading-relaxed text-text" dir="auto">
                {content.twist.change}
              </div>
            ) : null}
            {stage === "MAIN" ? (
              <p className="text-[19px] font-semibold leading-[1.45] text-text" dir="auto">
                {content.task.prompt}
              </p>
            ) : null}
          </div>
          {timeUpNote}
          <div className="mt-5">{task}</div>
          {error ? (
            <Alert
              className="mt-4"
              tone={online ? "critical" : "warning"}
              action={
                <Button size="sm" variant="secondary" onClick={onSubmit}>
                  <RotateCw aria-hidden />
                  {ti("retry")}
                </Button>
              }
            >
              {error}
            </Alert>
          ) : null}
          {/* The action rides at the bottom of the card while you work on the task. */}
          <div className="sticky bottom-0 -mx-5 mt-6 border-t border-border bg-surface/90 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
            <Button size="lg" className="h-[52px] w-full rounded-[14px] text-[16px]" onClick={onSubmit} disabled={!value} loading={submitting}>
              {submitLabel}
            </Button>
            <p className="mt-2 text-center text-xs text-tertiary">{value ? ti("readyHint") : ti("incompleteHint")}</p>
          </div>
        </Slide>
        {/* Room for the last card to settle at the top. */}
        <div className="h-8" aria-hidden />
      </div>

      {/* The rail: where you are in this scene. */}
      <ol className="pointer-events-none fixed end-[3px] top-1/2 z-50 flex -translate-y-1/2 flex-col gap-1.5" aria-hidden>
        {Array.from({ length: slides }, (_, i) => (
          <li key={i} className={cn("w-1 rounded-full transition-all duration-300 ease-[var(--ease-out)]", i === current ? "h-5 bg-accent" : "h-1 bg-accent/25", i === taskIndex && i !== current && "bg-saffron")} />
        ))}
      </ol>
    </div>
  );
}

/**
 * One card in the stack. The section snaps; the face inside is the card
 * (it scrolls on its own when it is long, then hands the swipe back to the
 * deck). The next card peeks in at the bottom.
 */
function Slide({ index, tone = "paper", task = false, nudge = false, children }: { index: number; tone?: "ink" | "paper"; task?: boolean; nudge?: boolean; children: React.ReactNode }) {
  return (
    <section data-slide={index} className={cn("deck-card snap-start snap-always px-3 pt-3", nudge && "deck-nudge")}>
      <div
        // Inline, so the ink card's own overflow rule can't stop a long card from scrolling.
        style={{ overflowY: "auto" }}
        className={cn(
          "deck-face flex h-full flex-col overscroll-auto rounded-[22px] p-5",
          tone === "ink" ? "hero-card" : "bg-surface shadow-card ring-1 ring-border/60",
          task && "pb-0",
        )}
      >
        {children}
      </div>
    </section>
  );
}

function NextHint({ onClick, label, tone = "paper" }: { onClick: () => void; label: string; tone?: "ink" | "paper" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("deck-hint mx-auto mt-auto flex flex-col items-center gap-1 pt-8 text-sm font-medium", tone === "ink" ? "text-hero-secondary" : "text-secondary")}
    >
      {label}
      <ChevronDown className={cn("size-5", tone === "ink" ? "text-hero-foreground" : "text-text")} aria-hidden />
    </button>
  );
}

function DeckBar({ branding, chapters, chapter, deadline, onExpire, online, clock }: { branding: Branding; chapters: string[]; chapter: number; deadline: number | null; onExpire: () => void; online: boolean; clock: { day: number; minutes: number } | null }) {
  const t = useTranslations("components.chapters");
  const n = useNumbers();
  return (
    <header className="z-50 border-b border-border/70 bg-background/85 px-4 pb-2.5 pt-[max(10px,env(safe-area-inset-top))] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-accent font-display text-[11px] font-bold text-accent-foreground [font-stretch:125%]" aria-hidden>
            {branding.orgName.trim().charAt(0).toUpperCase()}
          </span>
          <span className="truncate text-[13px] font-semibold">{branding.orgName}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[13px] text-secondary">
          {deadline ? <QuietTimer deadline={deadline} onExpire={onExpire} /> : null}
          {clock ? <StoryClockLabel clock={clock} className="font-medium text-text" /> : <span className="tabular">{t("chapterOf", { current: n.number(chapter + 1), total: n.number(chapters.length) })}</span>}
          <span className={cn("size-1.5 rounded-full", online ? "bg-success" : "bg-warning")} aria-hidden />
        </span>
      </div>
      <ol className="mt-2 flex gap-1" aria-hidden>
        {chapters.map((c, i) => (
          <li key={c} className={cn("h-[3px] flex-1 rounded-full", i < chapter ? "bg-accent" : i === chapter ? "bg-saffron" : "bg-accent/15")} />
        ))}
      </ol>
    </header>
  );
}
