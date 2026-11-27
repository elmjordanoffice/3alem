import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { CreditCard, Gauge, Sprout, Users } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { billingOverview } from "@/lib/billing";
import { graceOver } from "@/lib/billing/core";
import { GRACE_DAYS, TRIAL, isPlanKey, salesEmail } from "@/lib/billing/plans";
import { stripe, stripeConfigured, yearlyAvailable } from "@/lib/billing/stripe";
import { applyCheckoutSession } from "@/lib/billing/webhook";
import { orgBudgetUsd, orgSpendUsd } from "@/lib/ai/budget";
import { formatUsd } from "@/lib/billing/money";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { PlanPicker, PortalButton } from "@/components/billing/plan-picker";
import { UsageRing } from "@/components/billing/usage-ring";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("billing");
  return { title: t("title") };
}

const DAY = 86_400_000;

/**
 * Billing (D-066): the plan as the page's raised card with invitations used
 * this period, the AI budget this month, and the plans. Org admins only.
 * With billing off, it says so and nothing else.
 */
export default async function BillingPage({ searchParams }: { searchParams: Promise<{ checkout?: string; session_id?: string }> }) {
  const viewer = await requirePermission("billing.manage");
  const t = await getTranslations("billing");
  const org = viewer.activeOrganization;
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  const nu = viewer.user.numerals === "arab" ? "arab" : "latn";
  const sp = await searchParams;

  // Back from Checkout: apply the subscription now rather than wait for the webhook.
  let synced = false;
  if (sp.checkout === "success" && sp.session_id?.startsWith("cs_") && stripeConfigured()) {
    try {
      const session = await stripe().checkout.sessions.retrieve(sp.session_id);
      synced = Boolean(await applyCheckoutSession(session, {}, { expectOrganizationId: org.id }));
    } catch (e) {
      console.error("[billing] checkout sync failed", e);
    }
  }

  const overview = await billingOverview({ userId: viewer.user.id, organizationId: org.id });
  if (!overview) {
    return (
      <PageContainer className="max-w-3xl">
        <PageHeader title={t("title")} description={t("description")} />
        <EmptyState icon={CreditCard} title={t("off.title")} description={t("off.body")} />
      </PageContainer>
    );
  }

  const { row, window, used, allowance } = overview;
  const now = new Date();
  const tag = `${locale === "ar" ? "ar" : "en-GB"}-u-nu-${nu}`;
  const date = (d: Date) => new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
  const usd = (v: number, cents = false) => formatUsd(v, locale, nu, cents);
  const plan = isPlanKey(row.plan) ? row.plan : "trial";
  const trialRules = plan === "trial" || row.status === "INCOMPLETE";
  const trialOver = trialRules && (now >= row.trialEndsAt || used >= TRIAL.invitations);
  const hasSubscription = Boolean(row.stripeSubscriptionId) && row.status !== "CANCELED";

  const statusLine =
    row.status === "INCOMPLETE"
      ? t("current.incomplete")
      : plan === "trial"
        ? trialOver
          ? t("current.trialEnded")
          : t("current.trialEnds", { date: date(row.trialEndsAt), count: TRIAL.invitations })
        : row.status === "CANCELED"
          ? t("current.ended")
          : row.status === "PAST_DUE"
            ? graceOver(row, now)
              ? t("current.pastDueOver")
              : t("current.pastDue", { date: date(new Date((row.pastDueSince ?? now).getTime() + GRACE_DAYS * DAY)) })
            : row.cancelAtPeriodEnd && row.currentPeriodEnd
              ? t("current.endsOn", { date: date(row.currentPeriodEnd) })
              : plan === "enterprise" && !row.stripeSubscriptionId
                ? t("current.enterprise")
                : row.currentPeriodEnd
                  ? t("current.renews", { date: date(row.currentPeriodEnd) })
                  : null;

  const [spend, budget] = await Promise.all([orgSpendUsd(org.id), orgBudgetUsd(org.id)]);
  const spendFrac = budget > 0 ? Math.min(1, spend / budget) : 0;
  const sales = salesEmail();
  const salesHref = sales ? `mailto:${sales}?subject=${encodeURIComponent(t("choose.contactSubject", { org: org.name }))}` : null;
  const remaining = allowance === null ? null : Math.max(0, allowance - used);

  return (
    <PageContainer className="max-w-6xl">
      <PageHeader title={t("title")} description={t("description")} />

      {sp.checkout === "success" ? (
        <Alert tone="success" className="mb-6">
          {synced && (row.status === "ACTIVE" || row.status === "TRIALING") && plan !== "trial" ? t("checkout.success") : t("checkout.pending")}
        </Alert>
      ) : sp.checkout === "canceled" ? (
        <Alert tone="neutral" className="mb-6">
          {t("checkout.canceled")}
        </Alert>
      ) : null}

      {/* The plan: the page's one raised card. */}
      <section aria-labelledby="plan-h" className="hero-card rounded-card p-6 sm:p-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs text-hero-foreground">{t("current.eyebrow")}</p>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#3a2bb0]">
                <span className="size-1.5 rounded-full bg-current" aria-hidden />
                {t(`status.${row.status}`)}
              </p>
            </div>
            <h2 id="plan-h" className="mt-4 text-[2.25rem] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[2.75rem]">{t(`plans.${plan}`)}</h2>
            {statusLine ? <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-hero-secondary">{statusLine}</p> : null}
            {row.interval && !trialRules && row.status !== "CANCELED" ? <p className="mt-1 text-sm text-hero-secondary">{t(row.interval === "YEAR" ? "current.yearly" : "current.monthly")}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {trialRules || row.status === "CANCELED" ? (
                <Button asChild variant="signal" className="rounded-full px-5">
                  <a href="#plans">{t("current.choose")}</a>
                </Button>
              ) : null}
              {row.stripeCustomerId ? <PortalButton label={t("current.manage")} variant="ghost" className="rounded-full bg-white/12 px-5 text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.3)] hover:bg-white/20 hover:text-white" /> : null}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 self-center sm:pe-2">
            <UsageRing used={used} allowance={allowance} />
            <p className="text-xs font-medium text-hero-foreground">{t(trialRules ? "usage.trialTitle" : "usage.title")}</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Card>
          <CardContent className="flex h-full flex-col">
            <div className="flex items-center gap-3">
              <span className="tile-blue grid size-10 place-items-center" style={{ borderRadius: 999 }} aria-hidden>
                <Users className="size-[18px]" strokeWidth={2} />
              </span>
              <h2 className="text-[17px] font-bold tracking-[-0.01em] text-text">{t(trialRules ? "usage.trialTitle" : "usage.title")}</h2>
            </div>
            <p className="mt-4 text-sm text-secondary tabular">{t("usage.period", { start: date(window.start), end: date(new Date(window.end.getTime() - 1)) })}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-text">
              {remaining === null ? t("usage.unlimited") : t("usage.left", { remaining })}
            </p>
            <p className="mt-auto pt-4 text-sm leading-relaxed text-secondary">{t("usage.rule")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex h-full flex-col">
            <div className="flex items-center gap-3">
              <span className="tile-teal grid size-10 place-items-center" style={{ borderRadius: 999 }} aria-hidden>
                <Gauge className="size-[18px]" strokeWidth={2} />
              </span>
              <h2 className="text-[17px] font-bold tracking-[-0.01em] text-text">{t("ai.title")}</h2>
            </div>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-[-0.02em] text-text tabular">{usd(spend, true)}</span>
              <span className="text-sm text-secondary">{t("ai.of", { budget: usd(budget) })}</span>
            </p>
            <div
              role="meter"
              aria-label={t("ai.label", { spent: usd(spend, true), budget: usd(budget) })}
              aria-valuemin={0}
              aria-valuemax={budget}
              aria-valuenow={Math.round(Math.min(spend, budget) * 100) / 100}
              aria-valuetext={t("ai.label", { spent: usd(spend, true), budget: usd(budget) })}
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-level-empty"
            >
              <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--teal),var(--chart-1))] shadow-[0_0_10px_var(--teal)] rtl:bg-[linear-gradient(270deg,var(--teal),var(--chart-1))]" style={{ width: `${Math.max(spendFrac * 100, spend > 0 ? 2 : 0)}%` }} />
            </div>
            <p className="mt-auto pt-4 text-sm leading-relaxed text-secondary">{t("ai.body")}</p>
          </CardContent>
        </Card>
      </div>

      <section id="plans" aria-labelledby="plans-h" className="mt-12 scroll-mt-24">
        <div className="mb-6 flex flex-col gap-2">
          <h2 id="plans-h" className="text-xl font-extrabold tracking-[-0.02em] text-text">{t("choose.title")}</h2>
          <p className="max-w-2xl text-[15px] leading-relaxed text-secondary">{t("choose.description")}</p>
        </div>
        <PlanPicker yearly={yearlyAvailable()} currentPlan={hasSubscription || plan === "enterprise" ? plan : null} currentInterval={row.interval === "YEAR" ? "year" : row.interval === "MONTH" ? "month" : null} hasSubscription={hasSubscription} salesHref={salesHref} />
        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-tertiary">
          <span>{process.env.STRIPE_AUTOMATIC_TAX === "on" ? t("choose.tax") : t("choose.noTax")}</span>
          <span className="inline-flex items-center gap-1.5">
            <Sprout className="size-3.5" aria-hidden />
            {t("choose.growFree")}
          </span>
        </p>
      </section>
    </PageContainer>
  );
}
