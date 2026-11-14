"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { setLocale, setNumerals, setTextSize, updateProfile } from "@/app/actions/preferences";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/i18n/format";
import { useLocaleSettings } from "@/components/providers";
import { useMounted } from "@/lib/use-mounted";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-text">{label}</span>
        {hint ? <span className="text-sm text-secondary">{hint}</span> : null}
      </div>
      <div className="w-full sm:w-56">{children}</div>
    </div>
  );
}

export function AccountSettings(props: { name: string; email: string; locale: string; numerals: string; textSize: string }) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  // Show what is in effect right now (cookie), which the profile follows.
  const { locale, numerals } = useLocaleSettings();
  const mounted = useMounted();
  const [name, setName] = React.useState(props.name);
  const [saving, setSaving] = React.useState(false);
  const [nameError, setNameError] = React.useState<string | null>(null);

  const apply = (fn: () => Promise<unknown>) => async () => {
    await fn();
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            const res = await updateProfile({ name });
            setSaving(false);
            if (!res.ok) {
              setNameError(t("profile.nameRequired"));
              return;
            }
            setNameError(null);
            toast.success(t("profile.saved"));
            router.refresh();
          }}
        >
          <CardHeader>
            <CardTitle>{t("profile.title")}</CardTitle>
            <CardDescription>{t("profile.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Field label={t("profile.name")} error={nameError ?? undefined}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} value={name} onChange={(e) => setName(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid || undefined} />
              )}
            </Field>
            <Field label={t("profile.email")} hint={t("profile.emailHint")}>
              {({ id, describedBy }) => <Input id={id} value={props.email} readOnly disabled aria-describedby={describedBy} />}
            </Field>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" loading={saving} disabled={name.trim() === props.name}>
              {tc("save")}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("display.title")}</CardTitle>
          <CardDescription>{t("display.description")}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <Row label={t("display.language")}>
            <Select value={locale} onValueChange={(v) => apply(() => setLocale(v))()}>
              <SelectTrigger aria-label={t("display.language")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label={t("display.numerals")} hint={t("display.numeralsHint")}>
            <Select value={numerals} onValueChange={(v) => apply(() => setNumerals(v))()}>
              <SelectTrigger aria-label={t("display.numerals")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latn">{formatNumber(1234567890, "en", "latn", { useGrouping: false })}</SelectItem>
                <SelectItem value="arab">{formatNumber(1234567890, "ar", "arab", { useGrouping: false })}</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label={t("display.theme")}>
            <Select value={mounted ? (theme ?? "system") : "system"} onValueChange={setTheme}>
              <SelectTrigger aria-label={t("display.theme")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">{t("display.themeSystem")}</SelectItem>
                <SelectItem value="light">{t("display.themeLight")}</SelectItem>
                <SelectItem value="dark">{t("display.themeDark")}</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label={t("display.textSize")} hint={t("display.textSizeHint")}>
            <Select defaultValue={props.textSize} onValueChange={(v) => apply(() => setTextSize(v))()}>
              <SelectTrigger aria-label={t("display.textSize")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{t("display.textDefault")}</SelectItem>
                <SelectItem value="large">{t("display.textLarge")}</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </CardContent>
      </Card>
    </div>
  );
}
