import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollText } from "lucide-react";
import { requirePermission, tenantOf } from "@/lib/auth/session";
import { systemDb, withTenant } from "@/lib/db";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { QuerySelect } from "@/components/admin/query-select";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("audit");
  return { title: t("title") };
}

const CATEGORIES: Record<string, string[]> = {
  assessments: ["assessment.", "candidates.", "invitation."],
  reports: ["report."],
  people: ["membership.", "organization."],
  privacy: ["privacy.", "retention."],
  integrations: ["webhook."],
  framework: ["library."],
  teams: ["team.", "grow."],
  outcomes: ["outcome."],
  billing: ["billing.", "ai.budget."],
};
const PAGE = 50;

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ category?: string; cursor?: string }> }) {
  const viewer = await requirePermission("audit.view");
  const t = await getTranslations("audit");
  const locale = await getLocale();
  const { category, cursor } = await searchParams;
  const prefixes = category ? CATEGORIES[category] : undefined;
  const rows = await withTenant(tenantOf(viewer), (tx) =>
    tx.auditLog.findMany({
      where: prefixes ? { OR: prefixes.map((p) => ({ action: { startsWith: p } })) } : {},
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PAGE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
  );
  const page = rows.slice(0, PAGE);
  const next = rows.length > PAGE ? page[page.length - 1]!.id : null;
  // Names of the people who acted (only those in this organisation's log).
  const actorIds = [...new Set(page.map((r) => r.actorUserId).filter(Boolean))] as string[];
  const actors = new Map((await systemDb.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true } })).map((u) => [u.id, u.name]));
  const fmt = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
  const label = (action: string) => {
    const key = `actions.${action.replace(/\./g, "_")}`;
    return t.has(key) ? t(key as "actions.report_viewed") : action;
  };
  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
    return p.size ? `?${p}` : "";
  };

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={<QuerySelect param="category" value={category && CATEGORIES[category] ? category : "all"} label={t("filterLabel")} className="w-56" options={[{ value: "all", label: t("categories.all") }, ...Object.keys(CATEGORIES).map((c) => ({ value: c, label: t(`categories.${c}` as "categories.all") }))]} />}
      />
      {page.length === 0 ? (
        <EmptyState icon={ScrollText} title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <div className="overflow-x-auto rounded-card bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-subtle text-xs text-secondary">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">{t("when")}</th>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">{t("who")}</th>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">{t("what")}</th>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">{t("target")}</th>
              </tr>
            </thead>
            <tbody>
              {page.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-tertiary"><time dateTime={r.createdAt.toISOString()}>{fmt.format(r.createdAt)}</time></td>
                  <td className="px-4 py-2.5">{r.actorUserId ? actors.get(r.actorUserId) ?? t("deletedUser") : t("system")}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-text">{label(r.action)}</span>
                    <code className="mt-0.5 block w-fit font-mono text-[11px] text-tertiary" dir="ltr">{r.action}</code>
                  </td>
                  <td className="px-4 py-2.5">
                    {r.targetType === "session" && r.targetId && r.action.startsWith("report.") ? (
                      <Link href={`/app/reports/${r.targetId}`} className="text-accent-text underline-offset-2 hover:underline">{t("openReport")}</Link>
                    ) : r.targetType ? (
                      <span className="text-xs text-secondary"><span>{t.has(`targets.${r.targetType}`) ? t(`targets.${r.targetType}` as "targets.session") : r.targetType}</span></span>
                    ) : (
                      <span className="text-tertiary">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex justify-end gap-2">
        {cursor ? <Link href={`/app/org/audit${qs({})}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>{t("newest")}</Link> : null}
        {next ? <Link href={`/app/org/audit${qs({ cursor: next })}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>{t("older")}</Link> : null}
      </div>
      <p className="mt-6 text-xs text-tertiary">{t("retentionNote")}</p>
    </PageContainer>
  );
}
