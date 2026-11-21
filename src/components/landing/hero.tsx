import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RangeSignature } from "./range-signature";

/**
 * Bone, a billboard headline, and the signature: wide bands narrowing into
 * one vermilion dot. The hero's button is the page's one signal at a time.
 */
export async function Hero({ primaryHref, primaryLabel }: { primaryHref: string; primaryLabel: string }) {
  const t = await getTranslations("landing.hero");
  const facts = (["time", "languages", "people"] as const).map((k) => t(`facts.${k}`));

  return (
    <section aria-labelledby="hero-h">
      <div className="r-wrap pb-[clamp(3.5rem,7vw,6rem)] pt-[clamp(2.25rem,3.6vw,3.5rem)]">
        <p className="r-label flex items-center gap-3 text-secondary">
          <span className="size-2 shrink-0 rounded-full bg-[var(--signal)]" aria-hidden />
          {t("eyebrow")}
        </p>
        <h1 id="hero-h" className="display-x r-h1 mt-6">
          {t("title")}
        </h1>

        <div className="mt-[clamp(2.5rem,4vw,3.5rem)] grid gap-y-14 lg:grid-cols-12 lg:gap-x-6">
          <div className="flex flex-col lg:col-span-5">
            <p className="r-lead max-w-[34rem] text-secondary">{t("sub")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild variant="signal" size="lg" className="h-14 px-6 text-base" id="hero-cta">
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="flip-rtl" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-14 px-6 text-base text-text shadow-[inset_0_0_0_1.5px_var(--text)] hover:bg-text/5">
                <a href="#how">
                  {t("seeHow")}
                  <ArrowDown aria-hidden />
                </a>
              </Button>
            </div>
            <Facts items={facts} className="mt-auto hidden pt-14 lg:block" />
          </div>
          <div className="lg:col-span-7 lg:pt-1">
            <RangeSignature />
          </div>
          <Facts items={facts} className="lg:hidden" />
        </div>
      </div>
    </section>
  );
}

function Facts({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={className}>
      {items.map((f, i) => (
        <li key={f} className="flex items-baseline gap-4 border-t border-text/15 py-3 text-[15px] text-text last:border-b rtl:text-base">
          <span className="r-index w-5 shrink-0 text-[11px] text-tertiary">0{i + 1}</span>
          {f}
        </li>
      ))}
    </ul>
  );
}
