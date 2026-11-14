import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Check } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { trackByKey } from "@/lib/grow/tracks";
import { DOMAINS } from "@/lib/framework/data";
import { isLocale } from "@/i18n/config";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { PracticeLauncher } from "@/components/grow/practice-launcher";
import { SkillChip } from "@/components/report/level";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Track" };

export default async function TrackPage({ params }: { params: Promise<{ key: string }> }) {
  const viewer = await requireViewer();
  const { key } = await params;
  const track = trackByKey(key);
  if (!track) notFound();
  const t = await getTranslations("grow.tracks");
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : "en";
  const e = await withTenant({ userId: viewer.user.id }, (tx) => tx.trackEnrollment.findFirst({ where: { userId: viewer.user.id, track: { key } } }));
  const done = e?.completedSessions ?? 0;
  const nameOf = (k: string) => DOMAINS.flatMap((d) => d.subSkills).find((s) => s.key === k)?.name[locale] ?? k;
  return (
    <PageContainer className="max-w-3xl">
      <Link href="/app/grow/tracks" className="mb-6 inline-flex items-center gap-1.5 text-sm text-secondary hover:text-text">
        <ArrowLeft className="size-4 flip-rtl" aria-hidden />
        {t("title")}
      </Link>
      <PageHeader title={track.name[locale]} description={track.description[locale]} />
      <ol className="flex flex-col">
        {track.sessions.map((s, i) => {
          const isDone = i < done;
          const isNext = i === done;
          return (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={cn("inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular", isDone ? "bg-accent text-accent-foreground" : isNext ? "bg-accent-subtle text-accent-text ring-1 ring-accent" : "bg-surface-sunken text-tertiary")}>
                  {isDone ? <Check className="size-3.5" aria-hidden /> : i + 1}
                </span>
                {i < track.sessions.length - 1 ? <span className="w-px flex-1 bg-border" aria-hidden /> : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className={cn("text-[15px] font-medium", isNext ? "text-text" : isDone ? "text-secondary" : "text-text")}>{s.title[locale]}</h2>
                  <PracticeLauncher trackKey={track.key} trackIndex={i} label={isDone ? t("again") : t("start")} variant={isNext ? "primary" : "ghost"} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.skills.map((k) => (
                    <SkillChip key={k} name={nameOf(k)} />
                  ))}
                  {s.stretch ? <span className="text-xs text-tertiary">{t("stretch")}</span> : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </PageContainer>
  );
}
