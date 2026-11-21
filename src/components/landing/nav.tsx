import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/app/preference-controls";

export const SECTIONS = [
  ["how", "nav.how"],
  ["report", "nav.report"],
  ["modes", "nav.modes"],
  ["trust", "nav.trust"],
] as const;

/**
 * Flat bone bar with a hairline once the page moves (see LandingMotion). The
 * call to action is ink while the hero's signal button is on screen, so there
 * is only ever one vermilion button in view.
 */
export async function LandingNav({ signedIn }: { signedIn: boolean }) {
  const t = await getTranslations("landing");
  return (
    <header data-r-nav data-cta="ink" className="r-nav sticky top-0 z-50">
      <div className="r-wrap flex h-16 items-center gap-4 lg:h-[4.5rem]">
        <Link href="/" className="-m-1.5 shrink-0 rounded-control p-1.5">
          <Logo className="text-[16px] sm:text-[17px]" />
        </Link>
        <nav aria-label={t("navLabel")} className="ms-8 hidden items-center gap-7 lg:flex xl:ms-14">
          {SECTIONS.map(([id, key]) => (
            <a key={id} href={`#${id}`} className="rounded-sm text-[14px] font-medium text-secondary underline-offset-[6px] transition-colors hover:text-text hover:underline">
              {t(key)}
            </a>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1 sm:gap-2">
          <LanguageToggle className="px-2 text-text sm:px-3 [&>span]:hidden sm:[&>span]:inline" />
          {signedIn ? (
            <Button asChild className="r-nav-cta">
              <Link href="/app">{t("openApp")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden text-text sm:inline-flex">
                <Link href="/sign-in">{t("signIn")}</Link>
              </Button>
              <Button asChild className="r-nav-cta">
                <Link href="/sign-up">{t("navCta")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
