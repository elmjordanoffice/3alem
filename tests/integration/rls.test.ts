import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
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
    makeClient: (url) => new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) }),
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
});
