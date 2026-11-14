"use client";
import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";
import type { ItemContent } from "@/lib/assessment/item-schema";
import type { World } from "@/lib/assessment/world-schema";
import { Person } from "@/components/ui/avatar";
import { ChapterList } from "@/components/assessment/chapter-progress";
import { DocumentViewer } from "@/components/assessment/document-viewer";
import { CandidateShell } from "@/components/candidate/shell";

export function PreviewView({ banner, orgName, world, item, minutes }: { banner: string; orgName: string; world: World; item: ItemContent | null; minutes: number }) {
  const t = useTranslations("candidate.briefing");
  const ti = useTranslations("candidate.item");
  return (
    <CandidateShell branding={{ orgName, logoUrl: null, brandColor: null }}>
      <div className="border-b border-info/30 bg-info-subtle px-4 py-2 text-center text-sm text-text">
        <Eye className="me-1.5 inline size-4 text-info" aria-hidden />
        {banner}
      </div>
      <article className="mx-auto flex max-w-[680px] flex-col gap-8 px-4 py-12">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-accent-text">{t("eyebrow")}</p>
          <h1 className="text-2xl font-semibold text-text">{t("title", { company: world.companyName })}</h1>
          <p className="text-lg leading-relaxed text-secondary">{world.premise}</p>
        </header>
        <ul className="grid gap-3 sm:grid-cols-2">
          {world.cast.map((c) => (
            <li key={c.slot}>
              <Person name={c.name} role={c.role} />
            </li>
          ))}
        </ul>
        <ChapterList chapters={world.chapters.map((c) => c.title)} current={0} />
        <p className="text-sm text-tertiary">{t("before.time.title", { minutes })}</p>
      </article>
      {item ? (
        <div className="mx-auto max-w-6xl border-t border-border px-4 py-10 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <section className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold text-text">{item.title}</h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-text">{item.scenario}</p>
              {item.materials.length ? <DocumentViewer materials={item.materials} label={ti("materials")} /> : null}
            </section>
            <section className="flex flex-col gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-accent-text">{ti("yourTask")}</p>
              <p className="text-[15px] font-medium text-text">{item.task.prompt}</p>
              {item.task.options ? (
                <ul className="flex flex-col gap-2">
                  {item.task.options.map((o, i) => (
                    <li key={o.id} className="rounded-card border border-border bg-surface p-4 text-[15px] text-text">
                      <span className="me-2 font-semibold text-secondary">{String.fromCharCode(65 + i)}.</span>
                      {o.label}
                    </li>
                  ))}
                </ul>
              ) : null}
              {item.probe ? <p className="text-sm text-secondary">{ti("followUp")}: {item.probe.prompt}</p> : null}
            </section>
          </div>
        </div>
      ) : null}
    </CandidateShell>
  );
}
