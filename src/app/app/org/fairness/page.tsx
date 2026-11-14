import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AlertTriangle, Scale } from "lucide-react";
import { requirePermission, tenantOf } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { FAIRNESS_FIELDS, FIT_LEVELS, MIN_GROUP, fairnessReport, validity, type FairnessCutoff } from "@/lib/fairness";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormattedNumber } from "@/components/app/formatted";
import { QuerySelect } from "@/components/admin/query-select";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("fairness");
  return { title: t("title") };
}

/** Only aggregates reach this page; no individual answer is ever shown. */
// Fit is ordinal, so one hue from dark (strong) to light (weak) — never traffic-light colours.
const FIT_COLOR: Record<(typeof FIT_LEVELS)[number], string> = { STRONG: "bg-level-5", GOOD: "bg-level-4", PARTIAL: "bg-level-3", WEAK: "bg-level-2" };
const isRange = (s: string) => /^[\d\s–+-]+$/.test(s);

export default async function FairnessPage({ searchParams }: { searchParams: Promise<{ template?: string; cutoff?: string }> }) {
  const viewer = await requirePermission("fairness.view");
  const t = await getTranslations("fairness");
  const { template, cutoff: rawCutoff } = await searchParams;
  const cutoff: FairnessCutoff = rawCutoff === "partial" ? "PARTIAL" : "GOOD";
  const tf = await getTranslations("report.fit");
  const orgId = viewer.activeOrganization.id;
  const templates = await withTenant(tenantOf(viewer), (tx) => tx.assessmentTemplate.findMany({ where: { status: { not: "DRAFT" } }, select: { id: true, title: true }, orderBy: { updatedAt: "desc" } }));
  const templateId = templates.some((x) => x.id === template) ? template! : null;
  const [report, valid] = await Promise.all([fairnessReport(orgId, templateId, cutoff), validity(orgId)]);
  const flagged = FAIRNESS_FIELDS.flatMap((f) => report.byField[f].groups.filter((g) => g.flagged).map((g) => ({ field: f, ...g })));
  const pct = (x: number) => <FormattedNumber value={x} options={{ style: "percent", maximumFractionDigits: 0 }} />;

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <QuerySelect param="cutoff" value={cutoff === "PARTIAL" ? "partial" : "all"} label={t("cutoffLabel")} className="w-52" options={[{ value: "all", label: t("cutoff.GOOD") }, { value: "partial", label: t("cutoff.PARTIAL") }]} />
            {templates.length ? <QuerySelect param="template" value={templateId ?? "all"} label={t("filterLabel")} className="w-56" options={[{ value: "all", label: t("allRoles") }, ...templates.map((x) => ({ value: x.id, label: x.title }))]} /> : null}
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><CardContent><p className="text-sm text-secondary">{t("responses")}</p><p className="mt-1 text-2xl font-semibold tabular"><FormattedNumber value={report.total} /></p></CardContent></Card>
        <Card><CardContent><p className="text-sm text-secondary">{t("minGroup")}</p><p className="mt-1 text-2xl font-semibold tabular"><FormattedNumber value={MIN_GROUP} /></p></CardContent></Card>
        <Card><CardContent><p className="text-sm text-secondary">{t("flaggedGroups")}</p><p className="mt-1 text-2xl font-semibold tabular"><FormattedNumber value={flagged.length} /></p></CardContent></Card>
      </div>

      {flagged.length ? (
        <Alert tone="warning" title={t("flaggedTitle")} className="mb-6">
          <p>{t("flaggedBody")}</p>
          <ul className="mt-2 list-disc ps-5">
            {flagged.map((g) => (
              <li key={`${g.field}-${g.value}`}>
                {(() => {
                  const label = t(`values.${g.field}.${g.value}` as "values.gender.woman");
                  return t.rich("flaggedItem", { field: t(`fields.${g.field}`), ratio: Math.round((g.impactRatio ?? 0) * 100), group: () => <bdi dir={isRange(label) ? "ltr" : undefined}>{label}</bdi> });
                })()}
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {report.total === 0 ? (
        <EmptyState icon={Scale} title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {FAIRNESS_FIELDS.map((field) => {
            const { groups, suppressed } = report.byField[field];
            return (
              <Card key={field}>
                <CardHeader>
                  <CardTitle>{t(`fields.${field}`)}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {groups.length === 0 ? (
                    <p className="text-sm text-secondary">{t("allSuppressed", { n: MIN_GROUP })}</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="text-xs text-secondary">
                        <tr>
                          <th className="pb-2 text-start font-medium">{t("group")}</th>
                          <th className="pb-2 text-end font-medium">{t("n")}</th>
                          <th className="pb-2 ps-4 text-start font-medium">{t("distribution")}</th>
                          <th className="pb-2 ps-4 text-end font-medium">{t(`selectionRate.${cutoff}`)}</th>
                          <th className="pb-2 ps-4 text-end font-medium">{t("impactRatio")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groups.map((g) => (
                          <tr key={g.value} className="border-t border-border">
                            <td className="py-2.5">
                              {(() => {
                                const label = t(`values.${field}.${g.value}` as "values.gender.woman");
                                return <bdi dir={isRange(label) ? "ltr" : undefined} className={isRange(label) ? "whitespace-nowrap" : undefined}>{label}</bdi>;
                              })()}
                            </td>
                            <td className="py-2.5 text-end tabular"><FormattedNumber value={g.n} /></td>
                            <td className="py-2.5 ps-4">
                              <span className="flex h-2 w-28 gap-px overflow-hidden rounded-full" role="img" aria-label={FIT_LEVELS.map((f) => `${tf(f)}: ${g.distribution[f]}`).join(", ")}>
                                {FIT_LEVELS.map((f) => (g.distribution[f] ? <span key={f} className={FIT_COLOR[f]} style={{ width: `${(g.distribution[f] / g.n) * 100}%` }} /> : null))}
                              </span>
                            </td>
                            <td className="py-2.5 ps-4 text-end tabular">{pct(g.selectionRate)}</td>
                            <td className="py-2.5 ps-4 text-end">
                              {g.impactRatio === null ? "—" : g.flagged ? (
                                <Badge tone="warning"><AlertTriangle aria-hidden />{pct(g.impactRatio)}</Badge>
                              ) : (
                                <span className="tabular">{pct(g.impactRatio)}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {groups.length ? (
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-secondary" aria-hidden>
                      {FIT_LEVELS.map((f) => <li key={f} className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${FIT_COLOR[f]}`} />{tf(f)}</li>)}
                    </ul>
                  ) : null}
                  {suppressed > 0 ? <p className="text-xs text-tertiary">{t("suppressed", { n: suppressed, min: MIN_GROUP })}</p> : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{t("validityTitle")}</CardTitle>
            {valid.n < 20 ? <Badge tone="info">{t("earlyVersion")}</Badge> : null}
          </div>
          <CardDescription>{t("validityBody")}</CardDescription>
        </CardHeader>
        <CardContent>
          {valid.n < 20 ? (
            <p className="text-sm text-secondary">{t("validityTooFew", { n: valid.n })}</p>
          ) : (
            <p className="text-sm text-text">{t("validityResult", { r: (valid.r ?? 0).toFixed(2), n: valid.n })}</p>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-tertiary">{t("method")}</p>
    </PageContainer>
  );
}
