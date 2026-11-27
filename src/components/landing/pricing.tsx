import type * as React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Building2, Check, Mail, Rocket, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { NUMERALS_COOKIE, isNumeralSystem } from "@/i18n/config";
import { formatUsd } from "@/lib/billing/money";
import { PAID_PLANS, PLANS, TRIAL, salesEmail, yearlySavingMonths } from "@/lib/billing/plans";
import { Button } from "@/components/ui/button";
import { SectionHead } from "./section-head";
import { cn } from "@/lib/utils";

const vars = (v: Record<string, number>) => v as React.CSSProperties;

interface Card {
  key: "trial" | "starter" | "growth" | "enterprise";
  icon: LucideIcon;
  tone: string;
  price: string;
  term: string | null;
  extra: string | null;
  points: string[];
  cta: { href: string; label: string; mail?: boolean };
}

/**
 * Pricing on the landing page (D-066): the free trial and the three plans,
 * with prices and allowances from src/lib/billing/plans.ts, in the page's
 * section style (numbered pill, display title, lifted cards).
 */
export async function Pricing({ index, startHref, startLabel, className, headClassName }: { index: string; startHref: string; startLabel: string; className?: string; headClassName?: string }) {
  const t = await getTranslations("landing.pricing");
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  const raw = (await cookies()).get(NUMERALS_COOKIE)?.value;
  const nu = isNumeralSystem(raw) ? raw : "latn";
  const usd = (v: number) => formatUsd(v, locale, nu);
  const sales = salesEmail();
  const start = { href: startHref, label: startLabel };

  const cards: Card[] = [
    {
      key: "trial",
      icon: Sparkles,
      tone: "tile-violet",
      price: t("free"),
      term: t("trialTerm", { days: TRIAL.days }),
      extra: null,
      points: [t("points.trialInvites", { count: TRIAL.invitations }), t("points.allFeatures"), t("points.noCard")],
      cta: start,
    },
    ...PAID_PLANS.map((key, i): Card => {
      const p = PLANS[key];
      return {
        key,
        icon: key === "starter" ? Rocket : TrendingUp,
        tone: i === 0 ? "tile-blue" : "tile-teal",
        price: usd(p.priceUsd!.month),
        term: t("perMonth"),
        extra: t("yearly", { price: usd(p.priceUsd!.year), months: yearlySavingMonths(key) }),
        points: [t("points.invitations", { count: p.invitations! }), t("points.aiBudget", { amount: usd(p.aiBudgetUsd!) }), t("points.features")],
        cta: start,
      };
    }),
    {
      key: "enterprise",
      icon: Building2,
      tone: "bg-accent-subtle text-accent-text",
      price: t("custom"),
      term: null,
      extra: null,
      points: [t("points.customInvitations"), t("points.customBudget"), t("points.invoicing")],
      cta: sales ? { href: `mailto:${sales}?subject=${encodeURIComponent(t("contactSubject"))}`, label: t("contact"), mail: true } : start,
    },
  ];

  return (
    <section id="pricing" aria-labelledby="pricing-h" className={className}>
      <div className="r-wrap">
        <SectionHead index={index} label={t("label")} />
        <div className={headClassName}>
          <h2 id="pricing-h" className="display-x r-h2 lg:col-span-7">{t("title")}</h2>
          <p className="r-body max-w-md text-secondary lg:col-span-4 lg:col-start-9 lg:self-end">{t("sub")}</p>
        </div>
        {/* On wide screens each card spans six rows of a shared subgrid, so names, prices, lists and buttons line up. */}
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:mt-16 xl:grid-cols-4 xl:grid-rows-[auto_auto_auto_auto_1fr_auto] xl:gap-y-0">
          {cards.map((c, i) => (
            <li key={c.key} data-reveal style={vars({ "--i": i })} className={cn("r-card r-lift flex flex-col p-6 sm:p-7 xl:row-span-6 xl:grid xl:grid-rows-subgrid", c.key === "trial" && "ring-2 ring-accent/70")}>
              <div className="flex items-center gap-3">
                <span className={cn("r-orb size-11", c.tone)} aria-hidden>
                  <c.icon className="size-[45%]" strokeWidth={2} />
                </span>
                <h3 className="r-h3">{t(`plans.${c.key}`)}</h3>
              </div>
              <p className="r-body mt-4 text-secondary">{t(`blurbs.${c.key}`)}</p>
              <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
                <span className="display-x text-[2.5rem] leading-none tracking-[-0.03em] tabular">{c.price}</span>
                {c.term ? <span className="r-label text-secondary">{c.term}</span> : null}
              </p>
              <p className="mt-2 min-h-5 text-sm text-tertiary">{c.extra}</p>
              <ul className="mt-6 flex flex-col gap-3">
                {c.points.map((line) => (
                  <li key={line} className="flex gap-2.5 text-[15px] leading-snug">
                    <Check className="mt-0.5 size-4 shrink-0 text-teal-text" strokeWidth={2.5} aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <Button asChild variant={c.key === "trial" ? "primary" : "secondary"} size="lg" className="w-full rounded-full">
                  {c.cta.mail ? (
                    <a href={c.cta.href}>
                      <Mail aria-hidden />
                      {c.cta.label}
                    </a>
                  ) : (
                    <Link href={c.cta.href}>
                      {c.cta.label}
                      <ArrowRight className="flip-rtl" aria-hidden />
                    </Link>
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-tertiary">{t("note", { days: TRIAL.days, count: TRIAL.invitations })}</p>
      </div>
    </section>
  );
}
