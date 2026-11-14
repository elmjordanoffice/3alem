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

export function GrowOnboardingForm({ initial }: { initial: { currentRole: string; experienceYears: number; goal: string; hoursPerWeek: number } | null }) {
  const t = useTranslations("grow.onboarding");
  const router = useRouter();
  const [v, setV] = React.useState(initial ?? { currentRole: "", experienceYears: 3, goal: "", hoursPerWeek: 2 });
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
      <Alert tone="neutral">{t("privacy")}</Alert>
      {error ? <Alert tone="critical">{error}</Alert> : null}
      <Button type="submit" size="lg" className="self-start" loading={pending} disabled={v.currentRole.trim().length < 2 || v.goal.trim().length < 3}>
        {t("submit")}
      </Button>
    </form>
  );
}
