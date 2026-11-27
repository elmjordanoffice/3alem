import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";

/**
 * Deletion paths and AI log retention, against the test database (aalim_test):
 * nothing about a person or an organisation may outlive their deletion, and
 * the text of AI requests is cleared after the retention window.
 */
const ready = process.env.AALIM_TEST_DB === "ready" || Boolean(process.env.TEST_DATABASE_URL);
const systemUrl = process.env.TEST_DATABASE_URL ?? "postgresql://aalim:aalim@localhost:5432/aalim_test";
// The library reads its connection from the environment when first imported.
process.env.DATABASE_URL = systemUrl;
process.env.DATABASE_APP_URL = process.env.TEST_DATABASE_APP_URL ?? systemUrl.replace("aalim:aalim@", "aalim_app:aalim_app@");

describe.skipIf(!ready)("deletion and AI log retention", async () => {
  const { systemDb } = await import("@/lib/db");
  const { deleteOrganizationData, deleteUserData, coachLogKey } = await import("@/lib/privacy");
  const { trimAiLogs } = await import("@/lib/retention");
  const { recordFeedback } = await import("@/lib/hire/session");

  const run = randomUUID().slice(0, 8);
  const ids = { admin: `adm-${run}`, person: `per-${run}`, org: "", other: "", session: "", practice: "" };
  const log = (data: { organizationId?: string | null; sessionId?: string | null; createdAt?: Date; agent?: string }) =>
    systemDb.aiCallLog.create({
      data: { agent: data.agent ?? "test", promptVersion: "1", provider: "anthropic", model: "test", latencyMs: 1, ok: true, input: { text: "their words" }, output: { ok: true }, organizationId: data.organizationId ?? null, sessionId: data.sessionId ?? null, ...(data.createdAt ? { createdAt: data.createdAt } : {}) },
    });

  beforeAll(async () => {
    for (const id of [ids.admin, ids.person]) await systemDb.user.create({ data: { id, name: id, email: `${id}@test.aalim` } });
    ids.org = (await systemDb.organization.create({ data: { name: "Doomed", slug: `doomed-${run}` } })).id;
    ids.other = (await systemDb.organization.create({ data: { name: "Other", slug: `other-${run}` } })).id;
    await systemDb.membership.create({ data: { organizationId: ids.org, userId: ids.admin, roles: ["ORG_ADMIN"] } });
    ids.session = (await systemDb.assessmentSession.create({ data: { organizationId: ids.org, subjectUserId: ids.person, mode: "HIRE", engineVersion: "test" } })).id;
    ids.practice = (await systemDb.practiceSession.create({ data: { userId: ids.person, competencyKeys: ["judgment.risk-calibration"], difficulty: 3, item: {} } })).id;
  });

  afterAll(async () => {
    await systemDb.aiCallLog.deleteMany({ where: { agent: { startsWith: `t-${run}` } } });
    await systemDb.organization.deleteMany({ where: { id: { in: [ids.org, ids.other] } } });
    await systemDb.user.deleteMany({ where: { id: { in: [ids.admin, ids.person] } } });
    await systemDb.$disconnect();
  });

  it("runs against the test database, never development data", async () => {
    const rows = await systemDb.$queryRaw<{ db: string }[]>`SELECT current_database() AS db`;
    expect(rows[0]?.db).toBe(new URL(systemUrl).pathname.slice(1));
  });

  it("keeps candidate feedback anonymous: no organisation, session or person on the record", async () => {
    await recordFeedback(ids.session, { rating: 4, comment: `fine ${run}` });
    const rows = await systemDb.auditLog.findMany({ where: { action: "assessment.feedback", createdAt: { gte: new Date(Date.now() - 60_000) } } });
    const mine = rows.find((r) => JSON.stringify(r.metadata).includes(run))!;
    expect(mine).toMatchObject({ organizationId: null, actorUserId: null, targetId: null });
    expect(JSON.stringify(mine.metadata)).not.toContain(ids.session);
    await systemDb.auditLog.delete({ where: { id: mine.id } });
  });

  it("deletes an organisation with its assessments, AI logs and audit log, and leaves members' accounts", async () => {
    const byOrg = await log({ organizationId: ids.org, agent: `t-${run}-jd` });
    const bySession = await log({ sessionId: ids.session, agent: `t-${run}-score` });
    const elsewhere = await log({ organizationId: ids.other, agent: `t-${run}-elsewhere` });
    await systemDb.auditLog.create({ data: { organizationId: ids.org, action: "test.event" } });

    await deleteOrganizationData(ids.org, ids.admin);

    expect(await systemDb.organization.findUnique({ where: { id: ids.org } })).toBeNull();
    expect(await systemDb.assessmentSession.findUnique({ where: { id: ids.session } })).toBeNull();
    expect(await systemDb.aiCallLog.count({ where: { id: { in: [byOrg.id, bySession.id] } } })).toBe(0);
    expect(await systemDb.aiCallLog.count({ where: { id: elsewhere.id } })).toBe(1);
    expect(await systemDb.auditLog.count({ where: { organizationId: ids.org } })).toBe(0);
    expect(await systemDb.user.findUnique({ where: { id: ids.admin } })).not.toBeNull();
    expect(await systemDb.auditLog.count({ where: { action: "organization.deleted", targetId: ids.org } })).toBe(1);
    await systemDb.auditLog.deleteMany({ where: { action: "organization.deleted", targetId: ids.org } });
  });

  it("deletes a person's Grow practice and coach AI logs with their account", async () => {
    const practice = await log({ sessionId: ids.practice, agent: `t-${run}-practice` });
    const coach = await log({ sessionId: coachLogKey(ids.person), agent: `t-${run}-coach` });
    await deleteUserData(ids.person);
    expect(await systemDb.aiCallLog.count({ where: { id: { in: [practice.id, coach.id] } } })).toBe(0);
    expect(await systemDb.user.findUnique({ where: { id: ids.person } })).toBeNull();
  });

  it("clears the text of AI logs after 30 days and deletes rows after 13 months", async () => {
    const day = 24 * 60 * 60 * 1000;
    const now = new Date();
    const fresh = await log({ agent: `t-${run}-fresh`, createdAt: new Date(now.getTime() - 5 * day) });
    const old = await log({ agent: `t-${run}-old`, createdAt: new Date(now.getTime() - 40 * day) });
    const ancient = await log({ agent: `t-${run}-ancient`, createdAt: new Date(now.getTime() - 420 * day) });
    await trimAiLogs(now);
    const rows = await systemDb.aiCallLog.findMany({ where: { id: { in: [fresh.id, old.id, ancient.id] } } });
    expect(rows.find((r) => r.id === fresh.id)?.input).toEqual({ text: "their words" });
    expect(rows.find((r) => r.id === old.id)).toMatchObject({ input: { cleared: true }, output: null });
    expect(rows.find((r) => r.id === ancient.id)).toBeUndefined();
  });
});
