import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireViewer } from "@/lib/auth/session";
import { coachHistory } from "@/lib/grow/coach";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { CoachChat } from "@/components/grow/coach-chat";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("grow.coach");
  return { title: t("title") };
}

export default async function CoachPage() {
  const viewer = await requireViewer();
  const t = await getTranslations("grow.coach");
  const history = await coachHistory(viewer.user.id);
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title={t("title")} description={t("description")} />
      <CoachChat initial={history.map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content }))} name={viewer.user.name} />
    </PageContainer>
  );
}
