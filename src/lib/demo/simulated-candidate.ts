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

/** "Identifies the outlier." → "identify the outlier"; "يحدّد" → "سأحدّد". */
function firstPerson(text: string, lang: "en" | "ar") {
  const clean = text.trim().replace(/[.。]+$/, "");
  if (lang === "ar") return clean.replace(/^ي/, "سأ");
  const [verb = "", ...rest] = clean.split(" ");
  const v = verb.toLowerCase();
  const base = /ies$/.test(v) ? v.replace(/ies$/, "y") : /(sses|shes|ches|xes|zes)$/.test(v) ? v.slice(0, -2) : /s$/.test(v) && !/ss$/.test(v) ? v.slice(0, -1) : v;
  return [base, ...rest].join(" ").replace(/\btheir\b/g, "my").replace(/\bthey\b/g, "I");
}

/**
 * A sentence a person might write: the behaviour the signal describes, in the
 * first person, plus the specifics (the signal's keywords) that show it.
 */
function sentenceFor(signal: { text: string; keywords: string[] }, strong: boolean, r: () => number, lang: "en" | "ar", plain = false) {
  // A plain sentence names the behaviour without the specifics that prove it.
  const ks = plain ? [] : signal.keywords.filter((k) => (lang === "en" ? latin(k) : !latin(k))).slice(0, 2);
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)]!;
  const act = firstPerson(signal.text, lang);
  if (lang === "ar") {
    const tail = ks.length ? ` ${pick(["والمهم هنا:", "وأستند في ذلك إلى", "تحديدًا:"])} ${ks.join(" و")}.` : ".";
    return strong ? `${pick(["أولًا،", "قبل أن أقرر،", ""])} ${act}${tail}`.trim() : `${pick(["بصراحة،", "على الأرجح"])} ${act}${tail}`;
  }
  const opener = strong ? pick(["First, I'd", "Before deciding anything, I'd", "I'd start by trying to", "My first step would be to"]) : pick(["Honestly, I'd just", "I'd probably", "To keep things moving, I'd"]);
  const tail = ks.length ? ` ${pick(["The specifics that matter:", "I'd point to", "The detail I'd use:"])} ${ks.join(" and ")}.` : ".";
  return `${opener} ${act}.${tail}`.replace(/\.\./g, ".").replace(/\. ([a-z])/g, (_, c: string) => `. ${c.toUpperCase()}`);
}

function answerText(hidden: ItemHidden, targets: string[], p: SimPersona, r: () => number, lang: "en" | "ar"): string {
  const domain = (k: string) => k.split(".")[0]!;
  const parts: string[] = [];
  for (const key of targets) {
    const strong = p.strengths.includes(domain(key));
    const weak = p.weaknesses.includes(domain(key));
    // Strong domains show two of the item's strong behaviours with specifics, weak ones a red flag.
    const signals = (weak ? hidden.redFlags : hidden.strongIndicators).filter((s) => s.competencyKey === key);
    const pool = signals.length ? signals : strong ? hidden.strongIndicators : weak ? hidden.redFlags : [];
    const generic = lang === "ar" ? "سأتحدث مع الأشخاص المعنيين وأتخذ قرارًا معقولًا." : "I would talk to the people involved and make a reasonable call.";
    if (!strong && !weak) {
      // Middling: the right idea about half the time, without the specifics; otherwise something generic.
      parts.push(pool[0] && r() < 0.5 ? sentenceFor(pool[0], true, r, lang, true) : generic);
      continue;
    }
    for (const s of pool.slice(0, strong ? 2 : 1)) parts.push(sentenceFor(s, !weak, r, lang));
    if (!pool.length) parts.push(generic);
  }
  if (hidden.embeddedDetail && r() < p.attention) {
    // The hidden detail is a fact in the materials; someone who noticed it says so.
    const d = hidden.embeddedDetail.description.trim().replace(/\.$/, "");
    parts.push(lang === "ar" ? `وهناك أمر يستحق التنبيه: ${d}.` : `One thing worth flagging: ${d}.`);
  }
  return [...new Set(parts)].join(" ");
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

/** A persona's answer to one item (used for demo Grow practice). */
export function simulatedAnswer(content: ItemContent, hidden: ItemHidden, targets: string[], persona: SimPersona, lang: "en" | "ar" = "en"): ResponseContent {
  const r = rng(persona.seed);
  return mainContent(content, answerText(hidden, targets, persona, r, lang), r);
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
      // A few phrasings per turn so demo reports don't all quote the same line.
      const pick = (xs: string[]) => xs[Math.floor(r() * xs.length)]!;
      const turns: string[][] = good
        ? lang === "ar"
          ? [["أفهم تمامًا، وأعتذر عن أثر ذلك على فريقك. هل يمكنك أن تخبرني بما حدث بالتحديد؟", "شكرًا لأنك أخبرتني مباشرة. ما الذي أثّر عليكم أكثر من غيره؟"], ["سأتحقق من الأمر اليوم وأرسل لك ملخصًا قبل الساعة الرابعة بما سنغيّره.", "سأتابع الأمر بنفسي، وستصلك خطة واضحة قبل نهاية اليوم."], ["هل يناسبك أن نتحدث غدًا في العاشرة لنتأكد من أن كل شيء قد أُصلح؟", "سأتصل بك بعد أسبوع لنتأكد من أن الحل ناجح."]]
          : [["I understand, and I'm sorry this has affected your team. Can you tell me exactly what happened?", "Thanks for telling me directly. What hit your team hardest?"], ["I'll look into it today and send you a summary by 4pm with what we're changing.", "I'll own this myself, and you'll have a clear plan from me before the end of the day."], ["Would a short call tomorrow at 10 work to confirm it's fixed?", "I'll check back with you in a week to make sure the fix is holding."]]
        : lang === "ar"
          ? [["هذه هي السياسة المتبعة.", "هذا خارج عن يدي للأسف."], ["سنحاول حل الأمر قريبًا.", "سأرى ما يمكن فعله."], ["لا يمكنني فعل أكثر من ذلك.", "عليكم الانتظار مثل الجميع."]]
          : [["That is our policy.", "I'm afraid that's out of my hands."], ["We'll look into it as soon as possible.", "I'll see what can be done."], ["There's nothing more I can do right now.", "You'll have to wait like everyone else."]];
      const lines = turns.map(pick);
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
