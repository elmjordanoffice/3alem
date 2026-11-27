import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { itemContentSchema, itemHiddenSchema, type ItemContent, type ItemHidden, type ItemType } from "@/lib/assessment/item-schema";
import { responseContentSchema, responseText, candidateWords } from "@/lib/assessment/response-schema";
import { withTenant } from "@/lib/db";
import { DOMAINS } from "@/lib/framework/data";
import { ITEM_TYPES } from "@/lib/assessment/item-schema";
import { TYPE_AFFINITY, dialsFor, estimateSkill, type CandidateModel } from "@/lib/engine";
import { resolveBankItem, bankContent, fillTokens } from "@/lib/itembank/resolve";
import { curatedWorld } from "@/lib/hire/world";
import { prepareItem } from "@/lib/hire/items";
import { offlineScore } from "@/lib/ai/offline/scorer";
import { containsAny, sentenceWith } from "@/lib/ai/offline/text";
import { practiceFeedback, type PracticeFeedback } from "@/lib/ai/prompts/practice-feedback";
import { anchorsFor } from "@/lib/ai/prompts/shared";
import { getProvider, runAgent } from "@/lib/ai/run";
import { trackByKey } from "./tracks";
import { getGrowProfile, growContext } from "./profile";
import { ROLE_FAMILIES } from "@/lib/framework/role-families";
import { coachingFor, type Coaching } from "./coaching";

export interface PracticeItem {
  content: ItemContent;
  hidden: ItemHidden;
  type: ItemType;
  difficulty: number;
  targets: string[];
  source: string;
  /** Set when this is a "try again with a twist" round. */
  twistOf?: string;
  /** Set when this is a second go at the same scenario, with what the first attempt showed. */
  retryOf?: string;
  previous?: { scores: { competencyKey: string; level: number }[]; tips: string[] };
  track?: { key: string; index: number };
  /** The daily 2-minute rep: one quick decision. */
  quick?: boolean;
  /** Why this scenario, for this person: their industry, the role they're aiming for, the roadmap step it serves. */
  why?: { industry: string | null; role: string; skillKey: string; goal: string; step: number | null; steps: number };
}

export interface StoredFeedback extends PracticeFeedback {
  mode: "anthropic" | "offline";
  /** Habit tips and what the next level looks like (added in both modes). */
  coaching?: Coaching;
}

function domainOf(key: string) {
  return key.split(".")[0]!;
}

/** The roadmap: the plan's skills from the person's latest Grow report, most important first. */
async function roadmapSkills(userId: string): Promise<string[]> {
  const r = await withTenant({ userId }, (tx) => tx.report.findFirst({ where: { subjectUserId: userId, kind: "GROW", status: "READY" }, orderBy: { createdAt: "desc" }, select: { content: true } }));
  return ((r?.content as { narrative?: { plan?: { skillKey: string }[] } } | null)?.narrative?.plan ?? []).map((p) => p.skillKey);
}

/** Before a roadmap exists: a skill the goal's role needs most that the CV doesn't show yet. */
function gapSkill(family: string | undefined, shows: string[]): string | null {
  const f = ROLE_FAMILIES.find((x) => x.key === family);
  if (!f) return null;
  const domain = Object.entries(f.domainWeights)
    .filter(([d]) => d !== "technical" && !shows.includes(d))
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  return DOMAINS.find((d) => d.key === domain)?.subSkills[0]?.key ?? null;
}

/** The person's latest assessed level for a skill (from their newest Grow model). */
async function currentLevel(userId: string, key: string, startLevel = 3): Promise<number> {
  const snap = await withTenant({ userId }, (tx) =>
    tx.candidateModelSnapshot.findFirst({ where: { subjectUserId: userId, session: { mode: "GROW" } }, orderBy: { createdAt: "desc" } }),
  );
  if (!snap) {
    // Before any assessment, start from the person's own view of the domain, if they gave one.
    const profile = await getGrowProfile(userId);
    const own = (profile?.selfView as Record<string, number> | undefined)?.[domainOf(key)];
    return typeof own === "number" ? own : startLevel;
  }
  const model = snap.model as unknown as CandidateModel;
  return model.skills[key] ? estimateSkill(model, key).mean : 3;
}

function bestType(key: string, preferred?: ItemType): ItemType {
  if (preferred) return preferred;
  const d = domainOf(key);
  return [...ITEM_TYPES].filter((t) => t !== "FORCED_CHOICE_WORK_STYLE").sort((a, b) => (TYPE_AFFINITY[b][d] ?? 0) - (TYPE_AFFINITY[a][d] ?? 0))[0]!;
}

/** Start a practice scenario for a skill, a track session, or a twist on an earlier one. */
export async function startPractice(userId: string, locale: "en" | "ar", opts: { skillKey?: string; track?: { key: string; index: number }; twistOf?: string; retryOf?: string; quick?: boolean }) {
  const profile = await getGrowProfile(userId);
  if (opts.retryOf) {
    // Deliberate practice: the same scenario again, with the first attempt's feedback in view.
    const prev = await withTenant({ userId }, (tx) => tx.practiceSession.findFirst({ where: { id: opts.retryOf, userId } }));
    if (!prev?.feedback) throw new Error("Not found");
    const item = prev.item as unknown as PracticeItem;
    const fb = prev.feedback as unknown as StoredFeedback;
    const again: PracticeItem = {
      ...item,
      retryOf: prev.id,
      previous: { scores: fb.scores.map((s) => ({ competencyKey: s.competencyKey, level: s.level })), tips: [...(fb.coaching?.tips ?? []), ...fb.expertWouldConsider].slice(0, 4) },
    };
    delete again.track;
    return withTenant({ userId }, (tx) => tx.practiceSession.create({ data: { userId, competencyKeys: prev.competencyKeys, difficulty: prev.difficulty, item: again as unknown as Prisma.InputJsonValue } }));
  }
  if (opts.twistOf) {
    const prev = await withTenant({ userId }, (tx) => tx.practiceSession.findFirst({ where: { id: opts.twistOf, userId } }));
    if (!prev) throw new Error("Not found");
    const item = prev.item as unknown as PracticeItem;
    const twisted: PracticeItem = { ...item, twistOf: prev.id };
    return withTenant({ userId }, (tx) =>
      tx.practiceSession.create({ data: { userId, competencyKeys: item.hidden.twistTargets?.length ? item.hidden.twistTargets : item.targets, difficulty: item.difficulty, item: twisted as unknown as Prisma.InputJsonValue } }),
    );
  }

  // Who this is for: their industry, the role they're aiming for, their experience, their roadmap.
  const ctx = profile ? growContext(profile, locale) : null;
  const plan = await roadmapSkills(userId);
  let skills: string[];
  let preferred: ItemType | undefined;
  let stretch = 0;
  if (opts.track) {
    const def = trackByKey(opts.track.key)?.sessions[opts.track.index];
    if (!def) throw new Error("Unknown track session");
    skills = def.skills;
    preferred = def.itemType;
    stretch = def.stretch;
  } else {
    skills = [opts.skillKey ?? plan[0] ?? gapSkill(profile?.targetFamily, ctx?.career.shows ?? []) ?? "judgment.trade-off-reasoning"];
  }
  // The daily rep is one quick decision, pitched at where you are rather than above it.
  if (opts.quick) preferred = "TRADE_OFF_DILEMMA";
  const level = await currentLevel(userId, skills[0]!, ctx?.startLevel ?? 3);
  // Practise just above where you are now.
  const difficulty = Math.min(5, Math.max(2, Math.round(level + (opts.quick ? 0 : 0.5) + stretch)));
  const used = new Set(
    (await withTenant({ userId }, (tx) => tx.practiceSession.findMany({ where: { userId }, select: { item: true } }))).map((p) => (p.item as unknown as PracticeItem).source.replace(/^bank:/, "")),
  );
  // Scenes set in their industry, with them in the role they're aiming for.
  const world = ctx ? { ...ctx.world, yourRole: ctx.target } : curatedWorld("", locale).world;
  const target = { skills, itemType: bestType(skills[0]!, preferred), difficulty, timed: false };

  let item: PracticeItem | null = null;
  if (getProvider()) {
    const prepared = await prepareItem(
      { ...target, purpose: "explore", estMinutes: 6, dials: dialsFor(difficulty, false), avoidTypes: [], reason: "practice" },
      {
        world,
        locale,
        roleFamily: profile?.targetFamily ?? null,
        roleSummary: ctx ? `${ctx.summary}${plan.length ? ` Roadmap focus: ${plan.join(", ")}.` : ""}` : "",
        chapter: { number: 1, title: world.chapters[0]!.title, summary: world.chapters[0]!.summary },
        history: [],
        usedBankIds: used,
        technicalAnchors: {},
        ctx: {},
      },
    );
    if (prepared) item = { content: prepared.content, hidden: prepared.hidden, type: prepared.type, difficulty: prepared.difficulty, targets: prepared.targets, source: prepared.promptVersion };
  }
  if (!item) {
    const bank = resolveBankItem(target, { usedIds: used, roleFamily: profile?.targetFamily }) ?? resolveBankItem(target, { usedIds: new Set(), roleFamily: profile?.targetFamily });
    if (!bank) throw new Error("No practice item available");
    item = {
      content: bankContent(bank, world, locale),
      hidden: fillTokens(bank.hidden.en, world, locale),
      type: bank.type,
      difficulty: bank.difficulty,
      targets: bank.targets,
      source: `bank:${bank.id}`,
    };
  }
  if (opts.track) item.track = opts.track;
  if (opts.quick) item.quick = true;
  if (ctx && profile) {
    const step = plan.indexOf(skills[0]!);
    item.why = { industry: ctx.industryFromCv ? world.industry : null, role: ctx.target, skillKey: skills[0]!, goal: profile.goal, step: step >= 0 ? step + 1 : null, steps: plan.length };
  }
  return withTenant({ userId }, (tx) =>
    tx.practiceSession.create({ data: { userId, competencyKeys: item!.targets, difficulty: item!.difficulty, item: item as unknown as Prisma.InputJsonValue } }),
  );
}

/** "Works out…" → "works out…", leaving names and acronyms ("Line 3", "IT") alone. */
function lowerFirst(t: string) {
  return /^[A-Z][a-z]/.test(t) ? t[0]!.toLowerCase() + t.slice(1) : t;
}

/** Feedback without a model: built from the item's indicators and the person's words. */
export function offlineFeedback(item: PracticeItem, words: string, locale: "en" | "ar"): StoredFeedback {
  const ar = locale === "ar";
  const hit = item.hidden.strongIndicators.filter((s) => containsAny(words, s.keywords));
  const missed = item.hidden.strongIndicators.filter((s) => !containsAny(words, s.keywords));
  // One card per quote: two behaviours shown in the same sentence share it.
  const didWell: StoredFeedback["didWell"] = [];
  for (const s of hit) {
    const quote = sentenceWith(words, s.keywords) ?? words.slice(0, 160);
    const same = didWell.find((d) => d.quote === quote);
    if (same) same.point = `${same.point.replace(/\.$/, "")}${ar ? "، و" : "; and "}${ar ? s.text : lowerFirst(s.text)}`;
    else if (didWell.length < 3) didWell.push({ point: s.text, quote });
  }
  const expert = missed.slice(0, 3).map((s) => s.text);
  if (item.hidden.embeddedDetail && !containsAny(words, item.hidden.embeddedDetail.keywords)) {
    expert.unshift(ar ? `انتبه إلى تفصيلة في المواد: ${item.hidden.embeddedDetail.description}` : `A detail in the materials mattered: ${item.hidden.embeddedDetail.description}`);
  }
  if (expert.length === 0) expert.push(ar ? "اختبر خطتك: ما أول إشارة ستدلك على أنها لا تنجح؟" : "Stress-test your plan: what is the first sign it isn't working?");
  const approach = (ar ? "أحد الأساليب القوية: " : "One strong approach: ") + item.hidden.strongIndicators.slice(0, 3).map((s, i) => { const t = s.text.replace(/\.$/, ""); return ar || i === 0 ? t : lowerFirst(t); }).join(ar ? "؛ ثم " : "; then ") + ".";
  const keys = item.hidden.rubric.map((r) => r.competencyKey);
  const scored = offlineScore({ hidden: item.hidden, rubricKeys: keys, stage: "MAIN", response: words });
  return { didWell, expertWouldConsider: expert.slice(0, 4), oneStrongApproach: approach, scores: scored.scores.map((s) => ({ competencyKey: s.competencyKey, level: s.level, confidence: s.confidence })), mode: "offline" };
}

export async function submitPractice(userId: string, locale: "en" | "ar", id: string, content: unknown) {
  const session = await withTenant({ userId }, (tx) => tx.practiceSession.findFirst({ where: { id, userId } }));
  if (!session) throw new Error("Not found");
  if (session.feedback) return session;
  const item = session.item as unknown as PracticeItem;
  const parsed = responseContentSchema.parse(content);
  const words = candidateWords(parsed) || responseText(parsed, item.content);
  let feedback: StoredFeedback | null = null;
  if (getProvider()) {
    try {
      const { output } = await runAgent(practiceFeedback, {
        language: locale,
        itemText: `${item.content.title}\n${item.content.scenario}\nTask: ${item.twistOf && item.content.twist ? `${item.content.twist.change}\n${item.content.twist.prompt}` : item.content.task.prompt}`,
        rubric: anchorsFor(session.competencyKeys) || item.hidden.rubric.map((r) => `${r.competencyKey}: ${r.anchors.join(" | ")}`).join("\n"),
        strongIndicators: item.hidden.strongIndicators.map((s) => s.text),
        embeddedDetail: item.hidden.embeddedDetail?.description ?? null,
        response: responseText(parsed, item.content),
      }, { sessionId: id });
      // Quotes must be the person's own words.
      output.didWell = output.didWell.filter((d) => words.includes(d.quote.trim()));
      feedback = { ...output, mode: "anthropic" };
    } catch (e) {
      console.warn("[practice] model feedback failed; using offline feedback", e);
    }
  }
  feedback ??= offlineFeedback(item, words, locale);
  feedback.coaching = coachingFor(words, feedback.scores, item.targets, locale);
  const updated = await withTenant({ userId }, (tx) =>
    tx.practiceSession.update({ where: { id }, data: { response: parsed as unknown as Prisma.InputJsonValue, feedback: feedback as unknown as Prisma.InputJsonValue, completedAt: new Date() } }),
  );
  if (item.track) {
    await withTenant({ userId }, async (tx) => {
      const track = await tx.track.findFirst({ where: { key: item.track!.key, organizationId: null } });
      if (!track) return;
      const enrollment = await tx.trackEnrollment.upsert({ where: { userId_trackId: { userId, trackId: track.id } }, create: { userId, trackId: track.id }, update: {} });
      const total = (track.sessions as unknown[]).length;
      const done = Math.max(enrollment.completedSessions, item.track!.index + 1);
      await tx.trackEnrollment.update({ where: { id: enrollment.id }, data: { completedSessions: done, completedAt: done >= total ? new Date() : null } });
    });
  }
  return updated;
}

export async function saveReflection(userId: string, id: string, note: string) {
  return withTenant({ userId }, (tx) => tx.practiceSession.update({ where: { id }, data: { reflectionNote: note.slice(0, 4000) } }));
}

export function practiceSkillsCatalog(locale: "en" | "ar") {
  return DOMAINS.filter((d) => d.key !== "technical").map((d) => ({ key: d.key, name: d.name[locale], subSkills: d.subSkills.map((s) => ({ key: s.key, name: s.name[locale], description: s.description[locale] })) }));
}

export { itemContentSchema, itemHiddenSchema };
