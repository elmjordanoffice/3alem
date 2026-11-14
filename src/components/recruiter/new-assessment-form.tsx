"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { createAssessment } from "@/app/actions/assessments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { useNumbers } from "@/components/providers";

export function NewAssessmentForm({ aiMode }: { aiMode: "anthropic" | "offline" }) {
  const t = useTranslations("assessments.newPage");
  const n = useNumbers();
  const router = useRouter();
  const [jd, setJd] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const tooShort = jd.trim().length < 80;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const res = await createAssessment({ jobDescription: jd });
        if (res.ok) router.push(`/app/assessments/${res.id}/setup`);
        else {
          setError(t(`errors.${res.error}`));
          setPending(false);
        }
      }}
    >
      <Field label={t("jdLabel")} hint={t("jdHint")}>
        {({ id, describedBy }) => (
          <Textarea id={id} aria-describedby={describedBy} value={jd} onChange={(e) => setJd(e.target.value)} className="min-h-[22rem] font-normal" placeholder={t("jdPlaceholder")} disabled={pending} />
        )}
      </Field>
      <div className="flex items-center justify-between text-xs text-tertiary">
        <span className="tabular">{t("chars", { n: n.number(jd.length) })}</span>
        <span>{aiMode === "anthropic" ? t("modeAi") : t("modeOffline")}</span>
      </div>
      {error ? <Alert tone="critical">{error}</Alert> : null}
      {pending ? (
        <Alert tone="info" title={t("analysingTitle")}>
          {t("analysingBody")}
        </Alert>
      ) : null}
      <Button type="submit" size="lg" className="self-start" disabled={tooShort} loading={pending}>
        {!pending ? <Sparkles aria-hidden /> : null}
        {t("submit")}
      </Button>
    </form>
  );
}
