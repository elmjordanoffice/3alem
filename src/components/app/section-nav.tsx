"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionTab {
  href: string;
  label: string;
  /** Match only the exact path (for a section's overview tab). */
  exact?: boolean;
}

/**
 * A section's own navigation (Grow, Organisation, Platform admin): a sticky
 * bar of tabs above the page, so the main sidebar stays short.
 */
export function SectionNav({ title, icon: Icon, tabs, hideOn = [] }: { title: string; icon?: LucideIcon; tabs: SectionTab[]; hideOn?: string[] }) {
  const pathname = usePathname();
  if (hideOn.some((p) => pathname.startsWith(p))) return null;
  const current = tabs
    .filter((t) => (t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <div className="sticky top-14 z-20 border-b border-border bg-background px-4 sm:px-8 lg:top-0">
      <div className="flex max-w-full items-center gap-6 overflow-x-auto [scrollbar-width:none]">
        <span className="flex shrink-0 items-center gap-2 py-3 text-sm font-semibold text-text">
          {Icon ? <Icon className="size-4 text-text" strokeWidth={1.75} aria-hidden /> : null}
          {title}
        </span>
        <span className="h-4 w-px shrink-0 bg-border-strong" aria-hidden />
        <nav aria-label={title} className="flex shrink-0 items-stretch gap-5">
          {tabs.map((t) => {
            const active = t.href === current;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-12 items-center whitespace-nowrap text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
                  active ? "font-semibold text-text after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-text" : "text-secondary hover:text-text",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
