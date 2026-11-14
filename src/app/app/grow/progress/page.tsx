import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LineChart as LineIcon } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { growSessions } from "@/lib/grow/profile";
import type { ReportContent } from "@/lib/hire/report-types";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressCharts } from "@/components/grow/progress-charts";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("grow.progress");
  return { title: t("title") };
}

export default async function ProgressPage() {
  const viewer = await requireViewer();
  const t = await getTranslations("grow.progress");
  const sessions = (await growSessions(viewer.user.id)).filter((s) => s.report?.status === "READY").reverse();
  const practice = await withTenant({ userId: viewer.user.id }, (tx) => tx.practiceSession.findMany({ where: { userId: viewer.user.id, completedAt: { not: null } }, orderBy: { completedAt: "asc" } }));
  if (sessions.length === 0 && practice.length === 0) {
    return (
      <PageContainer>
        <PageHeader title={t("title")} description={t("description")} />
        <EmptyState icon={LineIcon} title={t("emptyTitle")} description={t("emptyBody")} />
      </PageContainer>
    );
  }
  const assessments = sessions.map((s) => {
    const c = s.report!.content as unknown as ReportContent;
    return { date: s.report!.createdAt.toISOString().slice(0, 10), domains: c.domains.map((d) => ({ key: d.key, name: d.name, estimate: d.estimate, range: d.range })) };
  });
  const practiceByWeek = new Map<string, number>();
  for (const p of practice) {
    const d = new Date(p.completedAt!);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const k = monday.toISOString().slice(0, 10);
    practiceByWeek.set(k, (practiceByWeek.get(k) ?? 0) + 1);
  }
  return (
    <PageContainer className="max-w-5xl">
      <PageHeader title={t("title")} description={t("description")} />
      <ProgressCharts assessments={assessments} practiceWeeks={[...practiceByWeek.entries()].map(([week, n]) => ({ week, n }))} />
    </PageContainer>
  );
}
