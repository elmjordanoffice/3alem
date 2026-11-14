"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/app/page-header";
import { Alert } from "@/components/ui/alert";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errors");
  return (
    <PageContainer>
      <Alert
        tone="critical"
        title={t("pageTitle")}
        action={
          <Button variant="secondary" size="sm" onClick={reset}>
            <RotateCcw aria-hidden />
            {t("retry")}
          </Button>
        }
      >
        {t("pageBody")}
      </Alert>
    </PageContainer>
  );
}
