import type * as React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Quote, TrendingUp } from "lucide-react";
import { RangeScale } from "@/components/report/range-scale";
import { levelBand } from "@/lib/levels";
import { Initials } from "./bands";
import { NarrowingChart, STAGES } from "./narrowing-chart";

const LAST = STAGES[STAGES.length - 1]!;

/**
 * The hero's product visual, built from real pieces of the report: the raised
 * violet role-fit card, two stat tiles and the narrowing chart, where the band
 * of plausible levels tightens scene by scene into the coral estimate. Plays
 * once on load; still under reduced motion.
 */
export async function HeroVisual() {
  const t = await getTranslations("landing.hero.figure");
  const tr = await getTranslations("landing.report.frame");
  const tf = await getTranslations("home.fit");
  const tl = await getTranslations("levels");
  const rtl = (await getLocale()) === "ar";
  const range = `${LAST.low.toFixed(1)}–${LAST.high.toFixed(1)}`;

  return (
    <figure role="img" aria-label={t("label")} className="relative">
      <div aria-hidden className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] sm:gap-4">
        {/* The verdict: the raised violet card. */}
        <div className="hero-card r-on-hero r-rise col-span-2 flex flex-col rounded-[24px] p-5 sm:col-span-1 sm:row-span-2 sm:p-6" style={{ "--d": 150 } as React.CSSProperties}>
          <div className="flex items-center gap-3">
            <Initials name={tr("candidate")} className="size-10 bg-white/18 text-xs text-white" />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold leading-tight">{tr("candidate")}</p>
              <p className="truncate text-xs text-hero-secondary rtl:text-[13px]">{tr("role")}</p>
            </div>
          </div>
          <p className="mt-6 text-xs text-hero-secondary rtl:text-[13px]">{tr("roleFit")}</p>
          <p className="display-x mt-1.5 text-[2.25rem] sm:text-[2.5rem] rtl:text-[2.125rem]">{tf("STRONG")}</p>
          <p className="mt-2.5 flex items-center gap-2 text-sm">
            <span className="flex gap-1" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-5 rounded-full bg-saffron-light shadow-[0_0_10px_rgb(255_92_124/0.7)]" />
              ))}
            </span>
            {tr("confidence")}
          </p>
          <ul className="mt-auto flex flex-col gap-3.5 pt-6">
            {(
              [
                ["priorities", 3.6, 4.2, 3.9],
                ["stakeholders", 3.3, 3.9, 3.6],
              ] as const
            ).map(([k, lo, hi, e]) => (
              <li key={k}>
                <p className="flex items-baseline justify-between gap-3 text-[13px] rtl:text-sm">
                  <span className="min-w-0 truncate">{tr(`skills.${k}`)}</span>
                  <span className="shrink-0 text-xs text-hero-secondary rtl:text-[13px]">{tl(String(levelBand(e)))}</span>
                </p>
                <div dir="ltr">
                  <RangeScale low={lo} high={hi} estimate={e} expected={4} tone="ink" size="sm" className="mt-2" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Stat tiles. White on the deep end of the blue; ink on the teal. */}
        <div className="tile-blue r-rise flex min-h-[8.75rem] flex-col justify-between gap-3 p-4 sm:p-5" style={{ "--d": 300 } as React.CSSProperties}>
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-[2.25rem] font-extrabold leading-none tracking-[-0.03em] tabular sm:text-[2.5rem]">
              <bdi dir="ltr">{LAST.est.toFixed(1)}</bdi>
            </p>
            <span className="r-orb size-8 bg-white/20">
              <TrendingUp className="size-4" strokeWidth={2.25} />
            </span>
          </div>
          <p className="text-[13px] font-semibold leading-snug rtl:text-sm">
            {t("estimate")} <bdi dir="ltr" className="font-medium tabular">{range}</bdi>
          </p>
        </div>
        <div className="tile-teal r-rise flex min-h-[8.75rem] flex-col justify-between gap-3 p-4 sm:p-5" style={{ "--d": 380 } as React.CSSProperties}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold leading-snug rtl:text-sm">{t("quotes")}</p>
            <span className="r-orb size-8 bg-white/20">
              <Quote className="size-4" strokeWidth={2.25} />
            </span>
          </div>
          <p className="font-display text-[2.25rem] font-extrabold leading-none tracking-[-0.03em] tabular sm:text-[2.5rem]">
            <bdi dir="ltr">23</bdi>
          </p>
        </div>

        {/* The narrowing chart */}
        <div className="r-card r-rise col-span-2 p-4 sm:p-6" style={{ "--d": 230 } as React.CSSProperties}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-sm font-semibold sm:text-[15px]">{t("skill")}</p>
            <p className="inline-flex items-center gap-2 rounded-full bg-surface-sunken px-3 py-1 text-xs font-medium text-secondary rtl:text-[13px]">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--signal)] opacity-60 motion-reduce:hidden" />
                <span className="relative size-2 rounded-full bg-[var(--signal)]" />
              </span>
              {t("narrowing")}
            </p>
          </div>
          <div className="mt-4">
            <NarrowingChart rtl={rtl} id="hv" labels={{ start: t("start"), scene: (n) => t("scene", { n }), low: t("low"), high: t("high") }} />
          </div>
        </div>
      </div>
    </figure>
  );
}
