import "server-only";
import { withTenant } from "@/lib/db";
import { coach, type CoachReply } from "@/lib/ai/prompts/coach";
import { getProvider, runAgent } from "@/lib/ai/run";
import type { ReportContent } from "@/lib/hire/report-types";
import { getGrowProfile } from "./profile";
import { offlineCoach } from "./offline-coach";

const HISTORY = 20;

async function latestGrowReport(userId: string): Promise<ReportContent | null> {
  const r = await withTenant({ userId }, (tx) => tx.report.findFirst({ where: { subjectUserId: userId, kind: "GROW", status: "READY" }, orderBy: { createdAt: "desc" } }));
  return (r?.content as unknown as ReportContent) ?? null;
}

export async function coachHistory(userId: string) {
  return withTenant({ userId }, (tx) => tx.coachMessage.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, take: 200 }));
}

export async function askCoach(userId: string, name: string, locale: "en" | "ar", text: string): Promise<CoachReply> {
  const profile = await getGrowProfile(userId);
  const report = await latestGrowReport(userId);
  const history = (await coachHistory(userId)).slice(-HISTORY);
  await withTenant({ userId }, (tx) => tx.coachMessage.create({ data: { userId, role: "user", content: text.slice(0, 4000) } }));

  const practice = await withTenant({ userId }, (tx) => tx.practiceSession.findMany({ where: { userId, completedAt: { not: null } }, orderBy: { createdAt: "desc" }, take: 40 }));
  const offline = () =>
    offlineCoach({
      text,
      report,
      locale,
      hours: profile?.hoursPerWeek ?? 2,
      selfView: (profile?.selfView as Record<string, number> | undefined) ?? {},
      practice: practice.map((p) => ({ skillKeys: p.competencyKeys, completedAt: p.completedAt, scores: (p.feedback as { scores?: { competencyKey: string; level: number }[] } | null)?.scores ?? [] })),
    });
  let reply: CoachReply;
  if (getProvider()) {
    try {
      const { output } = await runAgent(coach, {
        language: locale,
        name,
        goal: profile?.goal ?? "",
        hoursPerWeek: profile?.hoursPerWeek ?? 2,
        profile: report ? report.domains.map((d) => `${d.name}: ${d.estimate} (${d.range[0]}–${d.range[1]})`).join("\n") : "",
        plan: report?.narrative.plan?.map((p) => `${p.skillKey}: ${p.why}`).join("\n") ?? "",
        recentPractice: practice.slice(0, 8).map((p) => `${p.competencyKeys.join(", ")} — ${(p.feedback as { scores?: { level: number }[] })?.scores?.map((s) => s.level).join("/") ?? ""}`).join("\n"),
        reflections: practice.slice(0, 8).map((p) => p.reflectionNote).filter(Boolean).join("\n"),
        selfView: Object.entries((profile?.selfView as Record<string, number> | undefined) ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n"),
        conversation: [...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })), { role: "user" as const, content: text }],
      });
      reply = output;
    } catch (e) {
      console.warn("[coach] model failed; using offline coach", e);
      reply = offline();
    }
  } else {
    reply = offline();
  }
  await withTenant({ userId }, (tx) => tx.coachMessage.create({ data: { userId, role: "assistant", content: reply.reply } }));
  return reply;
}

export { latestGrowReport };
