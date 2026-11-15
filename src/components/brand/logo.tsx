import { cn } from "@/lib/utils";

/**
 * The Aalim mark: the narrowing range in miniature. A scale, the band of
 * plausible levels in saffron (the evidence colour), and the estimate.
 * Wordmark in both scripts.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7 shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="var(--ink)" />
      <rect x="6" y="15.1" width="20" height="1.8" rx="0.9" fill="var(--ink-foreground)" opacity="0.38" />
      <rect x="13.5" y="11.5" width="10" height="9" rx="4.5" fill="var(--saffron)" />
      <circle cx="19" cy="16" r="2.3" fill="var(--ink)" />
    </svg>
  );
}

export function Logo({ className, showArabic = true }: { className?: string; showArabic?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-text", className)}>
      <LogoMark />
      <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
        Aalim
        {showArabic ? <span className="ms-1.5 font-medium tracking-normal text-tertiary" lang="ar">عالم</span> : null}
      </span>
    </span>
  );
}
