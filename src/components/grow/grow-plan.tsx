"use client";
import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import type { ReportContent } from "@/lib/hire/report-types";
import { DOMAINS } from "@/lib/framework/data";
import { useLocaleSettings } from "@/components/providers";
import { PracticeLauncher } from "./practice-launcher";

export function GrowPlan({ plan }: { plan: NonNullable<ReportContent["narrative"]["plan"]> }) {
  const t = useTranslations("grow.plan");
  const { locale } = useLocaleSettings();
  const nameOf = (k: string) => DOMAINS.flatMap((d) => d.subSkills).find((s) => s.key === k)?.name[locale] ?? k;
  return (
    <section aria-labelledby="plan-h" className="flex flex-col gap-4">
      <h2 id="plan-h" className="flex items-center gap-2 text-lg font-semibold text-text">
        <CalendarDays className="size-4 text-accent-text" aria-hidden />
        {t("title")}
      </h2>
      <ol className="flex flex-col gap-4">
        {plan.map((p, i) => (
          <li key={p.skillKey} className="rounded-card border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-tertiary">{t("focus", { n: i + 1 })}</span>
                <h3 className="text-base font-semibold text-text">{nameOf(p.skillKey)}</h3>
                <p className="text-sm text-secondary" dir="auto">{p.why}</p>
              </div>
              <PracticeLauncher skillKey={p.skillKey} label={t("practise")} variant="secondary" />
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              {([["d30", p.days30], ["d60", p.days60], ["d90", p.days90]] as const).map(([k, v]) => (
                <div key={k} className="rounded-control bg-surface-subtle p-3">
                  <dt className="text-xs font-medium text-tertiary">{t(k)}</dt>
                  <dd className="mt-1 text-sm text-text" dir="auto">{v}</dd>
                </div>
              ))}
            </dl>
            {p.practice.filter(Boolean).length ? (
              <p className="mt-3 text-sm text-secondary" dir="auto"><span className="text-tertiary">{t("scenarios")} </span>{p.practice.join(" · ")}</p>
            ) : null}
            {p.resources.length ? <p className="mt-1 text-sm text-secondary" dir="auto"><span className="text-tertiary">{t("resources")} </span>{p.resources.join(" · ")}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
