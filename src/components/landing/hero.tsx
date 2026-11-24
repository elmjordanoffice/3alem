import type * as React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowDown, ArrowRight, Clock3, Languages, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "./hero-visual";

/**
 * Deep indigo with violet and blue light pooled behind the product, a big
 * bold headline, and a visual built from the report itself. The hero's
 * button is the page's one coral call to action.
 */
export async function Hero({ primaryHref, primaryLabel }: { primaryHref: string; primaryLabel: string }) {
  const t = await getTranslations("landing.hero");
  const facts = [
    ["time", Clock3],
    ["languages", Languages],
    ["people", UserCheck],
  ] as const;

  return (
    <section aria-labelledby="hero-h" className="r-hero">
      <div className="r-wrap grid items-center gap-x-10 gap-y-14 pb-[clamp(3rem,6vw,5rem)] pt-[clamp(1.75rem,4vw,3.5rem)] lg:grid-cols-12 xl:gap-x-14">
        <div className="flex flex-col lg:col-span-6">
          <p className="r-pill r-label r-rise self-start">
            <span className="grid size-6 place-items-center rounded-full bg-[var(--signal-subtle)]" aria-hidden>
              <span className="size-2 rounded-full bg-[var(--signal)] shadow-[0_0_8px_var(--signal)]" />
            </span>
            {t("eyebrow")}
          </p>
          <h1 id="hero-h" className="display-x r-h1 r-rise mt-6" style={{ "--d": 60 } as React.CSSProperties}>
            {t("title")}
          </h1>
          <p className="r-lead r-rise mt-6 max-w-[36rem] text-secondary" style={{ "--d": 120 } as React.CSSProperties}>
            {t("sub")}
          </p>
          <div className="r-rise mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" style={{ "--d": 180 } as React.CSSProperties}>
            <Button asChild variant="signal" size="lg" className="h-14 rounded-full px-7 text-base shadow-[0_16px_34px_-14px_var(--signal)]">
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="flip-rtl" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-14 rounded-full bg-surface px-7 text-base text-text shadow-card hover:bg-surface-subtle">
              <a href="#how">
                {t("seeHow")}
                <ArrowDown aria-hidden />
              </a>
            </Button>
          </div>
          <ul className="r-rise mt-10 grid gap-2.5 sm:grid-cols-3 lg:mt-12" style={{ "--d": 240 } as React.CSSProperties}>
            {facts.map(([k, Icon]) => (
              <li key={k} className="flex items-center gap-3 rounded-[18px] bg-surface/70 p-3 text-[14px] leading-snug text-text shadow-card sm:flex-col sm:items-start sm:p-4 rtl:text-[15px]">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-subtle text-accent-text" aria-hidden>
                  <Icon className="size-[18px]" strokeWidth={2} />
                </span>
                {t(`facts.${k}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-6">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
