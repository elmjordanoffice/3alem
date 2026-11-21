import type { BankItem, ItemContent, CastSlot } from "@/lib/assessment/item-schema";
import type { World } from "@/lib/assessment/world-schema";
import type { Target } from "@/lib/engine/types";
import { BANK } from "./index";

/**
 * Find the curated item that best matches a target: shared sub-skills
 * (primary counts double), the requested format, the requested difficulty and,
 * for technical tasks, the role family. Items already used are excluded.
 */
export function resolveBankItem(
  target: Pick<Target, "skills" | "itemType" | "difficulty" | "timed">,
  opts: { usedIds: Set<string>; roleFamily?: string | null; bank?: BankItem[] },
): BankItem | null {
  const bank = opts.bank ?? BANK;
  const [primary, ...rest] = target.skills;
  let best: { item: BankItem; score: number } | null = null;
  for (const item of bank) {
    if (opts.usedIds.has(item.id)) continue;
    if (item.type === "FORCED_CHOICE_WORK_STYLE" && target.itemType !== "FORCED_CHOICE_WORK_STYLE") continue;
    if (target.itemType === "FORCED_CHOICE_WORK_STYLE" && item.type !== "FORCED_CHOICE_WORK_STYLE") continue;
    if (item.type === "TECHNICAL_TASK" && opts.roleFamily && item.roleFamilies.length && !item.roleFamilies.includes(opts.roleFamily)) {
      // A technical task from another profession is never a fair work sample.
      continue;
    }
    const targets = new Set(item.targets);
    let score = 0;
    if (primary && targets.has(primary)) score += 6;
    else if (primary && item.targets.some((t) => t.split(".")[0] === primary.split(".")[0])) score += 2;
    for (const k of rest) if (targets.has(k)) score += 3;
    if (item.type === target.itemType) score += 4;
    score -= Math.abs(item.difficulty - target.difficulty) * 1.5;
    if (target.timed && item.dials.timePressure >= 4) score += 1;
    if (opts.roleFamily && item.roleFamilies.includes(opts.roleFamily)) score += 2;
    // Another profession's setting is a last resort: usable, but generic items come first.
    else if (opts.roleFamily && item.roleFamilies.length) score -= 5;
    if (!best || score > best.score || (score === best.score && item.id < best.item.id)) best = { item, score };
  }
  return best?.item ?? null;
}

const TOKEN = /\{\{\s*(company|you|manager|report1|report2|peer|client|exec|specialist)(\.role)?\s*\}\}/g;

/** Replace cast tokens with the session world's people. */
export function fillTokens<T>(value: T, world: World, locale: "en" | "ar"): T {
  const cast = new Map(world.cast.map((c) => [c.slot, c]));
  const you = locale === "ar" ? "أنت" : "you";
  const replace = (s: string) =>
    s.replace(TOKEN, (_m, slot: string, role?: string) => {
      if (slot === "company") return world.companyName;
      if (slot === "you") return role ? world.yourRole : you;
      const member = cast.get(slot as CastSlot);
      if (!member) return slot;
      return role ? member.role : member.name;
    });
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return replace(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(value) as T;
}

/** The candidate-visible content of a bank item, in the session's language, with names filled in. */
export function bankContent(item: BankItem, world: World, locale: "en" | "ar"): ItemContent {
  return fillTokens(item.content[locale] ?? item.content.en, world, locale);
}
