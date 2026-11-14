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
