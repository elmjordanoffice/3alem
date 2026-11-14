import { contrastRatio } from "@/lib/contrast";

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 - amount))));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** CSS variables for an organisation's brand accent, only if white text stays readable on it. */
export function brandStyle(color: string | null): React.CSSProperties | undefined {
  if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return undefined;
  if (contrastRatio(color, "#ffffff") < 4.5) return undefined;
  return {
    "--accent": color,
    "--accent-hover": shade(color, 0.1),
    "--accent-active": shade(color, 0.18),
    "--focus-ring": color,
  } as React.CSSProperties;
}
