import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { requirePermission, viewerCan } from "@/lib/auth/session";
import { teamAnalytics } from "@/lib/team";
import { nextHire } from "@/lib/team/next-hire";
import { isLocale } from "@/i18n/config";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { TeamOverview } from "@/components/team/team-overview";
import { InviteMembersDialog } from "@/components/team/invite-members-dialog";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requirePermission("team.view");
  const { id } = await params;
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : "en";
  const a = await teamAnalytics(viewer, id, locale);
  if (!a) notFound();
  const t = await getTranslations("team");
  const canManage = viewerCan(viewer, "team.manage");
  // The next hire: only for people who can open a role.
  const hire = viewerCan(viewer, "assessment.create") ? nextHire({ name: a.team.name, gaps: a.gaps }, locale) : null;
  return (
    <PageContainer className="max-w-6xl">
      <PageHeader title={a.team.name} description={a.team.description || t("overviewDescription")} actions={canManage ? <InviteMembersDialog teamId={id} /> : null} />
      <TeamOverview a={a} canManage={canManage} hire={hire} />
    </PageContainer>
  );
}
