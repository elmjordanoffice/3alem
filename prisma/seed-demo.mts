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

// More candidates so the fairness dashboard has groups large enough to show.
const DOMAIN_KEYS = ["technical", "critical-thinking", "judgment", "communication", "collaboration", "leadership", "management", "adaptability", "product-thinking"];
const MORE = ["Layla Mansour", "Yusuf Okafor", "Noor Al-Amin", "Chen Wei", "Fatima Zahra", "Lars Eriksson", "Amara Nwosu", "Tariq Hussein", "Sofia Rossi", "Kenji Sato", "Mariam Saleh", "Diego Alvarez", "Grace Mensah"];
function rng(seed: number) {
  let x = seed;
  return () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
}
for (const [i, name] of MORE.entries()) {
  const r = rng(77 + i);
  const pick = (n: number) => [...DOMAIN_KEYS].sort(() => r() - 0.5).slice(0, n);
  const strengths = pick(Math.floor(r() * 3));
  CANDIDATES.push({ name, strengths, weaknesses: pick(Math.floor(r() * 3)).filter((d) => !strengths.includes(d)), attention: Math.round((0.3 + r() * 0.6) * 10) / 10 });
}
// Voluntary answers, assigned independently of profile (no planted pattern).
const GENDER = ["woman", "man", "woman", "man", "another", "man", "woman", "man", "woman", "man", "woman", "prefer_not", "man", "woman", "man", "woman", "man", "another"];
const AGE = ["25_34", "35_44", "25_34", "45_54", "under25", "35_44", "25_34", "35_44", "55plus", "25_34", "35_44", "25_34", "45_54", "35_44", "25_34", "35_44", "under25", "25_34"];
const LANG = ["arabic", "english", "other", "english", "other", "arabic", "arabic", "english", "other", "arabic", "english", "arabic", "other", "arabic", "english", "arabic", "english", "other"];

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

// Hire: candidates with different profiles.
const { saveFairnessResponse } = await import("../src/lib/fairness");
for (const [i, c] of CANDIDATES.entries()) {
  const email = `${c.name.split(" ")[0]!.toLowerCase()}.demo@aalim.dev`;
  const existing = await db.invitation.findFirst({ where: { templateId: template.id, email }, include: { session: { select: { id: true } } } });
  let sessionId = existing?.session?.id;
  if (!existing) {
    const token = `demo-hire-${i}-${randomUUID()}`;
    await db.invitation.create({ data: { organizationId: org.id, templateId: template.id, invitedById: admin.id, email, name: c.name, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 86400_000) } });
    const session = await startSession(token, { locale: "en", accommodations: { extraTime: 1, untimed: false, largerText: false }, consent: true });
    await simulateSession(session.id, { ...c, seed: 1000 + i });
    sessionId = session.id;
  }
  if (!sessionId) continue;
  await saveFairnessResponse(sessionId, org.id, { gender: GENDER[i], ageBand: AGE[i], firstLanguage: LANG[i], disability: i % 6 === 2 ? "yes" : i % 6 === 5 ? "prefer_not" : "no" });
  // The first few were "hired" months ago: their managers recorded performance.
  if (i < 4) {
    const rating = [4, 3, 4, 2][i]!;
    await db.outcomeRating.upsert({ where: { sessionId_period: { sessionId, period: 6 } }, create: { organizationId: org.id, sessionId, ratedById: admin.id, period: 6, rating }, update: {} });
  }
  if (existing) continue;
  console.info(`hire: ${c.name} done`);
}

// Competency library: one organisation-specific skill.
const leadershipDomain = await db.competencyDomain.findFirstOrThrow({ where: { key: "leadership", organizationId: null } });
if (!(await db.competency.findFirst({ where: { organizationId: org.id, key: "org.safety-leadership" } }))) {
  await db.competency.create({
    data: {
      organizationId: org.id,
      domainId: leadershipDomain.id,
      key: "org.safety-leadership",
      order: 100,
      name: { en: "Safety leadership", ar: "القيادة في السلامة" },
      description: { en: "Makes safety part of every operational decision, especially under time pressure.", ar: "يجعل السلامة جزءًا من كل قرار تشغيلي، خاصة تحت ضغط الوقت." },
      anchors: {
        "1": { en: "Treats safety as someone else's job; accepts shortcuts when targets are at risk.", ar: "يعدّ السلامة مسؤولية غيره، ويقبل الاختصارات حين تكون الأهداف مهددة." },
        "2": { en: "Follows safety rules when reminded; raises obvious hazards but rarely follows up.", ar: "يتبع قواعد السلامة حين يُذكَّر بها، ويبلّغ عن المخاطر الواضحة لكنه نادرًا ما يتابعها." },
        "3": { en: "Builds safety checks into plans and stops work when a hazard is real, even at a cost to output.", ar: "يُدرج فحوص السلامة في الخطط ويوقف العمل حين يكون الخطر حقيقيًا، ولو على حساب الإنتاج." },
        "4": { en: "Anticipates where pressure will create risk and changes the process before incidents happen.", ar: "يتوقع أين سيُنتج الضغطُ مخاطر، ويغيّر طريقة العمل قبل وقوع الحوادث." },
        "5": { en: "Makes speaking up about safety normal across sites; others copy their practices.", ar: "يجعل الحديث عن السلامة أمرًا طبيعيًا في كل المواقع، ويقتدي الآخرون بممارساته." },
      },
    },
  });
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
// Grow: the individual demo account has a profile, a baseline, practice and a coach conversation.
{
  const { saveGrowProfile, startGrowSession, getGrowProfile } = await import("../src/lib/grow/profile");
  const { startPractice, submitPractice } = await import("../src/lib/grow/practice");
  const { askCoach } = await import("../src/lib/grow/coach");
  const { simulatedAnswer } = await import("../src/lib/demo/simulated-candidate");
  const sara = await db.user.findUniqueOrThrow({ where: { email: "candidate@aalim.dev" } });
  if (!(await getGrowProfile(sara.id))) {
    await saveGrowProfile(sara.id, { currentRole: "Operations coordinator", experienceYears: 4, goal: "Become a team lead within a year", hoursPerWeek: 2 });
    const persona = { strengths: ["judgment", "collaboration", "critical-thinking"], weaknesses: ["leadership", "management"], attention: 0.7, seed: 3101 };
    const baseline = await startGrowSession(sara.id, "en");
    await simulateSession(baseline.id, persona);
    const runs: { skillKey?: string; track?: { key: string; index: number } }[] = [
      { track: { key: "first-time-manager", index: 0 } },
      { track: { key: "first-time-manager", index: 1 } },
      { skillKey: "communication.difficult-conversations" },
      { skillKey: "judgment.trade-off-reasoning" },
    ];
    for (const [i, opts] of runs.entries()) {
      const ps = await startPractice(sara.id, "en", opts);
      const item = ps.item as { content: never; hidden: never; targets: string[] };
      await submitPractice(sara.id, "en", ps.id, simulatedAnswer(item.content, item.hidden, item.targets, { ...persona, seed: 4100 + i }));
    }
    await askCoach(sara.id, "Sara", "en", "What should I focus on this month to get closer to a team lead role?");
    console.info("grow: Sara Mansour done");
  }
}
console.info("demo data ready");
process.exit(0);
