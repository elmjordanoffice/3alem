import { beforeEach, describe, expect, it, vi } from "vitest";

// The budget reads spend from ai_call_log; here the log is a list we control.
const calls: { organizationId: string | null; sessionId: string | null; costUsd: number; ok: boolean; provider: string; createdAt: Date }[] = [];
const audits: { organizationId: string; action: string; createdAt: Date }[] = [];
const sent: { to: string; subject: string }[] = [];

vi.mock("@/lib/db", () => ({
  systemDb: {
    aiCallLog: {
      aggregate: async ({ where }: { where: { organizationId?: string | null; createdAt: { gte: Date } } }) => ({
        _sum: { costUsd: calls.filter((c) => c.createdAt >= where.createdAt.gte && (!("organizationId" in where) || c.organizationId === where.organizationId)).reduce((a, c) => a + c.costUsd, 0) },
      }),
      findFirst: async ({ where }: { where: { sessionId: string } }) => calls.find((c) => c.sessionId === where.sessionId && c.ok && c.provider !== "offline") ?? null,
    },
    auditLog: { findFirst: async ({ where }: { where: { organizationId: string; action: string } }) => audits.find((a) => a.organizationId === where.organizationId && a.action === where.action) ?? null },
    organization: { findUnique: async () => ({ name: "Northwind", defaultLocale: "en" }) },
    membership: { findMany: async () => [{ user: { email: "admin@northwind.test", name: "Amara Okafor" } }] },
  },
}));
vi.mock("@/lib/audit", () => ({ audit: async (e: { organizationId: string; action: string }) => void audits.push({ ...e, createdAt: new Date() }) }));
vi.mock("@/lib/mail", () => ({ sendMail: async (m: { to: string; subject: string }) => void sent.push(m) }));

const { checkBudget, recordSpend, resetBudgetCache } = await import("@/lib/ai/budget");

const spend = (organizationId: string | null, costUsd: number, sessionId: string | null = null) =>
  calls.push({ organizationId, sessionId, costUsd, ok: true, provider: "anthropic", createdAt: new Date() });

describe("monthly AI budget", () => {
  beforeEach(() => {
    calls.length = 0;
    audits.length = 0;
    sent.length = 0;
    resetBudgetCache();
    process.env.AI_BUDGET_ORG_MONTHLY_USD = "10";
    process.env.AI_BUDGET_PERSONAL_MONTHLY_USD = "5";
    delete process.env.AI_BUDGET_TOTAL_MONTHLY_USD;
  });

  it("allows calls under the budget and stops new work past it", async () => {
    spend("org1", 9);
    expect(await checkBudget({ organizationId: "org1" })).toEqual({ allowed: true });
    resetBudgetCache();
    spend("org1", 2);
    expect(await checkBudget({ organizationId: "org1" })).toMatchObject({ allowed: false, pool: "org:org1" });
    // Another organisation is unaffected.
    expect(await checkBudget({ organizationId: "org2" })).toEqual({ allowed: true });
  });

  it("lets an assessment already on the model finish, up to the hard stop", async () => {
    spend("org1", 10.5, "s1");
    expect(await checkBudget({ organizationId: "org1", sessionId: "s1" })).toEqual({ allowed: true });
    expect(await checkBudget({ organizationId: "org1", sessionId: "s2" })).toMatchObject({ allowed: false });
    resetBudgetCache();
    spend("org1", 2.5, "s1"); // 13 > 12.5
    expect(await checkBudget({ organizationId: "org1", sessionId: "s1" })).toMatchObject({ allowed: false });
  });

  it("gives personal Grow use its own pool, and honours a global ceiling", async () => {
    spend(null, 6);
    expect(await checkBudget({})).toMatchObject({ allowed: false, pool: "personal" });
    expect(await checkBudget({ organizationId: "org1" })).toEqual({ allowed: true });
    process.env.AI_BUDGET_TOTAL_MONTHLY_USD = "6";
    resetBudgetCache();
    expect(await checkBudget({ organizationId: "org1" })).toMatchObject({ allowed: false, pool: "total" });
  });

  it("emails admins once at 80% and once at 100%", async () => {
    spend("org1", 8.5);
    await recordSpend({ organizationId: "org1" }, 0.01);
    await recordSpend({ organizationId: "org1" }, 0.01);
    expect(sent.map((m) => m.subject)).toEqual(["Northwind has used 80% of this month's AI budget"]);
    resetBudgetCache();
    spend("org1", 2);
    await recordSpend({ organizationId: "org1" }, 0.01);
    expect(sent.at(-1)?.subject).toBe("Northwind has reached this month's AI budget");
    expect(audits.map((a) => a.action)).toEqual(["ai.budget.80", "ai.budget.100"]);
  });
});
