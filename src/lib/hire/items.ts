import "server-only";
import { itemContentSchema, itemHiddenSchema, type BankItem, type ItemContent, type ItemHidden, type ItemType } from "@/lib/assessment/item-schema";
import type { World } from "@/lib/assessment/world-schema";
import type { Target } from "@/lib/engine";
import { bankContent, resolveBankItem, fillTokens } from "@/lib/itembank/resolve";
import { BANK } from "@/lib/itembank";
import { itemGenerator } from "@/lib/ai/prompts/item-generator";
import { guessabilityChecker, GUESSABILITY_REJECT_AT } from "@/lib/ai/prompts/guessability";
import { anchorsFor } from "@/lib/ai/prompts/shared";
import { getProvider, runAgent, type AgentContext } from "@/lib/ai/run";

export interface PreparedItem {
  type: ItemType;
  difficulty: number;
  targets: string[];
  content: ItemContent;
  hidden: ItemHidden;
  promptVersion: string;
  guessability: { status: "NOT_REQUIRED" | "PASSED" | "FAILED"; result?: unknown };
  meta: ItemMeta;
}

export interface ItemMeta {
  purpose: Target["purpose"];
  hypothesisId?: string;
  timed: boolean;
  minutes: number;
  bankId?: string;
  reason: string;
  requested: { skills: string[]; itemType: ItemType; difficulty: number };
}

export interface PrepareContext {
  world: World;
  locale: "en" | "ar";
  roleFamily: string | null;
  roleSummary: string;
  chapter: { number: number; title: string; summary: string };
  history: string[];
  usedBankIds: Set<string>;
  technicalAnchors: Record<string, { name: string; anchors: string[] }>;
  ctx: AgentContext;
}

/** A curated item for the target, with the world's names filled in. */
export function prepareFromBank(target: Target, pc: PrepareContext): PreparedItem | null {
  const item = resolveBankItem(target, { usedIds: pc.usedBankIds, roleFamily: pc.roleFamily });
  if (!item) return null;
  return fromBank(item, target, pc);
}

export function fromBank(item: BankItem, target: Target, pc: PrepareContext): PreparedItem {
  const content = bankContent(item, pc.world, pc.locale);
  const hidden = fillTokens(item.hidden[pc.locale] ?? item.hidden.en, pc.world, pc.locale);
  return {
    type: item.type,
    difficulty: item.difficulty,
    targets: item.targets,
    content,
    hidden,
    promptVersion: `bank:${item.id}`,
    // Curated items are reviewed by people, including for guessability.
    guessability: { status: item.content.en.task.kind === "choice" ? "PASSED" : "NOT_REQUIRED", result: { reviewed: true } },
    meta: {
      purpose: target.purpose,
      hypothesisId: target.hypothesisId,
      timed: target.timed || item.dials.timePressure >= 4 || Boolean(content.timeLimitSeconds),
      minutes: item.minutes,
      bankId: item.id,
      reason: target.reason,
      requested: { skills: target.skills, itemType: target.itemType, difficulty: target.difficulty },
    },
  };
}

/**
 * Generate a fresh item with Claude: Item Generator → Guessability Checker
 * (choices only; one regeneration if the top option is obvious). Falls back
 * to the curated bank on any failure, so a session never stalls.
 */
export async function prepareItem(target: Target, pc: PrepareContext): Promise<PreparedItem | null> {
  if (!getProvider() || target.itemType === "FORCED_CHOICE_WORK_STYLE") return prepareFromBank(target, pc);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { output } = await runAgent(
        itemGenerator,
        {
          targets: target.skills,
          difficulty: target.difficulty,
          dials: target.dials,
          itemType: target.itemType,
          timed: target.timed,
          language: pc.locale,
          world: pc.world,
          chapter: pc.chapter,
          history: pc.history.slice(-6),
          roleSummary: pc.roleSummary,
          anchors: anchorsFor(target.skills, pc.technicalAnchors),
          avoidTypes: target.avoidTypes,
        },
        pc.ctx,
      );
      const content = itemContentSchema.parse(output.content);
      const hidden = itemHiddenSchema.parse(output.hidden);
      const rubricKeys = new Set(hidden.rubric.map((r) => r.competencyKey));
      const targets = target.skills.filter((k) => rubricKeys.has(k));
      if (targets.length === 0) throw new Error("Generated rubric covers none of the targets");

      let guessability: PreparedItem["guessability"] = { status: "NOT_REQUIRED" };
      if (content.task.kind === "choice" && content.task.options?.length) {
        const { output: g } = await runAgent(
          guessabilityChecker,
          { scenario: content.scenario, prompt: content.task.prompt, options: content.task.options },
          pc.ctx,
        );
        if (g.pickedOptionId !== "none" && g.confidence >= GUESSABILITY_REJECT_AT) {
          guessability = { status: "FAILED", result: g };
          continue; // regenerate
        }
        guessability = { status: "PASSED", result: g };
      }

      return {
        type: target.itemType,
        difficulty: target.difficulty,
        targets,
        content,
        hidden,
        promptVersion: itemGenerator.version,
        guessability,
        meta: {
          purpose: target.purpose,
          hypothesisId: target.hypothesisId,
          timed: target.timed || Boolean(content.timeLimitSeconds),
          minutes: target.estMinutes,
          reason: target.reason,
          requested: { skills: target.skills, itemType: target.itemType, difficulty: target.difficulty },
        },
      };
    } catch (e) {
      console.warn(`[items] generation attempt ${attempt + 1} failed`, e);
    }
  }
  return prepareFromBank(target, pc);
}

/** Bank ids already used in this session. */
export function usedBankIds(items: { promptVersion: string }[]): Set<string> {
  return new Set(items.map((i) => i.promptVersion).filter((v) => v.startsWith("bank:")).map((v) => v.slice(5)));
}

export function bankItemById(id: string) {
  return BANK.find((b) => b.id === id) ?? null;
}

/** Sub-skills a stage of an item can show. */
export function rubricKeysForStage(stage: "MAIN" | "PROBE" | "TWIST" | "ROLE_PLAY_TURN", targets: string[], hidden: ItemHidden): string[] {
  const rubric = hidden.rubric.map((r) => r.competencyKey);
  const pick = (keys: string[]) => [...new Set(keys)];
  if (stage === "PROBE") return pick(hidden.probeTargets?.length ? hidden.probeTargets : targets.slice(0, 2));
  if (stage === "TWIST") return pick(hidden.twistTargets?.length ? hidden.twistTargets : [targets[0]!, "adaptability.handling-new-information"]);
  return pick(targets.length ? targets : rubric);
}
