import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LandingMotion } from "@/components/landing/motion";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { SectionHead } from "@/components/landing/section-head";
import { LandingFooter } from "@/components/landing/footer";
import { EvidenceFragment, FairnessChart, GrowFragment, HireFragment, NarrowingCard, ReportFragment, SceneCard, TeamFragment } from "@/components/landing/fragments";
import { getViewer } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

/**
 * The marketing page, in the Range brand: bone, ink and one vermilion signal;
 * a strict 12-column grid with hairline rules and numbered sections; one
 * motion (bands narrowing into the estimate). Arabic mirrors the layout;
 * ranges and numbers read left to right.
 */
export default async function Home() {
  const t = await getTranslations("landing");
  const viewer = await getViewer();
  const primaryHref = viewer ? "/app" : "/sign-up";
  const primaryLabel = viewer ? t("openApp") : t("getStarted");

  const steps = [
    { key: "week", fragment: <SceneCard /> },
    { key: "range", fragment: <NarrowingCard /> },
    { key: "evidence", fragment: <EvidenceFragment /> },
  ] as const;
  const legend = ["fit", "ranges", "words", "ask"] as const;
  const markers = Array.from(t("report.markers"));
  const modes = [
    { key: "hire", fragment: <HireFragment /> },
    { key: "grow", fragment: <GrowFragment /> },
    { key: "team", fragment: <TeamFragment /> },
  ] as const;
  const trust = ["people", "review", "fairness", "privacy", "bilingual"] as const;
  const section = "scroll-mt-16 py-[clamp(5rem,10vw,9rem)]";

  return (
    <div className="range-page flex min-h-dvh flex-col">
      <LandingMotion />
      <a href="#main" className="sr-only z-[60] rounded-control bg-text px-4 py-2 text-sm font-medium text-[#f2f0eb] focus:not-sr-only focus:fixed focus:start-4 focus:top-3">
        {t("skip")}
      </a>
      <LandingNav signedIn={Boolean(viewer)} />

      <main id="main" className="flex-1">
        <Hero primaryHref={primaryHref} primaryLabel={primaryLabel} />

        {/* ── 01 How it works ── */}
        <section id="how" aria-labelledby="how-h" className={section}>
          <div className="r-wrap">
            <SectionHead index="01" label={t("how.label")} />
            <div className="mt-10 grid gap-y-6 lg:mt-14 lg:grid-cols-12 lg:gap-x-6">
              <h2 id="how-h" className="display-x r-h2 lg:col-span-8">{t("how.title")}</h2>
              <p className="r-body max-w-md text-secondary lg:col-span-4 lg:self-end">{t("how.intro")}</p>
            </div>
            {/* Each step spans four rows of a shared subgrid, so labels, titles,
                bodies and figures line up across the three columns. */}
            <ol className="mt-[clamp(3.5rem,6vw,6rem)] grid gap-y-16 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_1fr] lg:gap-x-6 lg:gap-y-0">
              {steps.map((s, i) => (
                <li key={s.key} className="grid lg:row-span-4 lg:grid-rows-subgrid">
                  <p className="r-label border-t-2 border-text pt-5 text-secondary">{t("how.step", { n: i + 1 })}</p>
                  <h3 className="r-h3 mt-6">{t(`how.steps.${s.key}.title`)}</h3>
                  <p className="r-body mt-3 max-w-[30rem] text-secondary">{t(`how.steps.${s.key}.body`)}</p>
                  <figure className="mt-8 flex flex-col">
                    <div className="flex flex-1 items-center rounded-[20px] bg-surface-sunken p-4 sm:p-6">{s.fragment}</div>
                    <figcaption className="mt-3 flex items-baseline gap-3 text-xs text-tertiary rtl:text-[13px]">
                      <span className="r-label text-text">{t("how.fig", { n: `1.${i + 1}` })}</span>
                      {t(`how.steps.${s.key}.fig`)}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 02 The report ── */}
        <section id="report" aria-labelledby="report-h" className={cn(section, "pt-0!")}>
          <div className="r-wrap">
            <SectionHead index="02" label={t("report.label")} />
            <div className="mt-10 grid gap-y-6 lg:mt-14 lg:grid-cols-12 lg:gap-x-6">
              <h2 id="report-h" className="display-x r-h2 lg:col-span-8">{t("report.title")}</h2>
              <p className="r-body max-w-md text-secondary lg:col-span-4 lg:self-end">{t("report.body")}</p>
            </div>
            <div className="mt-[clamp(3rem,6vw,5.5rem)] grid gap-y-10 lg:grid-cols-12 lg:gap-x-6">
              <ol className="order-last border-t border-text lg:order-none lg:col-span-4 lg:self-start">
                {legend.map((k, i) => (
                  <li key={k} className="flex items-baseline gap-4 border-b border-text/15 py-4">
                    <span className="grid size-6 shrink-0 translate-y-[-1px] place-items-center rounded-full bg-text font-display text-[10px] font-extrabold leading-none text-[#f2f0eb] [font-stretch:125%] rtl:text-[13px] rtl:font-bold">{markers[i]}</span>
                    <span className="r-body">{t(`report.legend.${k}`)}</span>
                  </li>
                ))}
              </ol>
              <div className="lg:col-span-8">
                <ReportFragment />
              </div>
            </div>
          </div>
        </section>

        {/* ── 03 Hire, Grow, Team ── */}
        <section id="modes" aria-labelledby="modes-h" className={cn(section, "r-on-ink bg-ink text-ink-foreground")}>
          <div className="r-wrap">
            <SectionHead index="03" label={t("modes.label")} onInk />
            <div className="mt-10 grid gap-y-6 lg:mt-14 lg:grid-cols-12 lg:gap-x-6">
              <h2 id="modes-h" className="display-x r-h2 lg:col-span-8">{t("modes.title")}</h2>
              <p className="r-body max-w-md text-ink-secondary lg:col-span-4 lg:self-end">{t("modes.sub")}</p>
            </div>
            <div className="mt-[clamp(3.5rem,6vw,6rem)] grid lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_1fr]">
              {modes.map((m, i) => (
                <article
                  key={m.key}
                  aria-labelledby={`mode-${m.key}`}
                  className={cn(
                    "grid content-start gap-y-5 border-t border-ink-foreground/20 py-10 lg:row-span-4 lg:grid-rows-subgrid lg:gap-y-6 lg:border-t-0 lg:py-2",
                    i > 0 && "lg:border-s lg:ps-8 xl:ps-10",
                    i < 2 && "lg:pe-8 xl:pe-10",
                    i === 0 && "border-t-0 pt-0",
                  )}
                >
                  <p className="r-label text-ink-secondary">{t(`modes.${m.key}.tag`)}</p>
                  <h3 id={`mode-${m.key}`} className="display-x r-word">{t(`modes.${m.key}.word`)}</h3>
                  <p className="r-body max-w-[26rem] text-ink-secondary">{t(`modes.${m.key}.body`)}</p>
                  <div className="self-end pt-4">{m.fragment}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 04 Trust ── */}
        <section id="trust" aria-labelledby="trust-h" className={section}>
          <div className="r-wrap">
            <SectionHead index="04" label={t("trust.label")} />
            <h2 id="trust-h" className="display-x r-h2 mt-10 lg:mt-14 lg:max-w-[66%]">{t("trust.title")}</h2>
            <ol className="mt-[clamp(3rem,6vw,5.5rem)] border-t border-text">
              {trust.map((k, i) => (
                <li key={k} className="grid gap-y-3 border-b border-text/15 py-8 lg:grid-cols-12 lg:gap-x-6 lg:py-10">
                  <span className="r-index text-[13px] lg:col-span-1 lg:pt-3">0{i + 1}</span>
                  <h3 className="r-h3 r-h3-lg lg:col-span-6">{t(`trust.items.${k}.title`)}</h3>
                  <div className="lg:col-span-5 lg:col-start-8">
                    <p className="r-body max-w-[34rem] text-secondary">{t(`trust.items.${k}.body`)}</p>
                    {k === "fairness" ? (
                      <div className="mt-6">
                        <FairnessChart />
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Closing band: the signal, full width ── */}
        <section aria-labelledby="cta-h" className="r-on-signal overflow-hidden bg-[var(--signal)] text-text">
          <div className="r-wrap grid items-end gap-y-12 py-[clamp(4.5rem,9vw,8rem)] lg:grid-cols-12 lg:gap-x-6">
            <div className="lg:col-span-10">
              <h2 id="cta-h" className="display-x r-h2-xl">{t("cta.title")}</h2>
              <p className="r-lead mt-8 max-w-xl">{t("cta.body")}</p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-14 bg-text px-6 text-base text-[#f2f0eb] hover:bg-[#2b2a28]">
                  <Link href={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="flip-rtl" aria-hidden />
                  </Link>
                </Button>
                {!viewer ? (
                  <Button asChild variant="ghost" size="lg" className="h-14 px-6 text-base text-text shadow-[inset_0_0_0_1.5px_var(--text)] hover:bg-text/10 hover:text-text">
                    <Link href="/sign-in">{t("signIn")}</Link>
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="hidden justify-self-end text-text lg:col-span-2 lg:block" aria-hidden>
              <LogoMark className="size-[clamp(9rem,13vw,13rem)]" />
            </div>
          </div>
        </section>
      </main>

      <LandingFooter signedIn={Boolean(viewer)} />
    </div>
  );
}

