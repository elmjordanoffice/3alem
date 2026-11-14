/**
 * Seeds the built-in competency framework and, outside production, a demo
 * organisation with one person per role. Idempotent: safe to run repeatedly.
 *
 *   npm run db:seed
 *
 * Demo sign-ins (password for all: "aalim-demo-2026"):
 *   admin@aalim.dev       platform admin
 *   orgadmin@aalim.dev    organisation admin + recruiter
 *   recruiter@aalim.dev   recruiter
 *   manager@aalim.dev     hiring manager
 *   team@aalim.dev        team manager
 *   candidate@aalim.dev   candidate / individual (no organisation)
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import type { OrgRole } from "../src/generated/prisma/enums";
import { DOMAINS } from "../src/lib/framework/data";
import { offlineAnalysis } from "../src/lib/hire/jd";
import { initialSkillWeights } from "../src/lib/hire/templates";
import { hashToken } from "../src/lib/hire/tokens";

/** Fixed demo token, so the candidate flow can be opened at /a/demo-candidate-token-0001 in development. */
export const DEMO_TOKEN = "demo-candidate-token-0001";

const DEMO_JD = `Operations Team Lead

Northwind is looking for an Operations Team Lead to run a team of six coordinators across our regional warehouse and delivery network.

You will plan daily and weekly operations, set priorities when demand spikes, and keep service levels and costs on track. You will coach your team, handle escalations from key clients, and work with sales, finance and engineering to fix recurring problems at the root.

What you bring
- 4+ years in operations, logistics or supply chain, including leading a team
- Comfortable with data: reading dashboards, spotting anomalies, building a case for change
- Clear, calm communication with clients and senior stakeholders
- Good judgment under pressure, and the courage to raise risks early`;

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

export const DEMO_PASSWORD = "aalim-demo-2026";

async function seedFramework() {
  for (const d of DOMAINS) {
    // Built-in rows have organizationId = null; Prisma compound uniques can't
    // match on null, so look up by key first.
    const existing = await db.competencyDomain.findFirst({ where: { organizationId: null, key: d.key } });
    const data = {
      order: d.order,
      name: d.name,
      description: d.description,
      highLevel: d.highLevel,
      generatedFromJobDescription: d.generatedFromJobDescription ?? false,
    };
    const domain = existing
      ? await db.competencyDomain.update({ where: { id: existing.id }, data })
      : await db.competencyDomain.create({ data: { ...data, key: d.key } });

    for (const [index, s] of d.subSkills.entries()) {
      const found = await db.competency.findFirst({ where: { organizationId: null, key: s.key } });
      const cdata = { domainId: domain.id, order: index + 1, name: s.name, description: s.description, anchors: s.anchors };
      if (found) await db.competency.update({ where: { id: found.id }, data: cdata });
      else await db.competency.create({ data: { ...cdata, key: s.key } });
    }
  }
  const count = await db.competency.count({ where: { organizationId: null } });
  console.info(`framework: ${DOMAINS.length} domains, ${count} sub-skills`);
}

async function upsertUser(email: string, name: string, opts: { isPlatformAdmin?: boolean } = {}) {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing;
  const user = await db.user.create({
    data: { id: randomUUID(), email, name, emailVerified: true, isPlatformAdmin: opts.isPlatformAdmin ?? false },
  });
  await db.account.create({
    data: {
      id: randomUUID(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: await hashPassword(DEMO_PASSWORD),
    },
  });
  return user;
}

async function seedDemo() {
  const org =
    (await db.organization.findUnique({ where: { slug: "northwind-demo" } })) ??
    (await db.organization.create({ data: { name: "Northwind Logistics", slug: "northwind-demo" } }));

  const people: { email: string; name: string; roles: OrgRole[] | null; admin?: boolean }[] = [
    { email: "admin@aalim.dev", name: "Noor Al-Rashid", roles: null, admin: true },
    { email: "orgadmin@aalim.dev", name: "Amara Okafor", roles: ["ORG_ADMIN", "RECRUITER"] },
    { email: "recruiter@aalim.dev", name: "Tomás Reyes", roles: ["RECRUITER"] },
    { email: "manager@aalim.dev", name: "Yuki Tanaka", roles: ["HIRING_MANAGER"] },
    { email: "team@aalim.dev", name: "Omondi Maina", roles: ["TEAM_MANAGER"] },
    { email: "candidate@aalim.dev", name: "Sara Mansour", roles: null },
  ];

  for (const p of people) {
    const user = await upsertUser(p.email, p.name, { isPlatformAdmin: p.admin });
    if (p.roles) {
      await db.membership.upsert({
        where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
        create: { organizationId: org.id, userId: user.id, roles: p.roles },
        update: { roles: p.roles },
      });
    }
  }
  console.info(`demo: organisation "${org.name}" with ${people.length} people (password: ${DEMO_PASSWORD})`);

  // A published demo role with one candidate invitation.
  const orgAdmin = await db.user.findUniqueOrThrow({ where: { email: "orgadmin@aalim.dev" } });
  let template = await db.assessmentTemplate.findFirst({ where: { organizationId: org.id, title: "Operations Team Lead" } });
  if (!template) {
    const { analysis, technicalSkills } = offlineAnalysis(DEMO_JD);
    template = await db.assessmentTemplate.create({
      data: {
        organizationId: org.id,
        createdById: orgAdmin.id,
        title: "Operations Team Lead",
        jobDescription: DEMO_JD,
        analysis: analysis as object,
        technicalSkillMap: technicalSkills as object,
        language: "en",
        durationMinutes: 50,
        accommodations: { extraTimeAllowed: true, untimedAllowed: true, largerTextAllowed: true },
        status: "PUBLISHED",
        publishedAt: new Date(),
        skillWeights: { create: initialSkillWeights(analysis, technicalSkills).map((w) => ({ ...w, organizationId: org.id })) },
      },
    });
  }
  const tokenHash = hashToken(DEMO_TOKEN);
  if (!(await db.invitation.findUnique({ where: { tokenHash } }))) {
    await db.invitation.create({
      data: {
        organizationId: org.id,
        templateId: template.id,
        invitedById: orgAdmin.id,
        email: "candidate@aalim.dev",
        name: "Sara Mansour",
        tokenHash,
        expiresAt: new Date(Date.now() + 365 * 86400_000),
      },
    });
  }
  console.info(`demo: role "${template.title}", candidate link /a/${DEMO_TOKEN}`);
}

async function main() {
  await seedFramework();
  if (process.env.NODE_ENV !== "production" && process.env.SEED_DEMO !== "false") await seedDemo();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
