/**
 * AI smoke test: run the real model on a few representative calls before
 * launch, and see quality, speed and cost.
 *
 *   ANTHROPIC_API_KEY=... npm run ai:smoke
 *
 * It analyses an English and an Arabic job description, then scores three
 * answers to one bank scenario (a strong one, a weak one and an Arabic one)
 * and checks that every evidence quote is the candidate's own words. Each
 * call is logged to ai_call_log like any other, and counts towards the
 * monthly budget. Expect a few US cents in total.
 *
 * Exit code 1 if any check fails, so it can gate a release.
 */
import { getProvider, runAgent } from "@/lib/ai/run";
import { costUsd } from "@/lib/ai/anthropic";
import { scorer, type ScorerInput } from "@/lib/ai/prompts/scorer";
import { analyzeJobDescription } from "@/lib/hire/jd";
import { BANK } from "@/lib/itembank";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Set ANTHROPIC_API_KEY first (and DATABASE_URL, so calls are logged).");
  process.exit(1);
}
if (!getProvider()) {
  console.error("The model provider is off (AI_PROVIDER=offline?).");
  process.exit(1);
}

type Row = { check: string; ok: boolean; ms: number; usd: number; note: string };
const rows: Row[] = [];
const t0 = () => Date.now();

// 1. Job descriptions, in both languages.
const JD_EN = `Operations Team Lead, Riyadh distribution centre. You will lead 12 pickers and packers across two shifts, plan staffing against daily order forecasts, improve on-time dispatch (currently 88%), and work with transport partners on cut-off times. You have 4+ years in warehouse operations, 1+ year leading a team, and are comfortable with spreadsheets and a WMS.`;
const JD_AR = `قائد فريق العمليات في مركز التوزيع. تقود فريقًا من 12 موظف تجهيز وتغليف على ورديتين، وتخطط للتوظيف وفق توقعات الطلبات اليومية، وتحسّن نسبة الشحن في الموعد (88٪ حاليًا)، وتنسّق مع شركاء النقل في مواعيد الإغلاق. لديك خبرة لا تقل عن 4 سنوات في عمليات المستودعات وسنة في قيادة فريق.`;
for (const [label, jd] of [["Job description (English)", JD_EN], ["Job description (Arabic)", JD_AR]] as const) {
  const s = t0();
  try {
    const { analysis, technicalSkills } = await analyzeJobDescription(jd, {});
    const ok = Boolean(analysis.roleTitle) && technicalSkills.length > 0;
    rows.push({ check: label, ok, ms: Date.now() - s, usd: 0, note: `${analysis.roleTitle} · ${analysis.roleFamily} · ${technicalSkills.length} technical skills` });
  } catch (e) {
    rows.push({ check: label, ok: false, ms: Date.now() - s, usd: 0, note: String(e) });
  }
}

// 2. Scoring, on one bank scenario.
const item = BANK.find((b) => b.id === "dil-01-billing-double-charge")!;
const fill = (t: string) => t.replace(/\{\{(\w+)(\.role)?\}\}/g, (_, n: string, r?: string) => (r ? "Team lead" : ({ client: "Qamar Retail", report1: "Leila", manager: "Omar", you: "you" } as Record<string, string>)[n] ?? n));
const inputFor = (lang: "en" | "ar", response: string): ScorerInput => {
  const c = item.content[lang];
  const h = (item.hidden[lang] ?? item.hidden.en)!;
  const keys = item.targets;
  return {
    itemText: fill([`Title: ${c.title}`, `Scenario: ${c.scenario}`, `Task: ${c.task.prompt}`, c.task.options ? `Options: ${c.task.options.map((o) => `${o.id}) ${o.label}`).join(" | ")}` : ""].join("\n")),
    stage: "MAIN",
    rubric: h.rubric.filter((r) => keys.includes(r.competencyKey)).map((r) => ({ competencyKey: r.competencyKey, anchors: r.anchors.map(fill) })),
    strongIndicators: h.strongIndicators.filter((s) => keys.includes(s.competencyKey)).map((s) => fill(s.text)),
    redFlags: h.redFlags.filter((s) => keys.includes(s.competencyKey)).map((s) => fill(s.text)),
    embeddedDetail: h.embeddedDetail ? `${h.embeddedDetail.description} (${h.embeddedDetail.location})` : null,
    communicationKeys: [],
    response,
  } as ScorerInput;
};
const answers: { label: string; lang: "en" | "ar"; text: string; expect: "high" | "low" }[] = [
  {
    label: "Strong answer (English)",
    lang: "en",
    expect: "high",
    text: "I'd pick b. At 1 in 2,000 and 48,000 transactions on day 1 that's about 24 double charges on launch day and roughly 100 in the first week, all visible to customers. The partial fix cuts that to around 30. I'll tell Qamar Retail myself today, even though sales made the promise, and agree a daily reconciliation owner (Leila's team) until the full fix ships on day 9. If duplicates exceed 5 a day after launch, we pause the promotion.",
  },
  { label: "Weak answer (English)", lang: "en", expect: "low", text: "Launch on time. One in two thousand is basically nothing and sales already promised the date, so it's their call really." },
  {
    label: "Strong answer (Arabic)",
    lang: "ar",
    expect: "high",
    text: "أختار التأجيل يومين. معدل 1 من 2000 مع 48 ألف عملية في اليوم الأول يعني نحو 24 خصمًا مزدوجًا يراه العملاء، ونحو 100 في الأسبوع الأول. سأبلغ العميل بنفسي اليوم رغم أن فريق المبيعات هو من وعد بالموعد، وأكلّف فريق ليلى بمراجعة يومية لعكس أي خصم مكرر حتى يُطلق الإصلاح الكامل.",
  },
];
for (const a of answers) {
  const s = t0();
  try {
    const { output, meta } = await runAgent(scorer, inputFor(a.lang, a.text), {});
    const quotesOk = output.scores.every((sc) => !sc.evidenceQuote || a.text.includes(sc.evidenceQuote.replace(/^…|…$/g, "").trim().slice(0, 40)));
    const mean = output.scores.reduce((x, sc) => x + sc.level, 0) / Math.max(1, output.scores.length);
    const levelOk = a.expect === "high" ? mean >= 3 : mean <= 2.5;
    rows.push({ check: a.label, ok: quotesOk && levelOk, ms: Date.now() - s, usd: costUsd(meta), note: `${output.scores.map((sc) => `${sc.competencyKey.split(".")[1]} ${sc.level}`).join(", ")}${quotesOk ? "" : " · a quote is not in the answer"}${levelOk ? "" : ` · mean ${mean.toFixed(1)} is not ${a.expect}`}` });
  } catch (e) {
    rows.push({ check: a.label, ok: false, ms: Date.now() - s, usd: 0, note: String(e) });
  }
}

// 3. Report.
const pad = (s: string, n: number) => (s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length));
console.log(`\nModel: ${getProvider()!.model}\n`);
for (const r of rows) console.log(`${r.ok ? "PASS" : "FAIL"}  ${pad(r.check, 26)} ${pad(`${(r.ms / 1000).toFixed(1)}s`, 7)} ${pad(r.usd ? `$${r.usd.toFixed(4)}` : "", 9)} ${r.note}`);
const scored = rows.filter((r) => r.usd > 0);
const perScore = scored.reduce((a, r) => a + r.usd, 0) / Math.max(1, scored.length);
// A 50-minute assessment makes about 14 scoring calls (9 scenes, follow-ups, a second pass on high-stakes answers),
// plus the world, a few generated scenes and the report, roughly another 6 scoring-sized calls.
console.log(`\nAbout $${perScore.toFixed(4)} per scoring call; an assessment is roughly 20 calls of this size: about $${(perScore * 20).toFixed(2)} each.`);
console.log("Set AALIM_MODEL to try a cheaper model, and AI_BUDGET_ORG_MONTHLY_USD to cap each organisation's monthly spend.\n");
process.exit(rows.every((r) => r.ok) ? 0 : 1);
