"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateOrganizationSettings } from "@/app/actions/organizations";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { contrastRatio } from "@/lib/contrast";

export function OrgSettingsForm(props: { name: string; brandColor: string | null; dataRetentionMonths: number }) {
  const t = useTranslations("orgSettings");
  const tc = useTranslations("common");
  const router = useRouter();
  const [name, setName] = React.useState(props.name);
  const [color, setColor] = React.useState(props.brandColor ?? "");
  const [retention, setRetention] = React.useState(String(props.dataRetentionMonths));
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const validColor = /^#[0-9a-fA-F]{6}$/.test(color);
  const ratio = validColor ? contrastRatio(color, "#ffffff") : null;

  return (
    <Card>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          const res = await updateOrganizationSettings({
            name,
            brandColor: color ? color : null,
            dataRetentionMonths: Number(retention),
          });
          setPending(false);
          if (!res.ok) {
            setError(t("invalid"));
            return;
          }
          setError(null);
          toast.success(t("saved"));
          router.refresh();
        }}
      >
        <CardHeader>
          <CardTitle>{t("general")}</CardTitle>
          <CardDescription>{t("generalDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {error ? <Alert tone="critical">{error}</Alert> : null}
          <Field label={t("name")}>
            {({ id }) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <Field label={t("brandColor")} hint={t("brandColorHint")} optionalLabel={tc("optional")}>
            {({ id, describedBy }) => (
              <div className="flex items-center gap-3">
                <span
                  className="size-10 shrink-0 rounded-control border border-border"
                  style={{ background: validColor ? color : "var(--accent)" }}
                  aria-hidden
                />
                <Input id={id} value={color} placeholder="#3B3FD8" onChange={(e) => setColor(e.target.value.trim())} aria-describedby={describedBy} className="max-w-40 font-mono" dir="ltr" />
              </div>
            )}
          </Field>
          {ratio !== null && ratio < 4.5 ? <Alert tone="warning">{t("lowContrast")}</Alert> : null}
          <Field label={t("retention")} hint={t("retentionHint")}>
            {({ id, describedBy }) => (
              <Input id={id} type="number" min={1} max={60} value={retention} onChange={(e) => setRetention(e.target.value)} aria-describedby={describedBy} className="max-w-28" />
            )}
          </Field>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={pending}>
            {tc("save")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
