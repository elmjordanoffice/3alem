import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";

/** Parse the two token blocks out of tokens.css. */
function tokens(): { light: Record<string, string>; dark: Record<string, string> } {
  const css = readFileSync(path.join(__dirname, "../../src/styles/tokens.css"), "utf8");
  const block = (selector: string) => {
    const start = css.indexOf(`${selector} {`);
    const body = css.slice(start, css.indexOf("\n}", start));
    return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1]!, m[2]!.toLowerCase()]));
  };
  return { light: block(":root"), dark: block(".dark") };
}

const AA = 4.5;
/** Large text and non-text UI (icons, borders that convey state) need 3:1. */
const AA_LARGE = 3;

// [foreground, background, minimum]
const PAIRS: [string, string, number][] = [
  ["text", "background", AA],
  ["text", "surface", AA],
  ["text", "surface-subtle", AA],
  ["text", "surface-sunken", AA],
  ["text-secondary", "background", AA],
  ["text-secondary", "surface", AA],
  ["text-secondary", "surface-subtle", AA],
  ["text-tertiary", "background", AA],
  ["text-tertiary", "surface", AA],
  ["text-tertiary", "surface-subtle", AA],
  ["accent-foreground", "accent", AA],
  ["accent-foreground", "accent-hover", AA],
  ["accent-text", "surface", AA],
  ["accent-text", "background", AA],
  ["accent-text", "accent-subtle", AA],
  ["text", "accent-subtle", AA],
  ["success", "success-subtle", AA],
  ["warning", "warning-subtle", AA],
  ["critical", "critical-subtle", AA],
  ["info", "info-subtle", AA],
  ["success", "surface", AA],
  ["warning", "surface", AA],
  ["critical", "surface", AA],
  ["info", "surface", AA],
  ["level-1-fg", "level-1", AA],
  ["level-2-fg", "level-2", AA],
  ["level-3-fg", "level-3", AA],
  ["level-4-fg", "level-4", AA],
  ["level-5-fg", "level-5", AA],
  ["focus-ring", "background", AA_LARGE],
  ["focus-ring", "surface", AA_LARGE],
  ["border-strong", "surface", 1.3],
  ["ink-foreground", "ink", AA],
  ["ink-secondary", "ink", AA],
  ["ink-foreground", "ink-raised", AA],
  ["ink-secondary", "ink-raised", AA],
  ["highlight-foreground", "highlight", AA],
  ["saffron", "ink", AA_LARGE],
  ["sidebar-foreground", "sidebar", AA],
  ["sidebar-secondary", "sidebar", AA],
  ["sidebar-tertiary", "sidebar", AA],
  ["sidebar-accent", "sidebar-active", AA],
  ["sidebar-secondary", "sidebar-raised", AA],
  ["hero-foreground", "hero-from", AA],
  ["hero-foreground", "hero-via", AA],
  ["hero-foreground", "hero-to", AA],
  ["hero-secondary", "hero-via", AA],
  ["ink-foreground", "night", AA],
  ["ink-secondary", "night", AA],
  ["ink-secondary", "night-raised", AA],
  ["saffron", "night", AA],
];

describe("design token contrast (WCAG AA)", () => {
  const t = tokens();
  for (const theme of ["light", "dark"] as const) {
    for (const [fg, bg, min] of PAIRS) {
      it(`${theme}: ${fg} on ${bg} ≥ ${min}:1`, () => {
        const a = t[theme][fg];
        const b = t[theme][bg];
        expect(a, `missing --${fg}`).toBeDefined();
        expect(b, `missing --${bg}`).toBeDefined();
        expect(contrastRatio(a!, b!)).toBeGreaterThanOrEqual(min);
      });
    }
  }

  it("uses one hue for the level ramp (no red/green)", () => {
    for (const theme of ["light", "dark"] as const) {
      const hues = [1, 2, 3, 4, 5].map((l) => {
        const hex = t[theme][`level-${l}`]!;
        const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        if (d === 0) return 0;
        const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        return (h * 60 + 360) % 360;
      });
      for (const h of hues) {
        expect(h).toBeGreaterThan(225);
        expect(h).toBeLessThan(250);
      }
    }
  });
});
