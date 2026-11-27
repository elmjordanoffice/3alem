"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { useNumbers } from "@/components/providers";

/**
 * Invitations used of the allowance, as a ring on the raised plan card:
 * white on violet, filling clockwise. With no limit it shows the count alone.
 */
export function UsageRing({ used, allowance }: { used: number; allowance: number | null }) {
  const t = useTranslations("billing.usage");
  const n = useNumbers();
  const id = React.useId().replace(/:/g, "");
  const frac = allowance ? Math.min(1, used / Math.max(1, allowance)) : 0;
  const [shown, setShown] = React.useState(0);
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(frac));
    return () => cancelAnimationFrame(raf);
  }, [frac]);
  const size = 168;
  const stroke = 12;
  const r = (size - stroke) / 2 - 4;
  const c = 2 * Math.PI * r;
  const label = allowance === null ? t("unlimitedLabel", { used: n.number(used) }) : t("ringLabel", { used: n.number(used), allowance: n.number(allowance) });
  return (
    <div className="relative size-[144px] shrink-0 sm:size-[168px]">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <defs>
          <linearGradient id={`use-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#c9c1ff" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth={stroke} />
        {allowance !== null ? (
          <circle
            className="ring-arc"
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#use-${id})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - shown)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: "drop-shadow(0 0 8px rgb(255 255 255 / 0.45))", opacity: used > 0 ? 1 : 0 }}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-hero-foreground" aria-hidden>
        <span className="text-[2.25rem] font-extrabold leading-none tracking-[-0.03em] tabular sm:text-[2.6rem]">{n.number(used)}</span>
        <span className="mt-1.5 text-xs font-medium text-hero-secondary">{allowance === null ? t("sent") : t("of", { allowance: n.number(allowance) })}</span>
      </div>
    </div>
  );
}
