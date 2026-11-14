import "server-only";
import type { World } from "@/lib/assessment/world-schema";
import { worldSchema } from "@/lib/assessment/world-schema";
import { WORLDS } from "@/lib/itembank";
import { worldBuilder } from "@/lib/ai/prompts/world-builder";
import { getProvider, runAgent, type AgentContext } from "@/lib/ai/run";
import { normalize } from "@/lib/ai/offline/text";

/** Pick the curated world that best matches the role's industry. */
export function curatedWorld(industryText: string, locale: "en" | "ar"): { id: string; world: World } {
  const t = normalize(industryText);
  let best = WORLDS[0]!;
  let hits = -1;
  for (const w of WORLDS) {
    const n = w.industryKeywords.filter((k) => t.includes(normalize(k))).length;
    if (n > hits) {
      best = w;
      hits = n;
    }
  }
  return { id: best.id, world: best[locale] };
}

export async function buildWorld(opts: {
  industry: string;
  industryKeywords: string[];
  roleTitle: string;
  roleSummary: string;
  roleLanguage: "en" | "ar";
  locale: "en" | "ar";
  ctx: AgentContext;
}): Promise<{ world: World; source: string }> {
  const curated = curatedWorld([opts.industry, ...opts.industryKeywords, opts.roleTitle].join(" "), opts.locale);
  const withRole = (w: World): World => ({ ...w, yourRole: opts.roleLanguage === opts.locale ? opts.roleTitle : w.yourRole });
  if (getProvider()) {
    try {
      const { output } = await runAgent(
        worldBuilder,
        { roleTitle: opts.roleTitle, roleSummary: opts.roleSummary, industry: opts.industry, language: opts.locale },
        opts.ctx,
      );
      return { world: worldSchema.parse(output), source: worldBuilder.version };
    } catch (e) {
      console.warn("[world] generation failed; using curated world", e);
    }
  }
  return { world: withRole(curated.world), source: `bank:${curated.id}` };
}
