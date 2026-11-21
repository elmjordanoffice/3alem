import Link from "next/link";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { requireViewer } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { TRACKS } from "@/lib/grow/tracks";
import { isLocale } from "@/i18n/config";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("grow.tracks");
  return { title: t("title") };
}

export default async function TracksPage() {
  const viewer = await requireViewer();
  const t = await getTranslations("grow.tracks");
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : "en";
  const enrollments = await withTenant({ userId: viewer.user.id }, (tx) => tx.trackEnrollment.findMany({ where: { userId: viewer.user.id }, include: { track: true } }));
  return (
    <PageContainer className="max-w-5xl">
      <PageHeader title={t("title")} description={t("description")} />
      <ul className="grid gap-4 md:grid-cols-2">
        {TRACKS.map((tr) => {
          const e = enrollments.find((x) => x.track.key === tr.key);
          const pct = e ? Math.round((e.completedSessions / tr.sessions.length) * 100) : 0;
          return (
            <li key={tr.key}>
              <Link href={`/app/grow/tracks/${tr.key}`} className="group block h-full rounded-card focus-visible:outline-2 focus-visible:outline-focus">
                <Card className="h-full transition-colors group-hover:border-border-strong">
                  <CardContent className="flex h-full flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-semibold text-text">{tr.name[locale]}</h2>
                      {e?.completedAt ? <Badge tone="success">{t("completed")}</Badge> : e?.assignedByTeamId && e.completedSessions === 0 ? <Badge tone="info">{t("suggested")}</Badge> : e ? <Badge tone="accent">{t("inProgress")}</Badge> : null}
                    </div>
                    <p className="flex-1 text-sm text-secondary">{tr.description[locale]}</p>
                    <div className="flex flex-col gap-1.5">
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-tertiary">{e ? t("progress", { done: e.completedSessions, total: tr.sessions.length }) : t("sessions", { n: tr.sessions.length })}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
}
