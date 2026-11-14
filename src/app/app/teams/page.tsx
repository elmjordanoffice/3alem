import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UsersRound } from "lucide-react";
import { requirePermission, viewerCan, tenantOf } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CreateTeamDialog } from "@/components/team/create-team-dialog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("team");
  return { title: t("title") };
}

export default async function TeamsPage() {
  const viewer = await requirePermission("team.view");
  const t = await getTranslations("team");
  const teams = await withTenant(tenantOf(viewer), (tx) => tx.team.findMany({ where: { organizationId: viewer.activeOrganization.id }, include: { members: { select: { status: true } } }, orderBy: { createdAt: "desc" } }));
  const canManage = viewerCan(viewer, "team.manage");
  return (
    <PageContainer className="max-w-5xl">
      <PageHeader title={t("title")} description={t("description")} actions={canManage ? <CreateTeamDialog /> : null} />
      <Alert tone="neutral" className="mb-6">{t("devTool")}</Alert>
      {teams.length === 0 ? (
        <EmptyState icon={UsersRound} title={t("emptyTitle")} description={t("emptyBody")} action={canManage ? <CreateTeamDialog /> : undefined} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {teams.map((team) => {
            const assessed = team.members.filter((m) => m.status === "ASSESSED").length;
            const active = team.members.filter((m) => m.status !== "REMOVED" && m.status !== "DECLINED").length;
            return (
              <li key={team.id}>
                <Link href={`/app/teams/${team.id}`} className="group block rounded-card focus-visible:outline-2 focus-visible:outline-focus">
                  <Card className="transition-colors group-hover:border-border-strong">
                    <CardContent className="flex flex-col gap-1">
                      <span className="font-semibold text-text">{team.name}</span>
                      <span className="text-sm text-secondary">{t("assessedOf", { assessed, total: active })}</span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PageContainer>
  );
}
