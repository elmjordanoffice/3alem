import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowDown, ArrowRight, Download, Mail, Trash2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
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

/** Splits a title at its first comma so the second clause can sit quieter. */
function splitClause(title: string): [string, string] {
  const m = title.match(/^(.*?[,،])\s*(.+)$/);
  return m ? [m[1]!, m[2]!] : [title, ""];
}

export default async function Home() {
  const t = await getTranslations("landing");
  const td = await getTranslations("landing.demo");
  const tf = await getTranslations("home.fit");
  const td2 = await getTranslations("dataRights");
  const viewer = await getViewer();
  const primaryHref = viewer ? "/app" : "/sign-up";
  const primaryLabel = viewer ? t("openApp") : t("getStarted");
  const [lead, rest] = splitClause(t("title"));
  const ar = (await getLocale()) === "ar";
  const [qo, qc] = ar ? ["«", "»"] : ["“", "”"];

  return (
    <div className="night-grain relative flex min-h-dvh flex-col bg-night text-ink-foreground">
      <SmoothScroll />
      <RevealOnScroll />

      {/* Glass navigation, floating over the film. */}
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
        <div className="nav-glass mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 rounded-full px-3 sm:ps-4">
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
              <Button asChild size="sm" className={cn("nav-cta ms-1 rounded-full", INK_PRIMARY)}>
                <Link href="/app">{t("openApp")}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className={cn("hidden rounded-full sm:inline-flex", INK_GHOST)}>
                  <Link href="/sign-in">{t("signIn")}</Link>
                </Button>
                <Button asChild size="sm" className={cn("nav-cta ms-1 rounded-full", INK_PRIMARY)}>
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
        >
          {/* Beat 0: the promise */}
          <div className="beat-0 absolute inset-0 flex flex-col items-center justify-center px-4 pb-[14vh] text-center">
            <h1 className="max-w-4xl text-[2.4rem] font-semibold leading-[1.04] tracking-[-0.035em] text-[#e2e3fb] sm:text-[3.25rem] lg:text-[4.25rem]">
              <SplitWords text={lead} delay={150} />
              {rest ? (
                <>
                  <br className="hidden sm:block" /> <SplitWords text={rest} delay={330} />
                </>
              ) : null}
            </h1>
            <p className="float-in mx-auto mt-8 max-w-xl text-lg leading-relaxed text-ink-secondary sm:text-xl" style={{ animationDelay: "650ms" }}>
              {t("film.sub")}
            </p>
            <div className="float-in mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-7" style={{ animationDelay: "800ms" }}>
              <Button asChild size="lg" className={cn("btn-hero cta-halo h-13 rounded-full px-7", INK_PRIMARY)}>
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="flip-rtl" aria-hidden />
                </Link>
              </Button>
              <a href="#how" className="group inline-flex items-center gap-2 rounded-full px-2 py-1 text-[15px] font-medium text-ink-secondary transition-colors hover:text-ink-foreground focus-visible:outline-2 focus-visible:outline-focus">
                {t("seeHow")}
                <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
              </a>
            </div>
            {/* The field's closest row, labelled: a skill with no evidence yet, so the range is wide. */}
            <div className="float-in absolute inset-x-0 bottom-14 mx-auto w-full max-w-4xl px-5 text-start sm:bottom-16" style={{ animationDelay: "1100ms" }} aria-hidden>
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="font-medium text-ink-foreground">{t("figure.skills.priorities")}</span>
                <span className="text-ink-secondary">{t("film.noEvidence")}</span>
              </div>
              <div className="relative mt-3 h-3 rounded-full bg-ink-foreground/10 shadow-[0_0_40px_rgb(143_146_247/0.35)]">
                <span className="hero-row-band absolute inset-y-0 rounded-full shadow-[0_0_24px_rgb(143_146_247/0.6)]" />
                <span className="absolute -inset-y-1.5 w-0.5 rounded-full bg-ink-foreground/80" style={{ insetInlineStart: "calc(75% - 1px)" }} />
                <span className="hero-row-dot absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-ink-secondary" />
              </div>
              <div className="relative mt-2 flex h-4 justify-between text-xs text-ink-secondary">
                <span>{td("scaleLow")}</span>
                <span className="absolute -translate-x-1/2 whitespace-nowrap rtl:translate-x-1/2" style={{ insetInlineStart: "75%" }}>
                  {t("figure.expected")} <bdi dir="ltr" className="tabular">4.0</bdi>
                </span>
                <span>{td("scaleHigh")}</span>
              </div>
            </div>
            <span className="sr-only">{t("film.scroll")}</span>
          </div>

          {/* Beat 1: the world */}
          <div className="beat-1 absolute inset-0">
            <Stage>
              <BeatCopy title={t("film.b1title")} body={t("film.b1body")} className="beat-copy-1" />
              <div className="relative mx-auto flex w-full max-w-[24rem] flex-col gap-3 sm:block sm:h-[28rem] lg:mx-0 lg:max-w-[30rem]" aria-hidden>
                <div className="fly card-night w-full rounded-[16px] p-4 text-ink-foreground sm:absolute sm:start-0 sm:top-0 sm:w-[86%]" style={{ "--fy": "70px" } as React.CSSProperties}>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={td("from")} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{td("from")}</span>
                      <span className="block truncate text-[11px] text-ink-secondary">{td("fromRole")}</span>
                    </span>
                    <Mail className="size-4 text-ink-secondary" aria-hidden />
                  </div>
                  <p className="mt-3 text-sm font-medium">{t("film.emailSubject")}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{td("message")}</p>
                </div>
                <div className="fly card-night ms-auto hidden w-[86%] rounded-[16px] p-4 text-ink-foreground sm:absolute sm:end-0 sm:top-[11.25rem] sm:block sm:w-[72%]" style={{ "--fy": "130px" } as React.CSSProperties}>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-ink-foreground/15 text-[10px] font-medium">ON</span>
                    <span className="text-xs font-medium">{t("film.chatFrom")}</span>
                    <span className="ms-auto text-[10px] text-ink-secondary tabular" dir="ltr">09:30</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-foreground/90">{t("film.chat")}</p>
                </div>
                <div className="fly card-night hidden w-[62%] rounded-[16px] p-4 text-ink-foreground sm:absolute sm:start-[8%] sm:top-[18.75rem] sm:block" style={{ "--fy": "190px" } as React.CSSProperties}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium">{t("film.sheetTitle")}</span>
                    <span className="text-[11px] text-ink-secondary">{t("film.sheetNote")}</span>
                  </div>
                  <div className="mt-3 flex h-14 items-end gap-1.5" dir="ltr">
                    {[42, 55, 48, 61, 58, 70, 84].map((h, i) => (
                      <span key={i} className={cn("flex-1 rounded-t-[3px]", i === 6 ? "bg-ink-foreground" : "bg-ink-foreground/25")} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </Stage>
          </div>

          {/* Beat 2: the range */}
          <div className="beat-2 absolute inset-0">
            <Stage reverse>
              <BeatCopy title={t("film.b2title")} body={t("film.b2body")} className="beat-copy-2" />
              <div className="beat-copy-2 card-night mx-auto w-full max-w-[34rem] rounded-[22px] p-6 sm:p-8 lg:mx-0" aria-hidden>
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
                  <span className="film-range-dot absolute top-1/2 size-[18px] -translate-y-1/2 rounded-full bg-ink-foreground ring-4 ring-[#151744]" />
                </div>
                <div className="relative mt-2 flex h-4 justify-between text-[11px] text-ink-secondary">
                  <span>{td("scaleLow")}</span>
                  <span className="absolute -translate-x-1/2 whitespace-nowrap rtl:translate-x-1/2" style={{ insetInlineStart: "75%" }}>
                    {t("figure.expected")} <bdi dir="ltr" className="tabular">4.0</bdi>
                  </span>
                  <span>{td("scaleHigh")}</span>
                </div>
                <div className="relative mt-6 h-6 border-t border-ink-foreground/10 pt-5 text-sm">
                  <span className="film-narrowing absolute start-0 text-ink-secondary">{t("figure.narrowing")}</span>
                  <span className="film-settled absolute start-0 font-medium">
                    {td("level")} <bdi dir="ltr" className="tabular text-ink-secondary">3.6–4.2</bdi>
                  </span>
                </div>
              </div>
            </Stage>
          </div>

          {/* Beat 3: the evidence */}
          <div className="beat-3 absolute inset-0">
            <Stage>
              <BeatCopy title={t("film.b3title")} body={t("film.b3body")} className="beat-copy-3" />
              <div className="beat-copy-3 mx-auto w-full max-w-[34rem] lg:mx-0" aria-hidden>
                <div className="card-night rounded-[22px] p-6 text-ink-foreground sm:p-8">
                  <p className="text-xs text-ink-secondary">{t("figure.evidenceSource")}</p>
                  <p className="mt-4 text-[17px] leading-relaxed sm:text-lg">
                    {qo}
                    {td("answerStart")} <mark className="film-mark">{td("answerEvidence")}</mark> {td("answerEnd")}
                    {qc}
                  </p>
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink-foreground/10 pt-4 text-xs text-ink-secondary">
                    <span className="font-medium text-ink-foreground">{t("figure.skills.priorities")}</span>
                    <span>
                      {td("level")} <bdi dir="ltr" className="tabular">3.6–4.2</bdi>
                    </span>
                  </div>
                </div>
                <div className="film-verdict card-night mt-4 flex flex-wrap items-center gap-3 rounded-[18px] px-5 py-4">
                  <FitPill fit="STRONG" label={tf("STRONG")} />
                  <span className="text-sm text-ink-secondary">{t("figure.confidence")}</span>
                  <span className="basis-full text-sm text-ink-foreground">{t("figure.ask1")}</span>
                </div>
              </div>
            </Stage>
          </div>

        </ScrollFilm>

        {/* ── The report, settling flat as it arrives ── */}
        <section aria-labelledby="product-h" className="relative isolate px-4 pb-28 pt-12 sm:px-6 lg:pb-40">
          <div className="pointer-events-none absolute inset-x-0 top-40 -z-10 mx-auto h-[36rem] max-w-5xl rounded-full bg-glow-indigo/25 blur-[120px]" aria-hidden />
          <div data-reveal className="mx-auto max-w-3xl text-center">
            <h2 id="product-h" className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
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
        <section aria-labelledby="name-h" className="relative isolate overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:pb-20 lg:pt-32">
          <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(50%_55%_at_50%_45%,rgb(76_81_232/0.2),transparent_70%)]" aria-hidden />
          <p aria-hidden lang="ar" dir="rtl" className="ghost-word pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 text-center text-[44vw] [mask-image:linear-gradient(to_bottom,transparent,#000_25%,#000_70%,transparent)] sm:text-[30vw]">
            عالم
          </p>
          <div data-reveal className="relative mx-auto max-w-4xl text-center">
            <h2 id="name-h" className="text-[2.25rem] font-semibold leading-[1.12] tracking-[-0.025em] sm:text-6xl">
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
        <section id="modes" aria-labelledby="modes-h" className="relative isolate scroll-mt-24 px-4 pb-24 pt-16 sm:px-6 lg:pb-32 lg:pt-20">
          <div className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-[50rem] bg-[radial-gradient(40%_40%_at_75%_40%,rgb(143_146_247/0.12),transparent_70%)]" aria-hidden />
          <div className="mx-auto max-w-6xl">
            <div data-reveal className="max-w-3xl">
              <h2 id="modes-h" className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
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
        <section id="trust" aria-labelledby="trust-h" className="relative isolate scroll-mt-24 px-4 py-24 sm:px-6 lg:py-36">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(45%_50%_at_20%_30%,rgb(76_81_232/0.22),transparent_70%)]" aria-hidden />
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
            <div data-reveal className="self-start lg:sticky lg:top-32">
              <h2 id="trust-h" className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
                <SplitWords text={t("trust.title")} />
              </h2>
              {/* The safeguard, shown: selection rates by group against the four-fifths line. */}
              <figure className="fade-up card-night mt-10 rounded-[20px] p-6" style={{ "--d": "200ms" } as React.CSSProperties}>
                <figcaption className="text-sm font-medium">{t("bento.fairness.title")}</figcaption>
                <div className="relative mt-5 flex flex-col gap-3" role="img" aria-label={t("bento.fairness.chart")}>
                  {(
                    [
                      ["a", 1],
                      ["b", 0.92],
                      ["c", 0.86],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.5rem] items-center gap-3">
                      <span className="truncate text-xs text-ink-secondary">{t(`bento.fairness.${k}`)}</span>
                      <span className="h-2.5 rounded-full bg-ink-foreground/10">
                        <span className="block h-full rounded-full bg-sidebar-accent" style={{ width: `${v * 100}%` }} />
                      </span>
                      <span className="text-end text-xs text-ink-secondary tabular" dir="ltr">{Math.round(v * 100)}%</span>
                    </div>
                  ))}
                  <span className="pointer-events-none absolute -bottom-2 -top-2 w-px border-s border-dashed border-ink-foreground/60" style={{ insetInlineStart: "calc(4.5rem + 0.75rem + (100% - 4.5rem - 2.5rem - 1.5rem) * 0.8)" }} aria-hidden>
                    <span className="absolute start-0 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-[11px] text-ink-secondary rtl:translate-x-1/2">
                      {t("bento.fairness.line")}
                    </span>
                  </span>
                </div>
                <div className="h-7" aria-hidden />
              </figure>
              {/* And the data right, shown: anyone can take their data or delete it. */}
              <div className="fade-up card-night mt-4 rounded-[20px] p-6" style={{ "--d": "320ms" } as React.CSSProperties} aria-hidden>
                <p className="text-sm font-medium">{td2("title")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-ink-foreground/[0.08] px-3.5 py-2 text-sm shadow-[inset_0_0_0_1px_rgb(245_244_255/0.12)]">
                    <Download className="size-4" aria-hidden />
                    {td2("exportAction")}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-ink-secondary shadow-[inset_0_0_0_1px_rgb(245_244_255/0.12)]">
                    <Trash2 className="size-4" aria-hidden />
                    {td2("deleteAction")}
                  </span>
                </div>
              </div>
            </div>
            <ul className="border-t border-ink-foreground/10">
              {(
                [
                  [t("trust.people.title"), t("trust.people.body")],
                  [t("trust.fairness.title"), t("trust.fairness.body")],
                  [t("trust.privacy.title"), t("trust.privacy.body")],
                  [t("bento.small.bilingual.title"), t("bento.small.bilingual.body")],
                  [t("bento.small.ats.title"), t("bento.small.ats.body")],
                ] as const
              ).map(([title, body]) => (
                <li key={title} data-reveal className="border-b border-ink-foreground/10 py-8">
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
            </ul>
          </div>
        </section>

        {/* ── Finale: the field again, at the horizon ── */}
        <section aria-labelledby="cta-h" className="relative isolate overflow-hidden px-4 pb-44 pt-28 sm:px-6 lg:pb-56 lg:pt-36">
          <div className="absolute inset-x-0 bottom-0 top-[58%] -z-10 [mask-image:linear-gradient(to_bottom,transparent,#000_40%)]" aria-hidden>
            <EvidenceField horizon={0.08} spread={1.6} speed={0.22} intensity={0.9} bloom={0.55} />
          </div>
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_48%_at_50%_40%,rgb(7_8_28/0.9),transparent_75%)]" aria-hidden />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-[radial-gradient(70%_60%_at_50%_100%,rgb(242_181_50/0.14),transparent_70%)]" aria-hidden />
          <div data-reveal className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
            <h2 id="cta-h" className="text-[2.4rem] font-semibold leading-[1.04] tracking-[-0.035em] text-[#e2e3fb] sm:text-6xl">
              <SplitWords text={t("cta.title")} />
            </h2>
            <p className="fade-up mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary" style={{ "--d": "300ms" } as React.CSSProperties}>
              {t("cta.body")}
            </p>
            <div className="fade-up mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-7" style={{ "--d": "420ms" } as React.CSSProperties}>
              <Button asChild size="lg" className={cn("btn-hero cta-halo h-13 rounded-full px-7", INK_PRIMARY)}>
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="flip-rtl" aria-hidden />
                </Link>
              </Button>
              {!viewer ? (
                <Link href="/sign-in" className="rounded-full px-2 py-1 text-[15px] font-medium text-ink-secondary transition-colors hover:text-ink-foreground focus-visible:outline-2 focus-visible:outline-focus">
                  {t("signIn")}
                </Link>
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
function Stage({ children, reverse = false }: { children: React.ReactNode; reverse?: boolean }) {
  return <div className={cn("mx-auto flex h-full max-w-6xl flex-col justify-center gap-8 px-5 pb-10 pt-24 sm:px-8 lg:items-center lg:justify-between lg:gap-16 lg:pb-0 lg:pt-0", reverse ? "lg:flex-row-reverse" : "lg:flex-row")}>{children}</div>;
}

function BeatCopy({ title, body, className }: { title: string; body: string; className?: string }) {
  return (
    <div className={cn("max-w-md", className)}>
      <h2 className=" text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-ink-secondary sm:text-lg">{body}</p>
    </div>
  );
}
