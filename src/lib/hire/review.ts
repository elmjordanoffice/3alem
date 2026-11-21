import "server-only";
import { systemDb, withTenant } from "@/lib/db";
import { tenantOf, type Viewer } from "@/lib/auth/session";
import { itemContentSchema } from "@/lib/assessment/item-schema";
import { responseContentSchema } from "@/lib/assessment/response-schema";

/** One part of an answer as a reviewer reads it: who said it (in role-play) and the words. */
export interface AnswerPart {
  who?: "candidate" | "stakeholder";
  label?: string;
  text: string;
}

export interface AnswerContext {
  title: string;
  scenario: string;
  stage: string;
  chosen: string | null;
  parts: AnswerPart[];
  quote: string;
}

export interface ReviewState {
  requested: boolean;
  reviewedAt: string | null;
  reviewerName: string | null;
  note: string | null;
}

export interface Adjustment {
  skillKey: string;
  level: number;
  note: string;
  byName: string;
  at: string;
}

/** The answer a piece of evidence came from, laid out for reading rather than scoring. */
export async function answerContext(viewer: Viewer, sessionId: string, scoreId: string): Promise<AnswerContext | null> {
  return withTenant(tenantOf(viewer), async (tx) => {
    const score = await tx.itemScore.findFirst({ where: { id: scoreId, sessionId }, include: { response: true, item: true } });
    if (!score) return null;
    const item = itemContentSchema.safeParse(score.item.content);
    const content = responseContentSchema.safeParse(score.response.content);
    if (!item.success || !content.success) {
      return { title: "", scenario: "", stage: score.response.stage, chosen: null, parts: [{ text: score.evidenceQuote }], quote: score.evidenceQuote };
    }
    const it = item.data;
    const c = content.data;
    const task = it.task;
    let chosen: string | null = null;
    let parts: AnswerPart[] = [];
    switch (c.kind) {
      case "choice":
        chosen = task.options?.find((o) => o.id === c.optionId)?.label ?? null;
        parts = [{ text: c.justification }];
        break;
      case "ranking":
        chosen = c.order.map((id, i) => `${i + 1}. ${task.rankItems?.find((x) => x.id === id)?.label ?? id}`).join("\n");
        parts = [{ text: c.reasoning }];
        break;
      case "allocation":
        chosen = (task.allocation?.rows ?? []).map((r) => `${r.label}: ${c.values[r.id] ?? 0}`).join("\n");
        parts = [{ text: c.reasoning }];
        break;
      case "written":
        parts = [{ text: c.text }];
        break;
      case "inbox": {
        const subject = (id: string) => task.inbox?.messages.find((m) => m.id === id)?.subject ?? id;
        parts = c.replies.map((r) => ({ label: subject(r.messageId), text: r.text }));
        break;
      }
      case "roleplay":
        parts = c.transcript.map((t) => ({ who: t.from, text: t.text }));
        break;
      case "design":
        parts = (task.design?.sections ?? []).map((s) => ({ label: s.label, text: c.sections[s.id] ?? "" }));
        break;
      case "chain":
        parts = c.choices.map((ch) => {
          const round = task.chain?.rounds.find((r) => r.id === ch.roundId);
          return { label: round?.options.find((o) => o.id === ch.optionId)?.label, text: ch.reason };
        });
        break;
      case "forced_choice":
        parts = [];
        break;
    }
    return { title: it.title, scenario: it.scenario, stage: score.response.stage, chosen, parts: parts.filter((p) => p.text.trim() || p.label), quote: score.evidenceQuote };
  });
}

/** Review request, confirmation and reviewer adjustments for a session's report. */
export async function reviewForViewer(viewer: Viewer, sessionId: string): Promise<{ review: ReviewState; adjustments: Adjustment[] } | null> {
  const data = await withTenant(tenantOf(viewer), async (tx) => {
    const s = await tx.assessmentSession.findUnique({
      where: { id: sessionId },
      select: { humanReviewRequested: true, humanReviewedAt: true, humanReviewedById: true, humanReviewNote: true },
    });
    if (!s) return null;
    const adjustments = await tx.reportAdjustment.findMany({ where: { sessionId }, orderBy: { updatedAt: "desc" } });
    return { s, adjustments };
  });
  if (!data) return null;
  const ids = [...new Set([data.s.humanReviewedById, ...data.adjustments.map((a) => a.createdById)].filter((x): x is string => Boolean(x)))];
  // Names only, for ids that came from this tenant's own rows.
  const users = ids.length ? await systemDb.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }) : [];
  const name = (id: string | null) => users.find((u) => u.id === id)?.name ?? null;
  return {
    review: {
      requested: data.s.humanReviewRequested,
      reviewedAt: data.s.humanReviewedAt?.toISOString() ?? null,
      reviewerName: name(data.s.humanReviewedById),
      note: data.s.humanReviewNote,
    },
    adjustments: data.adjustments.map((a) => ({ skillKey: a.skillKey, level: a.level, note: a.note, byName: name(a.createdById) ?? "", at: a.updatedAt.toISOString() })),
  };
}

/** True when the candidate asked for a human review and nobody has confirmed one yet. */
export function reviewPending(r: ReviewState | null | undefined): boolean {
  return Boolean(r?.requested && !r.reviewedAt);
}

export interface DecisionState {
  outcome: "ADVANCE" | "HIRE" | "HOLD" | "DECLINE";
  reason: string;
  byName: string;
  at: string;
}

/** What the hiring team decided for this candidate, if anything yet. */
export async function decisionForViewer(viewer: Viewer, sessionId: string): Promise<DecisionState | null> {
  const d = await withTenant(tenantOf(viewer), (tx) => tx.hiringDecision.findUnique({ where: { sessionId } }));
  if (!d) return null;
  const u = await systemDb.user.findUnique({ where: { id: d.decidedById }, select: { name: true } });
  return { outcome: d.outcome, reason: d.reason, byName: u?.name ?? "", at: d.updatedAt.toISOString() };
}
