/**
 * Generates the Aalim brand assets ("ʿAyn", D-063) from the brand fonts, so
 * every file is outlined (no font needed to open it) and identical to the
 * in-app logo.
 *
 *   npm run brand:assets
 *
 * Writes public/brand/*.svg, src/components/brand/wordmark-paths.ts and, via
 * Playwright (scripts/brand-render.spec.ts), the PNG renders, app icons and
 * social images.
 *
 * The wordmarks are shaped with HarfBuzz (the engine browsers use), so the
 * Arabic joins exactly as it does on screen. Fonts are static instances in
 * brand/fonts (SIL Open Font License), cut from the product's variable fonts:
 * Plus Jakarta Sans ExtraBold for "aalim", Readex Pro Bold for "عالم".
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
/** The app tile's ground: violet into navy, as the in-app LogoTile. */
export const TILE = ["#7564ee", "#1e2f86"] as const;

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

// Wordmarks: "aalim" in lowercase, set tight; "عالم" never tracked (it would break the joins).
const latin = normalise(outline("plus-jakarta-sans-800.ttf", "aalim", -42));
const arabic = normalise(outline("readex-pro-700.ttf", "عالم"));

/**
 * The mark: ʿayn (ع), the first letter of عالم (world), علم (knowledge),
 * عمل (work) and عين (eye). One rounded stroke: a small head open to the
 * right over a larger bowl, joined by a short neck. The head's counter is
 * the letter's "eye" in calligraphy; the coral pupil sits in it, looking
 * toward what comes next. 64-unit box, optically centred.
 */
const deg = (a: number) => (a * Math.PI) / 180;
const at = (cx: number, cy: number, rr: number, a: number) => [r(cx + rr * Math.cos(deg(a))), r(cy + rr * Math.sin(deg(a)))] as const;
export const AYN = (() => {
  const head = { cx: 30.6, cy: 17, r: 10, from: -28, to: -262 };
  const bowl = { cx: 32.6, cy: 41, r: 16, from: 236, to: 22 };
  const stroke = 8.5;
  const [sx, sy] = at(head.cx, head.cy, head.r, head.from);
  const [hx, hy] = at(head.cx, head.cy, head.r, head.to);
  const [bx, by] = at(bowl.cx, bowl.cy, bowl.r, bowl.from);
  const [ex, ey] = at(bowl.cx, bowl.cy, bowl.r, bowl.to);
  // Head: counter-clockwise from the upper-right tip, over the top, down to its foot (large arc).
  // Neck: a short stroke to the bowl. Bowl: counter-clockwise round the left and bottom to the tail.
  const d = `M${sx} ${sy}A${head.r} ${head.r} 0 1 0 ${hx} ${hy}L${bx} ${by}A${bowl.r} ${bowl.r} 0 1 0 ${ex} ${ey}`;
  // Length of the stroke (arcs and neck), for drawing it on: SVG pathLength isn't available everywhere.
  const length = r(head.r * deg(Math.abs(head.to - head.from)) + Math.hypot(bx - hx, by - hy) + bowl.r * deg(Math.abs(bowl.from - bowl.to)));
  return { d, stroke, length, head, bowl, pupil: { cx: r(head.cx + 1.2), cy: r(head.cy + 0.4), r: 3.6 } };
})();
const markInner = (fg: string, dot: string) =>
  `<path d="${AYN.d}" fill="none" stroke="${fg}" stroke-width="${AYN.stroke}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<circle cx="${AYN.pupil.cx}" cy="${AYN.pupil.cy}" r="${AYN.pupil.r}" fill="${dot}"/>`;
const markSvg = (fg: string, dot = SIGNAL) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${markInner(fg, dot)}</svg>`;
/** App icon: the mark on a tile. The tile radius follows the iOS/Android squircle proportion (22.5%). */
const symbolSvg = (bg: string | readonly [string, string], fg: string, dot: string, size = 64) => {
  const fill = typeof bg === "string" ? bg : "url(#tile)";
  const defs = typeof bg === "string" ? "" : `<defs><linearGradient id="tile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">${defs}<rect width="64" height="64" rx="14.4" fill="${fill}"/><g transform="translate(11.2 11.2) scale(0.65)">${markInner(fg, dot)}</g></svg>`;
};

/** Lockup geometry, shared with the in-app <Logo>: all in units of the Latin height (the l's ascender). */
export const LOCKUP = { mark: 1.38, gap: 0.28, rule: 0.34, arabic: 1.06 };

/** Horizontal lockup: the ʿayn, aalim, a hairline, عالم. */
function lockup({ fg, dot = SIGNAL, arabicOnly = false, latinOnly = false }: { fg: string; dot?: string; arabicOnly?: boolean; latinOnly?: boolean }) {
  const H = latin.height; // ascender height of "aalim" (no descenders)
  const mark = H * LOCKUP.mark;
  const gap = H * LOCKUP.gap;
  const parts: string[] = [];
  let x = 0;
  // The mark's centre sits on the centre of the Latin height. Its ink spans about x 14–54 of its 64-unit box.
  const markTop = (H - mark) / 2;
  const placeMark = () => {
    parts.push(`<g transform="translate(${r(x - mark * 0.2)} ${r(markTop)}) scale(${r(mark / 64)})">${markInner(fg, dot)}</g>`);
    x += mark * 0.66;
  };
  // Arabic alone reads right to left, so the mark leads on the right.
  if (!arabicOnly) {
    placeMark();
    x += gap;
    parts.push(`<path transform="translate(${r(x)} 0)" d="${latin.d}" fill="${fg}"/>`);
    x += latin.width;
  }
  if (!arabicOnly && !latinOnly) {
    x += H * LOCKUP.rule;
    parts.push(`<rect x="${r(x)}" y="${r(H * 0.12)}" width="${r(H * 0.07)}" height="${r(H * 0.88)}" rx="${r(H * 0.035)}" fill="${fg}" opacity="0.24"/>`);
    x += H * 0.07 + H * LOCKUP.rule;
  }
  let bottom = Math.max(H, markTop + mark);
  if (!latinOnly) {
    // Arabic: the alif rises a touch above the Latin ascenders (optical match), baselines aligned.
    const scale = (H * LOCKUP.arabic) / arabic.baseline;
    const dy = H - arabic.baseline * scale;
    parts.push(`<g transform="translate(${r(x)} ${r(dy)}) scale(${r(scale)})"><path d="${arabic.d}" fill="${fg}"/></g>`);
    x += arabic.width * scale;
    bottom = Math.max(bottom, dy + arabic.height * scale);
    if (arabicOnly) {
      x += gap;
      placeMark();
    }
  }
  const top = Math.min(markTop, latinOnly ? 0 : H - H * LOCKUP.arabic);
  const pad = H * 0.06;
  // The mark's ink starts about 12 units into its box and ends about 56 in.
  const left = arabicOnly ? -pad : -mark * 0.2 + (mark / 64) * 12 - pad;
  const right = arabicOnly ? x - mark * 0.66 - mark * 0.2 + (mark / 64) * 56 + pad : x + pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(left)} ${r(top - pad)} ${r(right - left)} ${r(bottom - top + pad * 2)}">${parts.join("")}</svg>`;
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
    `export const AYN = ${JSON.stringify(AYN)};\n` +
    `export const LOCKUP = ${JSON.stringify(LOCKUP)};\n`,
);
console.log(`brand: ${Object.keys(files).length} SVGs, icon.svg and wordmark-paths.ts written`);
