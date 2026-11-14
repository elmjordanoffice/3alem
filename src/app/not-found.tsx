import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">{t("notFoundTitle")}</h1>
        <p className="text-secondary">{t("notFoundBody")}</p>
      </div>
      <Button asChild variant="secondary">
        <Link href="/">{t("goHome")}</Link>
      </Button>
    </main>
  );
}
