"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { BarChart3, ChevronDown, FileText, Mail, RotateCw, Table2 } from "lucide-react";
import type { CandidateView, Branding } from "@/lib/hire/candidate-state";
import { MaterialView } from "@/components/assessment/document-viewer";
import { QuietTimer } from "@/components/assessment/quiet-timer";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useNumbers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { brandStyle } from "./brand";

type ItemView = Extract<CandidateView, { view: "item" }>;
const ICONS = { email: Mail, memo: FileText, table: Table2, chart: BarChart3 } as const;

/**
 * The scene as a vertical deck on phones, like a feed: one full-screen slide
 * for the scenario, one per document, then the task. Paging uses the
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
  const n = useNumbers();
  const { item } = v;
  const content = item.content;
  const stage = item.stage;
  const deckRef = React.useRef<HTMLDivElement>(null);
  const [current, setCurrent] = React.useState(0);
  const [typing, setTyping] = React.useState(false);

  const slides = 1 + content.materials.length + 1;
  const taskIndex = slides - 1;

  // Follow-ups open on the task slide; a new scene opens on its scenario.
  React.useEffect(() => {
    if (stage === "MAIN") return;
    const el = deckRef.current?.querySelector<HTMLElement>(`[data-slide="${taskIndex}"]`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  }, [stage, taskIndex]);

  // Which slide is on screen, for the rail and the hint (no work on every scroll frame).
  React.useEffect(() => {
    const root = deckRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.slide));
      },
      { root, threshold: 0.55 },
    );
    root.querySelectorAll("[data-slide]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [slides]);

  const go = (i: number) => {
    const el = deckRef.current?.querySelector<HTMLElement>(`[data-slide="${Math.max(0, Math.min(taskIndex, i))}"]`);
    el?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-40 flex flex-col bg-background text-text" style={brandStyle(v.branding.brandColor)}>
      <DeckBar branding={v.branding} chapters={v.world.chapters.map((c) => c.title)} chapter={v.chapterIndex} deadline={deadline} onExpire={onExpire} online={online} />

      {/* While typing, snapping steps aside so the keyboard and caret never fight the pager. */}
      <div
        ref={deckRef}
        onFocusCapture={(e) => {
          if ((e.target as HTMLElement).matches("textarea, input, [contenteditable='true']")) setTyping(true);
        }}
        onBlurCapture={() => setTyping(false)}
        className={cn("deck animate-deck-in relative flex-1 overflow-y-auto overscroll-contain", typing ? "snap-none" : "snap-y snap-mandatory")}
      >
        <Slide index={0} className="justify-between">
          <div className="flex flex-col gap-5 pt-2">
            <p className="eyebrow text-tertiary">{t("scene", { chapter: v.world.chapters[v.chapterIndex]?.title ?? "" })}</p>
            <h1 className="font-display text-[2.25rem] font-extrabold leading-[1.02] tracking-[-0.01em] text-text [font-stretch:112%]" dir="auto">
              {content.title}
            </h1>
            <p className="whitespace-pre-line text-[17px] leading-[1.6] text-text" dir="auto">
              {content.scenario}
            </p>
          </div>
          <NextHint onClick={() => go(1)} label={content.materials.length ? t("toMaterials", { count: content.materials.length }) : t("toTask")} />
        </Slide>

        {content.materials.map((m, i) => {
          const Icon = ICONS[m.kind];
          const index = i + 1;
          return (
            <Slide key={m.id} index={index}>
              <div className="flex items-center gap-2.5 pt-2 text-sm text-secondary">
                <span className="grid size-8 place-items-center rounded-full bg-surface shadow-card">
                  <Icon className="size-4 text-text" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="eyebrow text-tertiary">{t("document", { n: n.number(i + 1), total: n.number(content.materials.length) })}</span>
              </div>
              <h2 className="mt-3 text-[1.5rem] leading-tight text-text" dir="auto">{m.title}</h2>
              <div className="mt-4 [&_table]:text-[13px]">
                <MaterialView material={m} />
              </div>
              <NextHint onClick={() => go(index + 1)} label={index + 1 === taskIndex ? t("toTask") : t("next")} className="mt-auto pt-8" />
            </Slide>
          );
        })}

        <Slide index={taskIndex} task>
          <div className="flex flex-col gap-3 pt-2">
            <p className="eyebrow flex items-center gap-2 text-text">
              <span className="size-1.5 rounded-full bg-saffron" aria-hidden />
              {label}
            </p>
            {stage === "TWIST" && content.twist?.change ? (
              <div className="rounded-[14px] border-s-[3px] border-saffron bg-surface p-4 text-[16px] leading-relaxed text-text shadow-card" dir="auto">
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
          {/* The action rides at the bottom of the screen while you work on the task. */}
          <div className="sticky bottom-0 -mx-5 mt-6 border-t border-border bg-background/90 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
            <Button size="lg" className="h-[52px] w-full rounded-[14px] text-[16px]" onClick={onSubmit} disabled={!value} loading={submitting}>
              {submitLabel}
            </Button>
            <p className="mt-2 text-center text-xs text-tertiary">{value ? ti("readyHint") : ti("incompleteHint")}</p>
          </div>
        </Slide>
      </div>

      {/* The rail: where you are in this scene. */}
      <ol className="pointer-events-none fixed end-2 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-1.5" aria-hidden>
        {Array.from({ length: slides }, (_, i) => (
          <li key={i} className={cn("w-1 rounded-full transition-all duration-300 ease-[var(--ease-out)]", i === current ? "h-5 bg-text" : "h-1 bg-text/25", i === taskIndex && i !== current && "bg-saffron")} />
        ))}
      </ol>
    </div>
  );
}

function Slide({ index, task = false, className, children }: { index: number; task?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <section
      data-slide={index}
      className={cn(
        "deck-slide flex min-h-full snap-start snap-always flex-col px-5 pb-8 pe-7 pt-4",
        task && "pb-0",
        className,
      )}
    >
      {children}
    </section>
  );
}

function NextHint({ onClick, label, className }: { onClick: () => void; label: string; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("deck-hint mx-auto flex flex-col items-center gap-1 py-3 text-sm font-medium text-secondary", className)}>
      {label}
      <ChevronDown className="size-5 text-text" aria-hidden />
    </button>
  );
}

function DeckBar({ branding, chapters, chapter, deadline, onExpire, online }: { branding: Branding; chapters: string[]; chapter: number; deadline: number | null; onExpire: () => void; online: boolean }) {
  const t = useTranslations("components.chapters");
  const n = useNumbers();
  return (
    <header className="z-50 border-b border-border/70 bg-background/85 px-4 pb-2.5 pt-[max(10px,env(safe-area-inset-top))] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-text font-display text-[11px] font-bold text-background [font-stretch:125%]" aria-hidden>
            {branding.orgName.trim().charAt(0).toUpperCase()}
          </span>
          <span className="truncate text-[13px] font-semibold">{branding.orgName}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[13px] text-secondary">
          {deadline ? <QuietTimer deadline={deadline} onExpire={onExpire} /> : null}
          <span className="tabular">{t("chapterOf", { current: n.number(chapter + 1), total: n.number(chapters.length) })}</span>
          <span className={cn("size-1.5 rounded-full", online ? "bg-success" : "bg-warning")} aria-hidden />
        </span>
      </div>
      <ol className="mt-2 flex gap-1" aria-hidden>
        {chapters.map((c, i) => (
          <li key={c} className={cn("h-[3px] flex-1 rounded-full", i < chapter ? "bg-text" : i === chapter ? "bg-saffron" : "bg-text/15")} />
        ))}
      </ol>
    </header>
  );
}
