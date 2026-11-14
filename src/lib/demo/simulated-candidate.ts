import "server-only";
import { itemContentSchema, itemHiddenSchema, type ItemContent, type ItemHidden } from "@/lib/assessment/item-schema";
import type { ResponseContent } from "@/lib/assessment/response-schema";
import { systemDb } from "@/lib/db";
import { acknowledgeChapter, beginAssessment, currentItem, currentStage, roleplayTurn, submitResponse } from "@/lib/hire/session";
import { buildReport } from "@/lib/hire/report";

/**
 * Drives a session through the real pipeline with answers shaped by a
 * persona: strong domains use the language of strong answers, weak domains
 * the language of weak ones. Used for demo data and integration tests only.
 */
export interface SimPersona {
  strengths: string[];
  weaknesses: string[];
  /** 0–1: how often the persona notices hidden details. */
  attention: number;
  seed: number;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const latin = (k: string) => /^[\x20-\x7e]+$/.test(k);

function sentenceFor(keywords: string[], strong: boolean, r: () => number, lang: "en" | "ar") {
  const ks = keywords.filter((k) => (lang === "en" ? latin(k) : !latin(k))).slice(0, 3);
  const use = ks.length ? ks : keywords.slice(0, 2);
  if (lang === "ar") return strong ? `سأحرص على ${use.join(" و")} قبل أن أقرر، وسأشرح السبب للفريق.` : `سأكتفي بـ${use.join(" و")} ولن أطيل في الأمر.`;
  const openers = strong ? ["First, I would", "Before deciding, I would", "I would make sure to"] : ["I would just", "Honestly I'd", "I'd probably"];
  return `${openers[Math.floor(r() * openers.length)]} ${use.join(" and ")}${strong ? ", and explain my reasoning to the people affected." : " and move on."}`;
}

function answerText(hidden: ItemHidden, targets: string[], p: SimPersona, r: () => number, lang: "en" | "ar"): string {
  const domain = (k: string) => k.split(".")[0]!;
  const parts: string[] = [];
  for (const key of targets) {
    const strong = p.strengths.includes(domain(key));
    const weak = p.weaknesses.includes(domain(key));
    const signals = (strong ? hidden.strongIndicators : weak ? hidden.redFlags : hidden.strongIndicators.slice(0, 1)).filter((s) => s.competencyKey === key);
    const pool = signals.length ? signals : strong ? hidden.strongIndicators : weak ? hidden.redFlags : [];
    for (const s of pool.slice(0, strong ? 2 : 1)) parts.push(sentenceFor(s.keywords, !weak, r, lang));
    if (!pool.length) parts.push(lang === "ar" ? "سأتحدث مع الأشخاص المعنيين وأتخذ قراراً معقولاً." : "I would talk to the people involved and make a reasonable call.");
  }
  if (hidden.embeddedDetail && r() < p.attention) parts.push(sentenceFor(hidden.embeddedDetail.keywords, true, r, lang));
  return parts.join(" ");
}

function mainContent(content: ItemContent, text: string, r: () => number): ResponseContent {
  const t = content.task;
  switch (t.kind) {
    case "choice":
      return { kind: "choice", optionId: t.options![Math.floor(r() * t.options!.length)]!.id, justification: text };
    case "ranking":
      return { kind: "ranking", order: [...t.rankItems!].sort(() => r() - 0.5).map((x) => x.id), reasoning: text };
    case "allocation": {
      const rows = t.allocation!.rows;
      const each = Math.floor(t.allocation!.total / rows.length);
      const values = Object.fromEntries(rows.map((row, i) => [row.id, i === 0 ? t.allocation!.total - each * (rows.length - 1) : each]));
      return { kind: "allocation", values, reasoning: text };
    }
    case "inbox": {
      const msgs = t.inbox!.messages;
      const triage = Object.fromEntries(msgs.map((m, i) => [m.id, i < t.inbox!.replyCount ? ("reply" as const) : ("later" as const)]));
      return { kind: "inbox", order: msgs.map((m) => m.id), triage, replies: msgs.slice(0, t.inbox!.replyCount).map((m) => ({ messageId: m.id, text })) };
    }
    case "design":
      return { kind: "design", sections: Object.fromEntries(t.design!.sections.map((s) => [s.id, text])) };
    case "chain":
      return { kind: "chain", choices: t.chain!.rounds.map((round) => ({ roundId: round.id, optionId: round.options[Math.floor(r() * round.options.length)]!.id, reason: text.slice(0, 300) })) };
    case "forced_choice":
      return { kind: "forced_choice", picks: Object.fromEntries(t.forcedChoice!.pairs.map((pair) => [pair.id, r() < 0.5 ? ("a" as const) : ("b" as const)])) };
    default:
      return { kind: "written", text };
  }
}

export async function simulateSession(sessionId: string, persona: SimPersona) {
  const r = rng(persona.seed);
  const session = await systemDb.assessmentSession.findUniqueOrThrow({ where: { id: sessionId } });
  const lang = session.locale === "ar" ? "ar" : "en";
  if (session.status === "STARTED") await beginAssessment(sessionId);
  for (let guard = 0; guard < 200; guard++) {
    const s = await systemDb.assessmentSession.findUniqueOrThrow({ where: { id: sessionId } });
    if (["COMPLETED", "SCORED", "REPORTED"].includes(s.status)) break;
    const item = await currentItem(sessionId);
    if (!item) break;
    if (item.chapter > s.currentChapter) await acknowledgeChapter(sessionId);
    const content = itemContentSchema.parse(item.content);
    const hidden = itemHiddenSchema.parse(item.rubric);
    const stage = await currentStage(item.id, content);
    if (stage === "DONE") break;
    const id = () => `sim-${sessionId.slice(-6)}-${guard}-${Math.floor(r() * 1e9)}`;
    let response: ResponseContent;
    if (stage === "MAIN" && content.task.kind === "roleplay") {
      const good = persona.strengths.some((d) => d === "communication" || d === "collaboration");
      const lines = good
        ? lang === "ar"
          ? ["أفهم تماماً، وأعتذر عن أثر ذلك على فريقك. هل يمكنك أن تخبرني بما حدث بالتحديد؟", "سأتحقق من الأمر اليوم وأرسل لك ملخصاً قبل الساعة الرابعة.", "هل يناسبك أن نتحدث غداً في العاشرة لنتأكد من أن كل شيء قد أُصلح؟"]
          : ["I understand, and I'm sorry this has affected your team. Can you tell me exactly what happened?", "I will look into it today and send you a summary by 4pm with what we are changing.", "Would a short call tomorrow at 10 work to confirm it is fixed?"]
        : lang === "ar"
          ? ["هذه هي السياسة المتبعة.", "سنحاول حل الأمر قريباً.", "لا يمكنني فعل أكثر من ذلك."]
          : ["That is our policy.", "We'll look into it as soon as possible.", "There's nothing more I can do right now."];
      const transcript: { from: "candidate" | "stakeholder"; text: string }[] = [{ from: "stakeholder", text: content.task.roleplay!.openingLine }];
      for (const line of lines) {
        const res = await roleplayTurn(sessionId, { itemId: item.id, clientId: id(), text: line });
        transcript.push({ from: "candidate", text: line });
        if (res.ok) transcript.push({ from: "stakeholder", text: res.reply });
        if (!res.ok || res.ended) break;
      }
      response = { kind: "roleplay", transcript };
    } else {
      const targets = stage === "MAIN" ? item.targetCompetencyKeys : stage === "PROBE" ? (hidden.probeTargets ?? item.targetCompetencyKeys.slice(0, 1)) : (hidden.twistTargets ?? item.targetCompetencyKeys.slice(0, 1));
      const text = answerText(hidden, targets, persona, r, lang);
      response = stage === "MAIN" ? mainContent(content, text, r) : { kind: "written", text };
    }
    const minutes = ((item.meta as { minutes?: number })?.minutes ?? 5) * (stage === "MAIN" ? 0.6 : 0.2);
    await submitResponse(sessionId, { itemId: item.id, stage, clientId: id(), content: response, durationMs: Math.round(minutes * 60_000), events: [] });
  }
  const report = await systemDb.report.findUnique({ where: { sessionId } });
  if (report?.status !== "READY") await buildReport(sessionId);
}
