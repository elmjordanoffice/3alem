"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { runRetentionNow } from "@/app/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RetentionCard({ months }: { months: number }) {
  const t = useTranslations("orgSettings");
  const [pending, setPending] = React.useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dataTitle")}</CardTitle>
        <CardDescription>{t("dataDescription", { months })}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-sm text-secondary">{t("runNowHint")}</p>
        <Button
          variant="secondary"
          loading={pending}
          onClick={async () => {
            setPending(true);
            const res = await runRetentionNow();
            setPending(false);
            if (res.ok) toast.success(t("runNowDone", { n: res.deleted }));
          }}
        >
          {t("runNow")}
        </Button>
      </CardContent>
    </Card>
  );
}
