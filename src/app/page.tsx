import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Briefcase, Sprout, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { getViewer } from "@/lib/auth/session";

export default async function Home() {
  const t = await getTranslations("landing");
  const viewer = await getViewer();
  const modes = [
    { key: "hire", icon: Briefcase },
    { key: "grow", icon: Sprout },
    { key: "team", icon: Users },
  ] as const;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1">
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
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-28">
          <p className="text-sm font-medium text-accent-text">{t("eyebrow")}</p>
          <h1 className="mt-4 max-w-3xl text-[2.25rem] font-semibold leading-[1.1] tracking-tight text-text sm:text-3xl lg:text-[3.25rem]">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-[38rem] text-lg leading-relaxed text-secondary">{t("subtitle")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={viewer ? "/app" : "/sign-up"}>
                {viewer ? t("openApp") : t("getStarted")}
                <ArrowRight className="flip-rtl" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/design">{t("seeDesign")}</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6" aria-labelledby="modes">
          <h2 id="modes" className="sr-only">
            {t("modesTitle")}
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-3">
            {modes.map(({ key, icon: Icon }) => (
              <li key={key} className="flex flex-col gap-3 bg-surface p-6 sm:p-8">
                <Icon className="size-5 text-accent-text" strokeWidth={1.5} aria-hidden />
                <h3 className="text-base font-semibold text-text">{t(`modes.${key}.title`)}</h3>
                <p className="text-sm leading-relaxed text-secondary">{t(`modes.${key}.body`)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-16 grid gap-10 sm:grid-cols-3">
            {(["evidence", "adaptive", "people"] as const).map((k) => (
              <div key={k} className="flex flex-col gap-2 border-s-2 border-accent ps-4">
                <dt className="text-sm font-semibold text-text">{t(`principles.${k}.title`)}</dt>
                <dd className="text-sm leading-relaxed text-secondary">{t(`principles.${k}.body`)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-tertiary sm:px-6">
          <Logo showArabic={false} className="opacity-80" />
          <p>{t("footer")}</p>
        </div>
      </footer>
    </div>
  );
}
