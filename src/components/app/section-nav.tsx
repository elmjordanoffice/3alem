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
    <div className="pointer-events-none sticky top-14 z-20 px-4 py-2 sm:px-8 lg:top-0">
      <div className="pointer-events-auto mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto [scrollbar-width:none]">
        <span className="flex shrink-0 items-center gap-2.5 rounded-full bg-surface/90 py-1 pe-4 ps-1 text-sm font-bold text-text shadow-card backdrop-blur-xl">
          {Icon ? (
            <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_6px_16px_-6px_var(--accent)]">
              <Icon className="size-4" strokeWidth={2} aria-hidden />
            </span>
          ) : null}
          {title}
        </span>
        <nav aria-label={title} className="flex shrink-0 items-center gap-1 rounded-full bg-surface/90 p-1 shadow-card backdrop-blur-xl">
          {tabs.map((t) => {
            const active = t.href === current;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  active ? "bg-accent font-semibold text-accent-foreground shadow-[0_6px_16px_-6px_var(--accent)]" : "text-secondary hover:bg-surface-subtle hover:text-text",
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
