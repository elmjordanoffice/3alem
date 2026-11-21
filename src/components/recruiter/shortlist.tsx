"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ShortlistEntry, ShortlistGroup, Reason } from "@/lib/hire/shortlist";
import { FitPill } from "@/components/report/fit";
import { Badge } from "@/components/ui/badge";
import { useNumbers } from "@/components/providers";
import { cn } from "@/lib/utils";

const GROUPS: ShortlistGroup[] = ["interview", "closer", "elsewhere"];

/**
 * What the reports suggest doing next for this role: who to interview first,
 * who deserves a closer look, and who would fit another open role better.
 * Each name carries its reasons. The team decides; nothing here is automatic.
 */
export function Shortlist({ entries }: { entries: ShortlistEntry[] }) {
  const t = useTranslations("role.shortlist");
  const tf = useTranslations("role.fit");
  const td = useTranslations("report.decision.outcome");
  const n = useNumbers();
  if (entries.length === 0) return null;
  const groups = GROUPS.map((g) => ({ g, items: entries.filter((e) => e.group === g) }));
  const notNow = entries.filter((e) => e.group === "notNow").length;

  const reason = (r: Reason) => {
    switch (r.key) {
      case "strongOn":
        return t("reason.strongOn", { skills: r.skills.join(t("and")) });
      case "gapOn":
        return t("reason.gapOn", { skill: r.skill });
      case "thin":
        return t("reason.thin");
      case "potential":
        return t("reason.potential", { text: r.text });
      case "fitsRole":
        return t("reason.fitsRole", { role: r.role });
    }
  };

  return (
    <section aria-labelledby="shortlist-h" className="mb-8 overflow-hidden rounded-card bg-surface shadow-card">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 id="shortlist-h" className="flex items-center gap-2 text-lg">
            <Sparkles className="size-4 text-accent-text" aria-hidden />
            {t("title")}
          </h2>
          <p className="mt-0.5 text-sm text-secondary">{t("body")}</p>
        </div>
        {notNow ? <p className="text-xs text-tertiary">{t("notNow", { n: n.number(notNow) })}</p> : null}
      </header>
      <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0 rtl:md:divide-x-reverse">
        {groups.map(({ g, items }) => (
          <div key={g} className="flex flex-col gap-3 p-5 sm:p-6">
            <h3 className="flex items-center justify-between gap-2">
              <span className="eyebrow text-text">{t(`group.${g}`)}</span>
              <span className={cn("tabular font-display text-2xl font-extrabold [font-stretch:125%]", g === "interview" ? "text-text" : "text-tertiary")}>{n.number(items.length)}</span>
            </h3>
            <p className="-mt-2 text-xs text-tertiary">{t(`groupHint.${g}`)}</p>
            {items.length === 0 ? (
              <p className="text-sm text-tertiary">{t("empty")}</p>
            ) : (
              <ul className="flex flex-col">
                {items.slice(0, 5).map((e) => (
                  <li key={e.sessionId} className="border-t border-border first:border-t-0">
                    <Link href={`/app/reports/${e.sessionId}`} className="group flex flex-col gap-1 py-3 focus-visible:outline-2 focus-visible:outline-focus">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-text group-hover:underline">{e.name}</span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          {e.decision ? <Badge tone="neutral">{td(e.decision)}</Badge> : null}
                          <FitPill fit={e.fit} label={tf(e.fit)} />
                        </span>
                      </span>
                      {e.reasons.map((r, i) => (
                        <span key={i} className="text-xs leading-relaxed text-secondary" dir="auto">
                          {reason(r)}
                        </span>
                      ))}
                    </Link>
                  </li>
                ))}
                {items.length > 5 ? <li className="pt-2 text-xs text-tertiary">{t("more", { n: n.number(items.length - 5) })}</li> : null}
              </ul>
            )}
          </div>
        ))}
      </div>
      <p className="flex items-center gap-1.5 border-t border-border px-5 py-3 text-xs text-tertiary sm:px-6">
        <ArrowRight className="size-3.5 flip-rtl" aria-hidden />
        {t("footer")}
      </p>
    </section>
  );
}
