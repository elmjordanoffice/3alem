"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CandidateShell } from "@/components/candidate/shell";

export function GrowComplete() {
  const t = useTranslations("grow.complete");
  return (
    <CandidateShell>
      <div className="mx-auto flex max-w-[680px] flex-col gap-6 px-4 py-20 animate-slide-up">
        <h1 className="text-2xl font-semibold text-text">{t("title")}</h1>
        <p className="text-lg leading-relaxed text-secondary">{t("body")}</p>
        <Button asChild size="lg" className="self-start">
          <Link href="/app/grow/profile">
            {t("cta")}
            <ArrowRight className="flip-rtl" aria-hidden />
          </Link>
        </Button>
      </div>
    </CandidateShell>
  );
}
