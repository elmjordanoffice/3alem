import { getTranslations } from "next-intl/server";
import { AlertTriangle, ArrowRight, MessageSquareText, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { RangeScale } from "@/components/report/range-scale";
import { cn } from "@/lib/utils";

/**
 * Three numbered figures, one per moment of an assessment. Each is a small,
 * real piece of the interface rather than an illustration.
 */
export async function Chapters() {
  const t = await getTranslations("landing.how");
  const figs = [
    { key: "jd", visual: <JdFigure /> },
    { key: "week", visual: <WeekFigure /> },
    { key: "evidence", visual: <EvidenceFigure /> },
  ] as const;
  return (
    <ol className="mt-14 grid gap-6 lg:grid-cols-3">
      {figs.map((f, i) => (
        <li key={f.key} className="group flex flex-col overflow-hidden rounded-[20px] bg-surface shadow-card">
          <div className="relative flex h-[19rem] items-center justify-center overflow-hidden bg-surface-subtle px-5 py-6">
            <div className="ink-grid absolute inset-0 opacity-0 dark:opacity-100" aria-hidden />
            <div className="relative w-full max-w-[22rem]">{f.visual}</div>
          </div>
          <div className="flex flex-1 flex-col p-6 sm:p-7">
            <p className="flex items-center gap-2 text-xs text-tertiary">
              <span className="font-medium text-accent-text">{t("fig")} <bdi className="tabular">0{i + 1}</bdi></span>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </p>
            <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-text">{t(`${f.key}.title`)}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-secondary">{t(`${f.key}.body`)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

async function JdFigure() {
  const t = await getTranslations("landing.how.jdFig");
  const rows = [
    { k: "s1", w: 0.9 },
    { k: "s2", w: 0.7 },
    { k: "s3", w: 0.55 },
    { k: "s4", w: 0.4 },
  ] as const;
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-text">{t("role")}</p>
          <span className="text-[11px] text-tertiary">{t("weight")}</span>
        </div>
        <ul className="mt-3 flex flex-col gap-2.5">
          {rows.map((r) => (
            <li key={r.k} className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-3">
              <span className="truncate text-xs text-secondary">{t(r.k)}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-level-empty" aria-hidden>
                <span className="block h-full rounded-full bg-accent" style={{ width: `${r.w * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl bg-warning-subtle p-3.5 text-xs shadow-card">
        <p className="flex items-center gap-1.5 font-medium text-warning">
          <AlertTriangle className="size-3.5" aria-hidden />
          {t("flagTitle")}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-text">
          <span className="line-through decoration-warning/70">{t("flagFrom")}</span>
          <ArrowRight className="flip-rtl size-3.5 text-tertiary" aria-hidden />
          <span className="font-medium">{t("flagTo")}</span>
        </p>
      </div>
    </div>
  );
}

async function WeekFigure() {
  const t = await getTranslations("landing.how.weekFig");
  const messages = [
    { from: "m1from", subject: "m1subject", time: "08:12", unread: false },
    { from: "m2from", subject: "m2subject", time: "09:30", unread: false },
    { from: "m3from", subject: "m3subject", time: "10:05", unread: false },
  ] as const;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1" aria-hidden>
        {(["d1", "d2", "d3", "d4", "d5"] as const).map((d, i) => (
          <span key={d} className={cn("flex-1 rounded-md py-1 text-center text-[10px]", i === 1 ? "bg-ink font-medium text-ink-foreground" : i < 1 ? "bg-level-2 text-[var(--level-2-fg)]" : "bg-surface text-tertiary shadow-card")}>
            {t(d)}
          </span>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl bg-surface shadow-card">
        <p className="border-b border-border px-3.5 py-2 text-[11px] font-medium text-tertiary">{t("inbox")}</p>
        <ul className="divide-y divide-border">
          {messages.map((m, i) => (
            <li key={m.from} className={cn("flex items-center gap-2.5 px-3.5 py-2.5", i === 0 && "bg-accent-subtle/60")}>
              <Avatar name={t(m.from)} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-text">{t(m.from)}</span>
                <span className="block truncate text-[11px] text-secondary">{t(m.subject)}</span>
              </span>
              <span className="shrink-0 text-[10px] text-tertiary tabular" dir="ltr">{m.time}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-2.5 rounded-xl bg-ink p-3 text-ink-foreground shadow-card">
        <Sparkles className="size-4 shrink-0 text-saffron" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium">{t("m4from")}: {t("m4subject")}</span>
          <span className="block truncate text-[11px] text-ink-secondary">{t("adaptive")}</span>
        </span>
      </div>
    </div>
  );
}

async function EvidenceFigure() {
  const td = await getTranslations("landing.demo");
  const t = await getTranslations("landing.figure");
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-surface p-4 shadow-card">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-medium text-text">{t("skills.priorities")}</p>
          <span className="text-[11px] text-secondary">
            {td("level")} <bdi dir="ltr" className="tabular text-tertiary">3.6–4.2</bdi>
          </span>
        </div>
        <RangeScale low={3.6} high={4.2} estimate={3.9} expected={4} size="sm" className="mt-2.5" />
        <blockquote className="mt-3.5 border-s-2 border-saffron ps-3 text-xs leading-relaxed text-secondary">
          <mark className="evidence-mark">{td("answerEvidence")}</mark>
          <footer className="mt-1 text-[10px] text-tertiary">{t("evidenceSource")}</footer>
        </blockquote>
      </div>
      <div className="flex gap-2.5 rounded-xl bg-surface p-3.5 shadow-card">
        <MessageSquareText className="mt-0.5 size-4 shrink-0 text-accent-text" strokeWidth={1.75} aria-hidden />
        <span className="min-w-0">
          <span className="block text-[11px] text-tertiary">{t("askLabel")}</span>
          <span className="mt-0.5 block text-xs leading-snug text-text">{t("ask1")}</span>
        </span>
      </div>
    </div>
  );
}
