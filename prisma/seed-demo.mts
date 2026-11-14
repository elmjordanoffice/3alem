/**
 * Demo data built by running the real assessment pipeline with simulated
 * candidates: varied Hire reports for the demo role, and a six-person team.
 *
 *   npm run db:seed:demo        (after npm run db:seed)
 */
import "dotenv/config";
process.env.JOBS_MODE = "sync";
process.env.AI_PROVIDER = "offline";

const { randomUUID } = await import("node:crypto");
const { hashPassword } = await import("better-auth/crypto");
const { systemDb: db } = await import("../src/lib/db");
const { hashToken } = await import("../src/lib/hire/tokens");
const { startSession } = await import("../src/lib/hire/session");
const { simulateSession } = await import("../src/lib/demo/simulated-candidate");
const { startTeamSession, markReportSeen } = await import("../src/lib/team");

const PASSWORD = "aalim-demo-2026";

const CANDIDATES = [
  { name: "Hana Al-Sayed", strengths: ["critical-thinking", "judgment", "technical"], weaknesses: ["communication"], attention: 0.9 },
  { name: "Mateo Fernández", strengths: ["communication", "collaboration", "leadership"], weaknesses: ["critical-thinking"], attention: 0.4 },
  { name: "Priya Raman", strengths: ["management", "judgment", "leadership"], weaknesses: [], attention: 0.7 },
  { name: "Kwame Asante", strengths: [], weaknesses: ["judgment", "management", "adaptability"], attention: 0.2 },
  { name: "Elif Demir", strengths: ["adaptability", "product-thinking", "communication"], weaknesses: ["technical"], attention: 0.6 },
];

const TEAM = [
  { name: "Rania Aziz", email: "rania@aalim.dev", strengths: ["leadership", "management"], weaknesses: ["product-thinking"], attention: 0.7 },
  { name: "Jonas Weber", email: "jonas@aalim.dev", strengths: ["technical", "critical-thinking"], weaknesses: ["communication", "leadership"], attention: 0.8 },
  { name: "Aisha Bello", email: "aisha@aalim.dev", strengths: ["communication", "collaboration"], weaknesses: ["technical"], attention: 0.5 },
  { name: "Daniel Kim", email: "daniel@aalim.dev", strengths: ["judgment", "adaptability"], weaknesses: ["management"], attention: 0.6 },
  { name: "Lucía Morales", email: "lucia@aalim.dev", strengths: ["product-thinking", "critical-thinking"], weaknesses: ["adaptability"], attention: 0.7 },
  { name: "Samir Haddad", email: "samir@aalim.dev", strengths: [], weaknesses: ["leadership", "management"], attention: 0.3 },
];

async function user(email: string, name: string) {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing;
  const u = await db.user.create({ data: { id: randomUUID(), email, name, emailVerified: true } });
  await db.account.create({ data: { id: randomUUID(), accountId: u.id, providerId: "credential", userId: u.id, password: await hashPassword(PASSWORD) } });
  return u;
}

const org = await db.organization.findUniqueOrThrow({ where: { slug: "northwind-demo" } });
const template = await db.assessmentTemplate.findFirstOrThrow({ where: { organizationId: org.id, title: "Operations Team Lead" } });
const admin = await db.user.findUniqueOrThrow({ where: { email: "orgadmin@aalim.dev" } });

// Hire: five candidates with different profiles.
for (const [i, c] of CANDIDATES.entries()) {
  const email = `${c.name.split(" ")[0]!.toLowerCase()}.demo@aalim.dev`;
  if (await db.invitation.findFirst({ where: { templateId: template.id, email } })) continue;
  const token = `demo-hire-${i}-${randomUUID()}`;
  await db.invitation.create({ data: { organizationId: org.id, templateId: template.id, invitedById: admin.id, email, name: c.name, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 86400_000) } });
  const session = await startSession(token, { locale: "en", accommodations: { extraTime: 1, untimed: false, largerText: false }, consent: true });
  await simulateSession(session.id, { ...c, seed: 1000 + i });
  console.info(`hire: ${c.name} done`);
}

// Team: six members, all consented, assessed and seen.
const manager = await db.user.findUniqueOrThrow({ where: { email: "team@aalim.dev" } });
let team = await db.team.findFirst({ where: { organizationId: org.id, name: "Regional Operations" } });
team ??= await db.team.create({ data: { organizationId: org.id, name: "Regional Operations", managerUserId: manager.id, goals: { domains: ["leadership", "communication", "judgment"], description: "Run three distribution centres through peak season and grow two future team leads." } } });
for (const [i, m] of TEAM.entries()) {
  const u = await user(m.email, m.name);
  let member = await db.teamMember.findUnique({ where: { teamId_email: { teamId: team.id, email: m.email } } });
  if (member?.status === "ASSESSED") continue;
  member ??= await db.teamMember.create({ data: { teamId: team.id, organizationId: org.id, email: m.email, userId: u.id, status: "CONSENTED", consentedAt: new Date(), shareRawAnswers: i % 2 === 0 } });
  const s = await startTeamSession(member.id, u.id, "en");
  await simulateSession(s.id, { ...m, seed: 2000 + i });
  await markReportSeen(s.id, u.id);
  console.info(`team: ${m.name} done`);
}
console.info("demo data ready");
process.exit(0);
