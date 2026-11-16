import { getTranslations } from "next-intl/server";
import { Languages, Lock, Mic, Webhook, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { FitPill, type FitLevel } from "@/components/report/fit";
import { RangeScale } from "@/components/report/range-scale";
import { cn } from "@/lib/utils";

const HEAT: number[][] = [
  [4, 3, 4, 2, 3],
  [3, 4, 3, 3, 2],
  [2, 3, 3, 4, 4],
  [4, 2, 3, 3, 3],
  [3, 3, 2, 2, 4],
  [2, 4, 3, 3, 3],
];
const LEVEL_BG = ["", "bg-level-1", "bg-level-2", "bg-level-3", "bg-level-4", "bg-level-5"];

/**
 * The three modes and the safeguards, as a bento grid. Hire is the largest
 * tile because it is what most visitors came for. On phones the tiles stack in
 * reading order: Hire, Grow, Team, fairness, then the four small tiles.
 */
export async function Bento() {
  const t = await getTranslations("landing");
  const tf = await getTranslations("home.fit");
  const candidates: { name: string; fit: FitLevel; a: [number, number, number]; b: [number, number, number] }[] = [
    { name: t("bento.hire.c1"), fit: "STRONG", a: [3.6, 4.2, 3.9], b: [3.3, 3.9, 3.6] },
    { name: t("bento.hire.c2"), fit: "GOOD", a: [3.2, 3.9, 3.5], b: [3.6, 4.3, 4.0] },
    { name: t("bento.hire.c3"), fit: "PARTIAL", a: [2.4, 3.4, 2.9], b: [2.8, 3.6, 3.2] },
  ];
  const small: { key: "voice" | "ats" | "bilingual" | "privacy"; icon: LucideIcon }[] = [
    { key: "bilingual", icon: Languages },
    { key: "voice", icon: Mic },
    { key: "ats", icon: Webhook },
    { key: "privacy", icon: Lock },
  ];

  return (
    <div className="mt-14 grid gap-5 lg:grid-cols-6">
      {/* Hire */}
      <Tile className="lg:col-span-4 lg:row-span-2" title={t("modes.hire.title")} body={t("modes.hire.body")}>
        <div className="overflow-hidden rounded-xl bg-surface shadow-card">
          <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-4 border-b border-border px-4 py-2.5 text-[11px] text-tertiary sm:grid-cols-[minmax(0,1fr)_7rem_7rem_5.5rem]">
            <span className="truncate">{t("bento.hire.header")}</span>
            <span className="hidden sm:block">{t("bento.hire.skill1")}</span>
            <span className="hidden sm:block">{t("bento.hire.skill2")}</span>
            <span aria-hidden />
          </div>
          <ul className="divide-y divide-border">
            {candidates.map((c) => (
              <li key={c.name} className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-4 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_7rem_7rem_5.5rem]">
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar name={c.name} size="sm" />
                  <span className="truncate text-sm text-text">{c.name}</span>
                </span>
                <RangeScale low={c.a[0]} high={c.a[1]} estimate={c.a[2]} expected={4} size="sm" className="hidden sm:block" />
                <RangeScale low={c.b[0]} high={c.b[1]} estimate={c.b[2]} expected={3.5} size="sm" className="hidden sm:block" />
                <span className="flex justify-end">
                  <FitPill fit={c.fit} label={tf(c.fit)} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Tile>

      {/* Grow */}
      <Tile className="lg:col-span-2 lg:row-span-2" title={t("modes.grow.title")} body={t("modes.grow.body")}>
        <div className="flex flex-col gap-3 text-sm">
          <div className="rounded-xl bg-surface p-4 shadow-card">
            <p className="text-[11px] font-medium text-tertiary">{t("modes.grow.wellLabel")}</p>
            <p className="mt-1.5 leading-relaxed text-text">{t("modes.grow.well")}</p>
          </div>
          <div className="rounded-xl bg-ink p-4 text-ink-foreground shadow-card">
            <p className="text-[11px] font-medium text-ink-secondary">{t("modes.grow.expertLabel")}</p>
            <p className="mt-1.5 leading-relaxed">{t("modes.grow.expert")}</p>
          </div>
        </div>
      </Tile>

      {/* Team */}
      <Tile className="lg:col-span-3" title={t("modes.team.title")} body={t("modes.team.body")}>
        <div className="grid grid-cols-5 gap-1 rounded-xl bg-surface p-3 shadow-card" role="img" aria-label={t("modes.team.heatLabel")}>
          {HEAT.flatMap((row, r) => row.map((v, c) => <span key={`${r}-${c}`} className={cn("aspect-[2.2] rounded-[4px]", LEVEL_BG[v])} />))}
        </div>
      </Tile>

      {/* Fairness */}
      <Tile className="lg:col-span-3" title={t("bento.fairness.title")} body={t("bento.fairness.body")}>
        <div className="rounded-xl bg-surface p-4 shadow-card" role="img" aria-label={t("bento.fairness.chart")}>
          <div className="relative flex flex-col gap-2.5" dir="ltr">
            {([["a", 1], ["b", 0.92], ["c", 0.86]] as const).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.5rem] items-center gap-3">
                <span className="truncate text-[11px] text-secondary" dir="auto">{t(`bento.fairness.${k}`)}</span>
                <span className="h-2 rounded-full bg-level-empty">
                  <span className="block h-full rounded-full bg-level-4" style={{ width: `${v * 100}%` }} />
                </span>
                <span className="text-end text-[11px] text-tertiary tabular">{Math.round(v * 100)}%</span>
              </div>
            ))}
            {/* The four-fifths line sits at 80% of the bar track. */}
            <span className="pointer-events-none absolute -inset-y-1.5 w-px border-s border-dashed border-text/50" style={{ left: "calc(4.5rem + 0.75rem + (100% - 4.5rem - 2.5rem - 1.5rem) * 0.8)" }} aria-hidden />
          </div>
          <p className="mt-3 text-[11px] text-tertiary">{t("bento.fairness.line")}</p>
        </div>
      </Tile>

      {/* Small tiles */}
      <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-4">
        {small.map(({ key, icon: Icon }) => (
          <li key={key} className="rounded-[20px] bg-surface p-6 shadow-card">
            <span className="inline-flex size-9 items-center justify-center rounded-[10px] bg-accent-subtle text-accent-text">
              <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </span>
            <h3 className="mt-4 font-semibold text-text">{t(`bento.small.${key}.title`)}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-secondary">{t(`bento.small.${key}.body`)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Tile({ title, body, className, children }: { title: string; body: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("flex flex-col gap-6 rounded-[20px] bg-surface-subtle p-6 shadow-[inset_0_0_0_1px_var(--border)] sm:p-7", className)}>
      <div>
        <h3 className="font-display text-2xl font-semibold text-text">{title}</h3>
        <p className="mt-2 max-w-xl leading-relaxed text-secondary">{body}</p>
      </div>
      <div className="mt-auto">{children}</div>
    </section>
  );
}
