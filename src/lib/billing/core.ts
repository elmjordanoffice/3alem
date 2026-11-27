import type { BillingInterval, BillingStatus } from "@/generated/prisma/enums";
import { GRACE_DAYS, PLANS, TRIAL, TRIAL_WARNING_DAYS, isPlanKey, planConfig, type Interval, type PaidPlanKey, type PlanKey } from "./plans";

/**
 * Billing rules without I/O (D-066), so they can be tested on their own: is
 * billing on, which window usage is counted in, and whether new invitations
 * may be sent. Only new invitations are ever refused: anyone already invited
 * can start and finish, and reports, decisions, exports and data rights stay
 * available whatever the plan state.
 */

const DAY = 86_400_000;

/** The billing fields the rules need (a subset of the OrganizationBilling row). */
export interface BillingState {
  plan: string;
  status: BillingStatus;
  interval: BillingInterval | null;
  trialStartedAt: Date;
  trialEndsAt: Date;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  pastDueSince: Date | null;
  customInvitations: number | null;
  customAiBudgetUsd: number | null;
}

/**
 * Billing is on only when Stripe is configured. Off, everything is unlimited
 * (development, tests, self-hosting). Outside production, BILLING_FORCE can
 * turn it on without Stripe for listed organisation ids, or "all", so the
 * limits can be tried and tested locally.
 */
export function billingEnabled(organizationId?: string | null): boolean {
  if (process.env.STRIPE_SECRET_KEY) return true;
  if (process.env.NODE_ENV === "production") return false;
  const forced = (process.env.BILLING_FORCE ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return forced.includes("all") || (Boolean(organizationId) && forced.includes(organizationId!));
}

/** A new organisation's trial: TRIAL.days from `start`. */
export function trialFrom(start: Date) {
  return { plan: "trial" as const, status: "TRIALING" as const, trialStartedAt: start, trialEndsAt: new Date(start.getTime() + TRIAL.days * DAY) };
}

/**
 * Trial rules apply until a paid plan starts: on the trial itself, and while
 * a first payment is incomplete.
 */
export function onTrialRules(s: BillingState): boolean {
  return s.plan === "trial" || s.status === "INCOMPLETE";
}

/** Invitations a month on the current plan; null means unlimited. */
export function allowanceOf(s: BillingState): number | null {
  if (onTrialRules(s)) return TRIAL.invitations;
  if (s.plan === "enterprise") return s.customInvitations;
  return planConfig(s.plan).invitations;
}

/** The plan's monthly AI budget in USD, or null for the installation default. */
export function aiBudgetOf(s: BillingState): number | null {
  if (s.plan === "enterprise") return s.customAiBudgetUsd;
  return planConfig(s.plan).aiBudgetUsd;
}

/** `date` moved by whole calendar months (UTC), keeping the day where the month has it (31 Jan → 28 Feb). */
export function addMonthsUTC(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(date.getUTCDate(), last), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
}

export interface UsageWindow {
  start: Date;
  end: Date;
}

/**
 * The window invitations are counted in:
 * - on the trial, the trial itself;
 * - on a paid plan, the month of the billing period, anchored on the day it
 *   started (a yearly plan still allows its invitations each month, and a
 *   late renewal webhook doesn't freeze the count);
 * - otherwise (Enterprise without Stripe), the calendar month.
 */
export function usageWindow(s: BillingState, now = new Date()): UsageWindow {
  if (onTrialRules(s)) return { start: s.trialStartedAt, end: s.trialEndsAt };
  const anchor = s.currentPeriodStart;
  if (anchor && anchor <= now) {
    let k = (now.getUTCFullYear() - anchor.getUTCFullYear()) * 12 + (now.getUTCMonth() - anchor.getUTCMonth());
    if (addMonthsUTC(anchor, k) > now) k--;
    return { start: addMonthsUTC(anchor, k), end: addMonthsUTC(anchor, k + 1) };
  }
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return { start, end: addMonthsUTC(start, 1) };
}

/** One invitation row as the usage count needs it. */
export interface InvitationKey {
  templateId: string;
  email: string;
  createdAt: Date;
}

/**
 * Candidate invitations used in a window: Hire invitations whose person was
 * first invited to that assessment inside the window (a re-invite after a
 * revoke, or a renewed link, doesn't count again), plus Team-mode members
 * first invited inside it (re-inviting reuses their row).
 */
export function countUsage(input: { invitations: InvitationKey[]; earlier: Pick<InvitationKey, "templateId" | "email">[]; teamMembers: { createdAt: Date }[] }, w: UsageWindow): number {
  const key = (i: { templateId: string; email: string }) => `${i.templateId}\u0000${i.email.toLowerCase()}`;
  const seen = new Set(input.earlier.map(key));
  let n = 0;
  for (const inv of [...input.invitations].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())) {
    if (inv.createdAt < w.start || inv.createdAt >= w.end) continue;
    const k = key(inv);
    if (seen.has(k)) continue;
    seen.add(k);
    n++;
  }
  return n + input.teamMembers.filter((m) => m.createdAt >= w.start && m.createdAt < w.end).length;
}

export type GateReason = "trial_ended" | "limit_reached" | "past_due" | "canceled";

/** What an invite action returns when the plan refuses: the UI shows an upgrade message from it. */
export type BillingBlock = { ok: false; error: "billing"; reason: GateReason; remaining: number; canManage: boolean };

export type InviteDecision =
  | { allowed: true; unlimited: true }
  | { allowed: true; unlimited: false; used: number; allowance: number | null; remaining: number | null }
  | { allowed: false; reason: GateReason; used: number; allowance: number | null; remaining: number };

/** Past due beyond the grace period? A missing start date means it has only just begun. */
export function graceOver(s: BillingState, now: Date): boolean {
  return Boolean(s.pastDueSince) && now.getTime() - s.pastDueSince!.getTime() > GRACE_DAYS * DAY;
}

/** May `count` more people be invited, with `used` already this window? */
export function decide(s: BillingState, used: number, count: number, now = new Date()): InviteDecision {
  const allowance = allowanceOf(s);
  const remaining = allowance === null ? null : Math.max(0, allowance - used);
  const deny = (reason: GateReason): InviteDecision => ({ allowed: false, reason, used, allowance, remaining: remaining ?? 0 });
  const fits = allowance === null || used + count <= allowance;
  // Nobody new (only re-invites of people already counted): nothing to limit.
  if (count <= 0) return { allowed: true, unlimited: false, used, allowance, remaining };

  if (onTrialRules(s)) {
    // A first payment still pending: the trial carries on; once it's over, the payment is what's missing.
    const over = s.status === "INCOMPLETE" ? "past_due" : "trial_ended";
    if (now >= s.trialEndsAt) return deny(over);
    if (remaining === 0) return deny(over);
    if (!fits) return deny("limit_reached");
    return { allowed: true, unlimited: false, used, allowance, remaining };
  }
  if (s.status === "CANCELED") return deny("canceled");
  if (s.status === "PAST_DUE" && graceOver(s, now)) return deny("past_due");
  if (!fits) return deny("limit_reached");
  return { allowed: true, unlimited: false, used, allowance, remaining };
}

export type BannerKind = "trial_ending" | "trial_ended" | "payment_failed" | "canceled";

/** What, if anything, Home should tell an admin about billing. */
export function bannerFor(s: BillingState, used: number, now = new Date()): { kind: BannerKind; date: Date | null } | null {
  if (onTrialRules(s)) {
    if (s.status === "INCOMPLETE" && (now >= s.trialEndsAt || used >= TRIAL.invitations)) return { kind: "payment_failed", date: null };
    if (now >= s.trialEndsAt || used >= TRIAL.invitations) return { kind: "trial_ended", date: null };
    if (s.trialEndsAt.getTime() - now.getTime() <= TRIAL_WARNING_DAYS * DAY) return { kind: "trial_ending", date: s.trialEndsAt };
    return null;
  }
  if (s.status === "PAST_DUE") return { kind: "payment_failed", date: s.pastDueSince ? new Date(s.pastDueSince.getTime() + GRACE_DAYS * DAY) : null };
  if (s.status === "CANCELED") return { kind: "canceled", date: null };
  return null;
}

// ───────────── Stripe → billing row ─────────────

/** Stripe's subscription statuses, reduced to ours. */
export function mapStripeStatus(status: string): BillingStatus {
  switch (status) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
    case "paused":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    default:
      // incomplete, incomplete_expired and anything new: no paid plan yet, so the trial rules apply.
      return "INCOMPLETE";
  }
}

/** The shape of a Stripe subscription the reducer reads (a subset of Stripe.Subscription). */
export interface SubscriptionLike {
  id: string;
  status: string;
  customer: string | { id: string };
  cancel_at_period_end: boolean;
  cancel_at: number | null;
  metadata: Record<string, string> | null;
  items: { data: { price: { id: string; recurring: { interval: string } | null; metadata?: Record<string, string> | null }; current_period_start: number; current_period_end: number }[] };
}

/** Stripe price ids from the environment, mapped to plan and interval. */
export function priceTable(env: Record<string, string | undefined> = process.env): Map<string, { plan: PaidPlanKey; interval: Interval }> {
  const map = new Map<string, { plan: PaidPlanKey; interval: Interval }>();
  for (const plan of ["starter", "growth"] as const) {
    const e = PLANS[plan].priceEnv!;
    if (env[e.month]) map.set(env[e.month]!, { plan, interval: "month" });
    if (env[e.year]) map.set(env[e.year]!, { plan, interval: "year" });
  }
  return map;
}

export type BillingPatch = Partial<Omit<BillingState, "trialStartedAt" | "trialEndsAt">> & {
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string;
  stripePriceId?: string | null;
};

/**
 * The billing row after a subscription changed. The plan comes from the price
 * id (STRIPE_PRICE_*), else from `plan` metadata on the price or subscription
 * (useful for custom Enterprise prices), else stays as it was.
 */
export function reduceSubscription(current: Pick<BillingState, "plan" | "pastDueSince"> | null, sub: SubscriptionLike, now = new Date(), prices = priceTable()): BillingPatch {
  const item = sub.items.data.find((i) => prices.has(i.price.id)) ?? sub.items.data[0];
  const known = item ? prices.get(item.price.id) : undefined;
  const tagged = [item?.price.metadata?.plan, sub.metadata?.plan].find((p) => isPlanKey(p) && p !== "trial") as PlanKey | undefined;
  const status = mapStripeStatus(sub.status);
  const expired = sub.status === "incomplete_expired";
  const interval = known?.interval ?? (item?.price.recurring?.interval === "year" ? "year" : item ? "month" : null);
  return {
    plan: known?.plan ?? tagged ?? current?.plan ?? "trial",
    status,
    interval: interval === "year" ? "YEAR" : interval === "month" ? "MONTH" : null,
    // An abandoned first payment leaves no subscription behind.
    stripeSubscriptionId: expired ? null : sub.id,
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripePriceId: item?.price.id ?? null,
    currentPeriodStart: item ? new Date(item.current_period_start * 1000) : null,
    currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
    cancelAtPeriodEnd: status !== "CANCELED" && (sub.cancel_at_period_end || sub.cancel_at !== null),
    pastDueSince: status === "PAST_DUE" ? (current?.pastDueSince ?? now) : null,
  };
}
