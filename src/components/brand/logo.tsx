import { cn } from "@/lib/utils";

/**
 * The Aalim wordmark: a simple mark (a filled square with an open corner,
 * suggesting a lens / a page) plus the name in both scripts.
 */
export function Logo({ className, showArabic = true }: { className?: string; showArabic?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-text", className)}>
      <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="var(--accent)" />
        <path d="M8 16.5 12 7l4 9.5M9.6 13h4.8" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">
        Aalim
        {showArabic ? <span className="ms-1.5 font-medium text-tertiary" lang="ar">عالم</span> : null}
      </span>
    </span>
  );
}
