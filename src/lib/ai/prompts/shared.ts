import { DOMAINS } from "@/lib/framework/data";

export const DOMAIN_KEYS = DOMAINS.map((d) => d.key) as [string, ...string[]];

export const LANGUAGE_NAME = { en: "English", ar: "Modern Standard Arabic" } as const;

/** The question-design rules every generated item must follow (from the product brief). */
export const QUESTION_DESIGN_RULES = `QUESTION DESIGN RULES. The golden rule: test whether the person can PRODUCE good behaviour, not whether they can RECOGNISE it.
1. No socially obvious options. Every option in a choice must be defensible and carry a real cost. If a savvy non-expert could spot the top option by social desirability, the item fails.
2. Prefer production: the person writes, ranks, allocates, drafts, designs or talks.
3. Every choice gets a probe: "Why?", "What do you do first?", "What would change your mind?"
4. Twist after the answer: change ONE constraint and see whether they adapt or rigidly defend.
5. Consequences carry forward: use the candidate's earlier decisions when they are given.
6. Multi-trait: one scenario measures several skills; never name or hint at the skills measured.
7. Disguised repetition: when a skill was tested before, use a context that looks different.
8. Embed one critical detail in the materials (an email footnote, an outlier in a table, a date that conflicts). Noticing it is scored.
9. Fair and job-relevant: no trick questions; everything needed to answer is provided.
10. Culturally neutral: no idioms, no culture-specific references, names from many backgrounds.`;

/** Compact framework reference for prompts: domain → sub-skill keys with names. */
export function frameworkReference(): string {
  return DOMAINS.map((d) => `${d.key}: ${d.subSkills.map((s) => `${s.key} (${s.name.en})`).join("; ")}`).join("\n");
}

/** Level anchors for the given sub-skill keys, for scorers and generators. */
export function anchorsFor(keys: string[], extra: Record<string, { name: string; anchors: string[] }> = {}): string {
  const out: string[] = [];
  for (const key of keys) {
    const fromExtra = extra[key];
    if (fromExtra) {
      out.push(`${key} — ${fromExtra.name}\n${fromExtra.anchors.map((a, i) => `  ${i + 1}: ${a}`).join("\n")}`);
      continue;
    }
    for (const d of DOMAINS) {
      const s = d.subSkills.find((x) => x.key === key);
      if (s) out.push(`${key} — ${s.name.en}: ${s.description.en}\n${[1, 2, 3, 4, 5].map((l) => `  ${l}: ${s.anchors[l as 1].en}`).join("\n")}`);
    }
  }
  return out.join("\n\n");
}
