import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo, LogoMark } from "@/components/brand/logo";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { RangeScale } from "@/components/report/range-scale";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("auth.brand");
  return (
    <div className="app-canvas grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
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

      {/* Brand panel: the idea, at billboard scale. */}
      <aside className="hero-card hidden lg:m-3 lg:flex lg:flex-col lg:justify-between lg:gap-10 lg:rounded-[20px] lg:p-12 xl:p-14" aria-label={t("label")}>
        <p className="display-x max-w-lg text-[2.6rem] xl:text-[3.1rem]">{t("title")}</p>
        {/* The ʿayn at billboard scale: it draws itself, then keeps an eye out. */}
        <div className="relative mx-auto grid place-items-center">
          <span className="absolute size-56 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.18),transparent_68%)] blur-xl" aria-hidden />
          <LogoMark animated className="relative size-52 text-white [filter:drop-shadow(0_24px_40px_rgb(20_18_60/0.45))]" />
        </div>
        <figure className="max-w-md">
          <blockquote className="text-[15px] leading-relaxed text-hero-foreground" dir="auto">
            “{t("quoteStart")} <mark className="evidence-mark">{t("quoteEvidence")}</mark> {t("quoteEnd")}”
          </blockquote>
          <figcaption className="mt-5 border-t border-ink-foreground/15 pt-4">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{t("skill")}</span>
              <span className="text-hero-secondary">{t("level")} <bdi dir="ltr" className="tabular">{t("range")}</bdi></span>
            </div>
            <RangeScale low={3.3} high={3.9} estimate={3.6} expected={3.5} size="md" tone="ink" animate className="mt-3" />
          </figcaption>
        </figure>
        <p className="max-w-md text-sm leading-relaxed text-hero-secondary">{t("footer")}</p>
      </aside>
    </div>
  );
}
