import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { serialPool } from "@/lib/db-pool";
import { PrismaClient } from "@/generated/prisma/client";
import { createClients } from "@/lib/db-core";

/**
 * Proves Postgres row-level security isolates organisations, even when the
 * application forgets a where-clause. Uses the non-owner runtime role.
 */
const ready = process.env.AALIM_TEST_DB === "ready" || Boolean(process.env.TEST_DATABASE_URL);
const systemUrl = process.env.TEST_DATABASE_URL ?? "postgresql://aalim:aalim@localhost:5432/aalim_test";
const appUrl = process.env.TEST_DATABASE_APP_URL ?? systemUrl.replace("aalim:aalim@", "aalim_app:aalim_app@");

describe.skipIf(!ready)("row-level security", () => {
  const clients = createClients({
    systemUrl,
    appUrl,
    makeClient: (url) => new PrismaClient({ adapter: new PrismaPg(serialPool(url)) }),
  });
  const { system, withTenant } = clients;
  const run = randomUUID().slice(0, 8);
  const ids = { orgA: "", orgB: "", userA: `ua-${run}`, userB: `ub-${run}`, candidate: `uc-${run}` };

  beforeAll(async () => {
    for (const id of [ids.userA, ids.userB, ids.candidate]) {
      await system.user.create({ data: { id, name: id, email: `${id}@test.aalim` } });
    }
    const a = await system.organization.create({ data: { name: "Org A", slug: `a-${run}` } });
    const b = await system.organization.create({ data: { name: "Org B", slug: `b-${run}` } });
    ids.orgA = a.id;
    ids.orgB = b.id;
    await system.membership.create({ data: { organizationId: a.id, userId: ids.userA, roles: ["ORG_ADMIN"] } });
    await system.membership.create({ data: { organizationId: b.id, userId: ids.userB, roles: ["ORG_ADMIN"] } });
    for (const [org, user] of [[a.id, ids.userA], [b.id, ids.userB]] as const) {
      await system.assessmentTemplate.create({
        data: { organizationId: org, createdById: user, title: `Role at ${org}`, jobDescription: "JD" },
      });
    }
    await system.assessmentSession.create({
      data: { organizationId: a.id, subjectUserId: ids.candidate, mode: "HIRE", engineVersion: "test" },
    });
    await system.practiceSession.create({ data: { userId: ids.candidate, competencyKeys: ["judgment.risk-calibration"], difficulty: 3, item: {} } });
  });

  afterAll(async () => {
    await system.organization.deleteMany({ where: { id: { in: [ids.orgA, ids.orgB] } } });
    await system.user.deleteMany({ where: { id: { in: [ids.userA, ids.userB, ids.candidate] } } });
    await system.$disconnect();
    if (clients.app !== system) await clients.app.$disconnect();
  });

  it("returns only the active organisation's templates, with no where-clause", async () => {
    const rows = await withTenant({ userId: ids.userA, organizationId: ids.orgA }, (tx) => tx.assessmentTemplate.findMany());
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.organizationId === ids.orgA)).toBe(true);
  });

  it("returns nothing without a tenant context", async () => {
    const rows = await withTenant({}, (tx) => tx.assessmentTemplate.findMany());
    expect(rows).toHaveLength(0);
  });

  it("blocks writes into another organisation", async () => {
    await expect(
      withTenant({ userId: ids.userA, organizationId: ids.orgA }, (tx) =>
        tx.assessmentTemplate.create({ data: { organizationId: ids.orgB, createdById: ids.userA, title: "x", jobDescription: "x" } }),
      ),
    ).rejects.toThrow();
  });

  it("cannot update another organisation's rows", async () => {
    const result = await withTenant({ userId: ids.userA, organizationId: ids.orgA }, (tx) =>
      tx.assessmentTemplate.updateMany({ where: { organizationId: ids.orgB }, data: { title: "hijacked" } }),
    );
    expect(result.count).toBe(0);
    const b = await system.assessmentTemplate.findFirst({ where: { organizationId: ids.orgB } });
    expect(b?.title).not.toBe("hijacked");
  });

  it("lets a person see their own memberships across organisations, but not others'", async () => {
    const rows = await withTenant({ userId: ids.userA }, (tx) => tx.membership.findMany());
    expect(rows.map((r) => r.userId)).toEqual([ids.userA]);
  });

  it("lets a candidate see their own session but not the org's templates", async () => {
    const sessions = await withTenant({ userId: ids.candidate }, (tx) => tx.assessmentSession.findMany());
    expect(sessions).toHaveLength(1);
    const templates = await withTenant({ userId: ids.candidate }, (tx) => tx.assessmentTemplate.findMany());
    expect(templates).toHaveLength(0);
  });

  it("keeps Grow practice private from the organisation", async () => {
    const asOrg = await withTenant({ userId: ids.userA, organizationId: ids.orgA }, (tx) => tx.practiceSession.findMany());
    expect(asOrg).toHaveLength(0);
    const asSelf = await withTenant({ userId: ids.candidate }, (tx) => tx.practiceSession.findMany());
    expect(asSelf).toHaveLength(1);
  });

  it("hides the AI call log from the runtime role", async () => {
    await system.aiCallLog.create({ data: { agent: "test", promptVersion: "v0", provider: "mock", model: "mock", latencyMs: 1, ok: true, input: {} } });
    const rows = await withTenant({ userId: ids.userA, organizationId: ids.orgA }, (tx) => tx.aiCallLog.findMany());
    expect(rows).toHaveLength(0);
    await system.aiCallLog.deleteMany({ where: { agent: "test" } });
  });

  it("keeps fairness answers and platform review data away from the app role", async () => {
    await system.fairnessResponse.create({ data: { sessionRef: `fr-${run}`, organizationId: ids.orgA, gender: "woman" } });
    await system.bankItemReview.upsert({ where: { itemKey: `test-${run}` }, create: { itemKey: `test-${run}`, status: "retired" }, update: {} });
    const seen = await withTenant({ userId: ids.userA, organizationId: ids.orgA }, async (tx) => ({
      fairness: await tx.fairnessResponse.count(),
      review: await tx.bankItemReview.count(),
    }));
    expect(seen).toEqual({ fairness: 0, review: 0 });
    await system.fairnessResponse.deleteMany({ where: { sessionRef: `fr-${run}` } });
    await system.bankItemReview.deleteMany({ where: { itemKey: `test-${run}` } });
  });

  it("isolates webhooks and outcome ratings by organisation", async () => {
    await system.webhook.create({ data: { organizationId: ids.orgB, url: "https://b.example.com", secretEncrypted: "x", events: ["report.ready"] } });
    const fromA = await withTenant({ userId: ids.userA, organizationId: ids.orgA }, (tx) => tx.webhook.count());
    const fromB = await withTenant({ userId: ids.userB, organizationId: ids.orgB }, (tx) => tx.webhook.count());
    expect(fromA).toBe(0);
    expect(fromB).toBe(1);
    await expect(
      withTenant({ userId: ids.userA, organizationId: ids.orgA }, (tx) => tx.outcomeRating.create({ data: { organizationId: ids.orgB, sessionId: "x", ratedById: ids.userA, period: 6, rating: 3 } })),
    ).rejects.toThrow();
  });

  it("keeps hiring decisions and interview scorecards inside the organisation", async () => {
    const session = await system.assessmentSession.findFirstOrThrow({ where: { organizationId: ids.orgA } });
    await system.hiringDecision.create({ data: { organizationId: ids.orgA, sessionId: session.id, outcome: "ADVANCE", reason: "Test the open questions in person.", decidedById: ids.userA } });
    await system.interviewScorecard.create({ data: { organizationId: ids.orgA, sessionId: session.id, interviewerId: ids.userA, ratings: [], recommendation: "YES", summary: "Clear ownership." } });
    const asA = await withTenant({ userId: ids.userA, organizationId: ids.orgA }, async (tx) => [await tx.hiringDecision.count(), await tx.interviewScorecard.count()]);
    const asB = await withTenant({ userId: ids.userB, organizationId: ids.orgB }, async (tx) => [await tx.hiringDecision.count(), await tx.interviewScorecard.count()]);
    expect(asA).toEqual([1, 1]);
    expect(asB).toEqual([0, 0]);
    await expect(
      withTenant({ userId: ids.userB, organizationId: ids.orgB }, (tx) => tx.hiringDecision.create({ data: { organizationId: ids.orgA, sessionId: session.id, outcome: "DECLINE", reason: "Written from another organisation.", decidedById: ids.userB } })),
    ).rejects.toThrow();
  });

  it("lets members read their organisation's billing, and nobody write it through the app role", async () => {
    const trialEndsAt = new Date(Date.now() + 14 * 86400_000);
    await system.organizationBilling.create({ data: { organizationId: ids.orgA, trialEndsAt } });
    await system.stripeEvent.create({ data: { id: `evt_${run}`, type: "invoice.paid", organizationId: ids.orgA } });
    const asA = await withTenant({ userId: ids.userA, organizationId: ids.orgA }, (tx) => tx.organizationBilling.findMany());
    const asB = await withTenant({ userId: ids.userB, organizationId: ids.orgB }, (tx) => tx.organizationBilling.findMany());
    // Even naming another organisation as active doesn't help a non-member.
    const spoofed = await withTenant({ userId: ids.userB, organizationId: ids.orgA }, (tx) => tx.organizationBilling.findMany());
    expect(asA.map((r) => r.organizationId)).toEqual([ids.orgA]);
    expect(asB).toHaveLength(0);
    expect(spoofed).toHaveLength(0);
    const upgraded = await withTenant({ userId: ids.userA, organizationId: ids.orgA }, (tx) => tx.organizationBilling.updateMany({ data: { plan: "growth", status: "ACTIVE" } }));
    expect(upgraded.count).toBe(0);
    await expect(withTenant({ userId: ids.userB, organizationId: ids.orgB }, (tx) => tx.organizationBilling.create({ data: { organizationId: ids.orgB, plan: "enterprise", trialEndsAt } }))).rejects.toThrow();
    expect(await withTenant({ userId: ids.userA, organizationId: ids.orgA }, (tx) => tx.stripeEvent.count())).toBe(0);
    await system.stripeEvent.deleteMany({ where: { id: `evt_${run}` } });
  });
});
