import { cn } from "@/lib/utils";

/**
 * The brand's signature at large scale: bands of uncertainty narrowing, row by
 * row, into one vermilion point. Each band plays once from full width to its
 * own width (CSS only; still under reduced motion). Decorative.
 */
export function Narrowing({ rows = 5, tone = "ink", className }: { rows?: number; tone?: "ink" | "light"; className?: string }) {
  const widths = Array.from({ length: rows }, (_, i) => 100 - (i * (100 - 18)) / (rows - 1));
  return (
    <div className={cn("flex flex-col-reverse items-center gap-[clamp(6px,1.4vw,12px)]", className)} aria-hidden>
      {widths.map((w, i) => (
        <span
          key={i}
          className={cn("narrow-band block h-[clamp(14px,2.6vw,26px)] rounded-full", tone === "ink" ? "bg-ink-foreground/[0.14]" : "bg-text/[0.09]")}
          style={{ width: `${w}%`, animationDelay: `${120 + i * 110}ms` }}
        />
      ))}
      <span className="narrow-dot block size-[clamp(14px,2.6vw,26px)] rounded-full bg-saffron" style={{ animationDelay: `${160 + rows * 110}ms` }} />
    </div>
  );
}
