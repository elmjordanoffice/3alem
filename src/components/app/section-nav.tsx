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
    <div className="sticky top-14 z-20 border-b border-border bg-background/90 backdrop-blur-md lg:top-0">
      <div className="flex items-center gap-6 overflow-x-auto px-4 sm:px-8 [scrollbar-width:none]">
        <span className="flex shrink-0 items-center gap-2 py-3 text-sm font-semibold text-text">
          {Icon ? <Icon className="size-4 text-accent-text" strokeWidth={1.75} aria-hidden /> : null}
          {title}
        </span>
        <nav aria-label={title} className="flex shrink-0 items-stretch gap-1 self-stretch">
          {tabs.map((t) => {
            const active = t.href === current;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center whitespace-nowrap rounded-control px-2.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
                  active ? "font-medium text-text" : "text-secondary hover:text-text",
                )}
              >
                {t.label}
                <span aria-hidden className={cn("absolute inset-x-2.5 -bottom-px h-0.5 rounded-full transition-colors duration-200", active ? "bg-accent" : "bg-transparent")} />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
