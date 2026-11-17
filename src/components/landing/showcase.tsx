import { getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/avatar";
import { FitPill, type FitLevel } from "@/components/report/fit";
import { RangeScale } from "@/components/report/range-scale";
import { SplitWords } from "./split-words";
import { cn } from "@/lib/utils";

const HEAT: number[][] = [
  [4, 3, 4, 2, 3],
  [3, 4, 3, 3, 2],
  [2, 3, 3, 4, 4],
  [4, 2, 3, 3, 3],
  [3, 3, 2, 2, 4],
];
const LEVEL_BG = ["", "bg-level-1", "bg-level-2", "bg-level-3", "bg-level-4", "bg-level-5"];

/**
 * Hire, Grow and Team as showcase pieces: a lit frame on the night ground
 * holding a real fragment of the product on paper, then a tag, a title and one
 * line. Hire is the largest because it is what most visitors came for.
 */
export async function Showcase() {
  const t = await getTranslations("landing");
  const tf = await getTranslations("home.fit");
  const candidates: { name: string; fit: FitLevel; a: [number, number, number]; b: [number, number, number] }[] = [
    { name: t("bento.hire.c1"), fit: "STRONG", a: [3.6, 4.2, 3.9], b: [3.3, 3.9, 3.6] },
    { name: t("bento.hire.c2"), fit: "GOOD", a: [3.2, 3.9, 3.5], b: [3.6, 4.3, 4.0] },
    { name: t("bento.hire.c3"), fit: "PARTIAL", a: [2.4, 3.4, 2.9], b: [2.8, 3.6, 3.2] },
  ];

  return (
    <div className="mt-16 grid gap-x-6 gap-y-14 lg:grid-cols-12">
      <Piece className="lg:col-span-12" tag={t("showcase.hireTag")} title={t("modes.hire.title")} body={t("modes.hire.body")} wide>
        <div className="w-full max-w-xl overflow-hidden rounded-[14px] bg-surface text-text shadow-window">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 text-[11px] text-tertiary">
            <span className="truncate">{t("bento.hire.header")}</span>
            <span className="hidden gap-10 sm:flex">
              <span>{t("bento.hire.skill1")}</span>
              <span className="me-20">{t("bento.hire.skill2")}</span>
            </span>
          </div>
          <ul className="divide-y divide-border">
            {candidates.map((c) => (
              <li key={c.name} className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-4 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_6rem_6rem_5.5rem]">
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar name={c.name} size="sm" />
                  <span className="truncate text-sm">{c.name}</span>
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
      </Piece>

      <Piece className="lg:col-span-6" tag={t("showcase.growTag")} title={t("modes.grow.title")} body={t("modes.grow.body")}>
        <div className="flex w-full max-w-sm flex-col gap-3 text-sm">
          <div className="rounded-[14px] bg-surface p-4 text-text shadow-window">
            <p className="text-[11px] font-medium text-tertiary">{t("modes.grow.wellLabel")}</p>
            <p className="mt-1.5 leading-relaxed">{t("modes.grow.well")}</p>
          </div>
          <div className="ms-8 rounded-[14px] bg-ink-foreground p-4 text-ink shadow-window">
            <p className="text-[11px] font-medium text-ink/70">{t("modes.grow.expertLabel")}</p>
            <p className="mt-1.5 leading-relaxed">{t("modes.grow.expert")}</p>
          </div>
        </div>
      </Piece>

      <Piece className="lg:col-span-6" tag={t("showcase.teamTag")} title={t("modes.team.title")} body={t("modes.team.body")}>
        <div className="grid w-full max-w-sm grid-cols-5 gap-1.5 rounded-[14px] bg-surface p-3 shadow-window" role="img" aria-label={t("modes.team.heatLabel")}>
          {HEAT.flatMap((row, r) => row.map((v, c) => <span key={`${r}-${c}`} className={cn("aspect-[2] rounded-[5px]", LEVEL_BG[v])} />))}
        </div>
      </Piece>
    </div>
  );
}

function Piece({ tag, title, body, className, wide = false, children }: { tag: string; title: string; body: string; className?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <article data-reveal className={cn("group grid gap-6", wide ? "lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-center lg:gap-14" : "", className)}>
      <div className={cn("showcase-frame relative isolate flex items-center justify-center overflow-hidden rounded-[22px] px-6 py-10 sm:px-10", wide ? "min-h-[22rem] sm:py-14" : "min-h-[17rem]")}>
        <div className="fade-up relative w-full" style={{ "--d": "120ms" } as React.CSSProperties}>
          <div className="flex justify-center">{children}</div>
        </div>
      </div>
      <div className={wide ? "lg:order-first lg:max-w-md" : ""}>
        <p className="eyebrow text-sidebar-accent">{tag}</p>
        <h3 className={cn("mt-3 font-display font-semibold text-ink-foreground", wide ? "text-4xl sm:text-5xl" : "text-3xl")}>
          <SplitWords text={title} />
        </h3>
        <p className="fade-up mt-3 max-w-lg leading-relaxed text-ink-secondary" style={{ "--d": "200ms" } as React.CSSProperties}>
          {body}
        </p>
      </div>
    </article>
  );
}
