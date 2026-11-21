import type { ItemHidden } from "@/lib/assessment/item-schema";
import type { ScorerOutput } from "../prompts/scorer";
import { DOMAIN_HABITS, habitsIn } from "./signals";
import { affirms, containsAny, sentenceWith, sentences, wordCount } from "./text";

/**
 * Offline scorer, used when no language model is configured (development,
 * demos, tests) or when the model is unavailable.
 *
 * It reads the item's hidden strong indicators, red flags and embedded detail
 * and looks for them in the answer (word-start matches, with Arabic prefixes;
 * a negated red flag such as "I won't blame the supplier" does not count). On
 * top of that it credits the habits each domain rewards (reasons, trade-offs,
 * owners and dates, the other side's view, checking the facts), and it caps
 * what thin evidence can reach: no level 4 without a specific indicator, no
 * level 3 from a generic answer. Confidence never exceeds 0.75, so reports
 * built on it keep honest ranges. Every score still quotes the answer.
 *
 * Calibrated against tests/fixtures/calibration-answers.ts.
 */
export function offlineScore(input: {
  hidden: ItemHidden;
  rubricKeys: string[];
  stage: "MAIN" | "PROBE" | "TWIST" | "ROLE_PLAY_TURN";
  response: string;
}): ScorerOutput {
  const text = input.response.trim();
  const noticed = input.hidden.embeddedDetail ? Boolean(containsAny(text, input.hidden.embeddedDetail.keywords)) : false;
  if (wordCount(text) < 3) return { scores: [], embeddedDetailNoticed: false };

  const words = wordCount(text);
  const followUp = input.stage === "PROBE" || input.stage === "TWIST" || input.stage === "ROLE_PLAY_TURN";
  const hasNumbers = /\d|[٠-٩]/.test(text);
  const structured = sentences(text).length >= 4 || /^\s*([-*•]|\d+[.)])\s/m.test(text);
  const habits = habitsIn(text);

  const scores = input.rubricKeys.map((key) => {
    const domain = key.split(".")[0]!;
    const strong = input.hidden.strongIndicators.filter((s) => s.competencyKey === key);
    const red = input.hidden.redFlags.filter((s) => s.competencyKey === key);
    const strongHits = strong.filter((s) => affirms(text, s.keywords));
    const redHits = red.filter((s) => affirms(text, s.keywords));
    // Indicators written for other sub-skills still say something about care.
    const otherHits = input.hidden.strongIndicators.filter((s) => s.competencyKey !== key && affirms(text, s.keywords)).length;
    const shown = (DOMAIN_HABITS[domain] ?? ["reasons"]).filter((h) => habits.has(h));

    let level = 2.2;
    // Each further indicator adds a little less: the second and third confirm more than they add.
    strongHits.forEach((_, i) => (level += [0.85, 0.65, 0.5][i] ?? 0.4));
    level -= redHits.length * 0.9;
    level += Math.min(0.4, otherHits * 0.12);
    level += Math.min(0.6, shown.length * 0.2);
    if (noticed) level += 0.4;
    if (hasNumbers) level += 0.1;
    if (domain === "communication" && structured) level += 0.2;

    // What thin evidence can reach.
    const specific = strongHits.length > 0 || noticed;
    if (!specific) level = Math.min(level, shown.length >= 3 ? 3.4 : 2.4);
    if (redHits.length > 0 && strongHits.length === 0) level = Math.min(level, 2.2);
    if (words < 12) level = Math.min(level, 2.4);
    else if (words < 25 && !followUp) level = Math.min(level, 3.4);

    const clamped = Math.min(5, Math.max(1, Math.round(level)));
    const allKeywords = [...strongHits, ...redHits].flatMap((s) => s.keywords);
    const quote =
      (allKeywords.length && sentenceWith(text, allKeywords)) ||
      (noticed && input.hidden.embeddedDetail && sentenceWith(text, input.hidden.embeddedDetail.keywords)) ||
      sentences(text)[0]!.slice(0, 280);
    const matched = strongHits.length + redHits.length;
    return {
      competencyKey: key,
      level: clamped,
      confidence: Math.min(0.75, 0.4 + matched * 0.09 + shown.length * 0.03 + (noticed ? 0.04 : 0) + (words >= 40 ? 0.05 : 0)),
      evidenceQuote: quote,
      rationale: rationaleFor(strongHits, redHits, shown),
    };
  });
  return { scores, embeddedDetailNoticed: noticed };
}

function rationaleFor(strong: { text: string }[], red: { text: string }[], habits: string[]): string {
  const parts = [...strong.map((s) => `shows "${s.text}"`), ...red.map((s) => `watch: "${s.text}"`)];
  if (habits.length) parts.push(`habits seen: ${habits.join(", ")}`);
  return parts.length
    ? `Offline scoring: ${parts.join("; ")}.`
    : "Offline scoring: no specific indicator found; level reflects general care in the answer.";
}
