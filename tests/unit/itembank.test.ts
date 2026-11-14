import { describe, expect, it } from "vitest";
import { bankItemSchema, PRODUCTION_TYPES, ITEM_TYPES } from "@/lib/assessment/item-schema";
import { bankWorldSchema } from "@/lib/assessment/world-schema";
import { BANK, WORLDS } from "@/lib/itembank";
import { DOMAINS } from "@/lib/framework/data";

const SUB_SKILLS = new Set(DOMAINS.flatMap((d) => d.subSkills.map((s) => s.key)));
const TOKENS = /\{\{\s*(company|you|manager|report1|report2|peer|client|exec|specialist)(\.role)?\s*\}\}/g;
const ANY_TOKEN = /\{\{[^}]*\}\}/g;

function allStrings(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => allStrings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => allStrings(x, out));
  return out;
}

describe("curated item bank", () => {
  it("has items", () => {
    expect(BANK.length).toBeGreaterThan(0);
  });

  it("validates every item against the schema", () => {
    for (const item of BANK) {
      const r = bankItemSchema.safeParse(item);
      expect(r.success, `${item.id}: ${r.success ? "" : JSON.stringify(r.error.issues.slice(0, 3))}`).toBe(true);
    }
  });

  it("uses unique ids", () => {
    const ids = BANK.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references only real sub-skills", () => {
    for (const item of BANK) {
      const keys = [
        ...item.targets,
        ...item.hidden.en.rubric.map((r) => r.competencyKey),
        ...item.hidden.en.strongIndicators.map((s) => s.competencyKey),
        ...item.hidden.en.redFlags.map((s) => s.competencyKey),
        ...(item.hidden.en.probeTargets ?? []),
        ...(item.hidden.en.twistTargets ?? []),
      ];
      for (const k of keys) {
        if (item.type === "FORCED_CHOICE_WORK_STYLE" && k.startsWith("workstyle.")) continue;
        expect(SUB_SKILLS.has(k), `${item.id}: unknown sub-skill ${k}`).toBe(true);
      }
    }
  });

  it("has a rubric for every target", () => {
    for (const item of BANK) {
      if (item.type === "FORCED_CHOICE_WORK_STYLE") continue;
      const rubricKeys = new Set(item.hidden.en.rubric.map((r) => r.competencyKey));
      for (const t of item.targets) expect(rubricKeys.has(t), `${item.id}: no rubric for ${t}`).toBe(true);
    }
  });

  it("gives the right task payload for each kind", () => {
    for (const item of BANK) {
      for (const lang of ["en", "ar"] as const) {
        const t = item.content[lang].task;
        const need = { choice: t.options, ranking: t.rankItems, allocation: t.allocation, written: t.written, inbox: t.inbox, roleplay: t.roleplay, design: t.design, chain: t.chain, forced_choice: t.forcedChoice }[t.kind];
        expect(need, `${item.id} (${lang}): task.kind ${t.kind} has no payload`).toBeDefined();
      }
      if (item.content.en.task.kind === "choice") {
        expect(item.content.en.task.options!.length).toBeGreaterThanOrEqual(3);
        expect(item.hidden.en.optionNotes?.length, `${item.id}: every option needs a note`).toBe(item.content.en.task.options!.length);
      }
      if (item.type === "ROLE_PLAY") expect(item.hidden.en.roleplayBrief, item.id).toBeDefined();
    }
  });

  it("keeps English and Arabic structurally aligned", () => {
    for (const item of BANK) {
      const en = item.content.en;
      const ar = item.content.ar;
      expect(ar.task.kind).toBe(en.task.kind);
      expect(ar.materials.map((m) => m.kind)).toEqual(en.materials.map((m) => m.kind));
      expect(ar.task.options?.map((o) => o.id)).toEqual(en.task.options?.map((o) => o.id));
      expect(ar.task.rankItems?.map((o) => o.id)).toEqual(en.task.rankItems?.map((o) => o.id));
      expect(Boolean(ar.probe)).toBe(Boolean(en.probe));
      expect(Boolean(ar.twist)).toBe(Boolean(en.twist));
    }
  });

  it("uses only known cast tokens", () => {
    for (const item of BANK) {
      for (const s of allStrings(item.content)) {
        const all = s.match(ANY_TOKEN) ?? [];
        const ok = s.match(TOKENS) ?? [];
        expect(all.length, `${item.id}: bad token in "${s.slice(0, 80)}"`).toBe(ok.length);
      }
    }
  });

  it("keeps scenarios short", () => {
    for (const item of BANK) {
      const words = item.content.en.scenario.split(/\s+/).length;
      expect(words, `${item.id}: scenario has ${words} words`).toBeLessThanOrEqual(190);
    }
  });

  it("covers every item type and most sub-skills", () => {
    const types = new Set(BANK.map((i) => i.type));
    for (const t of ITEM_TYPES) expect(types.has(t), `no ${t} items`).toBe(true);
    const covered = new Set(BANK.flatMap((i) => i.targets));
    const nonTechnical = [...SUB_SKILLS].filter((k) => !k.startsWith("technical."));
    const missing = nonTechnical.filter((k) => !covered.has(k));
    expect(missing, `uncovered: ${missing.join(", ")}`).toEqual([]);
  });

  it("is mostly production tasks", () => {
    const production = BANK.filter((i) => PRODUCTION_TYPES.includes(i.type)).length;
    expect(production / BANK.length).toBeGreaterThanOrEqual(0.6);
  });
});

describe("curated worlds", () => {
  it("validates every world", () => {
    expect(WORLDS.length).toBeGreaterThanOrEqual(1);
    for (const w of WORLDS) {
      const r = bankWorldSchema.safeParse(w);
      expect(r.success, `${w.id}: ${r.success ? "" : JSON.stringify(r.error.issues.slice(0, 3))}`).toBe(true);
    }
  });
});
