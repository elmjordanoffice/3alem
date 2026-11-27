import "server-only";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { itemContentSchema, itemHiddenSchema, type ItemContent } from "@/lib/assessment/item-schema";
import { worldSchema, type World } from "@/lib/assessment/world-schema";
import { decisionSummary, responseContentSchema, responseEventSchema, type ResponseContent } from "@/lib/assessment/response-schema";
import { systemDb } from "@/lib/db";
import {
  ENGINE_VERSION,
  chapterFor,
  createModel,
  recordItem,
  remainingMinutes,
  selectNextTarget,
  shouldStop,
  type Target,
} from "@/lib/engine";
import { enqueue, settle } from "@/lib/jobs";
import { audit } from "@/lib/audit";
import { roleplayActor, type ActorOutput } from "@/lib/ai/prompts/roleplay-actor";
import { offlineActor } from "@/lib/ai/offline/actor";
import { getProvider, runAgent } from "@/lib/ai/run";
import { invitationForToken } from "./invitations";
import { buildWorld } from "./world";
import { prepareItem, prepareFromBank, usedBankIds, type ItemMeta, type PrepareContext, type PreparedItem } from "./items";
import { loadRoleProfileForSession, latestModel, saveModel } from "./model-store";
import { roleProfileFor, templateAnalysis, technicalSkills, type TemplateRow } from "./templates";
import { withModelLock } from "./scoring";
import { dispatchWebhook } from "@/lib/webhooks";
import { getGrowProfile, growContext } from "@/lib/grow/profile";

export const CONSENT_TEXT_VERSION = "candidate-consent.v1";
/** Longest time one stage can add to the clock (a tab left open doesn't eat the budget). */
const MAX_STAGE_MS = 25 * 60_000;

export type Stage = "MAIN" | "PROBE" | "TWIST";

export interface CandidateAccommodations {
  extraTime: 1 | 1.25 | 1.5;
  untimed: boolean;
  largerText: boolean;
}

/** Resolve a token to its session, or explain why not. */
export async function candidateContext(token: string) {
  const r = await invitationForToken(token);
  if (!r) return { state: "invalid" as const };
  const { inv, state } = r;
  if (state !== "valid") return { state, inv };
  return { state: "valid" as const, inv, session: inv.session };
}

/** Consent given: create the session, the candidate's identity and the world. */
export async function startSession(
  token: string,
  opts: { locale: "en" | "ar"; accommodations: CandidateAccommodations; consent: boolean; humanReview?: boolean },
) {
  const ctx = await candidateContext(token);
  if (ctx.state !== "valid") throw new Error(`Invitation ${ctx.state}`);
  if (!opts.consent) throw new Error("Consent required");
  if (ctx.session) return ctx.session;
  const { inv } = ctx;
  const template = inv.template as unknown as TemplateRow;
  const analysis = templateAnalysis(template);

  // The candidate is a person in Aalim, even without a password: they can
  // claim the account later (password reset proves the email) to see a
  // shared report or keep practising in Grow.
  const user =
    (await systemDb.user.findUnique({ where: { email: inv.email } })) ??
    (await systemDb.user.create({ data: { id: randomUUID(), email: inv.email, name: inv.name ?? inv.email.split("@")[0]!, locale: opts.locale } }));

  const budget = Math.round(template.durationMinutes * (opts.accommodations.untimed ? 1.5 : opts.accommodations.extraTime));
  const role = roleProfileFor(template);

  const session = await systemDb.$transaction(async (tx) => {
    const s = await tx.assessmentSession.create({
      data: {
        organizationId: inv.organizationId,
        subjectUserId: user.id,
        mode: "HIRE",
        templateId: inv.templateId,
        invitationId: inv.id,
        status: "STARTED",
        phase: "CALIBRATE",
        timeBudgetMinutes: budget,
        locale: opts.locale,
        accommodations: opts.accommodations as unknown as Prisma.InputJsonValue,
        engineVersion: ENGINE_VERSION,
        humanReviewRequested: opts.humanReview ?? false,
        startedAt: new Date(),
      },
    });
    await tx.candidateModelSnapshot.create({
      data: { sessionId: s.id, sequence: 0, model: createModel(role) as unknown as Prisma.InputJsonValue, organizationId: inv.organizationId, subjectUserId: user.id },
    });
    await tx.consent.create({
      data: { userId: user.id, email: inv.email, organizationId: inv.organizationId, kind: "ASSESSMENT_DATA_USE", subject: `invitation:${inv.id}`, granted: true, textVersion: CONSENT_TEXT_VERSION },
    });
    await tx.invitation.update({ where: { id: inv.id }, data: { status: "ACCEPTED", candidateUserId: user.id } });
    return s;
  });

  const { world, source } = await buildWorld({
    industry: analysis?.industry ?? "General business",
    industryKeywords: analysis?.industryKeywords ?? [],
    roleTitle: analysis?.roleTitle ?? template.title,
    roleSummary: analysis?.summary ?? "",
    roleLanguage: analysis?.language ?? "en",
    locale: opts.locale,
    ctx: { organizationId: inv.organizationId, sessionId: session.id },
  });
  await systemDb.scenarioWorld.create({
    data: {
      sessionId: session.id,
      organizationId: inv.organizationId,
      subjectUserId: user.id,
      companyName: world.companyName,
      industry: world.industry,
      summary: world as unknown as Prisma.InputJsonValue,
      cast: world.cast as unknown as Prisma.InputJsonValue,
      hooks: { decisions: [] },
      promptVersion: source,
    },
  });
  await audit({ organizationId: inv.organizationId, actorUserId: user.id, action: "assessment.started", targetType: "session", targetId: session.id });
  void dispatchWebhook(inv.organizationId, "candidate.started", { sessionId: session.id, templateId: inv.templateId, email: inv.email }).catch(() => undefined);
  // Prepare the first scene while the candidate reads the briefing.
  void enqueue("pregenerate", { sessionId: session.id }, session.id);
  return session;
}

async function loadWorld(sessionId: string): Promise<{ world: World; decisions: string[] }> {
  const w = await systemDb.scenarioWorld.findUniqueOrThrow({ where: { sessionId } });
  return { world: worldSchema.parse(w.summary), decisions: ((w.hooks as { decisions?: string[] }).decisions ?? []).slice(-12) };
}

async function prepareContext(sessionId: string): Promise<PrepareContext> {
  const { session, template, locale } = await loadRoleProfileForSession(sessionId);
  const { world, decisions } = await loadWorld(sessionId);
  const items = await systemDb.item.findMany({ where: { sessionId }, select: { promptVersion: true } });
  // Items retired in platform review are never selected again.
  const retired = await systemDb.bankItemReview.findMany({ where: { status: "retired" }, select: { itemKey: true } });
  const analysis = template ? templateAnalysis(template) : null;
  const tech = template ? technicalSkills(template) : [];
  const chapterNo = chapterFor(await sessionBudget(session));
  const ch = world.chapters[chapterNo - 1] ?? world.chapters[0]!;
  // Grow: the person's own context (goal's role family, CV, experience) instead of a job description.
  const grow = session.mode === "GROW" && session.subjectUserId ? await getGrowProfile(session.subjectUserId) : null;
  const gctx = grow ? growContext(grow, locale) : null;
  return {
    world,
    locale,
    roleFamily: analysis?.roleFamily ?? grow?.targetFamily ?? null,
    roleSummary: analysis ? `${analysis.roleTitle}: ${analysis.summary}` : (gctx?.summary ?? ""),
    chapter: { number: chapterNo, title: ch.title, summary: ch.summary },
    history: decisions,
    usedBankIds: new Set([...usedBankIds(items), ...retired.map((r) => r.itemKey)]),
    technicalAnchors: Object.fromEntries(tech.map((t) => [t.key, { name: t.name, anchors: t.anchors }])),
    ctx: { organizationId: session.organizationId, sessionId },
  };
}

/**
 * The budget the engine plans against. Time counts as the greater of the
 * measured time and 60% of each finished scene's expected minutes, so someone
 * who rushes through doesn't get an endless session (D-025).
 */
export async function sessionBudget(s: { id: string; timeBudgetMinutes: number; elapsedSeconds: number }) {
  const items = await systemDb.item.findMany({ where: { sessionId: s.id, status: "ANSWERED" }, select: { meta: true } });
  const floor = items.reduce((a, i) => a + ((i.meta as unknown as ItemMeta)?.minutes ?? 4) * 0.6, 0);
  return { totalMinutes: s.timeBudgetMinutes, elapsedMinutes: Math.max(s.elapsedSeconds / 60, floor) };
}

/** Persist a prepared item. */
async function storeItem(sessionId: string, prepared: PreparedItem, status: "PREGENERATED" | "PRESENTED", chapter: number) {
  const session = await systemDb.assessmentSession.findUniqueOrThrow({ where: { id: sessionId } });
  const count = await systemDb.item.count({ where: { sessionId, status: { not: "PREGENERATED" } } });
  return systemDb.item.create({
    data: {
      sessionId,
      organizationId: session.organizationId,
      subjectUserId: session.subjectUserId,
      chapter,
      sequence: status === "PRESENTED" ? count + 1 : 0,
      type: prepared.type,
      difficulty: prepared.difficulty,
      targetCompetencyKeys: prepared.targets,
      content: prepared.content as unknown as Prisma.InputJsonValue,
      rubric: prepared.hidden as unknown as Prisma.InputJsonValue,
      embeddedDetail: (prepared.hidden.embeddedDetail ?? undefined) as Prisma.InputJsonValue | undefined,
      guessabilityStatus: prepared.guessability.status,
      guessabilityResult: (prepared.guessability.result ?? undefined) as Prisma.InputJsonValue | undefined,
      status,
      promptVersion: prepared.promptVersion,
      meta: { ...prepared.meta, target: prepared.meta.requested } as unknown as Prisma.InputJsonValue,
      presentedAt: status === "PRESENTED" ? new Date() : null,
    },
  });
}

/** Pre-generate the next scene for the most likely target (AI mode only). */
export async function pregenerate(sessionId: string) {
  const session = await systemDb.assessmentSession.findUnique({ where: { id: sessionId } });
  if (!session || ["COMPLETED", "SCORED", "REPORTED"].includes(session.status)) return;
  const existing = await systemDb.item.count({ where: { sessionId, status: "PREGENERATED" } });
  if (existing >= 2) return;
  const { role } = await loadRoleProfileForSession(sessionId);
  const { model } = await latestModel(sessionId);
  const budget = await sessionBudget(session);
  const first = selectNextTarget(model, role, budget);
  if (!first) return;
  const targets = [first];
  // A second likely target: what the engine would pick if the first were already in flight.
  const shadow = recordItem(model, { itemId: "shadow", type: first.itemType, difficulty: first.difficulty, targets: first.skills, minutes: first.estMinutes, chapter: 1, purpose: first.purpose, timed: first.timed });
  const second = selectNextTarget(shadow, role, { ...budget, elapsedMinutes: budget.elapsedMinutes + first.estMinutes });
  if (second && getProvider()) targets.push(second);
  for (const t of targets.slice(0, 2 - existing)) {
    const pc = await prepareContext(sessionId);
    const prepared = getProvider() ? await prepareItem(t, pc) : prepareFromBank(t, pc);
    if (prepared) await storeItem(sessionId, prepared, "PREGENERATED", pc.chapter.number);
  }
}

/** Take a ready item that fits the target, so the next screen appears at once. */
async function takePregenerated(sessionId: string, target: Target) {
  const ready = await systemDb.item.findMany({ where: { sessionId, status: "PREGENERATED" }, orderBy: { createdAt: "asc" } });
  const score = (i: (typeof ready)[number]) => {
    const req = (i.meta as unknown as ItemMeta).requested;
    let s = 0;
    if (req?.skills?.[0] === target.skills[0]) s += 4;
    s += i.targetCompetencyKeys.filter((k) => target.skills.includes(k)).length;
    if (i.type === target.itemType) s += 2;
    s -= Math.abs(i.difficulty - target.difficulty);
    return s;
  };
  const best = ready.map((i) => ({ i, s: score(i) })).sort((a, b) => b.s - a.s)[0];
  return best && best.s >= 2 ? best.i : null;
}

/**
 * Choose and present the next item, or finish. Waits briefly for pending
 * scores so the choice adapts to the latest answer, but never long: the
 * person should see the next scene within about a second.
 */
export async function advance(sessionId: string) {
  await settle(sessionId, 1200);
  const session = await systemDb.assessmentSession.findUniqueOrThrow({ where: { id: sessionId } });
  if (["COMPLETED", "SCORED", "REPORTED"].includes(session.status)) return null;
  const { role } = await loadRoleProfileForSession(sessionId);
  const { model } = await latestModel(sessionId);
  const budget = await sessionBudget(session);
  if (shouldStop(model, role, budget)) return completeSession(sessionId);
  const target = selectNextTarget(model, role, budget);
  if (!target) return completeSession(sessionId);

  const chapter = chapterFor(budget);
  let item = await takePregenerated(sessionId, target);
  if (item) {
    item = await systemDb.item.update({
      where: { id: item.id },
      data: {
        status: "PRESENTED",
        presentedAt: new Date(),
        chapter,
        sequence: (await systemDb.item.count({ where: { sessionId, status: { notIn: ["PREGENERATED", "DISCARDED"] } } })) + 1,
        meta: { ...(item.meta as object), purpose: target.purpose, hypothesisId: target.hypothesisId ?? null, reason: target.reason } as Prisma.InputJsonValue,
      },
    });
  } else {
    // Nothing ready: the curated bank answers instantly; generation continues in the background.
    const pc = await prepareContext(sessionId);
    const prepared = prepareFromBank(target, pc) ?? (getProvider() ? await prepareItem(target, pc) : null);
    if (!prepared) return completeSession(sessionId);
    item = await storeItem(sessionId, prepared, "PRESENTED", chapter);
  }
  // Older pre-generated items that no longer fit are discarded.
  await systemDb.item.updateMany({ where: { sessionId, status: "PREGENERATED", createdAt: { lt: new Date(Date.now() - 10 * 60_000) } }, data: { status: "DISCARDED" } });

  const meta = item.meta as unknown as ItemMeta;
  await withModelLock(sessionId, (m) =>
    recordItem(m, {
      itemId: item!.id,
      type: item!.type,
      difficulty: item!.difficulty,
      targets: item!.targetCompetencyKeys,
      minutes: meta.minutes,
      chapter,
      purpose: target.purpose,
      timed: meta.timed,
      hypothesisId: target.hypothesisId,
    }),
  );
  const phase = target.purpose === "calibrate" ? "CALIBRATE" : target.purpose === "validate" ? "VALIDATE" : target.purpose === "stress" || target.purpose === "condition" ? "STRESS_TEST" : "EXPLORE";
  await systemDb.assessmentSession.update({ where: { id: sessionId }, data: { phase, status: session.status === "STARTED" ? "IN_PROGRESS" : session.status } });
  void enqueue("pregenerate", { sessionId }, `${sessionId}:pregen`);
  return item;
}

/** The briefing is done: present the first item. */
export async function beginAssessment(sessionId: string) {
  const current = await currentItem(sessionId);
  if (current) return current;
  await systemDb.assessmentSession.update({ where: { id: sessionId }, data: { status: "IN_PROGRESS" } });
  return advance(sessionId);
}

export async function currentItem(sessionId: string) {
  return systemDb.item.findFirst({ where: { sessionId, status: "PRESENTED" }, orderBy: { sequence: "desc" } });
}

/** Which stage of an item the candidate is on. */
export async function currentStage(itemId: string, content: ItemContent): Promise<Stage | "DONE"> {
  const done = new Set((await systemDb.response.findMany({ where: { itemId, stage: { not: "ROLE_PLAY_TURN" } }, select: { stage: true } })).map((r) => r.stage));
  if (!done.has("MAIN")) return "MAIN";
  if (content.probe && !done.has("PROBE")) return "PROBE";
  if (content.twist && !done.has("TWIST")) return "TWIST";
  return "DONE";
}

export interface SubmitInput {
  itemId: string;
  stage: Stage;
  clientId: string;
  content: unknown;
  durationMs: number;
  events: unknown[];
}

/** Save an answer (idempotent by clientId), queue scoring, and move on. */
export async function submitResponse(sessionId: string, input: SubmitInput) {
  const dupe = await systemDb.response.findUnique({ where: { clientId: input.clientId } });
  if (dupe) return { ok: true as const, duplicate: true };

  const session = await systemDb.assessmentSession.findUniqueOrThrow({ where: { id: sessionId } });
  if (!["IN_PROGRESS", "STARTED"].includes(session.status)) return { ok: false as const, error: "not_in_progress" };
  const item = await systemDb.item.findFirst({ where: { id: input.itemId, sessionId } });
  if (!item || item.status !== "PRESENTED") return { ok: false as const, error: "not_current" };
  const content = itemContentSchema.parse(item.content);
  const expected = await currentStage(item.id, content);
  if (expected !== input.stage) return { ok: false as const, error: "wrong_stage", expected };

  const parsed = responseContentSchema.safeParse(input.content);
  if (!parsed.success) return { ok: false as const, error: "invalid" };
  const events = (input.events ?? []).map((e) => responseEventSchema.safeParse(e)).filter((r) => r.success).map((r) => r.data!);
  const durationMs = Math.max(0, Math.min(MAX_STAGE_MS, Math.round(input.durationMs || 0)));

  const response = await systemDb.$transaction(async (tx) => {
    const r = await tx.response.create({
      data: {
        clientId: input.clientId,
        itemId: item.id,
        sessionId,
        organizationId: session.organizationId,
        subjectUserId: session.subjectUserId,
        stage: input.stage,
        content: parsed.data as unknown as Prisma.InputJsonValue,
        events: events as unknown as Prisma.InputJsonValue,
        durationMs,
        startedAt: new Date(Date.now() - durationMs),
      },
    });
    await tx.assessmentSession.update({ where: { id: sessionId }, data: { elapsedSeconds: { increment: Math.round(durationMs / 1000) } } });
    // Integrity context: paste and focus events (never a verdict).
    const integrity = events.filter((e) => e.type === "paste" || e.type === "tab_hidden");
    if (integrity.length) {
      await tx.integrityEvent.createMany({
        data: integrity.map((e) => ({
          sessionId,
          organizationId: session.organizationId,
          subjectUserId: session.subjectUserId,
          itemId: item.id,
          type: e.type === "paste" ? ("PASTE" as const) : ("TAB_HIDDEN" as const),
          payload: { stage: input.stage, chars: e.chars ?? null, at: e.at } as Prisma.InputJsonValue,
        })),
      });
    }
    if (input.stage === "MAIN") {
      const summary = decisionSummary(parsed.data, content, session.locale === "ar" ? "ar" : "en");
      if (summary) {
        const w = await tx.scenarioWorld.findUniqueOrThrow({ where: { sessionId } });
        const decisions = [...((w.hooks as { decisions?: string[] }).decisions ?? []), summary];
        await tx.scenarioWorld.update({ where: { sessionId }, data: { hooks: { decisions } } });
      }
    }
    return r;
  });

  void enqueue("score-response", { responseId: response.id, sessionId }, sessionId);

  const next = await currentStage(item.id, content);
  if (next !== "DONE") return { ok: true as const, next };
  await systemDb.item.update({ where: { id: item.id }, data: { status: "ANSWERED" } });
  const nextItem = await advance(sessionId);
  return { ok: true as const, next: nextItem ? ("NEXT_ITEM" as const) : ("COMPLETE" as const) };
}

/** One turn of a live role-play. Returns the stakeholder's reply. */
export async function roleplayTurn(sessionId: string, input: { itemId: string; clientId: string; text: string }) {
  const item = await systemDb.item.findFirst({ where: { id: input.itemId, sessionId, status: "PRESENTED", type: "ROLE_PLAY" } });
  if (!item) return { ok: false as const, error: "not_current" };
  const dupe = await systemDb.response.findUnique({ where: { clientId: input.clientId } });
  if (dupe) {
    const c = dupe.content as { transcript?: { from: string; text: string }[] };
    return { ok: true as const, reply: c.transcript?.find((t) => t.from === "stakeholder")?.text ?? "", ended: false, mood: "calm" };
  }
  const content = itemContentSchema.parse(item.content);
  const hidden = itemHiddenSchema.parse(item.rubric);
  const rp = content.task.roleplay!;
  const brief = hidden.roleplayBrief!;
  const { session, locale } = await loadRoleProfileForSession(sessionId);
  const { world } = await loadWorld(sessionId);
  const history = await roleplayTranscript(item.id, rp.openingLine);
  const conversation = [...history, { from: "candidate" as const, text: input.text }].map((t) => ({
    role: t.from === "candidate" ? ("user" as const) : ("assistant" as const),
    content: t.text,
  }));
  const castMember = world.cast.find((c) => c.name === rp.stakeholder.name);
  const actorInput = {
    language: locale,
    stakeholder: { name: rp.stakeholder.name, role: rp.stakeholder.role, personality: castMember?.personality ?? "" },
    publicContext: rp.stakeholder.context,
    hiddenGoals: brief.hiddenGoals,
    startingMood: brief.startingMood,
    softensWhen: brief.softensWhen,
    hardensWhen: brief.hardensWhen,
    resolution: brief.resolution,
    companyName: world.companyName,
    candidateRole: world.yourRole,
    maxTurns: rp.maxTurns,
    conversation,
  };
  let out: ActorOutput;
  try {
    out = getProvider() ? (await runAgent(roleplayActor, actorInput, { organizationId: session.organizationId, sessionId })).output : offlineActor(actorInput);
  } catch {
    out = offlineActor(actorInput);
  }
  const turns = conversation.filter((t) => t.role === "user").length;
  const ended = out.shouldEnd || turns >= rp.maxTurns;
  await systemDb.response.create({
    data: {
      clientId: input.clientId,
      itemId: item.id,
      sessionId,
      organizationId: session.organizationId,
      subjectUserId: session.subjectUserId,
      stage: "ROLE_PLAY_TURN",
      content: { kind: "roleplay", transcript: [{ from: "candidate", text: input.text }, { from: "stakeholder", text: out.reply }], mood: out.mood } as Prisma.InputJsonValue,
      events: [],
    },
  });
  return { ok: true as const, reply: out.reply, ended, mood: out.mood };
}

export async function roleplayTranscript(itemId: string, openingLine: string) {
  const turns = await systemDb.response.findMany({ where: { itemId, stage: "ROLE_PLAY_TURN" }, orderBy: { submittedAt: "asc" } });
  const out: { from: "candidate" | "stakeholder"; text: string }[] = [{ from: "stakeholder", text: openingLine }];
  for (const t of turns) out.push(...((t.content as { transcript: { from: "candidate" | "stakeholder"; text: string }[] }).transcript ?? []));
  return out;
}

/** Acknowledge a chapter transition. */
export async function acknowledgeChapter(sessionId: string) {
  const item = await currentItem(sessionId);
  if (item) await systemDb.assessmentSession.update({ where: { id: sessionId }, data: { currentChapter: item.chapter } });
}

export async function pauseSession(sessionId: string) {
  await systemDb.assessmentSession.update({ where: { id: sessionId }, data: { status: "PAUSED" } });
}

export async function resumeSession(sessionId: string) {
  const s = await systemDb.assessmentSession.findUniqueOrThrow({ where: { id: sessionId } });
  if (s.status === "PAUSED") await systemDb.assessmentSession.update({ where: { id: sessionId }, data: { status: "IN_PROGRESS" } });
}

export async function completeSession(sessionId: string) {
  const s = await systemDb.assessmentSession.findUniqueOrThrow({ where: { id: sessionId } });
  if (!["COMPLETED", "SCORED", "REPORTED"].includes(s.status)) {
    await systemDb.assessmentSession.update({ where: { id: sessionId }, data: { status: "COMPLETED", completedAt: new Date(), phase: "DONE" } });
    await systemDb.item.updateMany({ where: { sessionId, status: "PREGENERATED" }, data: { status: "DISCARDED" } });
    await audit({ organizationId: s.organizationId, actorUserId: s.subjectUserId, action: "assessment.completed", targetType: "session", targetId: sessionId });
    if (s.mode === "HIRE") void dispatchWebhook(s.organizationId, "candidate.completed", { sessionId, templateId: s.templateId, minutes: Math.round(s.elapsedSeconds / 60) }).catch(() => undefined);
    void enqueue("build-report", { sessionId }, sessionId);
  }
  return null;
}

/** Time left in minutes (never negative). */
export async function minutesLeft(s: { id: string; timeBudgetMinutes: number; elapsedSeconds: number }) {
  return remainingMinutes(await sessionBudget(s));
}

/**
 * The candidate's optional rating of the experience. The finish screen
 * promises it is anonymous to the hiring team, so it is stored at platform
 * level with no link to the session, the person or the organisation.
 */
export async function recordFeedback(sessionId: string, feedback: { rating: number; comment: string }) {
  const s = await systemDb.assessmentSession.findUniqueOrThrow({ where: { id: sessionId }, select: { mode: true } });
  await audit({ action: "assessment.feedback", metadata: { ...feedback, mode: s.mode, month: new Date().toISOString().slice(0, 7) } });
}

export type { ResponseContent };
export { saveModel };
