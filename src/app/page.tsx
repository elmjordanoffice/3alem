import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { HeroDemo } from "@/components/landing/hero-demo";
import { FitPill, type FitLevel } from "@/components/report/fit";
import { getViewer } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const HEAT: number[][] = [
  [4, 3, 4, 2, 3],
  [3, 4, 3, 3, 2],
  [2, 3, 3, 4, 4],
  [4, 2, 3, 3, 3],
  [3, 3, 2, 2, 4],
  [2, 4, 3, 3, 3],
];
const LEVEL_BG = ["", "bg-level-1", "bg-level-2", "bg-level-3", "bg-level-4", "bg-level-5"];

export default async function Home() {
  const t = await getTranslations("landing");
  const tf = await getTranslations("home.fit");
  const viewer = await getViewer();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="rounded-control focus-visible:outline-2 focus-visible:outline-focus">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1" aria-label={t("navLabel")}>
          <a href="#how" className="hidden rounded-control px-3 py-2 text-sm text-secondary hover:text-text md:inline">{t("nav.how")}</a>
          <a href="#modes" className="hidden rounded-control px-3 py-2 text-sm text-secondary hover:text-text md:inline">{t("nav.modes")}</a>
          <a href="#trust" className="me-2 hidden rounded-control px-3 py-2 text-sm text-secondary hover:text-text md:inline">{t("nav.trust")}</a>
          <LanguageToggle />
          <ThemeMenu />
          {viewer ? (
            <Button asChild size="sm" className="ms-2">
              <Link href="/app">{t("openApp")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="ms-1 hidden sm:inline-flex">
                <Link href="/sign-in">{t("signIn")}</Link>
              </Button>
              <Button asChild size="sm" className="ms-1">
                <Link href="/sign-up">{t("getStarted")}</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero: the claim on one side, the product proving it on the other. */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:pb-28 lg:pt-20">
          <div className="animate-rise">
            <h1 className="text-[2.75rem] font-semibold leading-[1.02] text-text sm:text-5xl lg:text-[4.5rem]">{t("title")}</h1>
            <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-secondary">{t("subtitle")}</p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={viewer ? "/app" : "/sign-up"}>{viewer ? t("openApp") : t("getStarted")}</Link>
              </Button>
              {!viewer ? (
                <Button asChild size="lg" variant="secondary">
                  <Link href="/sign-in">{t("signIn")}</Link>
                </Button>
              ) : null}
            </div>
            <p className="mt-8 max-w-[34rem] text-sm text-tertiary">{t("heroNote")}</p>
          </div>
          <HeroDemo />
        </section>

        {/* A real sequence, so it is numbered. */}
        <section id="how" aria-labelledby="how-h" className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <h2 id="how-h" className="max-w-2xl text-3xl font-semibold leading-tight text-text sm:text-[2.5rem]">{t("how.title")}</h2>
            <ol className="relative mt-14 grid gap-12 lg:grid-cols-3 lg:gap-10">
              <span aria-hidden className="absolute inset-x-0 top-6 hidden h-px bg-border lg:block" />
              {(["jd", "week", "evidence"] as const).map((k, i) => (
                <li key={k} className="relative">
                  <span className="relative inline-flex size-12 items-center justify-center rounded-full border border-border-strong bg-surface font-display text-lg font-semibold text-text tabular">{i + 1}</span>
                  <h3 className="mt-6 text-lg font-semibold text-text">{t(`how.${k}.title`)}</h3>
                  <p className="mt-2 max-w-sm leading-relaxed text-secondary">{t(`how.${k}.body`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Three modes, each shown by a piece of its own interface. */}
        <section id="modes" aria-labelledby="modes-h" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <h2 id="modes-h" className="max-w-2xl text-3xl font-semibold leading-tight text-text sm:text-[2.5rem]">{t("modesTitle")}</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-secondary">{t("modesSubtitle")}</p>
          <div className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-8">
            <Mode title={t("modes.hire.title")} body={t("modes.hire.body")}>
              <ul className="flex flex-col divide-y divide-border">
                {([["Hana Al-Sayed", "GOOD"], ["Priya Raman", "STRONG"], ["Mateo Fernández", "PARTIAL"]] as [string, FitLevel][]).map(([name, fit]) => (
                  <li key={name} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="truncate text-sm text-text">{name}</span>
                    <FitPill fit={fit} label={tf(fit)} />
                  </li>
                ))}
              </ul>
            </Mode>
            <Mode title={t("modes.grow.title")} body={t("modes.grow.body")}>
              <div className="flex flex-col gap-3 text-sm">
                <p>
                  <span className="block text-xs font-medium text-tertiary">{t("modes.grow.wellLabel")}</span>
                  <span className="mt-1 block leading-relaxed text-text">{t("modes.grow.well")}</span>
                </p>
                <p>
                  <span className="block text-xs font-medium text-tertiary">{t("modes.grow.expertLabel")}</span>
                  <span className="mt-1 block leading-relaxed text-text">{t("modes.grow.expert")}</span>
                </p>
              </div>
            </Mode>
            <Mode title={t("modes.team.title")} body={t("modes.team.body")}>
              <div className="grid grid-cols-5 gap-1" role="img" aria-label={t("modes.team.heatLabel")}>
                {HEAT.flatMap((row, r) => row.map((v, c) => <span key={`${r}-${c}`} className={cn("aspect-[1.6] rounded-[5px]", LEVEL_BG[v])} />))}
              </div>
              <p className="mt-3 text-xs text-tertiary">{t("modes.team.heatCaption")}</p>
            </Mode>
          </div>
        </section>

        <section id="trust" aria-labelledby="trust-h" className="bg-ink text-ink-foreground">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:gap-16">
              <div>
                <LogoMark className="size-10" />
                <h2 id="trust-h" className="mt-6 text-3xl font-semibold leading-tight sm:text-[2.5rem]">{t("trust.title")}</h2>
              </div>
              <dl className="grid gap-10 sm:grid-cols-3 sm:gap-8">
                {(["people", "fairness", "privacy"] as const).map((k) => (
                  <div key={k} className="border-t border-ink-foreground/20 pt-5">
                    <dt className="font-semibold">{t(`trust.${k}.title`)}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-ink-secondary">{t(`trust.${k}.body`)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-tertiary sm:px-6">
          <Logo />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/brand" className="hover:text-text">{t("brandLink")}</Link>
            <p>{t("footer")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Mode({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <h3 className="font-display text-2xl font-semibold text-text">{title}</h3>
      <p className="mt-3 leading-relaxed text-secondary">{body}</p>
      <div className="mt-6 rounded-card border border-border bg-surface p-5">{children}</div>
    </div>
  );
}
