"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Burst } from "@/components/brand/burst";
import { LogoMark } from "@/components/brand/logo";
import { useNumbers } from "@/components/providers";

/**
 * Small rewarding moments for candidates. None of them carries information
 * about how an answer went (nothing here may hint at a score); they only
 * acknowledge what the person did and show the story moving.
 */

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** "Sent": a pill that draws its check, holds, and leaves. Never blocks the next scene. */
export function SentToast({ onDone }: { onDone: () => void }) {
  const t = useTranslations("candidate.delight");
  return (
    // Phones: just under the deck's bar. Larger screens: low and centred, clear of the header.
    <div className="pointer-events-none fixed inset-x-0 top-[max(64px,calc(env(safe-area-inset-top)+56px))] z-[60] flex justify-center md:top-auto md:bottom-10">
      <div role="status" className="sent-toast flex items-center gap-2 rounded-full bg-accent py-2 ps-2.5 pe-4 text-sm font-semibold text-accent-foreground shadow-raised" onAnimationEnd={onDone}>
        <span className="relative grid size-6 place-items-center rounded-full bg-background/10">
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="joy-draw" style={{ "--len": 22 } as React.CSSProperties} />
          </svg>
          <span className="joy-pop absolute -end-0.5 -top-0.5 size-2 rounded-full bg-saffron" style={{ "--i": 3 } as React.CSSProperties} />
        </span>
        {t("sent")}
      </div>
    </div>
  );
}

/** A number that counts up once, eased; instant under reduced motion. */
export function CountUp({ value, duration = 900, delay = 0 }: { value: number; duration?: number; delay?: number }) {
  const n = useNumbers();
  const [shown, setShown] = React.useState(0);
  React.useEffect(() => {
    // Under reduced motion the first frame lands on the final value.
    const still = reducedMotion();
    let raf = 0;
    const start = performance.now() + (still ? 0 : delay);
    const tick = (now: number) => {
      const p = still ? 1 : Math.min(1, Math.max(0, (now - start) / duration));
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);
  return (
    <span className="tabular">
      {n.number(shown)}
      <span className="sr-only">{n.number(value)}</span>
    </span>
  );
}

/** The finish: the rings draw in, and the coral point lands with a small burst. */
export function FinishMark() {
  return (
    <div className="relative size-24" aria-hidden>
      <LogoMark animated className="size-24 text-accent" />
      {/* The burst sits on the point, at the centre of the mark. */}
      <span className="absolute left-1/2 top-1/2 block size-0">
        <Burst count={12} distance={30} delay={1300} />
      </span>
    </div>
  );
}
