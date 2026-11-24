import type * as React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Check, CornerDownLeft, MessageSquareText, Share2 } from "lucide-react";
import { LogoTile } from "@/components/brand/logo";
import { FitPill, type FitLevel } from "@/components/report/fit";
import { RangeScale } from "@/components/report/range-scale";
import { levelBand } from "@/lib/levels";
import { cn } from "@/lib/utils";
import { Band, Initials, pct } from "./bands";

/*
 * Real fragments of the product, built from its components and set on the
 * landing page as figures. Every name, scene and number is the demo story
 * the product itself ships with (Qamar Logistics, a fictional company).
 */

const range = (lo: number, hi: number) => `${lo.toFixed(1)}–${hi.toFixed(1)}`;

async function quotes() {
  return (await getLocale()) === "ar" ? (["«", "»"] as const) : (["“", "”"] as const);
}

/** A card in its well: rounded and lifted by light, no lines. */
function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[18px] bg-surface text-text shadow-card", className)}>{children}</div>;
}

/* ── Step 1: a scene from the week ─────────────────────────────────────── */
export async function SceneCard() {
  const t = await getTranslations("landing.how.scene");
  return (
    <Card className="w-full overflow-hidden">
      <div className="flex items-center justify-between gap-3 bg-surface-subtle px-4 py-3 text-xs rtl:text-[13px]">
        <span className="min-w-0 truncate font-medium text-secondary">{t("chapter")}</span>
        <span className="flex shrink-0 items-center gap-2 whitespace-nowrap text-tertiary">
          <span className="hidden gap-0.5 sm:flex lg:hidden 2xl:flex" dir="ltr">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className={cn("h-1 w-2.5 rounded-full", i < 4 ? "bg-accent shadow-[0_0_6px_rgb(108_92_231/0.8)]" : "bg-surface-sunken")} />
            ))}
          </span>
          {t("progress")}
        </span>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Initials name={t("from")} className="size-9 bg-accent text-accent-foreground" />
          <div className="min-w-0 flex-1">
            <p className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-semibold">{t("from")}</span>
              <bdi dir="ltr" className="text-xs text-tertiary tabular">09:12</bdi>
            </p>
            <p className="truncate text-xs text-tertiary rtl:text-[13px]">{t("fromRole")}</p>
          </div>
        </div>
        <p className="mt-4 text-[15px] font-semibold leading-snug">{t("subject")}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-secondary rtl:text-[15px] rtl:leading-[1.8]">{t("message")}</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-secondary rtl:text-[13px]">
          <span className="size-1.5 rounded-full bg-[var(--signal)]" aria-hidden />
          {t("adaptive")}
        </p>
        <div className="mt-4 rounded-[14px] bg-surface-subtle shadow-[0_0_0_3px_var(--accent-subtle),inset_0_0_0_1px_var(--accent)]">
          <p className="px-3.5 pt-3 text-xs font-medium text-tertiary rtl:text-[13px]">{t("replyLabel")}</p>
          <p className="px-3.5 pb-3 pt-1 text-sm leading-relaxed rtl:text-[15px] rtl:leading-[1.8]">
            {t("reply")}
            <span className="ms-0.5 inline-block h-[1.1em] w-0.5 translate-y-[0.2em] rounded-full bg-accent" aria-hidden />
          </p>
          <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1 text-xs text-tertiary">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5" strokeWidth={2} aria-hidden />
              {t("saved")}
            </span>
            <span className="inline-grid size-7 place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_6px_14px_-6px_rgb(108_92_231/0.9)]">
              <CornerDownLeft className="flip-rtl size-3.5" strokeWidth={2} aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ── Step 2: one skill, narrowing scene by scene ──────────────────────── */
const STEPS = [
  { n: 1, low: 1.6, high: 4.6, est: 3.1 },
  { n: 3, low: 2.6, high: 4.5, est: 3.6 },
  { n: 6, low: 3.2, high: 4.3, est: 3.8 },
  { n: 9, low: 3.6, high: 4.2, est: 3.9 },
] as const;

export async function NarrowingCard() {
  const t = await getTranslations("landing.how.range");
  return (
    <Card className="w-full overflow-hidden p-4 sm:p-5">
      <div data-narrow className="[--bh:10px]">
        <p className="text-sm font-semibold">{t("skill")}</p>
        <ul className="mt-5 flex flex-col gap-3.5">
          {STEPS.map((s, i) => {
            const last = i === STEPS.length - 1;
            return (
              <li key={s.n}>
                <div className={cn("flex items-baseline justify-between gap-3 text-xs rtl:text-[13px]", last ? "font-semibold text-text" : "text-tertiary")}>
                  <span>{t("after", { n: s.n })}</span>
                  <bdi dir="ltr" className="r-fade tabular" style={{ "--i": i } as React.CSSProperties}>
                    {range(s.low, s.high)}
                  </bdi>
                </div>
                <div dir="ltr" className="relative mt-2">
                  <span className="relative block h-[var(--bh)] rounded-full bg-level-empty">
                    {[2, 3, 4].map((l) => (
                      <span key={l} className="absolute inset-y-0 w-px bg-surface" style={{ left: `calc(var(--bh) / 2 + (100% - var(--bh)) * ${pct(l) / 100})` }} />
                    ))}
                  </span>
                  <span className="absolute inset-x-0 top-0 block">
                    <span className="r-track block">
                      <Band low={s.low} high={s.high} i={i} className="r-glow text-[var(--signal)]" />
                      <span className="absolute -top-1.5 h-[calc(var(--bh)+12px)] w-0.5 -translate-x-1/2 rounded-full bg-accent" style={{ left: `${pct(4)}%` }} />
                      <span className="r-at" style={{ "--x": pct(s.est), "--i": i } as React.CSSProperties}>
                        <span className="absolute -left-[7px] -top-[2px] size-3.5 rounded-full bg-text ring-[3px] ring-surface shadow-[0_1px_4px_rgb(6_4_30/0.4)]" />
                      </span>
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        <div dir="ltr" className="mt-2 flex justify-between text-[11px] text-tertiary rtl:text-xs">
          <span dir="auto">{t("low")}</span>
          <span dir="auto">{t("high")}</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
          <span className="font-semibold">
            {t("level")} <bdi dir="ltr" className="font-normal text-secondary tabular">3.6–4.2</bdi>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-tertiary rtl:text-[13px]">
            <span className="inline-block h-3 w-0.5 rounded-full bg-accent" aria-hidden />
            {t("expected")} <bdi dir="ltr" className="tabular">4.0</bdi>
          </span>
        </div>
      </div>
    </Card>
  );
}

/* ── Step 3: the words behind a score ─────────────────────────────────── */
export async function EvidenceFragment() {
  const t = await getTranslations("landing.how.evidence");
  const [qo, qc] = await quotes();
  return (
    <Card className="w-full overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-3 text-xs rtl:text-[13px]">
          <span className="font-medium text-secondary">{t("label")}</span>
          <span className="text-tertiary">{t("source")}</span>
        </div>
        <blockquote className="mt-3 text-[15px] leading-[1.7] rtl:text-base rtl:leading-[1.9]">
          {qo}
          {t("answerStart")} <mark className="evidence-mark">{t("answerEvidence")}</mark> {t("answerEnd")}
          {qc}
        </blockquote>
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium">{t("skill")}</span>
            <span className="shrink-0 text-xs text-secondary rtl:text-[13px]">
              {t("level")} <bdi dir="ltr" className="text-tertiary tabular">3.6–4.2</bdi>
            </span>
          </div>
          <div dir="ltr">
            <RangeScale low={3.6} high={4.2} estimate={3.9} expected={4} size="sm" className="mt-2.5" />
          </div>
        </div>
      </div>
      <div className="bg-surface-subtle p-4 sm:p-5">
        <p className="flex items-center gap-2 text-xs font-medium text-secondary rtl:text-[13px]">
          <MessageSquareText className="size-3.5" strokeWidth={1.75} aria-hidden />
          {t("askLabel")}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed rtl:text-[15px] rtl:leading-[1.8]">{t("ask")}</p>
      </div>
    </Card>
  );
}

/* ── The report ───────────────────────────────────────────────────────── */
/** A lettered marker tying a part of the report to the legend beside it. */
function Marker({ letter, ink = false, className }: { letter: string; ink?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute z-10 grid size-6 place-items-center rounded-full font-display text-[11px] font-extrabold leading-none rtl:text-[13px] rtl:font-bold",
        ink ? "bg-white text-[#4030b8] shadow-[0_6px_14px_-6px_rgb(6_4_30/0.6)]" : "bg-accent text-accent-foreground shadow-[0_6px_14px_-6px_rgb(108_92_231/0.9)]",
        className,
      )}
    >
      {letter}
    </span>
  );
}

const REPORT_SKILLS = [
  { key: "priorities", low: 3.6, high: 4.2, est: 3.9 },
  { key: "stakeholders", low: 3.3, high: 3.9, est: 3.6 },
  { key: "numbers", low: 2.4, high: 3.6, est: 3.0 },
] as const;

export async function ReportFragment() {
  const t = await getTranslations("landing.report.frame");
  const tl = await getTranslations("levels");
  const tf = await getTranslations("home.fit");
  const m = Array.from((await getTranslations("landing.report"))("markers"));
  const [qo, qc] = await quotes();

  return (
    <figure aria-label={t("label")} className="overflow-hidden rounded-card bg-surface text-text shadow-window">
      {/* Window bar */}
      <div className="flex h-14 items-center gap-3 bg-surface-subtle px-4 sm:px-5">
        <LogoTile className="size-7" />
        <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-tertiary rtl:text-[13px]">
          <span className="truncate">{t("crumb")}</span>
          <span aria-hidden>/</span>
          <span className="truncate font-medium text-secondary">{t("candidate")}</span>
        </p>
        <span className="ms-auto hidden items-center gap-1.5 text-xs text-secondary sm:inline-flex rtl:text-[13px]">
          <Share2 className="size-3.5" aria-hidden />
          {t("share")}
        </span>
        <span className="hidden rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-secondary shadow-card sm:inline-flex">PDF</span>
      </div>

      <div className="p-4 sm:p-6 lg:p-7">
        <div className="flex items-center gap-3">
          <Initials name={t("candidate")} className="size-10 text-xs" />
          <div className="min-w-0">
            <p className="font-display text-lg font-bold leading-tight tracking-[-0.01em]">{t("candidate")}</p>
            <p className="truncate text-sm text-secondary">{t("role")}</p>
          </div>
        </div>

        {/* The verdict: the page's one filled object */}
        <div className="hero-card r-on-hero relative mt-6 overflow-visible! rounded-[22px] p-5 sm:p-7">
          <Marker letter={m[0]!} ink className="-top-3 start-5 sm:start-7" />
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10">
            <div className="flex flex-col">
              <p className="text-xs text-hero-secondary rtl:text-sm">{t("roleFit")}</p>
              <p className="display-x mt-2 text-[2.5rem] leading-none sm:text-[3.25rem] rtl:text-[2.75rem] rtl:leading-[1.25] sm:rtl:text-[3.5rem]">{tf("GOOD")}</p>
              <p className="mt-3 flex items-center gap-2 text-sm">
                <span className="flex gap-0.5" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-4 rounded-full bg-saffron-light shadow-[0_0_10px_rgb(255_92_124/0.7)]" />
                  ))}
                </span>
                {t("confidence")}
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-hero-foreground rtl:text-base rtl:leading-[1.8]">{t("summary")}</p>
            </div>
            <div className="relative">
              <Marker letter={m[1]!} ink className="-top-7 start-0 md:-top-10" />
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs text-hero-secondary rtl:text-sm">{t("mustHaves")}</p>
                <p className="flex items-center gap-1.5 text-xs text-hero-secondary rtl:text-sm">
                  <span className="inline-block h-3 w-0.5 rounded-full bg-white/80" aria-hidden />
                  {t("expected")}
                </p>
              </div>
              <ul className="mt-5 flex flex-col gap-5">
                {REPORT_SKILLS.map((s) => (
                  <li key={s.key}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 font-medium">{t(`skills.${s.key}`)}</span>
                      <span className="shrink-0 text-xs text-hero-secondary rtl:text-[13px]">
                        {tl(String(levelBand(s.est)))} <bdi dir="ltr" className="tabular">{range(s.low, s.high)}</bdi>
                      </span>
                    </div>
                    <div dir="ltr">
                      <RangeScale low={s.low} high={s.high} estimate={s.est} expected={4} tone="ink" className="mt-2.5" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Under every score: her words, then what to ask */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="relative rounded-[18px] bg-surface-subtle p-4 sm:p-5">
            <Marker letter={m[2]!} className="-top-3 start-4 sm:start-5" />
            <div className="flex items-baseline justify-between gap-3 text-xs rtl:text-[13px]">
              <span className="font-medium text-secondary">{t("wordsLabel")}</span>
              <span className="text-tertiary">{t("quoteSource")}</span>
            </div>
            <blockquote className="mt-3 text-sm leading-[1.7] rtl:text-[15px] rtl:leading-[1.9]">
              {qo}
              {t("quoteStart")} <mark className="evidence-mark">{t("quoteEvidence")}</mark> {t("quoteEnd")}
              {qc}
            </blockquote>
            <p className="mt-3 text-xs text-tertiary rtl:text-[13px]">{t("skills.stakeholders")}</p>
          </div>
          <div className="relative flex flex-col rounded-[18px] bg-surface-subtle p-4 sm:p-5">
            <Marker letter={m[3]!} className="-top-3 start-4 sm:start-5" />
            <p className="text-xs font-medium text-secondary rtl:text-[13px]">{t("askLabel")}</p>
            <ol className="mb-5 mt-3 flex flex-col gap-3 text-sm leading-snug rtl:text-[15px] rtl:leading-[1.7]">
              {(["ask1", "ask2"] as const).map((k, i) => (
                <li key={k} className="flex gap-3">
                  <span className="r-index mt-px text-[11px] text-tertiary">0{i + 1}</span>
                  <span>{t(k)}</span>
                </li>
              ))}
            </ol>
            <p className="mt-auto flex items-center gap-2 pt-1 text-xs text-tertiary rtl:text-[13px]">
              <span className="flex h-3 items-end gap-px" aria-hidden>
                {[2, 3, 1, 3, 2, 3, 1, 2, 3].map((h, i) => (
                  <span key={i} className={cn("w-[3px] rounded-[1px]", i === 3 ? "bg-[var(--signal)]" : "bg-level-3")} style={{ height: `${h * 4}px` }} />
                ))}
              </span>
              {t("evidenceCount")}
            </p>
          </div>
        </div>
      </div>
    </figure>
  );
}

/* ── Hire, Grow, Team ─────────────────────────────────────────────────── */
export async function HireFragment() {
  const t = await getTranslations("landing.modes.hire");
  const tf = await getTranslations("home.fit");
  const rows: { name: string; fit: FitLevel; a: [number, number, number]; b: [number, number, number] }[] = [
    { name: t("c1"), fit: "STRONG", a: [3.6, 4.2, 3.9], b: [3.3, 3.9, 3.6] },
    { name: t("c2"), fit: "GOOD", a: [3.2, 3.9, 3.5], b: [3.6, 4.3, 4.0] },
    { name: t("c3"), fit: "PARTIAL", a: [2.4, 3.4, 2.9], b: [2.8, 3.6, 3.2] },
  ];
  return (
    <Card className="w-full overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_4.75rem_auto] items-center sm:grid-cols-[minmax(0,1fr)_7rem_auto] lg:grid-cols-[minmax(0,1fr)_4.5rem_auto] xl:grid-cols-[minmax(0,1fr)_5.5rem_auto] gap-3 bg-surface-subtle px-4 py-3 text-[11px] text-tertiary rtl:text-xs">
        <span className="font-medium text-secondary">{t("role")}</span>
        <span>{t("col1")}</span>
        <span aria-hidden />
      </div>
      <ul className="divide-y divide-border">
        {rows.map((c) => (
          <li key={c.name} className="grid grid-cols-[minmax(0,1fr)_4.75rem_auto] items-center sm:grid-cols-[minmax(0,1fr)_7rem_auto] lg:grid-cols-[minmax(0,1fr)_4.5rem_auto] xl:grid-cols-[minmax(0,1fr)_5.5rem_auto] gap-3 px-4 py-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <Initials name={c.name} className="hidden size-7 text-[10px] min-[400px]:inline-grid lg:hidden 2xl:inline-grid" />
              <span className="truncate text-sm">{c.name}</span>
            </span>
            <span dir="ltr">
              <RangeScale low={c.a[0]} high={c.a[1]} estimate={c.a[2]} expected={4} size="sm" />
            </span>
            <span className="flex justify-end">
              <FitPill fit={c.fit} label={tf(c.fit)} />
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export async function GrowFragment() {
  const t = await getTranslations("landing.modes.grow");
  return (
    <div className="flex w-full flex-col gap-3 text-sm">
      <Card className="p-4">
        <p className="flex items-center gap-2 text-xs font-medium text-secondary rtl:text-[13px]">
          <span className="grid size-5 place-items-center rounded-full bg-success-subtle text-success" aria-hidden>
            <Check className="size-3" strokeWidth={2.5} />
          </span>
          {t("wellLabel")}
        </p>
        <p className="mt-1.5 leading-relaxed rtl:text-[15px] rtl:leading-[1.8]">{t("well")}</p>
      </Card>
      <div className="ms-6 rounded-[18px] bg-accent-subtle p-4 text-text shadow-card">
        <p className="flex items-center gap-2 text-xs font-medium text-accent-text rtl:text-[13px]">
          <span className="size-1.5 rounded-full bg-[var(--signal)] shadow-[0_0_6px_var(--signal)]" aria-hidden />
          {t("expertLabel")}
        </p>
        <p className="mt-1.5 leading-relaxed rtl:text-[15px] rtl:leading-[1.8]">{t("expert")}</p>
      </div>
    </div>
  );
}

const HEAT: number[][] = [
  [4, 3, 4, 2, 3],
  [3, 4, 3, 3, 2],
  [2, 3, 3, 4, 4],
  [4, 2, 3, 3, 3],
  [3, 3, 2, 2, 4],
  [5, 4, 3, 2, 3],
];
const LEVEL_BG = ["", "bg-level-1", "bg-level-2", "bg-level-3", "bg-level-4", "bg-level-5"];

export async function TeamFragment() {
  const t = await getTranslations("landing.modes.team");
  return (
    <figure className="w-full">
      <Card className="p-3">
        <div className="grid grid-cols-5 gap-1.5" role="img" aria-label={t("heatLabel")}>
          {HEAT.flatMap((row, r) => row.map((v, c) => <span key={`${r}-${c}`} className={cn("aspect-[2.2] rounded-[6px]", LEVEL_BG[v], v === 5 && "shadow-[0_0_12px_-2px_var(--level-3)]")} />))}
        </div>
      </Card>
      <figcaption className="mt-3 flex items-center justify-between gap-3 px-1 text-xs text-secondary rtl:text-[13px]">
        <span>{t("heatCaption")}</span>
        <span className="flex gap-0.5" aria-hidden>
          {[1, 2, 3, 4, 5].map((l) => (
            <span key={l} className={cn("size-2.5 rounded-[3px]", LEVEL_BG[l])} />
          ))}
        </span>
      </figcaption>
    </figure>
  );
}

/* ── Trust: selection rates against the four-fifths line ─────────────── */
export async function FairnessChart() {
  const t = await getTranslations("landing.trust.chart");
  const rows = [
    ["a", 1],
    ["b", 0.92],
    ["c", 0.86],
  ] as const;
  return (
    <figure className="max-w-md">
      <figcaption className="text-xs font-medium text-secondary rtl:text-[13px]">{t("title")}</figcaption>
      <div className="relative mt-4 flex flex-col gap-2.5" role="img" aria-label={t("label")}>
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.75rem] items-center gap-3">
            <span className="text-xs text-tertiary rtl:text-[13px]">{t(k)}</span>
            <span className="h-2.5 rounded-full bg-level-empty">
              <span className="block h-full rounded-full bg-gradient-to-r from-[var(--chart-1)] to-[var(--blue)] shadow-[0_0_12px_-2px_var(--blue)] rtl:bg-gradient-to-l" style={{ width: `${v * 100}%` }} />
            </span>
            <bdi dir="ltr" className="text-end text-xs text-tertiary tabular">{Math.round(v * 100)}%</bdi>
          </div>
        ))}
        <span
          className="pointer-events-none absolute -bottom-2 -top-2 w-0 border-s border-dashed border-[var(--signal)]"
          style={{ insetInlineStart: "calc(4.5rem + 0.75rem + (100% - 4.5rem - 2.75rem - 1.5rem) * 0.8)" }}
          aria-hidden
        >
          <span className="absolute start-1.5 top-full mt-1 whitespace-nowrap text-[11px] text-tertiary">{t("line")}</span>
        </span>
      </div>
      <div className="h-6" aria-hidden />
    </figure>
  );
}
