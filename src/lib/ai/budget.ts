import "server-only";
import { systemDb } from "@/lib/db";
import { audit } from "@/lib/audit";
import { sendMail } from "@/lib/mail";
import { brandedEmail } from "@/lib/mail/templates";

/**
 * Monthly AI spending caps (D-065), so a busy organisation (or a bug) can't
 * run up an unbounded model bill.
 *
 * - Each organisation has a monthly budget in USD (AI_BUDGET_ORG_MONTHLY_USD,
 *   default 100; a billing plan can set its own, see `orgBudgetUsd`).
 *   Personal Grow use shares one pool (AI_BUDGET_PERSONAL_MONTHLY_USD,
 *   default 200). An optional global ceiling covers everything
 *   (AI_BUDGET_TOTAL_MONTHLY_USD).
 * - Past the budget, new work falls back to the offline engine, which every
 *   caller already has. An assessment already scored by the model may finish
 *   on it, up to a hard stop at 125%, so one report is never half one engine
 *   and half the other.
 * - Admins of the organisation get one email at 80% and one at 100% each
 *   month (deduplicated through the audit log).
 *
 * Spend comes from ai_call_log (every call is logged with its cost), cached
 * for a minute per pool and topped up locally after each call.
 */

const HARD = 1.25;
const CACHE_MS = 60_000;

type Pool = { kind: "org"; id: string } | { kind: "personal" } | { kind: "total" };
const keyOf = (p: Pool) => (p.kind === "org" ? `org:${p.id}` : p.kind);
const cache = new Map<string, { spend: number; at: number; month: string }>();

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export function monthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
const monthKey = (now = new Date()) => monthStart(now).toISOString().slice(0, 7);

/** The organisation's monthly budget in USD. Billing plans may override the default (see src/lib/billing). */
export async function orgBudgetUsd(organizationId: string): Promise<number> {
  const fromPlan = await planBudget(organizationId);
  return fromPlan ?? num(process.env.AI_BUDGET_ORG_MONTHLY_USD, 100);
}

/** Hook for billing: a plan's AI budget, or null for the default. */
let planBudget: (organizationId: string) => Promise<number | null> = async () => null;
export function setPlanBudgetResolver(fn: (organizationId: string) => Promise<number | null>) {
  planBudget = fn;
}

async function budgetOf(p: Pool): Promise<number | null> {
  if (p.kind === "org") return orgBudgetUsd(p.id);
  if (p.kind === "personal") return num(process.env.AI_BUDGET_PERSONAL_MONTHLY_USD, 200);
  return process.env.AI_BUDGET_TOTAL_MONTHLY_USD ? num(process.env.AI_BUDGET_TOTAL_MONTHLY_USD, Infinity) : null;
}

async function spendOf(p: Pool): Promise<number> {
  const key = keyOf(p);
  const month = monthKey();
  const hit = cache.get(key);
  if (hit && hit.month === month && Date.now() - hit.at < CACHE_MS) return hit.spend;
  const where = { createdAt: { gte: monthStart() }, ...(p.kind === "org" ? { organizationId: p.id } : p.kind === "personal" ? { organizationId: null } : {}) };
  const agg = await systemDb.aiCallLog.aggregate({ where, _sum: { costUsd: true } });
  const spend = Number(agg._sum.costUsd ?? 0);
  cache.set(key, { spend, at: Date.now(), month });
  return spend;
}

export type BudgetVerdict = { allowed: true } | { allowed: false; reason: "budget"; pool: string };

/**
 * May this call go to the model? `sessionId` lets an assessment that has
 * already used the model finish on it (up to the hard stop).
 */
export async function checkBudget(ctx: { organizationId?: string | null; sessionId?: string | null }): Promise<BudgetVerdict> {
  try {
    return await verdict(ctx);
  } catch (e) {
    // If spend can't be read, don't take the model away mid-assessment; the call is still logged.
    console.error("[ai] budget check failed", e);
    return { allowed: true };
  }
}

async function verdict(ctx: { organizationId?: string | null; sessionId?: string | null }): Promise<BudgetVerdict> {
  const pools: Pool[] = [ctx.organizationId ? { kind: "org", id: ctx.organizationId } : { kind: "personal" }, { kind: "total" }];
  for (const pool of pools) {
    const budget = await budgetOf(pool);
    if (budget === null || !Number.isFinite(budget)) continue;
    const spend = await spendOf(pool);
    if (spend < budget) continue;
    if (spend < budget * HARD && ctx.sessionId && (await usedModel(ctx.sessionId))) continue;
    return { allowed: false, reason: "budget", pool: keyOf(pool) };
  }
  return { allowed: true };
}

async function usedModel(sessionId: string): Promise<boolean> {
  const hit = await systemDb.aiCallLog.findFirst({ where: { sessionId, ok: true, provider: { not: "offline" } }, select: { id: true } });
  return Boolean(hit);
}

/** After a call: add its cost to the cached spend and warn admins at 80% and 100%. */
export async function recordSpend(ctx: { organizationId?: string | null }, costUsd: number) {
  if (!costUsd) return;
  const pools: Pool[] = [ctx.organizationId ? { kind: "org", id: ctx.organizationId } : { kind: "personal" }, { kind: "total" }];
  for (const p of pools) {
    const hit = cache.get(keyOf(p));
    if (hit && hit.month === monthKey()) hit.spend += costUsd;
  }
  if (ctx.organizationId) await maybeWarn(ctx.organizationId).catch((e) => console.error("[ai] budget warning failed", e));
}

async function maybeWarn(organizationId: string) {
  const budget = await orgBudgetUsd(organizationId);
  if (!budget) return;
  const spend = await spendOf({ kind: "org", id: organizationId });
  const level = spend >= budget ? 100 : spend >= budget * 0.8 ? 80 : 0;
  if (!level) return;
  const action = `ai.budget.${level}`;
  const already = await systemDb.auditLog.findFirst({ where: { organizationId, action, createdAt: { gte: monthStart() } }, select: { id: true } });
  if (already) return;
  await audit({ organizationId, action, metadata: { spendUsd: Math.round(spend * 100) / 100, budgetUsd: budget, month: monthKey() } });
  const org = await systemDb.organization.findUnique({ where: { id: organizationId }, select: { name: true, defaultLocale: true } });
  const admins = await systemDb.membership.findMany({ where: { organizationId, roles: { has: "ORG_ADMIN" } }, select: { user: { select: { email: true, name: true } } } });
  const base = (process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const lang = org?.defaultLocale === "ar" ? "ar" : "en";
  for (const a of admins) {
    const mail = brandedEmail(level === 100 ? "budgetReached" : "budgetNear", lang, { name: a.user.name.split(" ")[0] ?? a.user.name, org: org?.name ?? "", budget: `$${budget}` }, { url: `${base}/app/org/settings`, org: org?.name });
    await sendMail({ to: a.user.email, ...mail });
  }
}

/** For tests. */
export function resetBudgetCache() {
  cache.clear();
}
