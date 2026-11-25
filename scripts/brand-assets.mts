/**
 * Generates the Aalim brand assets ("Range") from the brand fonts, so every
 * file is outlined (no font needed to open it) and identical to the in-app
 * logo.
 *
 *   npm run brand:assets
 *
 * Writes public/brand/*.svg, src/components/brand/wordmark-paths.ts and, via
 * Playwright (scripts/brand-render.spec.ts), the PNG renders, app icons and
 * social images.
 *
 * The wordmarks are shaped with HarfBuzz (the engine browsers use), so the
 * Arabic joins exactly as it does on screen. Fonts are static instances in
 * brand/fonts (SIL Open Font License): Archivo Expanded ExtraBold for "AALIM",
 * Beiruti Black for "عالم".
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import hbInit from "harfbuzzjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/brand");
mkdirSync(OUT, { recursive: true });

// Night (D-061): indigo marks on light grounds, white on dark, a coral dot that
// keeps 3:1 against both white and the indigo canvas.
export const INK = "#1b1840";
export const BONE = "#ffffff";
export const SIGNAL = "#e8436b";
/** The app tile's ground: the in-app LogoTile's blue gradient. */
export const TILE = ["#3156d4", "#1a3291"] as const;

const r = (n: number) => Math.round(n * 100) / 100;

interface Hb {
  createBlob(b: Uint8Array): unknown;
  createFace(blob: unknown, i: number): { upem: number };
  createFont(face: unknown): { glyphToPath(g: number): string; glyphExtents?(g: number): unknown };
  createBuffer(): { addText(t: string): void; guessSegmentProperties(): void; json(): { g: number; ax: number; ay: number; dx: number; dy: number }[] };
  shape(font: unknown, buf: unknown): void;
}
const hb = (await hbInit) as unknown as Hb;

/** Shape text and return one SVG path (font units, y down, baseline at 0) plus its box. */
function outline(file: string, text: string, tracking = 0) {
  const face = hb.createFace(hb.createBlob(readFileSync(path.join(ROOT, "brand/fonts", file))), 0);
  const font = hb.createFont(face);
  const buf = hb.createBuffer();
  buf.addText(text);
  buf.guessSegmentProperties();
  hb.shape(font, buf);
  const glyphs = buf.json();
  let x = 0;
  const parts: string[] = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [i, g] of glyphs.entries()) {
    const raw = font.glyphToPath(g.g);
    if (raw) {
      // HarfBuzz paths are y-up; flip into SVG space and offset by the pen position.
      const d = raw.replace(/([MLQC])([^MLQCZ]*)/g, (_, cmd: string, args: string) => {
        const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
        const out: number[] = [];
        for (let k = 0; k < nums.length; k += 2) {
          const px = nums[k]! + x + g.dx;
          const py = -(nums[k + 1]! + g.dy);
          out.push(r(px), r(py));
          minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py);
        }
        return cmd + out.join(" ");
      });
      parts.push(d);
    }
    x += g.ax + (i < glyphs.length - 1 ? tracking : 0);
  }
  return { d: parts.join(""), minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

/** Move a path so its box starts at 0,0 (control points are within a percent of the box). */
function normalise(o: ReturnType<typeof outline>) {
  const d = o.d.replace(/([MLQC])([^MLQCZ]*)/g, (_, cmd: string, args: string) => {
    const nums = args.trim().split(/\s+/).map(Number);
    const out: number[] = [];
    for (let k = 0; k < nums.length; k += 2) out.push(r(nums[k]! - o.minX), r(nums[k + 1]! - o.minY));
    return cmd + out.join(" ");
  });
  // Baseline (y = 0 in font space) measured from the top of the box.
  return { d, width: r(o.width), height: r(o.height), baseline: r(-o.minY) };
}

// Wordmarks. "AALIM" is tracked open a little; "عالم" is never tracked (it would break the joins).
const latin = normalise(outline("archivo-expanded-800.ttf", "AALIM", 24));
const arabic = normalise(outline("beiruti-900.ttf", "عالم"));

/**
 * The mark: bands of uncertainty narrowing, step by step, into one point, the
 * estimate. Stacked, they also read as an A. 64-unit box.
 */
export const MARK = {
  // Four rows, equal height and gap; widths step down evenly to the dot (a band of no width).
  bars: [
    { x: 3, y: 48.25, w: 58 },
    { x: 11, y: 33.75, w: 42 },
    { x: 19, y: 19.25, w: 26 },
  ],
  h: 11,
  dot: { cx: 32, cy: 10.25, r: 5.5 },
};
const markInner = (fg: string, dot: string) =>
  MARK.bars.map((b) => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${MARK.h}" rx="${MARK.h / 2}" fill="${fg}"/>`).join("") +
  `<circle cx="${MARK.dot.cx}" cy="${MARK.dot.cy}" r="${MARK.dot.r}" fill="${dot}"/>`;
const markSvg = (fg: string, dot = SIGNAL) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${markInner(fg, dot)}</svg>`;
/** App icon: the mark on a tile. The tile radius follows the iOS/Android squircle proportion (22.5%). */
const symbolSvg = (bg: string | readonly [string, string], fg: string, dot: string, size = 64) => {
  const fill = typeof bg === "string" ? bg : "url(#tile)";
  const defs = typeof bg === "string" ? "" : `<defs><linearGradient id="tile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">${defs}<rect width="64" height="64" rx="14.4" fill="${fill}"/><g transform="translate(9.6 9.6) scale(0.7)">${markInner(fg, dot)}</g></svg>`;
};

/** Horizontal lockup: mark, AALIM, a hairline, عالم. All heights in Latin cap-height units. */
function lockup({ fg, dot = SIGNAL, arabicOnly = false, latinOnly = false }: { fg: string; dot?: string; arabicOnly?: boolean; latinOnly?: boolean }) {
  const H = latin.height; // cap height of AALIM
  const mark = H * 1.62;
  const gap = H * 0.42;
  const parts: string[] = [];
  let x = 0;
  // The mark's optical centre sits on the cap-height centre.
  parts.push(`<g transform="translate(0 ${r((H - mark) / 2)}) scale(${r(mark / 64)})">${markInner(fg, dot)}</g>`);
  x += mark + gap;
  if (!arabicOnly) {
    parts.push(`<path transform="translate(${r(x)} 0)" d="${latin.d}" fill="${fg}"/>`);
    x += latin.width;
  }
  if (!arabicOnly && !latinOnly) {
    x += gap * 0.8;
    parts.push(`<rect x="${r(x)}" y="${r(H * 0.02)}" width="${r(H * 0.05)}" height="${r(H * 0.96)}" fill="${fg}" opacity="0.22"/>`);
    x += gap * 0.8;
  }
  if (!latinOnly) {
    // Arabic: the alif/lam ascender rises a touch above the Latin caps (optical match), baselines aligned.
    const scale = (H * 1.18) / arabic.baseline;
    const dy = H - arabic.baseline * scale;
    parts.push(`<g transform="translate(${r(x)} ${r(dy)}) scale(${r(scale)})"><path d="${arabic.d}" fill="${fg}"/></g>`);
    x += arabic.width * scale;
  }
  const top = Math.min((H - mark) / 2, H - (latinOnly ? H : H * 1.18));
  const bottom = latinOnly ? Math.max(H, (H + mark) / 2) : Math.max((H + mark) / 2, H - arabic.baseline * ((H * 1.18) / arabic.baseline) + arabic.height * ((H * 1.18) / arabic.baseline));
  const pad = H * 0.06;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(-pad)} ${r(top - pad)} ${r(x + pad * 2)} ${r(bottom - top + pad * 2)}">${parts.join("")}</svg>`;
}

const files: Record<string, string> = {
  "mark.svg": markSvg(INK),
  "mark-reverse.svg": markSvg(BONE),
  "symbol.svg": symbolSvg(TILE, BONE, SIGNAL),
  "symbol-signal.svg": symbolSvg(SIGNAL, INK, BONE),
  "logo.svg": lockup({ fg: INK }),
  "logo-reverse.svg": lockup({ fg: BONE }),
  "logo-en.svg": lockup({ fg: INK, latinOnly: true }),
  "logo-ar.svg": lockup({ fg: INK, arabicOnly: true }),
  "logo-en-reverse.svg": lockup({ fg: BONE, latinOnly: true }),
  "logo-ar-reverse.svg": lockup({ fg: BONE, arabicOnly: true }),
  "logo-mono.svg": lockup({ fg: INK, dot: INK }),
  "wordmark.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${latin.width} ${latin.height}"><path d="${latin.d}" fill="${INK}"/></svg>`,
  "wordmark-ar.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${arabic.width} ${arabic.height}"><path d="${arabic.d}" fill="${INK}"/></svg>`,
};
for (const [name, svg] of Object.entries(files)) writeFileSync(path.join(OUT, name), svg + "\n");
// The browser tab icon: the app tile.
writeFileSync(path.join(ROOT, "src/app/icon.svg"), symbolSvg(TILE, BONE, SIGNAL) + "\n");

// Path data for the in-app <Logo>, so the product and the files never drift.
writeFileSync(
  path.join(ROOT, "src/components/brand/wordmark-paths.ts"),
  `// Generated by scripts/brand-assets.mts. Do not edit by hand.\n` +
    `export const LATIN = { width: ${latin.width}, height: ${latin.height}, baseline: ${latin.baseline}, d: "${latin.d}" };\n` +
    `export const ARABIC = { width: ${arabic.width}, height: ${arabic.height}, baseline: ${arabic.baseline}, d: "${arabic.d}" };\n` +
    `export const MARK = ${JSON.stringify(MARK)};\n`,
);
console.log(`brand: ${Object.keys(files).length} SVGs, icon.svg and wordmark-paths.ts written`);
