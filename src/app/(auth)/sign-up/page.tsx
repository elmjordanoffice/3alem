import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getViewer } from "@/lib/auth/session";
import { publicRobots } from "@/lib/legal";
import { SignUpForm } from "@/components/app/auth-forms";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signUp");
  return { title: t("title"), robots: publicRobots() };
}

export default async function Page() {
  if (await getViewer()) redirect("/app");
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full" />}>
      <SignUpForm />
    </Suspense>
  );
}
