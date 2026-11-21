"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { saveOnboardingAction } from "@/app/actions/grow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type Values = { currentRole: string; experienceYears: number; goal: string; hoursPerWeek: number; selfView: Record<string, number> };

export function GrowOnboardingForm({ initial, domains }: { initial: (Omit<Values, "selfView"> & { selfView?: Record<string, number> }) | null; domains: { key: string; name: string; statement: string }[] }) {
  const t = useTranslations("grow.onboarding");
  const router = useRouter();
  const [v, setV] = React.useState<Values>({ currentRole: "", experienceYears: 3, goal: "", hoursPerWeek: 2, ...initial, selfView: initial?.selfView ?? {} });
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
      <Field label={t("currentRole")} hint={t("currentRoleHint")}>
        {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={v.currentRole} onChange={(e) => setV({ ...v, currentRole: e.target.value })} placeholder={t("currentRolePlaceholder")} required />}
      </Field>
      <Field label={t("experience")}>
        {({ id }) => <Input id={id} type="number" min={0} max={50} value={v.experienceYears} onChange={(e) => setV({ ...v, experienceYears: Number(e.target.value) })} className="max-w-28" />}
      </Field>
      <Field label={t("goal")} hint={t("goalHint")}>
        {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={v.goal} onChange={(e) => setV({ ...v, goal: e.target.value })} placeholder={t("goalPlaceholder")} required />}
      </Field>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-text">{t("hours")}</legend>
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {HOURS.map((h) => (
            <button key={h} type="button" role="radio" aria-checked={v.hoursPerWeek === h} onClick={() => setV({ ...v, hoursPerWeek: h })} className={cn("h-10 rounded-control border px-4 text-sm font-medium", v.hoursPerWeek === h ? "border-accent bg-accent-subtle text-accent-text" : "border-border-strong text-secondary hover:bg-surface-subtle")}>
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
            const set = (val: number | null) => {
              const next = { ...v.selfView };
              if (val == null) delete next[d.key];
              else next[d.key] = val;
              setV({ ...v, selfView: next });
            };
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
