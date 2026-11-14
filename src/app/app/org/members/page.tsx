import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireViewer, tenantOf, viewerCan } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { MembersTable } from "@/components/app/members-table";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("members");
  return { title: t("title") };
}

export default async function MembersPage() {
  const viewer = await requireViewer();
  if (!viewer.activeOrganization) redirect("/app");
  const t = await getTranslations("members");

  const members = await withTenant(tenantOf(viewer), (tx) =>
    tx.membership.findMany({
      where: { organizationId: viewer.activeOrganization!.id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
  );

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description", { org: viewer.activeOrganization.name })} />
      <MembersTable
        canManage={viewerCan(viewer, "members.manage")}
        currentUserId={viewer.user.id}
        members={members.map((m) => ({ userId: m.user.id, name: m.user.name, email: m.user.email, roles: m.roles }))}
      />
    </PageContainer>
  );
}
