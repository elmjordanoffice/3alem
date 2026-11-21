import { describe, expect, it } from "vitest";
import { DOMAINS } from "@/lib/framework/data";
import {
  INTERVIEW_GUIDE,
  guideFor,
  type InterviewGuideEntry,
} from "@/lib/framework/interview-guide";

const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

const domainKeys = DOMAINS.map((d) => d.key);
const subSkillKeys = DOMAINS.flatMap((d) => d.subSkills.map((s) => s.key));
const frameworkKeys = [...domainKeys, ...subSkillKeys];

type Pair = { en: string; ar: string };
type Field = { key: string; field: string; kind: "question" | "signal"; text: Pair };

function fieldsOf(key: string, e: InterviewGuideEntry): Field[] {
  return [
    { key, field: "question", kind: "question", text: e.question },
    { key, field: "situational", kind: "question", text: e.situational },
    ...e.followUps.map((text, i) => ({
      key,
      field: `followUps[${i}]`,
      kind: "question" as const,
      text,
    })),
    ...e.listenFor.map((text, i) => ({
      key,
      field: `listenFor[${i}]`,
      kind: "signal" as const,
      text,
    })),
    ...e.watchFor.map((text, i) => ({
      key,
      field: `watchFor[${i}]`,
      kind: "signal" as const,
      text,
    })),
  ];
}

const allFields = Object.entries(INTERVIEW_GUIDE).flatMap(([key, e]) => fieldsOf(key, e));
const words = (s: string) => s.trim().split(/\s+/).length;

describe("interview guide", () => {
  it("has an entry for every domain and sub-skill in the framework", () => {
    const missing = frameworkKeys.filter((k) => !Object.hasOwn(INTERVIEW_GUIDE, k));
    expect(missing).toEqual([]);
  });

  it("has no entries for keys that are not in the framework", () => {
    const extra = Object.keys(INTERVIEW_GUIDE).filter((k) => !frameworkKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it("has the expected shape: 2 follow-ups, 3 listen-for and 2 watch-for signals", () => {
    for (const e of Object.values(INTERVIEW_GUIDE)) {
      expect(e.followUps).toHaveLength(2);
      expect(e.listenFor).toHaveLength(3);
      expect(e.watchFor).toHaveLength(2);
    }
  });

  it("fills every string in both languages", () => {
    const empty = allFields
      .filter((f) => !f.text.en?.trim() || !f.text.ar?.trim())
      .map((f) => `${f.key} ${f.field}`);
    expect(empty).toEqual([]);
  });

  it("writes Arabic strings in Arabic script and English strings without it", () => {
    const noArabic = allFields
      .filter((f) => !ARABIC.test(f.text.ar))
      .map((f) => `${f.key} ${f.field}`);
    const arabicInEnglish = allFields
      .filter((f) => ARABIC.test(f.text.en))
      .map((f) => `${f.key} ${f.field}`);
    expect(noArabic).toEqual([]);
    expect(arabicInEnglish).toEqual([]);
  });

  it("uses Arabic punctuation in Arabic strings", () => {
    const latinPunct = allFields
      .filter((f) => /[?,;]/.test(f.text.ar))
      .map((f) => `${f.key} ${f.field}`);
    expect(latinPunct).toEqual([]);
  });

  it("does not repeat a question anywhere in the guide", () => {
    for (const lang of ["en", "ar"] as const) {
      const seen = new Map<string, string>();
      const dupes: string[] = [];
      for (const f of allFields.filter((x) => x.kind === "question")) {
        const norm = f.text[lang].trim().toLowerCase();
        const prev = seen.get(norm);
        if (prev) dupes.push(`${lang}: ${prev} = ${f.key} ${f.field}`);
        else seen.set(norm, `${f.key} ${f.field}`);
      }
      expect(dupes).toEqual([]);
    }
  });

  it("keeps questions to 30 words and signals to 15 words", () => {
    const tooLong = allFields
      .filter((f) => {
        const max = f.kind === "question" ? 30 : 15;
        return words(f.text.en) > max || words(f.text.ar) > max;
      })
      .map((f) => `${f.key} ${f.field}`);
    expect(tooLong).toEqual([]);
  });

  it("asks about a real past situation in `question` and a hypothetical one in `situational`", () => {
    for (const [key, e] of Object.entries(INTERVIEW_GUIDE)) {
      expect(e.question.en, key).not.toMatch(/^(imagine|suppose|what would you)/i);
      expect(e.question.ar, key).not.toMatch(/^(لنفترض|تخيّل|تخيل|افترض)/);
      expect(e.situational.en, key).toMatch(/^Imagine\b/);
      expect(e.situational.ar, key).toMatch(/^لنفترض/);
    }
  });

  it("guideFor returns the entry for known keys", () => {
    expect(guideFor("judgment")).toBe(INTERVIEW_GUIDE.judgment);
    expect(guideFor("judgment.knowing-when-to-escalate")).toBe(
      INTERVIEW_GUIDE["judgment.knowing-when-to-escalate"],
    );
  });

  it("guideFor returns null for unknown keys", () => {
    expect(guideFor("")).toBeNull();
    expect(guideFor("not-a-skill")).toBeNull();
    expect(guideFor("judgment.not-a-skill")).toBeNull();
    expect(guideFor("constructor")).toBeNull();
    expect(guideFor("toString")).toBeNull();
    expect(guideFor("__proto__")).toBeNull();
  });
});
