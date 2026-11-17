import type * as React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { MessageSquareText, Share2 } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { FitPill } from "@/components/report/fit";
import { RangeScale } from "@/components/report/range-scale";
import { cn } from "@/lib/utils";

/**
 * The landing hero's figure: a real candidate report in a window frame, with
 * the scene that produced the evidence and the estimate narrowing floating
 * around it (docs/design-references.md: "the product is the hero").
 */
export async function HeroFigure() {
  const t = await getTranslations("landing.figure");
  const td = await getTranslations("landing.demo");
  const tl = await getTranslations("levels");
  const tf = await getTranslations("home.fit");
  const [qo, qc] = (await getLocale()) === "ar" ? ["«", "»"] : ["“", "”"];

  const skills = [
    { key: "priorities", low: 3.6, high: 4.2, est: 3.9, expected: 4, level: tl("4") },
    { key: "stakeholders", low: 3.3, high: 3.9, est: 3.6, expected: 3.5, level: tl("3") },
    { key: "numbers", low: 2.4, high: 3.6, est: 3.0, expected: 3, level: tl("3") },
  ] as const;

  return (
    <figure aria-label={t("label")} data-reveal className="relative mx-auto w-full max-w-[68rem] text-start">
      <div className="card-lit relative overflow-hidden rounded-[18px] text-text">
        {/* Window chrome */}
        <div className="flex h-11 items-center gap-3 border-b border-border bg-surface-subtle px-4">
          <LogoMark className="size-5" />
          <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-tertiary">
            <span className="truncate">{t("crumbRole")}</span>
            <span aria-hidden>/</span>
            <span className="truncate font-medium text-secondary">{t("candidate")}</span>
          </p>
          <span className="ms-auto hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs text-secondary sm:inline-flex">
            <Share2 className="size-3.5" aria-hidden />
            {t("share")}
          </span>
          <span className="hidden rounded-md bg-surface px-2 py-1 text-xs font-medium text-secondary shadow-card sm:inline-flex">PDF</span>
        </div>

        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_17.5rem]">
          <div className="min-w-0 p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <Avatar name={t("candidate")} className="size-11 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-semibold leading-tight text-text">{t("candidate")}</p>
                <p className="mt-0.5 truncate text-sm text-secondary">{t("role")}</p>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <FitPill fit="STRONG" label={tf("STRONG")} />
                <span className="text-xs text-tertiary">{t("confidence")}</span>
              </div>
            </div>

            <div className="mt-6 rounded-[14px] bg-ink p-4 text-ink-foreground sm:p-5">
              <p className="eyebrow text-ink-secondary">{t("summaryLabel")}</p>
              <p className="mt-2 text-[15px] leading-relaxed">{t("summary")}</p>
            </div>

            <ul className="mt-6 flex flex-col divide-y divide-border">
              {skills.map((s, i) => (
                <li key={s.key} className={cn("py-4 first:pt-0 last:pb-0", i === 2 && "hidden sm:block")}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium text-text">{t(`skills.${s.key}`)}</span>
                    <span className="shrink-0 text-xs text-secondary">
                      {s.level} <bdi dir="ltr" className="tabular text-tertiary">{s.low.toFixed(1)}–{s.high.toFixed(1)}</bdi>
                    </span>
                  </div>
                  <RangeScale low={s.low} high={s.high} estimate={s.est} expected={s.expected} size="sm" className="mt-2.5" />
                  {i === 0 ? (
                    <blockquote className="mt-3.5 border-s-2 border-saffron ps-3.5 text-sm leading-relaxed text-secondary">
                      <p>
                        {qo}
                        {td("answerStart")} <mark className="evidence-mark">{td("answerEvidence")}</mark> {td("answerEnd")}
                        {qc}
                      </p>
                      <footer className="mt-1.5 text-xs text-tertiary">{t("evidenceSource")}</footer>
                    </blockquote>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <aside className="hidden flex-col gap-5 border-s border-border bg-surface-subtle p-6 md:flex">
            <div>
              <p className="eyebrow text-tertiary">{t("evidenceLabel")}</p>
              <p className="mt-2 font-display text-[1.75rem] font-semibold leading-none text-text tabular">23</p>
              <p className="mt-1.5 text-xs text-secondary">{t("evidenceCount")}</p>
              <div className="mt-3 flex gap-1" aria-hidden>
                {[3, 2, 4, 1, 3, 2, 4, 3, 1].map((n, i) => (
                  <span key={i} className="flex flex-1 flex-col-reverse gap-0.5">
                    {Array.from({ length: n }, (_, j) => (
                      <span key={j} className={cn("h-1.5 rounded-[2px]", i === 3 ? "bg-saffron" : "bg-level-3")} />
                    ))}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-px bg-border" />
            <div>
              <p className="eyebrow text-tertiary">{t("askLabel")}</p>
              <ul className="mt-3 flex flex-col gap-3 text-sm leading-snug text-text">
                {(["ask1", "ask2"] as const).map((k) => (
                  <li key={k} className="flex gap-2.5">
                    <MessageSquareText className="mt-0.5 size-4 shrink-0 text-accent-text" strokeWidth={1.75} aria-hidden />
                    <span>{t(k)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
        {/* The page beneath the fold: let the figure dissolve rather than end. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent md:hidden" aria-hidden />
      </div>

      {/* The estimate narrowing as the scenes add up */}
      <div className="fade-up absolute -end-6 top-[31rem] z-10 hidden w-[17rem] rounded-2xl bg-surface p-4 text-text shadow-window lg:block xl:-end-14" style={{ "--d": "800ms" } as React.CSSProperties}>
        <div className="flex items-center justify-between gap-3 text-[11px] text-tertiary">
          <span>{t("scene")}</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 animate-pulse-soft rounded-full bg-saffron" aria-hidden />
            {t("narrowing")}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium">{t("skills.priorities")}</p>
        <RangeScale low={3.6} high={4.2} estimate={3.9} expected={4} size="md" animate className="mt-3" />
        <p className="mt-2 flex justify-between text-[11px] text-tertiary">
          <span>{td("level")} <bdi dir="ltr" className="tabular">3.6–4.2</bdi></span>
          <span>{t("expected")} <bdi dir="ltr" className="tabular">4.0</bdi></span>
        </p>
      </div>
    </figure>
  );
}
