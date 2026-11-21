import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/brand/logo";
import { LanguageToggle } from "@/components/app/preference-controls";
import { INK_GHOST } from "@/components/ui/ink";
import { SECTIONS } from "./nav";

/** Ink, the promise, the name, and the wordmark at full width. */
export async function LandingFooter({ signedIn }: { signedIn: boolean }) {
  const t = await getTranslations("landing");
  const link = "rounded-sm text-ink-secondary underline-offset-4 transition-colors hover:text-ink-foreground hover:underline";
  return (
    <footer className="r-on-ink bg-ink text-ink-foreground">
      <div className="r-wrap pb-8 pt-[clamp(4rem,8vw,7rem)]">
        <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-6">
            <p className="display-x text-[clamp(1.75rem,3.2vw,3rem)] leading-[0.95] rtl:leading-[1.3]">{t("footer.promise")}</p>
            <p className="r-body mt-8 max-w-md text-ink-secondary">
              {t("footer.nameTitle")} {t("footer.name")}
            </p>
            <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
              {(
                [
                  ["عالَم", "ʿālam", "alam"],
                  ["عالِم", "ʿālim", "alim"],
                ] as const
              ).map(([word, translit, key]) => (
                <div key={key} className="flex items-baseline gap-3">
                  <dt lang="ar" dir="rtl" className="font-display text-[1.75rem] font-bold leading-none">
                    {word}
                  </dt>
                  <dd className="text-sm text-ink-secondary">
                    <span dir="ltr" lang="ar-Latn">{translit}</span> · {t(`footer.${key}`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <nav aria-label={t("footer.product")} className="lg:col-span-2 lg:col-start-9">
            <p className="r-label text-ink-secondary">{t("footer.product")}</p>
            <ul className="mt-5 flex flex-col gap-3 text-[15px]">
              {SECTIONS.map(([id, key]) => (
                <li key={id}>
                  <a href={`#${id}`} className={link}>{t(key)}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t("footer.more")} className="lg:col-span-2">
            <p className="r-label text-ink-secondary">{t("footer.more")}</p>
            <ul className="mt-5 flex flex-col gap-3 text-[15px]">
              <li>
                <Link href="/brand" className={link}>{t("footer.brand")}</Link>
              </li>
              <li>
                <Link href={signedIn ? "/app" : "/sign-in"} className={link}>{signedIn ? t("openApp") : t("signIn")}</Link>
              </li>
              {!signedIn ? (
                <li>
                  <Link href="/sign-up" className={link}>{t("getStarted")}</Link>
                </li>
              ) : null}
            </ul>
          </nav>
        </div>

        <div className="mt-[clamp(4rem,9vw,8rem)] text-ink-foreground" dir="ltr">
          <Wordmark className="h-auto w-full" />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink-foreground/15 pt-6 text-sm text-ink-secondary">
          <p>{t("footer.note")}</p>
          <LanguageToggle className={INK_GHOST} />
        </div>
      </div>
    </footer>
  );
}
