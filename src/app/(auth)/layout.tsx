import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="rounded-control focus-visible:outline-2 focus-visible:outline-focus">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeMenu />
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-[8vh] sm:pt-[12vh]">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}
