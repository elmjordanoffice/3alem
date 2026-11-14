import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/app/auth-forms";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.forgot");
  return { title: t("title") };
}

export default async function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
