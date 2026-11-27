/**
 * Plans and prices (D-066). The one place to change what each plan costs and
 * includes; the billing page, the invite limits, the AI budget and the landing
 * page all read from here. Stripe holds the real prices: keep the amounts
 * below in step with the prices whose ids are in STRIPE_PRICE_*.
 *
 * Usage is counted in candidate invitations: each person counts once per
 * assessment (Hire) or team (Team mode). Re-sent and renewed links don't count
 * again, and personal Grow use is always free.
 */

export type PlanKey = "trial" | "starter" | "growth" | "enterprise";
export type PaidPlanKey = "starter" | "growth";
export type Interval = "month" | "year";

export interface PlanConfig {
  key: PlanKey;
  /** Candidate invitations a month. Null: unlimited, or set per organisation (Enterprise). */
  invitations: number | null;
  /** Monthly AI budget in USD. Null: the installation default (AI_BUDGET_ORG_MONTHLY_USD). */
  aiBudgetUsd: number | null;
  /** List prices in USD, for display. Stripe charges what the price ids say. */
  priceUsd?: { month: number; year: number };
  /** Environment variables holding the Stripe price ids. Yearly is optional. */
  priceEnv?: { month: string; year: string };
}

/** The free trial: whichever ends first, the days or the invitations. All features, no card. */
export const TRIAL = { days: 14, invitations: 5 } as const;

/** Days a failed payment may stay unpaid before new invitations stop. */
export const GRACE_DAYS = 7;

/** Admins see a banner on Home when the trial ends within this many days. */
export const TRIAL_WARNING_DAYS = 3;

export const PLANS: Record<PlanKey, PlanConfig> = {
  trial: { key: "trial", invitations: TRIAL.invitations, aiBudgetUsd: 40 },
  starter: {
    key: "starter",
    invitations: 25,
    aiBudgetUsd: 40,
    priceUsd: { month: 149, year: 1490 },
    priceEnv: { month: "STRIPE_PRICE_STARTER_MONTHLY", year: "STRIPE_PRICE_STARTER_YEARLY" },
  },
  growth: {
    key: "growth",
    invitations: 100,
    aiBudgetUsd: 150,
    priceUsd: { month: 399, year: 3990 },
    priceEnv: { month: "STRIPE_PRICE_GROWTH_MONTHLY", year: "STRIPE_PRICE_GROWTH_YEARLY" },
  },
  // Custom allowance and AI budget, set by a platform admin on the organisation's billing record.
  enterprise: { key: "enterprise", invitations: null, aiBudgetUsd: null },
};

/** Plans an admin can buy online, in display order. */
export const PAID_PLANS: readonly PaidPlanKey[] = ["starter", "growth"];

export function isPlanKey(v: unknown): v is PlanKey {
  return typeof v === "string" && Object.hasOwn(PLANS, v);
}

export function isPaidPlan(v: unknown): v is PaidPlanKey {
  return typeof v === "string" && (PAID_PLANS as readonly string[]).includes(v);
}

/** An unknown key (say, a plan since removed from this file) is treated as the trial. */
export function planConfig(key: string): PlanConfig {
  return isPlanKey(key) ? PLANS[key] : PLANS.trial;
}

/** Whole months saved by paying yearly (two, at 10× the monthly price). */
export function yearlySavingMonths(plan: PaidPlanKey): number {
  const p = PLANS[plan].priceUsd!;
  return Math.max(0, Math.round(12 - p.year / p.month));
}

/** Where sales enquiries go, or null to hide the Enterprise contact link. */
export function salesEmail(): string | null {
  const v = process.env.SALES_EMAIL?.trim();
  return v && /^\S+@\S+\.\S+$/.test(v) ? v : null;
}
