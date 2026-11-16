import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Check } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { RangeField } from "@/components/brand/range-field";
import { Button } from "@/components/ui/button";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { INK_GHOST, INK_PRIMARY, INK_SECONDARY } from "@/components/ui/ink";
import { HeroFigure } from "@/components/landing/hero-figure";
import { Chapters } from "@/components/landing/chapters";
import { Bento } from "@/components/landing/bento";
import { getViewer } from "@/lib/auth/session";

export default async function Home() {
  const t = await getTranslations("landing");
  const viewer = await getViewer();
  const primaryHref = viewer ? "/app" : "/sign-up";
  const primaryLabel = viewer ? t("openApp") : t("getStarted");

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Hero: ink lit by the range field, with the product as the image. */}
      <div className="ink-lit grain relative isolate overflow-hidden text-ink-foreground">
        <div className="ink-grid absolute inset-0 -z-10" aria-hidden />
        <header className="relative mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="rounded-control focus-visible:outline-2 focus-visible:outline-focus">
            <Logo reverse showArabic={false} className="sm:hidden" />
            <Logo reverse className="hidden sm:inline-flex" />
          </Link>
          <nav className="flex items-center gap-1" aria-label={t("navLabel")}>
            <a href="#how" className="hidden rounded-control px-3 py-2 text-sm text-ink-secondary transition-colors hover:text-ink-foreground md:inline">{t("nav.how")}</a>
            <a href="#modes" className="hidden rounded-control px-3 py-2 text-sm text-ink-secondary transition-colors hover:text-ink-foreground md:inline">{t("nav.modes")}</a>
            <a href="#trust" className="me-2 hidden rounded-control px-3 py-2 text-sm text-ink-secondary transition-colors hover:text-ink-foreground md:inline">{t("nav.trust")}</a>
            <LanguageToggle className={INK_GHOST} />
            <ThemeMenu className={`hidden sm:inline-flex ${INK_GHOST}`} />
            {viewer ? (
              <Button asChild size="sm" className={`ms-2 ${INK_PRIMARY}`}>
                <Link href="/app">{t("openApp")}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className={`ms-1 hidden sm:inline-flex ${INK_GHOST}`}>
                  <Link href="/sign-in">{t("signIn")}</Link>
                </Button>
                <Button asChild size="sm" className={`ms-1 ${INK_PRIMARY}`}>
                  <Link href="/sign-up">{t("getStarted")}</Link>
                </Button>
              </>
            )}
          </nav>
        </header>

        <section className="relative mx-auto max-w-6xl px-4 pb-0 pt-14 text-center sm:px-6 sm:pt-20 lg:pt-24">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-ink-foreground/[0.07] px-3.5 py-1.5 text-[13px] text-ink-secondary shadow-[inset_0_0_0_1px_rgb(245_244_255/0.12)]">
              <span className="size-1.5 rounded-full bg-saffron" aria-hidden />
              {t("hero.eyebrow")}
            </p>
            <h1 className="text-lit mx-auto mt-7 max-w-4xl text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[5.25rem]">{t("title")}</h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-ink-secondary">{t("subtitle")}</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className={INK_PRIMARY}>
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="flip-rtl" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className={INK_SECONDARY}>
                <a href="#how">{t("seeHow")}</a>
              </Button>
            </div>
            <ul className="mx-auto mt-9 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-secondary">
              {(["time", "languages", "people"] as const).map((k) => (
                <li key={k} className="flex items-center gap-2">
                  <Check className="size-4 text-saffron" aria-hidden />
                  {t(`hero.points.${k}`)}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-16 px-0 sm:mt-20 lg:px-8">
            <HeroFigure />
          </div>
        </section>
        {/* The ink dissolves into the paper below the figure. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" aria-hidden />
      </div>

      <main className="flex-1">
        {/* The promise in both scripts, at equal weight. */}
        <section aria-label={t("promise.label")} className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="flex flex-col items-center gap-5 text-center">
            <p lang="en" dir="ltr" className="font-display text-[2rem] font-semibold leading-tight tracking-[-0.025em] text-text sm:text-5xl lg:text-[3.5rem]">
              Evidence, <span className="text-tertiary">not impressions.</span>
            </p>
            <span className="flex items-center gap-3" aria-hidden>
              <span className="h-px w-16 bg-border-strong" />
              <LogoMark className="size-6" />
              <span className="h-px w-16 bg-border-strong" />
            </span>
            <p lang="ar" dir="rtl" className="font-display text-[2rem] font-semibold leading-[1.4] text-text sm:text-5xl lg:text-[3.5rem]">
              أدلة، <span className="text-tertiary">لا انطباعات.</span>
            </p>
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-center text-[15px] leading-relaxed text-secondary">{t("promise.caption")}</p>
        </section>

        {/* How it works: three numbered figures. */}
        <section id="how" aria-labelledby="how-h" className="scroll-mt-8 border-t border-border bg-surface-subtle/60">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <p className="eyebrow text-accent-text">{t("how.eyebrow")}</p>
            <h2 id="how-h" className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-text sm:text-[2.75rem]">{t("how.title")}</h2>
            <Chapters />
          </div>
        </section>

        {/* Three modes and the safeguards. */}
        <section id="modes" aria-labelledby="modes-h" className="scroll-mt-8 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <p className="eyebrow text-accent-text">{t("nav.modes")}</p>
          <h2 id="modes-h" className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-text sm:text-[2.75rem]">{t("modesTitle")}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">{t("modesSubtitle")}</p>
          <Bento />
        </section>

        {/* Trust, on ink, with the range field as texture. */}
        <section id="trust" aria-labelledby="trust-h" className="px-4 pb-20 sm:px-6 lg:pb-28">
          <div className="ink-lit grain relative mx-auto max-w-6xl overflow-hidden rounded-[28px] text-ink-foreground">
            <RangeField width={560} height={520} rows={9} className="pointer-events-none absolute -bottom-24 -start-20 hidden h-[95%] w-auto opacity-60 [mask-image:radial-gradient(ellipse_at_15%_90%,#000_10%,transparent_60%)] lg:block rtl:-scale-x-100" />
            <div className="relative grid gap-12 p-8 sm:p-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-16 lg:p-16">
              <div>
                <LogoMark className="size-11" reverse />
                <h2 id="trust-h" className="mt-7 text-3xl font-semibold leading-tight sm:text-[2.5rem]">{t("trust.title")}</h2>
              </div>
              <dl className="grid gap-8 sm:grid-cols-3 sm:gap-6">
                {(["people", "fairness", "privacy"] as const).map((k, i) => (
                  <div key={k} className="rounded-2xl bg-ink-raised/70 p-5 shadow-[inset_0_0_0_1px_rgb(245_244_255/0.1)] backdrop-blur-md">
                    <dt className="font-semibold">
                      <span className="block font-display text-sm text-saffron tabular" aria-hidden>0{i + 1}</span>
                      <span className="mt-3 block">{t(`trust.${k}.title`)}</span>
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed text-ink-secondary">{t(`trust.${k}.body`)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Close */}
        <section aria-labelledby="cta-h" className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:py-28">
            <LogoMark className="size-12" />
            <h2 id="cta-h" className="mt-8 max-w-3xl text-[2.25rem] font-semibold leading-[1.1] text-text sm:text-5xl">{t("cta.title")}</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-secondary">{t("cta.body")}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="flip-rtl" aria-hidden />
                </Link>
              </Button>
              {!viewer ? (
                <Button asChild size="lg" variant="secondary">
                  <Link href="/sign-in">{t("signIn")}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface-subtle/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-secondary">{t("trust.people.body")}</p>
          </div>
          <nav aria-label={t("footerNav.product")}>
            <p className="eyebrow text-tertiary">{t("footerNav.product")}</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li><a href="#how" className="text-secondary hover:text-text">{t("nav.how")}</a></li>
              <li><a href="#modes" className="text-secondary hover:text-text">{t("nav.modes")}</a></li>
              <li><a href="#trust" className="text-secondary hover:text-text">{t("nav.trust")}</a></li>
            </ul>
          </nav>
          <nav aria-label={t("footerNav.more")}>
            <p className="eyebrow text-tertiary">{t("footerNav.more")}</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li><Link href="/brand" className="text-secondary hover:text-text">{t("brandLink")}</Link></li>
              <li><Link href={viewer ? "/app" : "/sign-in"} className="text-secondary hover:text-text">{viewer ? t("openApp") : t("signIn")}</Link></li>
            </ul>
          </nav>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-6 text-sm text-tertiary sm:px-6">
          <p>{t("footer")}</p>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeMenu />
          </div>
        </div>
      </footer>
    </div>
  );
}
