import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireViewer } from "@/lib/auth/session";
import { Logo } from "@/components/brand/logo";
import { OnboardingChoice } from "@/components/app/onboarding-choice";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding");
  return { title: t("title") };
}

export default async function OnboardingPage() {
  const viewer = await requireViewer();
  const t = await getTranslations("onboarding");
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center px-4 sm:px-6">
        <Logo />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-[8vh]">
        <h1 className="text-xl font-semibold text-text">{t("welcome", { name: viewer.user.name.split(" ")[0] ?? "" })}</h1>
        <p className="mt-2 text-secondary">{t("subtitle")}</p>
        <OnboardingChoice />
      </main>
    </div>
  );
}
