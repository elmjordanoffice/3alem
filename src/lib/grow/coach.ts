import "server-only";
import { withTenant } from "@/lib/db";
import { coach, type CoachReply } from "@/lib/ai/prompts/coach";
import { getProvider, runAgent } from "@/lib/ai/run";
import { containsAny } from "@/lib/ai/offline/text";
import { DOMAINS } from "@/lib/framework/data";
import type { ReportContent } from "@/lib/hire/report-types";
import { getGrowProfile } from "./profile";

const HISTORY = 20;

async function latestGrowReport(userId: string): Promise<ReportContent | null> {
  const r = await withTenant({ userId }, (tx) => tx.report.findFirst({ where: { subjectUserId: userId, kind: "GROW", status: "READY" }, orderBy: { createdAt: "desc" } }));
  return (r?.content as unknown as ReportContent) ?? null;
}

export async function coachHistory(userId: string) {
  return withTenant({ userId }, (tx) => tx.coachMessage.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, take: 200 }));
}

function skillName(key: string, locale: "en" | "ar") {
  for (const d of DOMAINS) {
    const s = d.subSkills.find((x) => x.key === key);
    if (s) return s.name[locale];
  }
  return key;
}

/** A plainer coach for when no language model is configured. Still honest and specific. */
function offlineCoach(text: string, report: ReportContent | null, locale: "en" | "ar", hours: number): CoachReply {
  const ar = locale === "ar";
  const plan = report?.narrative.plan ?? [];
  const focus = plan.map((p) => p.skillKey);
  if (!report) {
    return {
      reply: ar
        ? "لا أملك تقييماً لك بعد، لذلك لا أستطيع أن أكون دقيقاً. ابدأ بالتقييم المرجعي (30 دقيقة)، ثم سنبني خطتك على أدلة حقيقية."
        : "I don't have an assessment for you yet, so I can't be specific. Start with the 30-minute baseline; then we'll build your plan on real evidence.",
      suggestedSkills: [],
    };
  }
  if (containsAny(text, ["week", "plan", "schedule", "time", "أسبوع", "خطة", "وقت", "جدول"])) {
    const per = Math.max(1, Math.floor((hours * 60) / 25));
    return {
      reply: ar
        ? `لديك نحو ${hours} ساعة هذا الأسبوع، أي ما يقارب ${per} جلسات تدريب قصيرة. اقتراحي: ابدأ بـ${skillName(focus[0] ?? "", "ar")}، ثم جلسة واحدة على ${skillName(focus[1] ?? focus[0] ?? "", "ar")}، واكتب ملاحظة قصيرة بعد كل جلسة.`
        : `You have about ${hours} hours this week, which is roughly ${per} short practice sessions. My suggestion: start with ${skillName(focus[0] ?? "", "en").toLowerCase()}, then one session on ${skillName(focus[1] ?? focus[0] ?? "", "en").toLowerCase()}, and write a short note after each.`,
      suggestedSkills: focus.slice(0, 2),
    };
  }
  if (containsAny(text, ["why", "low", "weak", "لماذا", "ضعيف", "منخفض"])) {
    const area = report.narrative.developmentAreas[0];
    return {
      reply: area
        ? (ar ? `أوضح مجال للبناء هو ${area.headline}. ${area.explanation} ` : `The clearest area to build is ${area.headline.toLowerCase()}. ${area.explanation} `) + (ar ? "لن تتغير المستويات إلا بإعادة التقييم، لكن التدريب المركّز يجعل ذلك ممكناً." : "Levels only change through re-assessment, but focused practice is what moves them.")
        : ar
          ? "لم يظهر في تقييمك مجال ضعف واضح بأدلة كافية."
          : "Your assessment didn't show a clear weak area with enough evidence.",
      suggestedSkills: area ? [area.skillKey] : [],
    };
  }
  const strength = report.narrative.strengths[0];
  return {
    reply: ar
      ? `${strength ? `أقوى ما ظهر لديك: ${strength.headline}. ` : ""}تركيزك الحالي: ${focus.map((k) => skillName(k, "ar")).join("، ") || "لم يُحدَّد بعد"}. ما الذي تريد العمل عليه اليوم؟`
      : `${strength ? `Your clearest strength: ${strength.headline.toLowerCase()}. ` : ""}Your current focus: ${focus.map((k) => skillName(k, "en").toLowerCase()).join(", ") || "not set yet"}. What would you like to work on today?`,
    suggestedSkills: focus.slice(0, 1),
  };
}

export async function askCoach(userId: string, name: string, locale: "en" | "ar", text: string): Promise<CoachReply> {
  const profile = await getGrowProfile(userId);
  const report = await latestGrowReport(userId);
  const history = (await coachHistory(userId)).slice(-HISTORY);
  await withTenant({ userId }, (tx) => tx.coachMessage.create({ data: { userId, role: "user", content: text.slice(0, 4000) } }));

  let reply: CoachReply;
  if (getProvider()) {
    try {
      const practice = await withTenant({ userId }, (tx) => tx.practiceSession.findMany({ where: { userId, completedAt: { not: null } }, orderBy: { createdAt: "desc" }, take: 8 }));
      const { output } = await runAgent(coach, {
        language: locale,
        name,
        goal: profile?.goal ?? "",
        hoursPerWeek: profile?.hoursPerWeek ?? 2,
        profile: report ? report.domains.map((d) => `${d.name}: ${d.estimate} (${d.range[0]}–${d.range[1]})`).join("\n") : "",
        plan: report?.narrative.plan?.map((p) => `${p.skillKey}: ${p.why}`).join("\n") ?? "",
        recentPractice: practice.map((p) => `${p.competencyKeys.join(", ")} — ${(p.feedback as { scores?: { level: number }[] })?.scores?.map((s) => s.level).join("/") ?? ""}`).join("\n"),
        reflections: practice.map((p) => p.reflectionNote).filter(Boolean).join("\n"),
        conversation: [...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })), { role: "user" as const, content: text }],
      });
      reply = output;
    } catch (e) {
      console.warn("[coach] model failed; using offline coach", e);
      reply = offlineCoach(text, report, locale, profile?.hoursPerWeek ?? 2);
    }
  } else {
    reply = offlineCoach(text, report, locale, profile?.hoursPerWeek ?? 2);
  }
  await withTenant({ userId }, (tx) => tx.coachMessage.create({ data: { userId, role: "assistant", content: reply.reply } }));
  return reply;
}

export { latestGrowReport };
