import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Lock } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { memberView } from "@/lib/team";
import { PageContainer } from "@/components/app/page-header";
import { HireReport } from "@/components/report/hire-report";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Team member" };

export default async function TeamMemberPage({ params }: { params: Promise<{ id: string; memberId: string }> }) {
  const viewer = await requirePermission("team.view");
  const { id, memberId } = await params;
  const v = await memberView(viewer, id, memberId);
  if (!v) notFound();
  const t = await getTranslations("team");
  return (
    <PageContainer className="max-w-6xl">
      <Link href={`/app/teams/${id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-secondary hover:text-text">
        <ArrowLeft className="size-4 flip-rtl" aria-hidden />
        {v.team.name}
      </Link>
      {!v.allowed || !v.content ? (
        <EmptyState icon={Lock} title={t("memberLockedTitle")} description={t("memberLockedBody", { min: 5 })} />
      ) : (
        <>
          <Alert tone={v.member.shareRawAnswers ? "neutral" : "info"} className="mb-8">{v.member.shareRawAnswers ? t("memberSharesRaw") : t("memberNoRaw")}</Alert>
          <HireReport content={{ ...v.content, candidate: { name: v.member.name } }} audience="candidate" />
        </>
      )}
    </PageContainer>
  );
}
