import Link from "next/link";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { requireViewer } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { practiceSkillsCatalog } from "@/lib/grow/practice";
import { isLocale } from "@/i18n/config";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { PracticeLauncher } from "@/components/grow/practice-launcher";
import { Card, CardContent } from "@/components/ui/card";
import { FormattedNumber } from "@/components/app/formatted";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("grow.practice");
  return { title: t("title") };
}

export default async function PracticeGym() {
  const viewer = await requireViewer();
  const t = await getTranslations("grow.practice");
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : "en";
  const catalog = practiceSkillsCatalog(locale);
  const recent = await withTenant({ userId: viewer.user.id }, (tx) => tx.practiceSession.findMany({ where: { userId: viewer.user.id }, orderBy: { createdAt: "desc" }, take: 8 }));
  const counts = new Map<string, number>();
  for (const r of await withTenant({ userId: viewer.user.id }, (tx) => tx.practiceSession.findMany({ where: { userId: viewer.user.id, completedAt: { not: null } }, select: { competencyKeys: true } })))
    for (const k of r.competencyKeys) counts.set(k, (counts.get(k) ?? 0) + 1);
  const title = (item: unknown) => (item as { content?: { title?: string } }).content?.title ?? "";

  return (
    <PageContainer className="max-w-6xl">
      <PageHeader title={t("title")} description={t("description")} />
      {recent.length ? (
        <section className="mb-10">
          <h2 className="mb-3 text-base font-semibold text-text">{t("recent")}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recent.slice(0, 4).map((r) => (
              <li key={r.id}>
                <Link href={`/app/grow/practice/${r.id}`} className="block h-full rounded-card bg-surface shadow-card p-4 hover:shadow-card-hover">
                  <span className="block text-sm font-medium text-text" dir="auto">{title(r.item)}</span>
                  <span className="mt-1 block text-xs text-secondary">{r.completedAt ? t("done") : t("unfinished")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {catalog.map((d) => (
          <Card key={d.key}>
            <CardContent className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-text">{d.name}</h2>
              <ul className="flex flex-col divide-y divide-border">
                {d.subSkills.map((s) => (
                  <li key={s.key} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-sm text-text">{s.name}</span>
                      <span className="block text-xs text-tertiary">
                        {counts.get(s.key) ? <>{t("practised")} <FormattedNumber value={counts.get(s.key)!} /></> : s.description}
                      </span>
                    </span>
                    <PracticeLauncher skillKey={s.key} label={t("start")} variant="ghost" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
