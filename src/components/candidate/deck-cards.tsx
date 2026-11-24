"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowUpDown, BarChart3, FileText, Inbox, LayoutTemplate, ListChecks, Mail, MessagesSquare, PenLine, PieChart, Route, Scale, Table2, type LucideIcon } from "lucide-react";
import type { Material } from "@/lib/assessment/materials";
import { castIn, sceneArt } from "@/lib/brand/scene-art";
import { MaterialView } from "@/components/assessment/document-viewer";
import { initials, cn } from "@/lib/utils";
import type { StoryNote } from "@/lib/hire/story";
import { ColleagueNote } from "./story";

/**
 * The cards of the phone deck. Every card has its own face: the situation is
 * an ink cover with art drawn from the scene itself, each document looks like
 * the thing it is, and the task says how to answer before you start.
 */

export const MATERIAL_ICON: Record<Material["kind"], LucideIcon> = { email: Mail, memo: FileText, table: Table2, chart: BarChart3 };

export const TASK_ICON: Record<string, LucideIcon> = {
  choice: ListChecks,
  ranking: ArrowUpDown,
  allocation: PieChart,
  written: PenLine,
  inbox: Inbox,
  roleplay: MessagesSquare,
  design: LayoutTemplate,
  chain: Route,
  forced_choice: Scale,
};

/** The scene's own picture: the brand's bands narrowing into the dot, composed from the title. */
export function SceneArt({ seed, className }: { seed: string; className?: string }) {
  const art = React.useMemo(() => sceneArt(seed), [seed]);
  const cx = art.stack[0]!.x + art.stack[0]!.w / 2;
  const cy = (art.stack[0]!.y + art.dot.cy) / 2;
  return (
    <svg viewBox={`0 0 ${art.width} ${art.height}`} className={className} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g>
        {art.field.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={b.h / 2} fill="var(--hero-foreground)" opacity={b.strength} />
        ))}
      </g>
      <g transform={`rotate(${art.tilt} ${cx} ${cy})`}>
        {art.stack.map((b, i) => (
          <rect
            key={i}
            className="art-band"
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={b.h / 2}
            fill="var(--hero-foreground)"
            opacity={0.22 + b.strength * 0.5}
            style={{ animationDelay: `${120 + i * 110}ms` }}
          />
        ))}
        <circle className="art-dot" cx={art.dot.cx} cy={art.dot.cy} r={art.dot.r} fill="var(--signal)" style={{ animationDelay: `${180 + art.stack.length * 110}ms` }} />
      </g>
    </svg>
  );
}

/** Initials, overlapping, for the people a scene involves. */
function FacePile({ people }: { people: { name: string; role: string }[] }) {
  return (
    <span className="flex -space-x-2 rtl:space-x-reverse" aria-hidden>
      {people.map((p) => (
        <span key={p.name} className="grid size-8 place-items-center rounded-full bg-white text-[11px] font-semibold text-accent ring-2 ring-[var(--hero-from)]">
          {initials(p.name)}
        </span>
      ))}
    </span>
  );
}

export function CoverCard({
  title,
  scenario,
  eyebrow,
  materials,
  cast,
  note = null,
}: {
  title: string;
  scenario: string;
  eyebrow: string;
  materials: Material[];
  cast: { name: string; role: string }[];
  note?: StoryNote | null;
}) {
  const t = useTranslations("candidate.deck");
  const td = useTranslations("components.documents");
  const people = castIn(scenario, cast);
  const list = new Intl.ListFormat(undefined, { type: "conjunction" });
  return (
    <div className="flex min-h-full flex-col">
      <div className={cn("relative -mx-5 -mt-5 overflow-hidden", note ? "h-[20vh] max-h-44 min-h-32" : "h-[28vh] max-h-60 min-h-40")}>
        <SceneArt seed={title} className="absolute inset-0 size-full" />
        <span className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[var(--hero-from)] to-transparent" aria-hidden />
      </div>
      {note ? <ColleagueNote note={note} tone="ink" className="mb-5" /> : null}
      <p className="eyebrow text-hero-secondary">{eyebrow}</p>
      <h1 className="mt-2 font-display text-[2rem] font-extrabold leading-[1.04] tracking-[-0.01em] text-hero-foreground [font-stretch:112%]" dir="auto">
        {title}
      </h1>
      <p className="mt-4 whitespace-pre-line text-[16px] leading-[1.6] text-hero-foreground/90" dir="auto">
        {scenario}
      </p>
      {people.length ? (
        <p className="mt-5 flex items-center gap-3 text-sm text-hero-secondary">
          <FacePile people={people} />
          <span>{t("with", { names: list.format(people.map((p) => p.name)) })}</span>
        </p>
      ) : null}
      {materials.length ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {materials.map((m) => {
            const Icon = MATERIAL_ICON[m.kind];
            return (
              <li key={m.id} className="hero-tile flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-hero-foreground">
                <Icon className="size-3.5" aria-hidden />
                {td(m.kind)}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** A document as its own card: a header that says what it is, then the thing itself. */
export function MaterialCard({ material, index, total, org }: { material: Material; index: number; total: number; org: string }) {
  const t = useTranslations("candidate.deck");
  const td = useTranslations("components.documents");
  const Icon = MATERIAL_ICON[material.kind];
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground">
            <Icon className="size-4" strokeWidth={1.9} aria-hidden />
          </span>
          <span className="eyebrow text-text">{td(material.kind)}</span>
        </span>
        <span className="text-xs text-tertiary tabular">{t("document", { n: index, total })}</span>
      </div>
      {material.kind !== "email" ? (
        <h2 className="mt-4 text-[1.375rem] font-semibold leading-tight text-text" dir="auto">
          {material.title}
        </h2>
      ) : null}
      <div className={cn("mt-4", material.kind === "table" && "[&_table]:text-[13px]")}>
        <MaterialView material={material} bare org={org} />
      </div>
    </div>
  );
}

/** How to answer, before the prompt. */
export function TaskHeader({ kind, label, stage }: { kind: string; label: string; stage: "MAIN" | "PROBE" | "TWIST" }) {
  const t = useTranslations("candidate.deck");
  const Icon = stage === "MAIN" ? (TASK_ICON[kind] ?? PenLine) : PenLine;
  const how = stage === "MAIN" ? kind : "written";
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="eyebrow flex items-center gap-2 text-text">
        <span className="size-2 rounded-full bg-saffron" aria-hidden />
        {label}
      </p>
      <span className="flex items-center gap-1.5 rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-secondary">
        <Icon className="size-3.5" aria-hidden />
        {t(`how.${how}` as "how.written")}
      </span>
    </div>
  );
}
