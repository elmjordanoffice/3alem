import { cn } from "@/lib/utils";
import { ARABIC, LATIN } from "./wordmark-paths";

/**
 * The Aalim mark: the narrowing range. A scale, the band of plausible levels
 * in saffron (the evidence colour) and the estimate. See /brand.
 */
export function LogoMark({ className, reverse = false }: { className?: string; reverse?: boolean }) {
  // Reversed (on ink): the square turns light and the scale turns ink, as in public/brand/logo-reverse.svg.
  const square = reverse ? "var(--ink-foreground)" : "var(--ink)";
  const track = reverse ? "var(--ink)" : "var(--ink-foreground)";
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7 shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill={square} />
      <rect x="5" y="15.2" width="22" height="1.6" rx="0.8" fill={track} opacity="0.38" />
      <rect x="11.5" y="12.4" width="13" height="7.2" rx="3.6" fill="var(--saffron)" />
      <circle cx="18.6" cy="16" r="1.9" fill={reverse ? "var(--ink-foreground)" : "var(--ink)"} />
    </svg>
  );
}

/**
 * The wordmark, outlined from Alexandria (scripts/brand-assets.mts): "aalim"
 * with its tittle in saffron, and عالم. Arabic sits on the Latin baseline.
 */
export function Wordmark({ showArabic = true, className }: { showArabic?: boolean; className?: string }) {
  const arScale = (LATIN.height * 0.9) / ARABIC.height;
  const arDy = LATIN.baseline - ARABIC.baseline * arScale;
  const gap = LATIN.height * 0.36;
  const arX = LATIN.width + gap * 2;
  const width = showArabic ? arX + ARABIC.width * arScale : LATIN.width;
  const bottom = showArabic ? Math.max(LATIN.height, arDy + ARABIC.height * arScale) : LATIN.height;
  return (
    <svg viewBox={`0 0 ${width} ${bottom}`} className={cn("h-[1.05em] w-auto shrink-0", className)} role="img" aria-label="Aalim">
      <path d={LATIN.body} fill="currentColor" />
      <path d={LATIN.tittle} fill="var(--saffron)" />
      {showArabic ? (
        <>
          <rect x={LATIN.width + gap * 0.93} y={LATIN.height * 0.14} width={LATIN.height * 0.03} height={LATIN.height * 0.78} fill="currentColor" opacity={0.25} />
          <g transform={`translate(${arX} ${arDy}) scale(${arScale})`}>
            <path d={ARABIC.d} fill="currentColor" opacity={0.75} />
          </g>
        </>
      ) : null}
    </svg>
  );
}

export function Logo({ className, showArabic = true, reverse = false }: { className?: string; showArabic?: boolean; reverse?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-[19px]", reverse ? "text-ink-foreground" : "text-text", className)}>
      <LogoMark reverse={reverse} />
      <Wordmark showArabic={showArabic} />
    </span>
  );
}
