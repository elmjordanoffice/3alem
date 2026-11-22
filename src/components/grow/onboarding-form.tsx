"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { saveOnboardingAction } from "@/app/actions/grow";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const HOURS = [1, 2, 3, 5];
/** "How often does this describe you?" on the 1–5 scale; "not sure" leaves the domain out. */
const OFTEN = [
  ["rarely", 1.5],
  ["sometimes", 2.5],
  ["often", 3.5],
  ["almostAlways", 4.5],
] as const;

type Values = { currentRole: string; experienceYears: number; goal: string; hoursPerWeek: number; selfView: Record<string, number>; cvText: string };
type Career = { titles: string[]; years: number | null; worldId: string | null; family: string | null; managesPeople: boolean; teamSize: number | null; shows: string[] };

export function GrowOnboardingForm({ initial, domains }: { initial: (Omit<Values, "selfView" | "cvText"> & { selfView?: Record<string, number>; cvText?: string }) | null; domains: { key: string; name: string; statement: string }[] }) {
  const t = useTranslations("grow.onboarding");
  const router = useRouter();
  const [v, setV] = React.useState<Values>({ currentRole: "", experienceYears: 3, goal: "", hoursPerWeek: 2, ...initial, selfView: initial?.selfView ?? {}, cvText: initial?.cvText ?? "" });
  const [career, setCareer] = React.useState<Career | null>(null);
  const [cvState, setCvState] = React.useState<"idle" | "reading" | "error">("idle");
  const [yearsTouched, setYearsTouched] = React.useState(Boolean(initial));
  const fileRef = React.useRef<HTMLInputElement>(null);
  // What the CV says, shown before saving; fills the obvious gaps it can.
  const applyReading = React.useCallback(
    (c: Career, text?: string) => {
      setCareer(c);
      setV((x) => ({
        ...x,
        ...(text !== undefined ? { cvText: text } : {}),
        ...(c.titles[0] && !x.currentRole ? { currentRole: c.titles[0] } : {}),
        ...(c.years && !yearsTouched ? { experienceYears: c.years } : {}),
      }));
    },
    [yearsTouched],
  );
  const readPasted = async (text: string) => {
    if (text.trim().length < 40) return setCareer(null);
    const r = await fetch("/api/grow/cv", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) }).then((x) => x.json()).catch(() => null);
    if (r?.ok) applyReading(r.career);
  };
  const upload = async (file: File) => {
    setCvState("reading");
    const body = new FormData();
    body.append("file", file);
    const r = await fetch("/api/grow/cv", { method: "POST", body }).then((x) => x.json()).catch(() => null);
    if (!r?.ok) return setCvState("error");
    setCvState("idle");
    applyReading(r.career, r.text);
  };
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const res = await saveOnboardingAction(v);
        setPending(false);
        if (!res.ok) return setError(t("error"));
        router.push("/app/grow");
        router.refresh();
      }}
    >
      {/* The CV first: it can fill in the rest, and it shapes every scenario. */}
      <section aria-labelledby="cv-h" className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="cv-h" className="text-sm font-semibold text-text">{t("cv.title")}</h2>
            <p className="mt-0.5 max-w-xl text-sm text-secondary">{t("cv.body")}</p>
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} aria-label={t("cv.upload")} />
          <Button type="button" variant="secondary" size="sm" loading={cvState === "reading"} onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden />
            {t("cv.upload")}
          </Button>
        </div>
        <Textarea value={v.cvText} onChange={(e) => setV((x) => ({ ...x, cvText: e.target.value }))} onBlur={(e) => readPasted(e.target.value)} placeholder={t("cv.placeholder")} className="min-h-32 text-sm" aria-label={t("cv.title")} dir="auto" />
        {cvState === "error" ? <p className="text-sm text-critical">{t("cv.error")}</p> : null}
        {career ? <CvReading career={career} /> : null}
        <p className="text-xs text-tertiary">{t("cv.private")}</p>
      </section>
      <Field label={t("currentRole")} hint={t("currentRoleHint")}>
        {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={v.currentRole} onChange={(e) => setV((x) => ({ ...x, currentRole: e.target.value }))} placeholder={t("currentRolePlaceholder")} required />}
      </Field>
      <Field label={t("experience")}>
        {({ id }) => <Input id={id} type="number" min={0} max={50} value={v.experienceYears} onChange={(e) => (setYearsTouched(true), setV((x) => ({ ...x, experienceYears: Number(e.target.value) })))} className="max-w-28" />}
      </Field>
      <Field label={t("goal")} hint={t("goalHint")}>
        {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={v.goal} onChange={(e) => setV((x) => ({ ...x, goal: e.target.value }))} placeholder={t("goalPlaceholder")} required />}
      </Field>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-text">{t("hours")}</legend>
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {HOURS.map((h) => (
            <button key={h} type="button" role="radio" aria-checked={v.hoursPerWeek === h} onClick={() => setV((x) => ({ ...x, hoursPerWeek: h }))} className={cn("h-10 rounded-control border px-4 text-sm font-medium", v.hoursPerWeek === h ? "border-accent bg-accent-subtle text-accent-text" : "border-border-strong text-secondary hover:bg-surface-subtle")}>
              {t("hoursOption", { n: h })}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-text">{t("selfTitle")}</legend>
        <p className="-mt-1 text-sm text-secondary">{t("selfHint")}</p>
        <ul className="flex flex-col gap-2">
          {domains.map((d) => {
            const cur = v.selfView[d.key];
            const set = (val: number | null) =>
              setV((x) => {
                const next = { ...x.selfView };
                if (val == null) delete next[d.key];
                else next[d.key] = val;
                return { ...x, selfView: next };
              });
            return (
              <li key={d.key} className="rounded-[12px] bg-surface p-3.5 shadow-card">
                <p className="text-sm font-medium text-text">{d.name}</p>
                <p className="mt-0.5 text-sm text-secondary">“{d.statement}”</p>
                <div role="radiogroup" aria-label={t("selfAria", { domain: d.name })} className="mt-2.5 flex flex-wrap gap-1.5">
                  {OFTEN.map(([k, val]) => (
                    <button key={k} type="button" role="radio" aria-checked={cur === val} onClick={() => set(cur === val ? null : val)} className={cn("h-9 rounded-[10px] px-3 text-[13px] font-medium shadow-[inset_0_0_0_1px_var(--border)]", cur === val ? "bg-accent text-accent-foreground shadow-none" : "text-secondary hover:bg-surface-subtle")}>
                      {t(`often.${k}`)}
                    </button>
                  ))}
                  <button type="button" role="radio" aria-checked={cur == null} onClick={() => set(null)} className={cn("h-9 rounded-[10px] px-3 text-[13px] font-medium", cur == null ? "bg-surface-sunken text-text" : "text-tertiary hover:bg-surface-subtle")}>
                    {t("often.unsure")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </fieldset>
      <Alert tone="neutral">{t("privacy")}</Alert>
      {error ? <Alert tone="critical">{error}</Alert> : null}
      <Button type="submit" size="lg" className="self-start" loading={pending} disabled={v.currentRole.trim().length < 2 || v.goal.trim().length < 3}>
        {t("submit")}
      </Button>
    </form>
  );
}

/** What the CV reader found, plainly, so the person can see what shapes their practice. */
function CvReading({ career }: { career: Career }) {
  const t = useTranslations("grow.onboarding.cv");
  const td = useTranslations("domainsShort");
  const items = [
    career.titles.length ? t("read.titles", { titles: career.titles.join(" · ") }) : null,
    career.years ? t("read.years", { n: career.years }) : null,
    career.worldId ? t(`read.industry.${career.worldId}` as "read.industry.northwind-logistics") : null,
    career.managesPeople ? (career.teamSize ? t("read.team", { n: career.teamSize }) : t("read.managed")) : null,
    career.shows.length ? t("read.shows", { skills: career.shows.map((d) => td(d)).join(", ") }) : null,
  ].filter((x): x is string => Boolean(x));
  if (!items.length) return null;
  return (
    <div className="rounded-[12px] bg-surface-subtle p-3.5">
      <p className="eyebrow text-tertiary">{t("read.title")}</p>
      <ul className="mt-2 flex flex-col gap-1 text-sm text-text">
        {items.map((x) => (
          <li key={x} className="flex gap-2">
            <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-saffron" aria-hidden />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
