import type * as React from "react";
import { getTranslations } from "next-intl/server";
import { Band, pct } from "./bands";

/** Top to bottom: the estimate after each scene, tightening towards 3.9. */
const ROWS = [
  { scene: 9, low: 3.6, high: 4.2 },
  { scene: 6, low: 3.2, high: 4.4 },
  { scene: 4, low: 2.6, high: 4.6 },
  { scene: 2, low: 1.8, high: 4.8 },
  { scene: 0, low: 1, high: 5 },
] as const;
const ESTIMATE = 3.9;

/**
 * The hero's signature: the mark's idea at billboard scale. Five ink bands,
 * one per stage of evidence, narrow step by step into a single vermilion dot,
 * the estimate. Played once on load (CSS only), bottom band first; static
 * under reduced motion. The layout mirrors in Arabic (labels on the reading
 * side), but the scale itself reads left to right in both languages.
 */
export async function RangeSignature() {
  const t = await getTranslations("landing.hero.figure");
  const range = (lo: number, hi: number) => `${lo.toFixed(1)}–${hi.toFixed(1)}`;

  return (
    <figure className="r-sig" role="img" aria-label={t("label")}>
      <div className="r-sig-grid" aria-hidden>
        {/* Caption row */}
        <div className="flex items-center justify-between gap-4 pb-[calc(var(--gap)*1.5)] text-[13px] sm:col-start-2 rtl:text-sm">
          <span className="font-medium text-text">{t("skill")}</span>
          <span className="hidden items-center gap-2 text-tertiary sm:flex">
            <span className="size-1.5 rounded-full bg-[var(--signal)]" />
            {t("narrowing")}
          </span>
        </div>
        <span className="hidden sm:block" />

        {/* The estimate */}
        <Label className="r-fade font-semibold text-text" i={4}>{t("estimate")}</Label>
        <div className="r-track" dir="ltr">
          <div className="relative" style={{ height: "var(--bh)" }}>
            <span className="r-at" style={{ "--x": pct(ESTIMATE) } as React.CSSProperties}>
              <span className="r-stem" />
              <span className="r-dot" />
            </span>
          </div>
        </div>
        <Value className="r-fade text-[15px] font-semibold text-text" i={4}>{ESTIMATE.toFixed(1)}</Value>

        {/* The bands, narrowest on top */}
        {ROWS.map((r, idx) => {
          const i = ROWS.length - 2 - idx; // the bottom band holds still; the rest narrow upwards
          return (
            <Row key={r.scene} i={Math.max(0, i)} label={r.scene === 0 ? t("start") : t("scene", { n: r.scene })} value={range(r.low, r.high)}>
              <Band low={r.low} high={r.high} i={Math.max(0, i)} className="text-text" />
            </Row>
          );
        })}

        {/* The scale */}
        <span className="hidden sm:block" />
        <div className="r-track mt-1" dir="ltr">
          <div className="relative h-12 border-t border-text/25">
            {[1, 2, 3, 4, 5].map((v) => (
              <span key={v} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${pct(v)}%` }}>
                <span className="h-1.5 w-px bg-text/40" />
                <span className="mt-1 text-[11px] leading-4 text-tertiary tabular">{v}</span>
              </span>
            ))}
            <span className="absolute left-[calc(var(--bh)/-2)] top-7 text-[11px] leading-4 text-tertiary rtl:text-xs" dir="auto">{t("low")}</span>
            <span className="absolute right-[calc(var(--bh)/-2)] top-7 text-[11px] leading-4 text-tertiary rtl:text-xs" dir="auto">{t("high")}</span>
          </div>
        </div>
        <span className="hidden sm:block" />
      </div>
    </figure>
  );
}

function Row({ label, value, i, children }: { label: string; value: string; i: number; children: React.ReactNode }) {
  return (
    <>
      <Label className="r-fade text-tertiary" i={i}>{label}</Label>
      <div className="r-track" dir="ltr">{children}</div>
      <Value className="r-fade text-secondary" i={i}>{value}</Value>
    </>
  );
}

function Label({ children, className, i }: { children: React.ReactNode; className?: string; i: number }) {
  return (
    <span className={`hidden items-center justify-end whitespace-nowrap text-[12px] sm:flex rtl:text-[13px] ${className ?? ""}`} style={{ "--i": i } as React.CSSProperties}>
      {children}
    </span>
  );
}

function Value({ children, className, i }: { children: React.ReactNode; className?: string; i: number }) {
  return (
    <span className={`hidden items-center whitespace-nowrap text-[12px] tabular sm:flex ${className ?? ""}`} style={{ "--i": i } as React.CSSProperties}>
      <bdi dir="ltr">{children}</bdi>
    </span>
  );
}
