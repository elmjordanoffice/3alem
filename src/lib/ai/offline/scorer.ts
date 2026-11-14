import type { ItemHidden } from "@/lib/assessment/item-schema";
import type { ScorerOutput } from "../prompts/scorer";
import { containsAny, sentenceWith, sentences, wordCount } from "./text";

/**
 * Offline scorer, used when no language model is configured (development,
 * demos, tests) or when the model is unavailable. It reads the item's hidden
 * strong indicators, red flags and embedded detail and looks for them in the
 * answer. It is deliberately conservative: confidence never exceeds 0.75, so
 * reports built on it show wide ranges. Every score still quotes the answer.
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
  const hasNumbers = /\d|[٠-٩]/.test(text);
  const structured = sentences(text).length >= 3 || /^\s*([-*•]|\d+[.)])\s/m.test(text);

  const scores = input.rubricKeys.map((key) => {
    const strong = input.hidden.strongIndicators.filter((s) => s.competencyKey === key);
    const red = input.hidden.redFlags.filter((s) => s.competencyKey === key);
    const strongHits = strong.filter((s) => containsAny(text, s.keywords));
    const redHits = red.filter((s) => containsAny(text, s.keywords));
    // Indicators written for other sub-skills still say something about care.
    const otherHits = input.hidden.strongIndicators.filter((s) => s.competencyKey !== key && containsAny(text, s.keywords)).length;

    let level = 2.4;
    level += strongHits.length * 0.85;
    level -= redHits.length * 0.9;
    level += Math.min(0.5, otherHits * 0.15);
    if (noticed) level += 0.4;
    if (hasNumbers) level += 0.15;
    if (key.startsWith("communication.") && structured) level += 0.3;
    if (words < 12) level = Math.min(level, 2.5); // too little to show more

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
      confidence: Math.min(0.75, 0.42 + matched * 0.1 + (words >= 40 ? 0.05 : 0)),
      evidenceQuote: quote,
      rationale:
        matched > 0
          ? `Offline scoring: ${strongHits.map((s) => `shows "${s.text}"`).concat(redHits.map((s) => `watch: "${s.text}"`)).join("; ")}.`
          : "Offline scoring: no specific indicator found; level reflects general care in the answer.",
    };
  });
  return { scores, embeddedDetailNoticed: noticed };
}
