import { cn } from "@/lib/utils";
import { ARABIC, LATIN, MARK } from "./wordmark-paths";

/**
 * The Aalim mark ("Range"): bands of uncertainty narrowing, step by step, into
 * one point, the estimate. Stacked, they read as an A. The dot is the only
 * colour: vermilion, the signal. See /brand and scripts/brand-assets.mts.
 */
export function LogoMark({ className, mono = false }: { className?: string; mono?: boolean; reverse?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-7 shrink-0", className)} aria-hidden>
      {MARK.bars.map((b) => (
        <rect key={b.y} x={b.x} y={b.y} width={b.w} height={MARK.h} rx={MARK.h / 2} fill="currentColor" />
      ))}
      <circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill={mono ? "currentColor" : "var(--saffron)"} />
    </svg>
  );
}

/** The app tile: the mark on ink, as on home screens and in the browser tab. */
export function LogoTile({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-[22.5%] bg-ink text-ink-foreground", className)} aria-hidden>
      <LogoMark className="size-[70%]" />
    </span>
  );
}

/**
 * The wordmarks, outlined from the brand fonts: AALIM in Archivo Expanded
 * ExtraBold and عالم in Beiruti Black, baselines aligned, with a hairline.
 */
export function Wordmark({ showArabic = true, className }: { showArabic?: boolean; className?: string }) {
  const H = LATIN.height;
  const arScale = (H * 1.18) / ARABIC.baseline;
  const arDy = H - ARABIC.baseline * arScale;
  const gap = H * 0.34;
  const arX = LATIN.width + gap * 2;
  const top = showArabic ? Math.min(0, arDy) : 0;
  const width = showArabic ? arX + ARABIC.width * arScale : LATIN.width;
  const bottom = showArabic ? Math.max(H, arDy + ARABIC.height * arScale) : H;
  return (
    <svg viewBox={`0 ${top} ${width} ${bottom - top}`} className={cn("h-[0.9em] w-auto shrink-0 overflow-visible", className)} role="img" aria-label="Aalim">
      <path d={LATIN.d} fill="currentColor" />
      {showArabic ? (
        <>
          <rect x={LATIN.width + gap * 0.95} y={H * 0.02} width={H * 0.05} height={H * 0.96} fill="currentColor" opacity={0.22} />
          <g transform={`translate(${arX} ${arDy}) scale(${arScale})`}>
            <path d={ARABIC.d} fill="currentColor" />
          </g>
        </>
      ) : null}
    </svg>
  );
}

export function Logo({ className, showArabic = true, reverse = false }: { className?: string; showArabic?: boolean; reverse?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[17px]", reverse ? "text-ink-foreground" : "text-text", className)}>
      <LogoMark className="size-[1.6em]" />
      <Wordmark showArabic={showArabic} />
    </span>
  );
}
