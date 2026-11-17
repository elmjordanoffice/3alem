import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Mail } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { EvidenceField } from "@/components/brand/evidence-field";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { FitPill } from "@/components/report/fit";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { INK_GHOST, INK_PRIMARY } from "@/components/ui/ink";
import { HeroFigure } from "@/components/landing/hero-figure";
import { ScrollFilm } from "@/components/landing/scroll-film";
import { Showcase } from "@/components/landing/showcase";
import { SplitWords } from "@/components/landing/split-words";
import { RevealOnScroll, ScrollSettle, SmoothScroll } from "@/components/landing/motion";
import { getViewer } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const GHOST_BUTTON = "border border-ink-foreground/15 bg-ink-foreground/[0.04] text-ink-foreground hover:bg-ink-foreground/10 active:bg-ink-foreground/15";

/** Splits a title at its first comma so the second clause can sit quieter. */
function splitClause(title: string): [string, string] {
  const m = title.match(/^(.*?[,،])\s*(.+)$/);
  return m ? [m[1]!, m[2]!] : [title, ""];
}

export default async function Home() {
  const t = await getTranslations("landing");
  const td = await getTranslations("landing.demo");
  const tf = await getTranslations("home.fit");
  const viewer = await getViewer();
  const primaryHref = viewer ? "/app" : "/sign-up";
  const primaryLabel = viewer ? t("openApp") : t("getStarted");
  const [lead, rest] = splitClause(t("title"));

  return (
    <div className="night-grain relative flex min-h-dvh flex-col bg-night text-ink-foreground">
      <SmoothScroll />
      <RevealOnScroll />

      {/* Glass navigation, floating over the film. */}
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
        <div className="nav-glass mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 rounded-full ps-4 pe-2">
          <Link href="/" className="rounded-control focus-visible:outline-2 focus-visible:outline-focus">
            <Logo reverse showArabic={false} className="sm:hidden" />
            <Logo reverse className="hidden sm:inline-flex" />
          </Link>
          <nav className="flex items-center gap-0.5" aria-label={t("navLabel")}>
            {(
              [
                ["#how", "nav.how"],
                ["#modes", "nav.modes"],
                ["#trust", "nav.trust"],
              ] as const
            ).map(([href, key]) => (
              <a key={href} href={href} className="nav-pill hidden rounded-full px-3.5 py-1.5 text-sm text-ink-secondary md:inline">
                {t(key)}
              </a>
            ))}
            <span className="mx-1.5 hidden h-5 w-px bg-ink-foreground/15 md:block" aria-hidden />
            <LanguageToggle className={cn("rounded-full", INK_GHOST)} />
            <ThemeMenu className={cn("hidden rounded-full sm:inline-flex", INK_GHOST)} />
            {viewer ? (
              <Button asChild size="sm" className={cn("ms-1 rounded-full", INK_PRIMARY)}>
                <Link href="/app">{t("openApp")}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className={cn("hidden rounded-full sm:inline-flex", INK_GHOST)}>
                  <Link href="/sign-in">{t("signIn")}</Link>
                </Button>
                <Button asChild size="sm" className={cn("ms-1 rounded-full", INK_PRIMARY)}>
                  <Link href="/sign-up">{t("getStarted")}</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ── The film: a world of estimates that narrows as you scroll ── */}
        <ScrollFilm
          anchors={[{ id: "how", p: 0.3 }]}
          backdrop={
            <p aria-hidden lang="ar" dir="rtl" className="ghost-word pointer-events-none absolute inset-x-0 bottom-[-6vw] text-center text-[46vw] sm:text-[34vw]">
              عالم
            </p>
          }
        >
          {/* Beat 0: the promise */}
          <div className="beat-0 absolute inset-0 flex flex-col items-center justify-center px-4 pb-[14vh] text-center">
            <p className="float-in inline-flex items-center gap-2 rounded-full bg-ink-foreground/[0.06] px-3.5 py-1.5 text-[13px] text-ink-secondary shadow-[inset_0_0_0_1px_rgb(245_244_255/0.12)] backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-saffron shadow-[0_0_10px_2px_rgb(242_181_50/0.6)]" aria-hidden />
              {t("hero.eyebrow")}
            </p>
            <h1 className="mt-8 max-w-5xl text-[2.9rem] font-semibold leading-[0.98] tracking-[-0.035em] sm:text-7xl lg:text-[6.5rem]">
              <SplitWords text={lead} delay={150} />
              {rest ? (
                <>
                  <br className="hidden sm:block" /> <SplitWords text={rest} delay={330} className="text-ink-secondary/80" />
                </>
              ) : null}
            </h1>
            <p className="float-in mx-auto mt-8 max-w-xl text-lg leading-relaxed text-ink-secondary sm:text-xl" style={{ animationDelay: "650ms" }}>
              {t("film.sub")}
            </p>
            <div className="float-in mt-10 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "800ms" }}>
              <Button asChild size="lg" className={cn("btn-hero h-13 rounded-full px-7", INK_PRIMARY)}>
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="flip-rtl" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className={cn("h-13 rounded-full px-7 backdrop-blur-md", GHOST_BUTTON)}>
                <a href="#how">{t("seeHow")}</a>
              </Button>
            </div>
            <div className="float-in absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 text-xs text-ink-secondary/80" style={{ animationDelay: "1400ms" }}>
              <span>{t("film.scroll")}</span>
              <span className="relative h-10 w-px overflow-hidden bg-ink-foreground/15" aria-hidden>
                <span className="scroll-cue absolute inset-0 bg-ink-foreground" />
              </span>
            </div>
          </div>

          {/* Beat 1: the world */}
          <div className="beat-1 absolute inset-0">
            <Stage>
              <BeatCopy n="01" title={t("film.b1title")} body={t("film.b1body")} className="beat-copy-1" />
              <div className="relative mx-auto h-[16.5rem] w-full max-w-[24rem] sm:h-[24rem] lg:mx-0 lg:h-[26rem] lg:max-w-[30rem]" aria-hidden>
                <div className="fly absolute start-0 top-0 w-[86%] rounded-[16px] bg-surface p-4 text-text shadow-window" style={{ "--fy": "70px" } as React.CSSProperties}>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={td("from")} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{td("from")}</span>
                      <span className="block truncate text-[11px] text-tertiary">{td("fromRole")}</span>
                    </span>
                    <Mail className="size-4 text-tertiary" aria-hidden />
                  </div>
                  <p className="mt-3 text-sm font-medium">{t("film.emailSubject")}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-secondary">{td("message")}</p>
                </div>
                <div className="fly absolute end-0 top-[46%] w-[78%] sm:top-[38%] sm:w-[72%] rounded-[16px] bg-ink-raised p-4 text-ink-foreground shadow-window ring-1 ring-ink-foreground/10" style={{ "--fy": "130px" } as React.CSSProperties}>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-ink-foreground/15 text-[10px] font-medium">ON</span>
                    <span className="text-xs font-medium">{t("film.chatFrom")}</span>
                    <span className="ms-auto text-[10px] text-ink-secondary tabular" dir="ltr">09:30</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-foreground/90">{t("film.chat")}</p>
                </div>
                <div className="fly absolute bottom-0 start-[8%] hidden w-[62%] rounded-[16px] bg-surface p-4 text-text shadow-window sm:block" style={{ "--fy": "190px" } as React.CSSProperties}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium">{t("film.sheetTitle")}</span>
                    <span className="text-[11px] font-medium text-warning">{t("film.sheetNote")}</span>
                  </div>
                  <div className="mt-3 flex h-14 items-end gap-1.5" dir="ltr">
                    {[42, 55, 48, 61, 58, 70, 84].map((h, i) => (
                      <span key={i} className={cn("flex-1 rounded-t-[3px]", i === 6 ? "bg-warning" : "bg-level-3")} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </Stage>
          </div>

          {/* Beat 2: the range */}
          <div className="beat-2 absolute inset-0">
            <Stage>
              <BeatCopy n="02" title={t("film.b2title")} body={t("film.b2body")} className="beat-copy-2" />
              <div className="beat-copy-2 mx-auto w-full max-w-[34rem] rounded-[22px] bg-night-raised/80 p-6 shadow-window ring-1 ring-ink-foreground/10 backdrop-blur-xl sm:p-8 lg:mx-0" aria-hidden>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-lg font-semibold sm:text-xl">{t("figure.skills.priorities")}</p>
                  <p className="shrink-0 text-xs text-ink-secondary">
                    {t("film.scene")} <span className="film-scene font-display text-base font-semibold text-ink-foreground tabular" /> {t("film.of9")}
                  </p>
                </div>
                <div className="relative mt-8 h-4 rounded-full bg-ink-foreground/10">
                  {[25, 50, 75].map((x) => (
                    <span key={x} className="absolute inset-y-0 w-px bg-night/70" style={{ left: `${x}%` }} />
                  ))}
                  <span className="film-range-band absolute inset-y-0 rounded-full shadow-[0_0_24px_rgb(242_181_50/0.45)]" />
                  <span className="absolute -inset-y-1.5 w-0.5 rounded-full bg-ink-foreground/70" style={{ insetInlineStart: "calc(75% - 1px)" }} />
                  <span className="film-range-dot absolute top-1/2 size-[18px] -translate-y-1/2 rounded-full bg-ink-foreground ring-4 ring-night-raised" />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-ink-secondary">
                  <span>{td("scaleLow")}</span>
                  <span>{td("scaleHigh")}</span>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink-foreground/10 pt-5 text-sm">
                  <span className="film-settled font-medium">
                    {td("level")} <bdi dir="ltr" className="tabular text-ink-secondary">3.6–4.2</bdi>
                  </span>
                  <span className="text-ink-secondary">
                    {t("figure.expected")} <bdi dir="ltr" className="tabular">4.0</bdi>
                  </span>
                </div>
              </div>
            </Stage>
          </div>

          {/* Beat 3: the evidence */}
          <div className="beat-3 absolute inset-0">
            <Stage>
              <BeatCopy n="03" title={t("film.b3title")} body={t("film.b3body")} className="beat-copy-3" />
              <div className="beat-copy-3 mx-auto w-full max-w-[34rem] lg:mx-0" aria-hidden>
                <div className="rounded-[22px] bg-surface p-6 text-text shadow-window sm:p-8">
                  <p className="text-xs text-tertiary">{t("figure.evidenceSource")}</p>
                  <p className="mt-4 text-[17px] leading-relaxed sm:text-lg">
                    “{td("answerStart")} <mark className="film-mark">{td("answerEvidence")}</mark> {td("answerEnd")}”
                  </p>
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-secondary">
                    <span className="font-medium text-text">{t("figure.skills.priorities")}</span>
                    <span>
                      {td("level")} <bdi dir="ltr" className="tabular text-tertiary">3.6–4.2</bdi>
                    </span>
                  </div>
                </div>
                <div className="film-verdict mt-4 flex flex-wrap items-center gap-3 rounded-[18px] bg-night-raised/80 px-5 py-4 ring-1 ring-ink-foreground/10 backdrop-blur-xl">
                  <FitPill fit="STRONG" label={tf("STRONG")} />
                  <span className="text-sm text-ink-secondary">{t("figure.confidence")}</span>
                  <span className="ms-auto text-sm text-ink-foreground">{t("figure.ask1")}</span>
                </div>
              </div>
            </Stage>
          </div>

          {/* Progress rail */}
          <ol className="absolute end-6 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex" aria-hidden>
            {(["one", "two", "three"] as const).map((k, i) => (
              <li key={k} className="flex items-center gap-3 text-xs text-ink-secondary" style={{ opacity: `calc(0.4 + var(--b${i + 1}) * 0.6)` }}>
                <span>{t(`film.rail.${k}`)}</span>
                <span className="film-rail-dot h-0.5 rounded-full bg-ink-foreground" style={{ "--on": `var(--b${i + 1})` } as React.CSSProperties} />
              </li>
            ))}
          </ol>
        </ScrollFilm>

        {/* ── The report, settling flat as it arrives ── */}
        <section aria-labelledby="product-h" className="relative isolate px-4 pb-28 pt-12 sm:px-6 lg:pb-40">
          <div className="pointer-events-none absolute inset-x-0 top-40 -z-10 mx-auto h-[36rem] max-w-5xl rounded-full bg-glow-indigo/25 blur-[120px]" aria-hidden />
          <div data-reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-sidebar-accent">{t("product.eyebrow")}</p>
            <h2 id="product-h" className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
              <SplitWords text={t("product.title")} />
            </h2>
            <p className="fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-secondary" style={{ "--d": "250ms" } as React.CSSProperties}>
              {t("how.evidence.body")}
            </p>
          </div>
          <ScrollSettle className="mx-auto mt-16 max-w-6xl [perspective:2200px] sm:mt-20">
            <div className="lg:px-8" style={{ transform: "rotateX(calc((1 - var(--settle)) * 22deg)) translateY(calc((1 - var(--settle)) * 80px)) scale(calc(0.92 + var(--settle) * 0.08))", transformOrigin: "50% 0%" }}>
              <HeroFigure />
            </div>
          </ScrollSettle>
        </section>

        {/* ── The name ── */}
        <section aria-labelledby="name-h" className="relative isolate overflow-hidden px-4 py-32 sm:px-6 lg:py-48">
          <p aria-hidden lang="ar" dir="rtl" className="ghost-word pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 text-center text-[52vw] sm:text-[38vw]">
            عالم
          </p>
          <div data-reveal className="relative mx-auto max-w-4xl text-center">
            <p className="eyebrow text-sidebar-accent">{t("name.label")}</p>
            <h2 id="name-h" className="mt-6 text-[2.25rem] font-semibold leading-[1.12] tracking-[-0.025em] sm:text-6xl">
              <SplitWords text={t("name.title")} />
            </h2>
            <p className="fade-up mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-ink-secondary" style={{ "--d": "300ms" } as React.CSSProperties}>
              {t("name.body")}
            </p>
            <div className="fade-up mt-10 flex flex-wrap justify-center gap-3" style={{ "--d": "450ms" } as React.CSSProperties}>
              {(
                [
                  ["عالَم", "ʿālam", "alam"],
                  ["عالِم", "ʿālim", "alim"],
                ] as const
              ).map(([ar, tr, k]) => (
                <span key={k} className="inline-flex items-center gap-3 rounded-full bg-ink-foreground/[0.05] px-5 py-2.5 text-sm shadow-[inset_0_0_0_1px_rgb(245_244_255/0.1)]">
                  <span lang="ar" dir="rtl" className="font-display text-xl font-semibold">{ar}</span>
                  <span className="text-ink-secondary" dir="ltr">{tr}</span>
                  <span className="h-4 w-px bg-ink-foreground/20" aria-hidden />
                  <span className="text-ink-secondary">{t(`name.${k}`)}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Hire, Grow, Team ── */}
        <section id="modes" aria-labelledby="modes-h" className="scroll-mt-24 px-4 py-24 sm:px-6 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div data-reveal className="max-w-3xl">
              <p className="eyebrow text-sidebar-accent">{t("nav.modes")}</p>
              <h2 id="modes-h" className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
                <SplitWords text={t("modesTitle")} />
              </h2>
              <p className="fade-up mt-6 max-w-2xl text-lg leading-relaxed text-ink-secondary" style={{ "--d": "250ms" } as React.CSSProperties}>
                {t("modesSubtitle")}
              </p>
            </div>
            <Showcase />
          </div>
        </section>

        {/* ── Safeguards: an editorial list, not a row of cards ── */}
        <section id="trust" aria-labelledby="trust-h" className="scroll-mt-24 px-4 py-24 sm:px-6 lg:py-36">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
            <div data-reveal className="self-start lg:sticky lg:top-32">
              <p className="eyebrow text-sidebar-accent">{t("safeguards.eyebrow")}</p>
              <h2 id="trust-h" className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
                <SplitWords text={t("trust.title")} />
              </h2>
              <LogoMark reverse className="fade-up mt-10 size-14" />
            </div>
            <ol className="border-t border-ink-foreground/10">
              {(
                [
                  [t("trust.people.title"), t("trust.people.body")],
                  [t("trust.fairness.title"), t("trust.fairness.body")],
                  [t("trust.privacy.title"), t("trust.privacy.body")],
                  [t("bento.small.bilingual.title"), t("bento.small.bilingual.body")],
                  [t("bento.small.ats.title"), t("bento.small.ats.body")],
                ] as const
              ).map(([title, body], i) => (
                <li key={title} data-reveal className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-6 border-b border-ink-foreground/10 py-8 sm:grid-cols-[4rem_minmax(0,1fr)]">
                  <span className="fade-up font-display text-lg font-semibold text-sidebar-accent tabular">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold sm:text-[1.75rem]">
                      <SplitWords text={title} />
                    </h3>
                    <p className="fade-up mt-3 max-w-xl leading-relaxed text-ink-secondary" style={{ "--d": "150ms" } as React.CSSProperties}>
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Finale: the field again, at the horizon ── */}
        <section aria-labelledby="cta-h" className="relative isolate overflow-hidden px-4 pb-44 pt-28 sm:px-6 lg:pb-56 lg:pt-36">
          <div className="absolute inset-x-0 bottom-0 top-1/3 -z-10 [mask-image:linear-gradient(to_bottom,transparent,#000_45%)]" aria-hidden>
            <EvidenceField horizon={0.42} speed={0.22} intensity={0.9} bloom={0.55} />
          </div>
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_42%_at_50%_42%,rgb(7_8_28/0.85),transparent_75%)]" aria-hidden />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-[radial-gradient(70%_60%_at_50%_100%,rgb(242_181_50/0.14),transparent_70%)]" aria-hidden />
          <div data-reveal className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
            <LogoMark reverse className="fade-up size-14" />
            <h2 id="cta-h" className="mt-9 text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-7xl">
              <SplitWords text={t("cta.title")} />
            </h2>
            <p className="fade-up mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary" style={{ "--d": "300ms" } as React.CSSProperties}>
              {t("cta.body")}
            </p>
            <div className="fade-up mt-10 flex flex-wrap justify-center gap-3" style={{ "--d": "420ms" } as React.CSSProperties}>
              <Button asChild size="lg" className={cn("btn-hero h-13 rounded-full px-7", INK_PRIMARY)}>
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="flip-rtl" aria-hidden />
                </Link>
              </Button>
              {!viewer ? (
                <Button asChild size="lg" variant="secondary" className={cn("h-13 rounded-full px-7", GHOST_BUTTON)}>
                  <Link href="/sign-in">{t("signIn")}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-ink-foreground/10 bg-night">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Logo reverse />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-secondary">{t("trust.people.body")}</p>
          </div>
          <nav aria-label={t("footerNav.product")}>
            <p className="eyebrow text-ink-secondary">{t("footerNav.product")}</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li><a href="#how" className="text-ink-secondary hover:text-ink-foreground">{t("nav.how")}</a></li>
              <li><a href="#modes" className="text-ink-secondary hover:text-ink-foreground">{t("nav.modes")}</a></li>
              <li><a href="#trust" className="text-ink-secondary hover:text-ink-foreground">{t("nav.trust")}</a></li>
            </ul>
          </nav>
          <nav aria-label={t("footerNav.more")}>
            <p className="eyebrow text-ink-secondary">{t("footerNav.more")}</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li><Link href="/brand" className="text-ink-secondary hover:text-ink-foreground">{t("brandLink")}</Link></li>
              <li><Link href={viewer ? "/app" : "/sign-in"} className="text-ink-secondary hover:text-ink-foreground">{viewer ? t("openApp") : t("signIn")}</Link></li>
            </ul>
          </nav>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-ink-foreground/10 px-4 py-6 text-sm text-ink-secondary sm:px-6">
          <p>{t("footer")}</p>
          <div className="flex items-center gap-1">
            <LanguageToggle className={INK_GHOST} />
            <ThemeMenu className={INK_GHOST} />
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Copy on the start side, the visual on the end side; stacked on phones. */
function Stage({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-8 px-5 pb-10 pt-24 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:pb-0 lg:pe-36 lg:pt-0">{children}</div>;
}

function BeatCopy({ n, title, body, className }: { n: string; title: string; body: string; className?: string }) {
  return (
    <div className={cn("max-w-md", className)}>
      <p className="font-display text-sm font-semibold text-sidebar-accent tabular">{n}</p>
      <h2 className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-ink-secondary sm:text-lg">{body}</p>
    </div>
  );
}
