import "server-only";
import type { OrganizationBilling } from "@/generated/prisma/client";
import { systemDb, withTenant, type TenantContext } from "@/lib/db";
import { audit } from "@/lib/audit";
import { aiBudgetOf, allowanceOf, bannerFor, billingEnabled, countUsage, decide, trialFrom, usageWindow, type InviteDecision, type UsageWindow } from "./core";

/**
 * Billing on the server (D-066): the organisation's billing row, usage this
 * window, and the invitation gate. Reads and writes of the row from trusted
 * code use the system client; the billing page reads it as the member, through
 * row-level security.
 */

export { billingEnabled } from "./core";
export type { GateReason, InviteDecision } from "./core";

/**
 * The organisation's billing row, created on first use while billing is on:
 * the trial starts when the organisation is created, or (for organisations
 * that existed before billing was turned on) now.
 */
export async function ensureBilling(organizationId: string, start = new Date()): Promise<OrganizationBilling> {
  const existing = await systemDb.organizationBilling.findUnique({ where: { organizationId } });
  if (existing) return existing;
  try {
    const row = await systemDb.organizationBilling.create({ data: { organizationId, ...trialFrom(start) } });
    await audit({ organizationId, action: "billing.trial_started", targetType: "organization", targetId: organizationId, metadata: { trialEndsAt: row.trialEndsAt.toISOString() } });
    return row;
  } catch (e) {
    // Two requests raced to create it: the other one won.
    if ((e as { code?: string }).code === "P2002") return systemDb.organizationBilling.findUniqueOrThrow({ where: { organizationId } });
    throw e;
  }
}

/** Candidate invitations counted in a window (see countUsage in ./core for the rule). */
export async function usageIn(organizationId: string, w: UsageWindow): Promise<number> {
  const [invitations, teamMembers] = await Promise.all([
    systemDb.invitation.findMany({ where: { organizationId, createdAt: { gte: w.start, lt: w.end } }, select: { templateId: true, email: true, createdAt: true } }),
    systemDb.teamMember.findMany({ where: { organizationId, createdAt: { gte: w.start, lt: w.end } }, select: { createdAt: true } }),
  ]);
  const earlier = invitations.length
    ? await systemDb.invitation.findMany({
        where: { organizationId, createdAt: { lt: w.start }, templateId: { in: [...new Set(invitations.map((i) => i.templateId))] }, email: { in: [...new Set(invitations.map((i) => i.email))] } },
        select: { templateId: true, email: true },
      })
    : [];
  return countUsage({ invitations, earlier, teamMembers }, w);
}

/**
 * May the organisation invite `count` more people now? Called before any
 * invitation is created. Only new people count; billing off means yes.
 */
export async function canInvite(organizationId: string, count: number): Promise<InviteDecision> {
  if (!billingEnabled(organizationId)) return { allowed: true, unlimited: true };
  const row = await ensureBilling(organizationId);
  const now = new Date();
  const used = await usageIn(organizationId, usageWindow(row, now));
  return decide(row, used, count, now);
}

/** Remaining invitations for the form, or null when billing is off or the plan is unlimited. */
export async function invitationAllowance(organizationId: string): Promise<{ used: number; allowance: number; remaining: number; trial: boolean } | null> {
  if (!billingEnabled(organizationId)) return null;
  const row = await ensureBilling(organizationId);
  const allowance = allowanceOf(row);
  if (allowance === null) return null;
  const used = await usageIn(organizationId, usageWindow(row));
  return { used, allowance, remaining: Math.max(0, allowance - used), trial: row.plan === "trial" || row.status === "INCOMPLETE" };
}

export interface BillingOverview {
  row: OrganizationBilling;
  window: UsageWindow;
  used: number;
  allowance: number | null;
  decision: InviteDecision;
  banner: ReturnType<typeof bannerFor>;
}

/** Everything the billing page and the Home banner show, read as the member (row-level security). */
export async function billingOverview(ctx: TenantContext & { organizationId: string }): Promise<BillingOverview | null> {
  if (!billingEnabled(ctx.organizationId)) return null;
  await ensureBilling(ctx.organizationId);
  const row = await withTenant(ctx, (tx) => tx.organizationBilling.findUnique({ where: { organizationId: ctx.organizationId } }));
  if (!row) return null;
  const now = new Date();
  const window = usageWindow(row, now);
  const used = await usageIn(ctx.organizationId, window);
  return { row, window, used, allowance: allowanceOf(row), decision: decide(row, used, 1, now), banner: bannerFor(row, used, now) };
}

/** Start the trial for a new organisation (only while billing is on). */
export async function startTrial(organizationId: string, createdAt: Date) {
  if (billingEnabled(organizationId)) await ensureBilling(organizationId, createdAt);
}

// Shared through globalThis: the server can load this module more than once (instrumentation and routes).
const budgetCache = ((globalThis as { aalimPlanBudgets?: Map<string, { value: number | null; at: number }> }).aalimPlanBudgets ??= new Map());

/**
 * The plan's monthly AI budget in USD (null: the installation default),
 * registered with the AI budget at server start (see ./register). Cached for
 * a minute, since it's asked before every model call.
 */
export async function planAiBudgetUsd(organizationId: string): Promise<number | null> {
  if (!billingEnabled(organizationId)) return null;
  const hit = budgetCache.get(organizationId);
  if (hit && Date.now() - hit.at < 60_000) return hit.value;
  const row = await systemDb.organizationBilling.findUnique({ where: { organizationId } });
  const value = row ? aiBudgetOf(row) : null;
  budgetCache.set(organizationId, { value, at: Date.now() });
  return value;
}

/** Forget a cached AI budget after the plan changes. */
export function forgetPlanBudget(organizationId: string) {
  budgetCache.delete(organizationId);
}
