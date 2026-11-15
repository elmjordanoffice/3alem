"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/app/page-header";
import { OutOfRange } from "@/components/brand/out-of-range";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errors");
  return (
    <PageContainer className="max-w-xl">
      <div role="alert" className="flex flex-col py-12">
        <OutOfRange className="w-48 rtl:-scale-x-100" />
        <h1 className="mt-10 text-[2rem] font-semibold leading-tight text-text">{t("pageTitle")}</h1>
        <p className="mt-3 text-lg leading-relaxed text-secondary">{t("pageBody")}</p>
        <Button className="mt-8 self-start" onClick={reset}>
          <RotateCcw aria-hidden />
          {t("retry")}
        </Button>
      </div>
    </PageContainer>
  );
}
