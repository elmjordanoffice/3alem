import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireViewer } from "@/lib/auth/session";
import { systemDb } from "@/lib/db";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FormattedNumber } from "@/components/app/formatted";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return { title: t("title") };
}

/** Platform admin overview. Uses the system client: platform staff see across tenants. */
export default async function AdminPage() {
  const viewer = await requireViewer();
  if (!viewer.user.isPlatformAdmin) redirect("/app?denied=1");
  const t = await getTranslations("admin");
  const [orgs, users, audits] = await Promise.all([
    systemDb.organization.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { memberships: true } } }, take: 50 }),
    systemDb.user.count(),
    systemDb.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card><CardContent><p className="text-sm text-secondary">{t("organizations")}</p><p className="mt-1 text-2xl font-semibold tabular"><FormattedNumber value={orgs.length} /></p></CardContent></Card>
        <Card><CardContent><p className="text-sm text-secondary">{t("people")}</p><p className="mt-1 text-2xl font-semibold tabular"><FormattedNumber value={users} /></p></CardContent></Card>
      </div>
      <h2 className="mb-3 text-base font-semibold">{t("organizations")}</h2>
      <div className="mb-10 overflow-hidden rounded-card border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-surface-subtle text-xs text-secondary">
            <tr><th className="px-4 py-2.5 text-start font-medium">{t("name")}</th><th className="px-4 py-2.5 text-end font-medium">{t("members")}</th></tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-t border-border"><td className="px-4 py-3">{o.name}</td><td className="px-4 py-3 text-end tabular"><FormattedNumber value={o._count.memberships} /></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mb-3 text-base font-semibold">{t("recentActivity")}</h2>
      <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface text-sm">
        {audits.length === 0 ? <li className="px-4 py-3 text-secondary">{t("noActivity")}</li> : audits.map((a) => (
          <li key={a.id} className="flex justify-between gap-4 px-4 py-3"><code className="font-mono text-xs">{a.action}</code><time className="text-xs text-tertiary" dateTime={a.createdAt.toISOString()}>{a.createdAt.toISOString().slice(0, 16).replace("T", " ")}</time></li>
        ))}
      </ul>
    </PageContainer>
  );
}
