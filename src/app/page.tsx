import type * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BriefcaseBusiness, ChartSpline, Languages, LockKeyhole, MessagesSquare, Quote, Scale, Sprout, UserCheck, UserRoundSearch, UsersRound, type LucideIcon } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LandingMotion } from "@/components/landing/motion";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { SectionHead } from "@/components/landing/section-head";
import { LandingFooter } from "@/components/landing/footer";
import { EvidenceFragment, FairnessChart, GrowFragment, HireFragment, NarrowingCard, ReportFragment, SceneCard, TeamFragment } from "@/components/landing/fragments";
import { getViewer } from "@/lib/auth/session";
import { publicRobots } from "@/lib/legal";
import { cn } from "@/lib/utils";

export function generateMetadata(): Metadata {
  return { robots: publicRobots(), alternates: { canonical: "/" } };
}

/** A round gradient icon in a stat tile's colour. White marks on violet and blue; ink on teal. */
function Orb({ icon: Icon, tone, className }: { icon: LucideIcon; tone: "violet" | "blue" | "teal"; className?: string }) {
  return (
    <span className={cn("r-orb", `tile-${tone}`, className)} aria-hidden>
      <Icon className="size-[45%]" strokeWidth={2} />
    </span>
  );
}

const vars = (v: Record<string, number>) => v as React.CSSProperties;

/**
 * The marketing page, in Night: it follows the theme like the app (deep
 * indigo by default, lavender when light is chosen), with soft light behind
 * the hero, rounded cards lifted by light, pill eyebrows, gradient tiles and
 * the raised violet card for what to look at first. One motion carries the
 * idea: the range narrowing, answer by answer, into the coral estimate.
 * Arabic mirrors the layout; ranges and numbers read left to right.
 */
export default async function Home() {
  const t = await getTranslations("landing");
  const viewer = await getViewer();
  const primaryHref = viewer ? "/app" : "/sign-up";
  const primaryLabel = viewer ? t("openApp") : t("getStarted");

  const steps = [
    { key: "week", icon: MessagesSquare, tone: "violet", fragment: <SceneCard /> },
    { key: "range", icon: ChartSpline, tone: "blue", fragment: <NarrowingCard /> },
    { key: "evidence", icon: Quote, tone: "teal", fragment: <EvidenceFragment /> },
  ] as const;
  const legend = ["fit", "ranges", "words", "ask"] as const;
  const markers = Array.from(t("report.markers"));
  const modes = [
    { key: "hire", icon: BriefcaseBusiness, tone: "violet", fragment: <HireFragment /> },
    { key: "grow", icon: Sprout, tone: "blue", fragment: <GrowFragment /> },
    { key: "team", icon: UsersRound, tone: "teal", fragment: <TeamFragment /> },
  ] as const;
  const trust = [
    ["people", UserCheck],
    ["review", UserRoundSearch],
    ["fairness", Scale],
    ["privacy", LockKeyhole],
    ["bilingual", Languages],
  ] as const;
  const section = "scroll-mt-20 py-[clamp(4.5rem,9vw,8rem)]";
  const head = "mt-6 grid gap-y-5 lg:grid-cols-12 lg:gap-x-6";

  return (
    <div className="range-page flex min-h-dvh flex-col">
      <LandingMotion />
      <a href="#main" className="sr-only z-[60] rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-3">
        {t("skip")}
      </a>
      <LandingNav signedIn={Boolean(viewer)} />

      <main id="main" className="flex-1">
        <Hero primaryHref={primaryHref} primaryLabel={primaryLabel} />

        {/* ── 01 How it works ── */}
        <section id="how" aria-labelledby="how-h" className={cn(section, "pt-[clamp(2rem,5vw,4rem)]")}>
          <div className="r-wrap">
            <SectionHead index="01" label={t("how.label")} />
            <div className={head}>
              <h2 id="how-h" className="display-x r-h2 lg:col-span-7">{t("how.title")}</h2>
              <p className="r-body max-w-md text-secondary lg:col-span-4 lg:col-start-9 lg:self-end">{t("how.intro")}</p>
            </div>
            {/* Each step spans four rows of a shared subgrid, so labels, titles,
                bodies and figures line up across the three cards. */}
            <ol className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-rows-[auto_auto_auto_1fr] lg:gap-y-0">
              {steps.map((s, i) => (
                <li key={s.key} data-reveal style={vars({ "--i": i })} className="r-card r-lift grid grid-cols-[minmax(0,1fr)] p-5 sm:p-6 lg:row-span-4 lg:grid-rows-subgrid">
                  <div className="flex items-center gap-3">
                    <Orb icon={s.icon} tone={s.tone} className="size-11" />
                    <p className="r-label text-secondary">{t("how.step", { n: i + 1 })}</p>
                  </div>
                  <h3 className="r-h3 mt-6">{t(`how.steps.${s.key}.title`)}</h3>
                  <p className="r-body mt-3 max-w-[30rem] text-secondary">{t(`how.steps.${s.key}.body`)}</p>
                  <figure className="mt-7 flex flex-col">
                    <div className="r-well flex flex-1 items-center p-3 sm:p-4">{s.fragment}</div>
                    <figcaption className="mt-3 flex items-baseline gap-2 px-1 text-xs text-tertiary rtl:text-[13px]">
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
            <div className={head}>
              <h2 id="report-h" className="display-x r-h2 lg:col-span-7">{t("report.title")}</h2>
              <p className="r-body max-w-md text-secondary lg:col-span-4 lg:col-start-9 lg:self-end">{t("report.body")}</p>
            </div>
            <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-x-6">
              <ol className="order-last flex flex-col gap-3 lg:order-none lg:col-span-4 lg:self-center">
                {legend.map((k, i) => (
                  <li key={k} data-reveal style={vars({ "--i": i })} className="r-card flex items-center gap-4 p-4 sm:p-5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent font-display text-[13px] font-extrabold text-accent-foreground shadow-[0_8px_18px_-8px_rgb(108_92_231/0.9)] rtl:text-[15px] rtl:font-bold" aria-hidden>
                      {markers[i]}
                    </span>
                    <span className="r-body">{t(`report.legend.${k}`)}</span>
                  </li>
                ))}
              </ol>
              <div data-reveal className="relative lg:col-span-8">
                <div aria-hidden className="pointer-events-none absolute -inset-x-10 -inset-y-16 -z-10 bg-[radial-gradient(closest-side,var(--wash-1),transparent)]" />
                <ReportFragment />
              </div>
            </div>
          </div>
        </section>

        {/* ── 03 Hire, Grow, Team ── */}
        <section id="modes" aria-labelledby="modes-h" className={cn(section, "pt-0!")}>
          <div className="r-wrap">
            <SectionHead index="03" label={t("modes.label")} />
            <div className={head}>
              <h2 id="modes-h" className="display-x r-h2 lg:col-span-7">{t("modes.title")}</h2>
              <p className="r-body max-w-md text-secondary lg:col-span-4 lg:col-start-9 lg:self-end">{t("modes.sub")}</p>
            </div>
            <div className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-rows-[auto_auto_auto_1fr] lg:gap-y-0">
              {modes.map((m, i) => (
                <article key={m.key} aria-labelledby={`mode-${m.key}`} data-reveal style={vars({ "--i": i })} className="r-card r-lift grid grid-cols-[minmax(0,1fr)] content-start gap-y-4 p-5 sm:p-6 lg:row-span-4 lg:grid-rows-subgrid lg:gap-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <Orb icon={m.icon} tone={m.tone} className="size-12" />
                    <p className="r-label rounded-full bg-surface-sunken px-3 py-1 text-secondary">{t(`modes.${m.key}.tag`)}</p>
                  </div>
                  <h3 id={`mode-${m.key}`} className="display-x r-word mt-2">{t(`modes.${m.key}.word`)}</h3>
                  <p className="r-body max-w-[26rem] text-secondary">{t(`modes.${m.key}.body`)}</p>
                  <div className="r-well flex items-center self-stretch p-3 sm:p-4 lg:p-3 xl:p-4">{m.fragment}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 04 Trust ── */}
        <section id="trust" aria-labelledby="trust-h" className={cn(section, "pt-0!")}>
          <div className="r-wrap">
            <SectionHead index="04" label={t("trust.label")} />
            <h2 id="trust-h" className="display-x r-h2 mt-6 lg:max-w-[58%]">{t("trust.title")}</h2>
            <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
              {trust.map(([k, Icon], i) => (
                <li key={k} data-reveal style={vars({ "--i": i % 3 })} className={cn("r-card r-lift flex flex-col p-6 sm:p-7", k === "fairness" && "md:col-span-2 lg:col-span-1 lg:row-span-2")}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-12 place-items-center rounded-full bg-accent-subtle text-accent-text" aria-hidden>
                      <Icon className="size-[22px]" strokeWidth={2} />
                    </span>
                    <span className="r-index text-sm text-tertiary">0{i + 1}</span>
                  </div>
                  <h3 className="r-h3 mt-6">{t(`trust.items.${k}.title`)}</h3>
                  <p className="r-body mt-3 max-w-[34rem] text-secondary">{t(`trust.items.${k}.body`)}</p>
                  {k === "fairness" ? (
                    <div className="mt-auto pt-8">
                      <div className="r-well p-4 sm:p-5">
                        <FairnessChart />
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Closing: the raised violet card, the page's last coral button ── */}
        <section aria-labelledby="cta-h" className="pb-[clamp(4rem,8vw,7rem)]">
          <div className="r-wrap">
            <div data-reveal className="hero-card r-on-hero rounded-[28px] px-6 py-12 sm:rounded-[36px] sm:px-12 sm:py-20 lg:px-16">
              <div aria-hidden className="pointer-events-none absolute -bottom-1/2 -end-1/4 -z-10 size-[44rem] max-w-none rounded-full bg-[radial-gradient(closest-side,rgb(59_120_255/0.45),transparent)]" />
              <LogoMark className="pointer-events-none absolute -bottom-8 -end-6 -z-10 size-[clamp(11rem,22vw,19rem)] text-white/[0.09]" />
              <div className="max-w-4xl">
                <h2 id="cta-h" className="display-x r-h2-xl">{t("cta.title")}</h2>
                <p className="r-lead mt-6 max-w-xl text-hero-secondary">{t("cta.body")}</p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button asChild variant="signal" size="lg" className="h-14 rounded-full px-7 text-base shadow-[0_16px_34px_-14px_var(--signal)]">
                    <Link href={primaryHref}>
                      {primaryLabel}
                      <ArrowRight className="flip-rtl" aria-hidden />
                    </Link>
                  </Button>
                  {!viewer ? (
                    <Button asChild variant="ghost" size="lg" className="h-14 rounded-full bg-white/12 px-7 text-base text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.3)] hover:bg-white/20 hover:text-white">
                      <Link href="/sign-in">{t("signIn")}</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter signedIn={Boolean(viewer)} />
    </div>
  );
}
