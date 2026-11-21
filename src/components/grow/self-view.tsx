"use client";
import { useTranslations } from "next-intl";
import { RangeScale } from "@/components/report/range-scale";
import { useNumbers } from "@/components/providers";

/**
 * Your own view next to the evidence, per domain. A gap of a level or more is
 * worth a thought either way: an underestimate is a strength you may not be
 * using; an overestimate is a blind spot worth testing in practice.
 */
export function SelfViewComparison({ rows }: { rows: { key: string; name: string; own: number; estimate: number; range: [number, number] }[] }) {
  const t = useTranslations("grow.selfView");
  const n = useNumbers();
  if (!rows.length) return null;
  return (
    <section aria-labelledby="self-view" className="mt-12 rounded-[20px] bg-surface p-5 shadow-card sm:p-6 lg:ms-[13.5rem]">
      <h2 id="self-view" className="font-display text-lg font-semibold">{t("title")}</h2>
      <p className="mt-1 text-sm text-secondary">{t("body")}</p>
      <ul className="mt-5 flex flex-col gap-4">
        {rows.map((r) => {
          const gap = r.own - r.estimate;
          const note = r.own > r.range[1] + 0.5 ? "over" : r.own < r.range[0] - 0.5 ? "under" : "match";
          return (
            <li key={r.key} className="grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center sm:gap-6">
              <div>
                <p className="text-sm font-medium text-text">{r.name}</p>
                <p className={note === "match" ? "text-xs text-tertiary" : "text-xs text-accent-text"}>{t(`note.${note}`, { gap: n.level(Math.abs(gap)) })}</p>
              </div>
              <div className="relative">
                <RangeScale low={r.range[0]} high={r.range[1]} estimate={r.estimate} expected={r.own} size="sm" />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-tertiary">{t("legend")}</p>
    </section>
  );
}
