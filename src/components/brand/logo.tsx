import { cn } from "@/lib/utils";
import { ARABIC, AYN, LATIN, LOCKUP } from "./wordmark-paths";

/**
 * The Aalim mark ("ʿAyn", D-063): the letter ع, first letter of عالم (world),
 * علم (knowledge), عمل (work) and عين (eye), drawn as one rounded stroke. The
 * coral pupil sits in the letter's head, which calligraphers call its eye.
 * See /brand and scripts/brand-assets.mts (the geometry lives there).
 *
 * `animated`: the stroke draws itself once, then the pupil glances and blinks
 * now and then (still under prefers-reduced-motion).
 */
export function LogoMark({ className, mono = false, tight = false, animated = false }: { className?: string; mono?: boolean; tight?: boolean; animated?: boolean }) {
  return (
    <svg viewBox={tight ? "12 0 44 64" : "0 0 64 64"} className={cn("size-7 shrink-0 overflow-visible", animated && "ayn-live", className)} aria-hidden>
      <path d={AYN.d} fill="none" stroke="currentColor" strokeWidth={AYN.stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={100} className="ayn-stroke" />
      <circle cx={AYN.pupil.cx} cy={AYN.pupil.cy} r={AYN.pupil.r} fill={mono ? "currentColor" : "var(--saffron)"} className="ayn-pupil" />
    </svg>
  );
}

/** The app tile: the white ʿayn on violet turning to navy, the pupil in coral. */
export function LogoTile({ className, animated = false }: { className?: string; animated?: boolean }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-[30%] bg-[linear-gradient(140deg,#7564ee,#1e2f86)] text-white shadow-[0_10px_24px_-8px_rgb(91_76_214/0.75),inset_0_1px_0_rgb(255_255_255/0.22)]",
        className,
      )}
      aria-hidden
    >
      <LogoMark className="size-[66%]" animated={animated} />
    </span>
  );
}

/**
 * The wordmarks, outlined from the brand fonts: aalim in Plus Jakarta Sans
 * ExtraBold, set tight, and عالم in Readex Pro Bold, baselines aligned, with
 * a rounded hairline between them.
 */
export function Wordmark({ showArabic = true, className }: { showArabic?: boolean; className?: string }) {
  const H = LATIN.height;
  const arScale = (H * LOCKUP.arabic) / ARABIC.baseline;
  const arDy = H - ARABIC.baseline * arScale;
  const ruleX = LATIN.width + H * LOCKUP.rule;
  const arX = ruleX + H * 0.07 + H * LOCKUP.rule;
  const top = showArabic ? Math.min(0, arDy) : 0;
  const width = showArabic ? arX + ARABIC.width * arScale : LATIN.width;
  const bottom = showArabic ? Math.max(H, arDy + ARABIC.height * arScale) : H;
  return (
    <svg viewBox={`0 ${top} ${width} ${bottom - top}`} className={cn("h-[1.3em] w-auto shrink-0 overflow-visible", className)} role="img" aria-label="Aalim">
      <path d={LATIN.d} fill="currentColor" />
      {showArabic ? (
        <>
          <rect x={ruleX} y={H * 0.12} width={H * 0.07} height={H * 0.88} rx={H * 0.035} fill="currentColor" opacity={0.24} />
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
    // A logo keeps one composition in both directions.
    <span dir="ltr" className={cn("inline-flex items-center gap-[0.3em] text-[17px]", reverse ? "text-ink-foreground" : "text-text", className)}>
      <LogoMark tight className="h-[1.55em] w-auto" />
      <Wordmark showArabic={showArabic} />
    </span>
  );
}
