import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LogoTile, Wordmark } from "@/components/brand/logo";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { SECTIONS } from "./nav";

/** A recessed panel: the promise, the name, the links, and the wordmark at full width, glowing out of the dark. */
export async function LandingFooter({ signedIn }: { signedIn: boolean }) {
  const t = await getTranslations("landing");
  const link = "rounded-full text-secondary underline-offset-4 transition-colors hover:text-text hover:underline";
  return (
    <footer className="relative isolate overflow-hidden rounded-t-[32px] bg-surface-sunken sm:rounded-t-[40px]">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[60%] bg-[radial-gradient(60%_80%_at_50%_100%,var(--wash-1),transparent_70%)]" />
      <div className="r-wrap pb-8 pt-[clamp(3.5rem,7vw,6rem)]">
        <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-6">
            <LogoTile className="size-11" />
            <p className="display-x mt-6 text-[clamp(1.875rem,3.2vw,3rem)] leading-[1.05] rtl:leading-[1.35]">{t("footer.promise")}</p>
            <p className="r-body mt-6 max-w-md text-secondary">
              {t("footer.nameTitle")} {t("footer.name")}
            </p>
            <dl className="mt-6 flex flex-wrap gap-3">
              {(
                [
                  ["عالَم", "ʿālam", "alam"],
                  ["عالِم", "ʿālim", "alim"],
                ] as const
              ).map(([word, translit, key]) => (
                <div key={key} className="flex items-baseline gap-3 rounded-full bg-surface px-4 py-2 shadow-card">
                  <dt lang="ar" dir="rtl" className="font-display text-[1.375rem] font-bold leading-none">
                    {word}
                  </dt>
                  <dd className="text-sm text-secondary">
                    <span dir="ltr" lang="ar-Latn">{translit}</span> · {t(`footer.${key}`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <nav aria-label={t("footer.product")} className="lg:col-span-2 lg:col-start-9">
            <p className="r-label text-tertiary">{t("footer.product")}</p>
            <ul className="mt-5 flex flex-col gap-3 text-[15px]">
              {SECTIONS.map(([id, key]) => (
                <li key={id}>
                  <a href={`#${id}`} className={link}>{t(key)}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t("footer.more")} className="lg:col-span-2">
            <p className="r-label text-tertiary">{t("footer.more")}</p>
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

        <div className="mt-[clamp(3.5rem,8vw,7rem)] text-[var(--glow-lavender)] [mask-image:linear-gradient(to_bottom,black_35%,transparent_105%)]" dir="ltr">
          <Wordmark className="h-auto w-full" />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-secondary">
          <p>{t("footer.note")}</p>
          <div className="flex items-center gap-2">
            <LanguageToggle className="rounded-full text-text" />
            <ThemeMenu className="size-9 rounded-full text-text shadow-[inset_0_0_0_1px_var(--border-strong)]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
