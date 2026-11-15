import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { aiMode } from "@/lib/ai/run";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { NewAssessmentForm } from "@/components/recruiter/new-assessment-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("assessments.newPage");
  return { title: t("title") };
}

export default async function NewAssessmentPage() {
  await requirePermission("assessment.create");
  const t = await getTranslations("assessments.newPage");
  return (
    <PageContainer className="max-w-5xl">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
          <PageHeader title={t("title")} description={t("description")} />
          <NewAssessmentForm aiMode={aiMode()} />
        </div>
        {/* What happens after "Analyse": a real sequence. */}
        <aside className="self-start rounded-[20px] bg-ink p-6 text-ink-foreground lg:sticky lg:top-12">
          <h2 className="text-lg font-semibold">{t("steps.title")}</h2>
          <ol className="mt-5 flex flex-col gap-5">
            {(["analyse", "review", "invite"] as const).map((k, i) => (
              <li key={k} className="flex gap-3.5">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-raised text-sm font-semibold text-saffron tabular">{i + 1}</span>
                <span>
                  <span className="block font-medium">{t(`steps.${k}.title`)}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-secondary">{t(`steps.${k}.body`)}</span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </PageContainer>
  );
}
