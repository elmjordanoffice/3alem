import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { RangeScale } from "@/components/report/range-scale";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("auth.brand");
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
      <div className="flex min-h-dvh flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="rounded-control focus-visible:outline-2 focus-visible:outline-focus">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeMenu />
          </div>
        </header>
        <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-[8vh] sm:pt-[12vh]">
          <div className="w-full max-w-[400px] animate-rise">{children}</div>
        </main>
      </div>

      {/* Brand panel: what Aalim is for, shown rather than claimed. */}
      <aside className="relative hidden overflow-hidden bg-ink text-ink-foreground lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-20" aria-label={t("label")}>
        <p className="max-w-md font-display text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.02em]">{t("title")}</p>
        <figure className="max-w-md">
          <blockquote className="rounded-2xl bg-ink-raised p-6 text-[15px] leading-relaxed">
            {t("quoteStart")} <mark className="evidence-mark">{t("quoteEvidence")}</mark> {t("quoteEnd")}
          </blockquote>
          <figcaption className="mt-6">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{t("skill")}</span>
              <span className="text-ink-secondary">{t("level")} <bdi dir="ltr">{t("range")}</bdi></span>
            </div>
            <RangeScale low={3.3} high={3.9} estimate={3.6} tone="ink" size="md" className="mt-3" />
          </figcaption>
        </figure>
        <p className="max-w-md text-sm leading-relaxed text-ink-secondary">{t("footer")}</p>
      </aside>
    </div>
  );
}
