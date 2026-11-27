"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Building2, Check, CreditCard, Mail, Rocket, TrendingUp, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { openBillingPortal, startCheckout } from "@/app/actions/billing";
import { PAID_PLANS, PLANS, yearlySavingMonths, type Interval, type PaidPlanKey } from "@/lib/billing/plans";
import { useLocaleSettings, useNumbers } from "@/components/providers";
import { usdOptions } from "@/lib/billing/money";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Send the admin to Stripe, or say why not. */
function useGo() {
  const t = useTranslations("billing.errors");
  const [pending, setPending] = React.useState<string | null>(null);
  const go = async (key: string, run: () => Promise<{ ok: true; url: string } | { ok: false; error: string }>) => {
    setPending(key);
    const res = await run();
    if (res.ok) {
      window.location.assign(res.url);
      return;
    }
    setPending(null);
    toast.error(t.has(res.error as "off") ? t(res.error as "off") : t("invalid"));
  };
  return { pending, go };
}

/** "Manage billing and invoices": the Stripe billing portal. */
export function PortalButton({ className, variant = "secondary", label }: { className?: string; variant?: ButtonProps["variant"]; label: string }) {
  const { pending, go } = useGo();
  return (
    <Button variant={variant} className={className} loading={pending === "portal"} onClick={() => go("portal", openBillingPortal)}>
      <CreditCard aria-hidden />
      {label}
    </Button>
  );
}

const ICONS: Record<PaidPlanKey | "enterprise", LucideIcon> = { starter: Rocket, growth: TrendingUp, enterprise: Building2 };
const TILES: Record<PaidPlanKey | "enterprise", string> = { starter: "tile-blue", growth: "tile-violet", enterprise: "tile-teal" };

/**
 * The plans, with a monthly/yearly switch when yearly prices exist. Without a
 * live subscription the buttons open Checkout; with one, changes go through
 * the billing portal so nobody ends up paying twice.
 */
export function PlanPicker({
  yearly,
  currentPlan,
  currentInterval,
  hasSubscription,
  salesHref,
}: {
  yearly: boolean;
  currentPlan: string | null;
  currentInterval: Interval | null;
  hasSubscription: boolean;
  salesHref: string | null;
}) {
  const t = useTranslations("billing");
  const n = useNumbers();
  const { locale } = useLocaleSettings();
  const [interval, setInterval] = React.useState<Interval>(yearly && currentInterval === "year" ? "year" : "month");
  const { pending, go } = useGo();
  const usd = (v: number) => n.number(v, usdOptions(locale));
  const saving = Math.max(...PAID_PLANS.map(yearlySavingMonths));

  return (
    <div className="flex flex-col gap-6">
      {yearly ? (
        <div role="group" aria-label={t("choose.period")} className="inline-flex w-fit items-center gap-0.5 rounded-full bg-surface p-1 shadow-card">
          {(["month", "year"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={interval === v}
              onClick={() => setInterval(v)}
              className="inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium text-secondary transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-pressed:bg-accent aria-pressed:font-semibold aria-pressed:text-accent-foreground"
            >
              {t(v === "month" ? "choose.monthly" : "choose.yearly")}
              {v === "year" && saving > 0 ? <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", interval === "year" ? "bg-white/20" : "bg-accent-subtle text-accent-text")}>{t("choose.save", { months: saving })}</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PAID_PLANS.map((key) => {
          const plan = PLANS[key];
          const Icon = ICONS[key];
          const current = hasSubscription && currentPlan === key;
          const price = plan.priceUsd![interval];
          return (
            <li key={key} className={cn("flex flex-col rounded-card bg-surface p-6 shadow-card", current && "ring-2 ring-accent")}>
              <div className="flex items-center justify-between gap-3">
                <span className={cn("grid size-11 place-items-center", TILES[key])} style={{ borderRadius: 999 }} aria-hidden>
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                {current ? <Badge tone="accent">{t("choose.current")}</Badge> : null}
              </div>
              <h3 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-text">{t(`plans.${key}`)}</h3>
              <p className="mt-1 min-h-10 text-sm text-secondary">{t(`blurbs.${key}`)}</p>
              <p className="mt-5 flex items-baseline gap-2">
                <span className="text-[2.25rem] font-extrabold leading-none tracking-[-0.03em] text-text tabular">{usd(price)}</span>
                <span className="text-sm text-secondary">{t(interval === "month" ? "choose.perMonth" : "choose.perYear")}</span>
              </p>
              <ul className="mt-5 flex flex-col gap-2.5 text-sm text-text">
                {[t("choose.invitations", { count: plan.invitations! }), t("choose.aiBudget", { amount: usd(plan.aiBudgetUsd!) }), t("choose.features")].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-teal-text" aria-hidden strokeWidth={2.5} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                {current ? null : hasSubscription ? (
                  <Button variant="secondary" className="w-full" loading={pending === key} onClick={() => go(key, openBillingPortal)}>
                    {t("choose.change")}
                  </Button>
                ) : (
                  <Button className="w-full" loading={pending === key} onClick={() => go(key, () => startCheckout({ plan: key, interval }))}>
                    {t("choose.select", { plan: t(`plans.${key}`) })}
                    <ArrowRight className="flip-rtl" aria-hidden />
                  </Button>
                )}
              </div>
            </li>
          );
        })}

        <li className={cn("flex flex-col rounded-card bg-surface p-6 shadow-card md:col-span-2 lg:col-span-1", currentPlan === "enterprise" && "ring-2 ring-accent")}>
          <div className="flex items-center justify-between gap-3">
            <span className={cn("grid size-11 place-items-center", TILES.enterprise)} style={{ borderRadius: 999 }} aria-hidden>
              <Building2 className="size-5" strokeWidth={2} />
            </span>
            {currentPlan === "enterprise" ? <Badge tone="accent">{t("choose.current")}</Badge> : null}
          </div>
          <h3 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-text">{t("plans.enterprise")}</h3>
          <p className="mt-1 min-h-10 text-sm text-secondary">{t("blurbs.enterprise")}</p>
          <p className="mt-5 text-[2.25rem] font-extrabold leading-none tracking-[-0.03em] text-text">{t("choose.custom")}</p>
          <ul className="mt-5 flex flex-col gap-2.5 text-sm text-text">
            {[t("choose.customInvitations"), t("choose.customBudget"), t("choose.invoicing")].map((line) => (
              <li key={line} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-teal-text" aria-hidden strokeWidth={2.5} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {salesHref && currentPlan !== "enterprise" ? (
            <div className="mt-auto pt-6">
              <Button asChild variant="secondary" className="w-full">
                <a href={salesHref}>
                  <Mail aria-hidden />
                  {t("choose.contact")}
                </a>
              </Button>
            </div>
          ) : null}
        </li>
      </ul>
    </div>
  );
}
