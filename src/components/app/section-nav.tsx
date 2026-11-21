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
    <div className="sticky top-14 z-20 px-4 pt-4 sm:px-8 lg:top-0">
      <div className="flex max-w-full items-center gap-4 overflow-x-auto rounded-[18px] bg-surface/90 p-1.5 ps-4 shadow-card backdrop-blur-md [scrollbar-width:none] sm:w-fit">
        <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-text">
          {Icon ? <Icon className="size-4 text-accent-text" strokeWidth={1.75} aria-hidden /> : null}
          {title}
        </span>
        <nav aria-label={title} className="flex shrink-0 items-center gap-1">
          {tabs.map((t) => {
            const active = t.href === current;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center whitespace-nowrap rounded-[12px] px-3.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
                  active ? "bg-accent font-medium text-accent-foreground shadow-[0_8px_20px_-10px_rgb(59_63_216/0.7)]" : "text-secondary hover:bg-surface-subtle hover:text-text",
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
