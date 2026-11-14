import type { ActorInput, ActorOutput } from "../prompts/roleplay-actor";
import { containsAny, normalize } from "./text";

/**
 * Offline role-play actor: a mood state machine. It reacts to observable
 * behaviours in the candidate's message (acknowledging impact, asking
 * questions, committing with specifics, getting defensive, vague promises) and
 * to the item's own "softens" and "hardens" cues. Replies are short and stay
 * in character. Used when no language model is configured.
 */

const MOODS = ["angry", "frustrated", "sceptical", "guarded", "calm", "warming", "satisfied"] as const;
type Mood = (typeof MOODS)[number];

const EMPATHY = ["understand", "i hear", "that must", "sorry", "apologi", "frustrat", "fair point", "you're right", "you are right", "impact", "أفهم", "أتفهم", "آسف", "أعتذر", "معك حق", "محق", "أقدر"];
const OWNERSHIP = ["i will", "i'll", "i am going to", "my responsibility", "i own", "let me", "سأ", "سوف", "مسؤوليتي", "أتحمل", "أتكفل"];
const SPECIFIC = ["today", "tomorrow", "by ", "monday", "tuesday", "wednesday", "thursday", "friday", "hour", "o'clock", "اليوم", "غدا", "غداً", "الساعة", "قبل", "يوم"];
const DEFENSIVE = ["not my fault", "policy", "you should have", "that's not true", "calm down", "nothing i can do", "not possible", "ليس خطئي", "السياسة", "كان عليك", "اهدأ", "لا يمكنني"];
const VAGUE = ["asap", "as soon as possible", "soon", "we'll see", "look into it", "try our best", "قريبا", "قريباً", "سنرى", "في أقرب وقت", "سنحاول"];

function cueWords(cues: string[]) {
  return cues.flatMap((c) => normalize(c).split(/[^\p{L}\p{N}']+/u).filter((w) => w.length > 4));
}

function move(mood: Mood, delta: number): Mood {
  const i = MOODS.indexOf(mood);
  return MOODS[Math.min(MOODS.length - 1, Math.max(0, i + Math.sign(delta)))]!;
}

const LINES: Record<"en" | "ar", Record<Mood, string[]>> = {
  en: {
    angry: [
      "I've heard apologies before. What exactly is going to be different this time?",
      "That doesn't answer my question. Who is actually responsible for fixing this?",
      "I'm running out of patience. Give me something concrete.",
    ],
    frustrated: [
      "Okay, but I still don't see a plan. What happens next, and when?",
      "My team is the one paying for this. What are you going to change?",
      "I need more than reassurance.",
    ],
    sceptical: [
      "I'm not convinced. What makes you sure that will work?",
      "We've tried something like that before. Why would it be different now?",
      "Walk me through the risk. What happens if you're wrong?",
    ],
    guarded: [
      "Fine. Go on.",
      "That's a start. What do you need from me?",
      "I'm listening, but I want to see it happen.",
    ],
    calm: [
      "That makes sense. What would you need from my side?",
      "Okay. How will I know it's on track?",
      "I can work with that. Anything else I should know?",
    ],
    warming: [
      "Thank you, that actually helps. Can you put the dates in writing?",
      "I appreciate you being straight with me.",
      "Good. Let's agree who does what.",
    ],
    satisfied: [
      "Alright. Send me the summary today and we'll check in on the date you gave.",
      "That works for me. Thank you for handling this properly.",
    ],
  },
  ar: {
    angry: [
      "سمعت الاعتذار من قبل. ما الذي سيتغير هذه المرة بالتحديد؟",
      "هذا لا يجيب عن سؤالي. من المسؤول فعلاً عن إصلاح هذا؟",
      "صبري ينفد. أعطني شيئاً ملموساً.",
    ],
    frustrated: [
      "حسناً، لكني ما زلت لا أرى خطة. ماذا سيحدث بعد ذلك، ومتى؟",
      "فريقي هو من يدفع الثمن. ما الذي ستغيره؟",
      "أحتاج إلى أكثر من الطمأنة.",
    ],
    sceptical: [
      "لست مقتنعاً. ما الذي يجعلك واثقاً أن هذا سينجح؟",
      "جربنا شيئاً كهذا من قبل. لماذا سيختلف الأمر الآن؟",
      "اشرح لي المخاطر. ماذا لو كنت مخطئاً؟",
    ],
    guarded: ["حسناً. أكمل.", "هذه بداية. ماذا تحتاج مني؟", "أنا أستمع، لكني أريد أن أرى ذلك يحدث."],
    calm: ["هذا منطقي. ماذا تحتاج من جهتي؟", "حسناً. كيف سأعرف أن الأمور تسير كما ينبغي؟", "يمكنني العمل على هذا. هل هناك شيء آخر يجب أن أعرفه؟"],
    warming: ["شكراً، هذا يساعد فعلاً. هل يمكنك أن ترسل المواعيد كتابياً؟", "أقدر صراحتك معي.", "جيد. لنتفق على من يفعل ماذا."],
    satisfied: ["حسناً. أرسل لي الملخص اليوم، وسنتابع في الموعد الذي ذكرته.", "هذا يناسبني. شكراً لأنك تعاملت مع الأمر كما يجب."],
  },
};

export function offlineActor(input: ActorInput): ActorOutput {
  const lang = input.language;
  const candidateTurns = input.conversation.filter((t) => t.role === "user");
  let mood: Mood = (MOODS as readonly string[]).includes(input.startingMood) ? (input.startingMood as Mood) : "guarded";
  const soften = cueWords(input.softensWhen);
  const harden = cueWords(input.hardensWhen);

  for (const turn of candidateTurns) {
    const t = turn.content;
    let delta = 0;
    if (containsAny(t, EMPATHY)) delta += 1;
    if (containsAny(t, OWNERSHIP) && containsAny(t, SPECIFIC)) delta += 1;
    if (/[?؟]/.test(t)) delta += 0.5;
    if (containsAny(t, soften)) delta += 1;
    if (containsAny(t, DEFENSIVE)) delta -= 1.5;
    if (containsAny(t, VAGUE)) delta -= 1;
    if (containsAny(t, harden)) delta -= 1;
    if (t.trim().split(/\s+/).length < 4) delta -= 0.5;
    if (Math.abs(delta) >= 0.75) mood = move(mood, delta);
  }

  const turnCount = candidateTurns.length;
  const atLimit = turnCount >= input.maxTurns;
  const done = mood === "satisfied" || atLimit;
  const lines = LINES[lang][done && mood !== "satisfied" ? (mood === "angry" || mood === "frustrated" ? mood : "calm") : mood];
  let reply = lines[turnCount % lines.length]!;
  if (atLimit && mood !== "satisfied") {
    reply += lang === "ar" ? " لنتوقف هنا ونعود للموضوع لاحقاً." : " Let's stop here for now and pick this up later.";
  }
  const progress = (MOODS.indexOf(mood) / (MOODS.length - 1)) * 0.9 + (mood === "satisfied" ? 0.1 : 0);
  return { reply, mood, goalProgress: Math.round(progress * 100) / 100, shouldEnd: done };
}

export function openingLine(input: { openingLine: string }): string {
  return input.openingLine;
}
