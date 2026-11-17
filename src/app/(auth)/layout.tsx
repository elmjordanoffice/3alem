import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { RangeScale } from "@/components/report/range-scale";
import { EvidenceField } from "@/components/brand/evidence-field";

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
      <aside className="ink-lit grain relative isolate hidden overflow-hidden text-ink-foreground lg:m-3 lg:flex lg:flex-col lg:justify-between lg:rounded-[24px] lg:p-14 xl:p-16" aria-label={t("label")}>
        <div className="ink-grid absolute inset-0 -z-10" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 top-[34%] -z-10 [mask-image:linear-gradient(to_bottom,transparent,#000_35%)]" aria-hidden>
          <EvidenceField horizon={0.04} spread={1.7} speed={0.24} intensity={0.9} bloom={0.5} palette="quiet" />
        </div>
        <p className="max-w-md font-display text-[2.75rem] font-semibold leading-[1.06] tracking-[-0.03em]">{t("title")}</p>
        <figure className="relative max-w-md">
          <div className="float-in rounded-2xl bg-ink-foreground/[0.06] p-5 shadow-[inset_0_0_0_1px_rgb(245_244_255/0.12)] backdrop-blur-sm" style={{ animationDelay: "200ms" }}>
            <blockquote className="text-[15px] leading-relaxed">
              “{t("quoteStart")} <mark className="evidence-mark">{t("quoteEvidence")}</mark> {t("quoteEnd")}”
            </blockquote>
          </div>
          <figcaption className="float-in mt-4 rounded-2xl bg-surface p-5 text-text shadow-window" style={{ animationDelay: "450ms" }}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{t("skill")}</span>
              <span className="text-secondary">{t("level")} <bdi dir="ltr" className="tabular text-tertiary">{t("range")}</bdi></span>
            </div>
            <RangeScale low={3.3} high={3.9} estimate={3.6} expected={3.5} size="md" animate className="mt-3" />
          </figcaption>
        </figure>
        <p className="max-w-md text-sm leading-relaxed text-ink-secondary">{t("footer")}</p>
      </aside>
    </div>
  );
}
