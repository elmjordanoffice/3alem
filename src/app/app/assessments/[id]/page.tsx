import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Download, Settings2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { requirePermission, viewerCan } from "@/lib/auth/session";
import { assessmentDetail } from "@/lib/hire/recruiter";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CandidatesTable } from "@/components/recruiter/candidates-table";
import { InviteDialog } from "@/components/recruiter/invite-dialog";
import { SkillChip } from "@/components/report/level";
import { Shortlist } from "@/components/recruiter/shortlist";
import { shortlistFor } from "@/lib/hire/shortlist";
import { invitationAllowance } from "@/lib/billing";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const viewer = await requirePermission("assessment.view");
  const d = await assessmentDetail(viewer, (await params).id);
  return { title: d?.template.title ?? "Assessment" };
}

export default async function AssessmentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ deleted?: string }> }) {
  const viewer = await requirePermission("assessment.view");
  const { id } = await params;
  const { deleted } = await searchParams;
  const detail = await assessmentDetail(viewer, id);
  if (!detail) notFound();
  const t = await getTranslations("role");
  const ta = await getTranslations("assessments");
  const canInvite = viewerCan(viewer, "candidate.invite") && detail.template.status === "PUBLISHED";
  const mustHaves = detail.weights.filter((w) => w.importance === "MUST_HAVE");
  const shortlist = viewerCan(viewer, "report.view") ? await shortlistFor(viewer, id) : [];
  const allowance = canInvite ? await invitationAllowance(viewer.activeOrganization.id) : null;
  const nameOf = (key: string) => detail.technicalSkills.find((s) => s.key === key)?.name ?? ta(`domain.${key}`);

  return (
    <PageContainer className="max-w-6xl">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {detail.template.title}
            <Badge tone={detail.template.status === "PUBLISHED" ? "success" : "neutral"}>{ta(`status.${detail.template.status}`)}</Badge>
          </span>
        }
        description={t("description", { minutes: detail.template.durationMinutes })}
        actions={
          <>
            {viewerCan(viewer, "candidate.view") && detail.candidates.length ? (
              <Button variant="ghost" asChild>
                <a href={`/api/assessments/${id}/export`} download>
                  <Download aria-hidden />
                  {t("exportCsv")}
                </a>
              </Button>
            ) : null}
            {viewerCan(viewer, "assessment.create") ? (
              <Button variant="secondary" asChild>
                <Link href={`/app/assessments/${id}/setup`}>
                  <Settings2 aria-hidden />
                  {t("setup")}
                </Link>
              </Button>
            ) : null}
            {canInvite ? <InviteDialog templateId={id} allowance={allowance} /> : null}
          </>
        }
      />
      {deleted ? <Alert tone="success" className="mb-6">{t("candidateDeleted")}</Alert> : null}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-secondary">{t("mustHaves")}</span>
        {mustHaves.map((w) => (
          <SkillChip key={w.skillKey} name={nameOf(w.skillKey)} />
        ))}
      </div>
      <Shortlist entries={shortlist} />
      <CandidatesTable templateId={id} rows={detail.candidates} canInvite={canInvite} />
    </PageContainer>
  );
}
