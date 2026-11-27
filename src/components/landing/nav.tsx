import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LogoTile, Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";

export const SECTIONS = [
  ["how", "nav.how"],
  ["report", "nav.report"],
  ["modes", "nav.modes"],
  ["trust", "nav.trust"],
  ["pricing", "pricing.nav"],
] as const;

/**
 * Clear over the hero, frosted once the page moves (see LandingMotion). The
 * logo is the blue tile, the section links are pills, and the call to action
 * is violet: the hero keeps the page's one coral button.
 *
 * Other public pages (the legal and trust pages) reuse it with `base="/"`, so
 * the section links lead back to the landing page, and `solid`, so it is
 * frosted from the start over long text.
 */
export async function LandingNav({ signedIn, base = "", solid = false }: { signedIn: boolean; base?: string; solid?: boolean }) {
  const t = await getTranslations("landing");
  return (
    <header data-r-nav data-scrolled={solid ? "" : undefined} className="r-nav sticky top-0 z-50">
      <div className="r-wrap flex h-16 items-center gap-3 lg:h-[4.75rem]">
        <Link href="/" className="-m-1 flex shrink-0 items-center gap-2.5 rounded-full p-1">
          <LogoTile className="size-9 sm:size-10" />
          <Wordmark className="h-[19px] text-text sm:h-[21px]" />
        </Link>
        <nav aria-label={t("navLabel")} className="ms-6 hidden items-center gap-1 rounded-full bg-surface/60 p-1 shadow-card lg:flex xl:ms-12">
          {SECTIONS.map(([id, key]) => (
            <a key={id} href={`${base}#${id}`} className="rounded-full px-4 py-2 text-[14px] font-medium text-secondary transition-colors hover:bg-surface hover:text-text">
              {t(key)}
            </a>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1 sm:gap-2">
          <LanguageToggle className="rounded-full px-2.5 text-text sm:px-3.5 [&>span]:hidden sm:[&>span]:inline" />
          <ThemeMenu className="hidden size-10 rounded-full text-text shadow-[inset_0_0_0_1px_var(--border-strong)] sm:inline-flex" />
          {signedIn ? (
            <Button asChild className="rounded-full px-5">
              <Link href="/app">{t("openApp")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden rounded-full text-text md:inline-flex">
                <Link href="/sign-in">{t("signIn")}</Link>
              </Button>
              <Button asChild className="rounded-full px-5">
                <Link href="/sign-up">{t("navCta")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
