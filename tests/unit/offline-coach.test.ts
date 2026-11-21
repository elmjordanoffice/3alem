import { describe, expect, it } from "vitest";
import { offlineCoach, selfViewGaps } from "@/lib/grow/offline-coach";
import type { ReportContent } from "@/lib/hire/report-types";

const report = {
  domains: [
    { key: "judgment", name: "Judgment", estimate: 2.4, range: [2, 2.8] },
    { key: "collaboration", name: "Collaboration", estimate: 4.1, range: [3.7, 4.5] },
  ],
  evidence: { e1: { id: "e1", quote: "I'd ask what matters most to them before proposing anything." } },
  narrative: {
    strengths: [{ skillKey: "collaboration.empathy", headline: "Reads people well", explanation: "", evidenceIds: ["e1"] }],
    developmentAreas: [{ skillKey: "judgment.trade-off-reasoning", headline: "Naming trade-offs", explanation: "Choices rarely say what they cost.", evidenceIds: [] }],
    hiddenPotential: [],
    plan: [
      { skillKey: "judgment.trade-off-reasoning", why: "", practice: [], days30: "", days60: "", days90: "", resources: [] },
      { skillKey: "communication.clarity", why: "", practice: [], days30: "", days60: "", days90: "", resources: [] },
    ],
  },
} as unknown as ReportContent;

const now = new Date("2026-11-21T12:00:00Z");
const day = (n: number) => new Date(now.getTime() - n * 86_400_000);
const base = { report, locale: "en" as const, hours: 2, selfView: { judgment: 4, collaboration: 3 }, practice: [], now };

describe("offline coach", () => {
  it("finds blind spots and hidden strengths against the evidence", () => {
    const { blind, hidden } = selfViewGaps({ judgment: 4, collaboration: 3 }, report);
    expect(blind?.key).toBe("judgment");
    expect(hidden?.key).toBe("collaboration");
    const r = offlineCoach({ ...base, text: "Do I have any blind spots?" });
    expect(r.reply).toMatch(/rated yourself higher in decision-making/i);
    expect(r.reply).toMatch(/stronger than you think/);
  });

  it("prepares interviews from strengths, in their own words", () => {
    const r = offlineCoach({ ...base, text: "I have an interview next week, how should I prepare?" });
    expect(r.reply).toMatch(/reads people well/i);
    expect(r.reply).toContain("what matters most to them");
    expect(r.suggestedSkills).toEqual(["collaboration.empathy"]);
  });

  it("measures progress from practice", () => {
    const practice = [
      { skillKeys: ["judgment.trade-off-reasoning"], completedAt: day(6), scores: [{ competencyKey: "judgment.trade-off-reasoning", level: 2 }] },
      { skillKeys: ["judgment.trade-off-reasoning"], completedAt: day(1), scores: [{ competencyKey: "judgment.trade-off-reasoning", level: 4 }] },
    ];
    const r = offlineCoach({ ...base, practice, text: "Am I making progress?" });
    expect(r.reply).toMatch(/2 sessions/);
    expect(r.reply).toMatch(/from level 2 to 4/);
  });

  it("answers a situation with that skill's habits", () => {
    const r = offlineCoach({ ...base, text: "I have a conflict with a colleague about deadlines" });
    expect(r.reply).toMatch(/collaboration/i);
    expect(r.suggestedSkills.length).toBe(1);
  });

  it("speaks Arabic", () => {
    const r = offlineCoach({ ...base, locale: "ar", text: "عندي مقابلة الأسبوع القادم" });
    expect(r.reply).toContain("ابدأ بما تُظهره الأدلة");
  });

  it("is honest without a baseline", () => {
    expect(offlineCoach({ ...base, report: null, text: "hi" }).reply).toMatch(/don't have an assessment/);
  });
});

describe("offline coach: the starter prompts land on the right answer", () => {
  const cases: [string, "en" | "ar", RegExp][] = [
    ["How am I doing?", "en", /haven't finished a practice session/],
    ["Do I have any blind spots?", "en", /rated yourself higher/],
    ["Help me prepare for an interview", "en", /Lead with what the evidence shows/],
    ["What should I focus on first?", "en", /^Today:/],
    ["ما مدى تقدّمي؟", "ar", /لم تُكمل أي جلسة تدريب/],
    ["هل لدي نقاط عمياء؟", "ar", /قيّمت نفسك/],
    ["ساعدني في الاستعداد لمقابلة", "ar", /ابدأ بما تُظهره الأدلة/],
    ["ما الذي ينبغي أن أركّز عليه أولًا؟", "ar", /^اليوم:/],
    ["ضع لي خطة تدريب لهذا الأسبوع", "ar", /هذا الأسبوع/],
  ];
  for (const [text, locale, re] of cases) {
    it(text, () => expect(offlineCoach({ ...base, locale, text }).reply).toMatch(re));
  }
});

it("doesn't mistake 'weekly' for a question about the week", () => {
  const r = offlineCoach({ ...base, text: "I have a conflict with a colleague about who owns the weekly report" });
  expect(r.reply).toMatch(/collaboration/i);
});
