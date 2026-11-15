import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireViewer } from "@/lib/auth/session";
import { getGrowProfile } from "@/lib/grow/profile";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { GrowOnboardingForm } from "@/components/grow/onboarding-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("grow.onboarding");
  return { title: t("title") };
}

export default async function GrowOnboarding() {
  const viewer = await requireViewer();
  const t = await getTranslations("grow.onboarding");
  const p = await getGrowProfile(viewer.user.id);
  return (
    <PageContainer className="max-w-5xl">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="max-w-2xl">
          <PageHeader title={t("title")} description={t("description")} />
          <GrowOnboardingForm initial={p ? { currentRole: p.currentRole, experienceYears: p.experienceYears, goal: p.goal, hoursPerWeek: p.hoursPerWeek } : null} />
        </div>
        {/* What happens after this form: a real sequence. */}
        <aside className="self-start rounded-[20px] bg-ink p-6 text-ink-foreground lg:sticky lg:top-12">
          <h2 className="text-lg font-semibold">{t("next.title")}</h2>
          <ol className="mt-5 flex flex-col gap-5">
            {(["baseline", "profile", "practice"] as const).map((k, i) => (
              <li key={k} className="flex gap-3.5">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-raised text-sm font-semibold text-saffron tabular">{i + 1}</span>
                <span>
                  <span className="block font-medium">{t(`next.${k}.title`)}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-secondary">{t(`next.${k}.body`)}</span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </PageContainer>
  );
}
