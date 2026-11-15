import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { OutOfRange } from "@/components/brand/out-of-range";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
        <Link href="/" className="rounded-control focus-visible:outline-2 focus-visible:outline-focus">
          <Logo />
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 pb-24">
        <OutOfRange className="w-56 rtl:-scale-x-100" />
        <p className="mt-10 text-sm text-tertiary">404</p>
        <h1 className="mt-2 text-[2.5rem] font-semibold leading-tight text-text">{t("notFoundTitle")}</h1>
        <p className="mt-3 text-lg leading-relaxed text-secondary">{t("notFoundBody")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/app">{t("goApp")}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">{t("goHome")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
