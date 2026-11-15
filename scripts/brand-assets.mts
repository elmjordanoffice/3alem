/**
 * Generates the Aalim brand assets from the brand fonts, so every file is
 * outlined (no font needed to open it) and identical to the in-app logo.
 *
 *   npm run brand:assets
 *
 * Writes public/brand/*.svg, src/components/brand/wordmark-paths.ts and, via
 * Playwright, PNG renders and the social images.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import * as opentypeNs from "opentype.js";

// The package ships both module formats; take whichever namespace has the API.
const opentype = ((opentypeNs as unknown as { parse?: unknown }).parse ? opentypeNs : (opentypeNs as unknown as { default: typeof opentypeNs }).default) as typeof opentypeNs;

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/brand");
mkdirSync(OUT, { recursive: true });

const INK = "#17184a";
const INK_FG = "#f5f4ff";
const SAFFRON = "#f2b532";

function font(file: string) {
  const b = readFileSync(path.join(ROOT, "node_modules/@fontsource/alexandria/files", file));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
}
const latin = font("alexandria-latin-600-normal.woff");
const arabic = font("alexandria-arabic-600-normal.woff");

type Cmd = opentype.PathCommand;
const r = (n: number) => Math.round(n * 100) / 100;
function toD(cmds: Cmd[]) {
  return cmds
    .map((c) => {
      if (c.type === "M" || c.type === "L") return `${c.type}${r(c.x)} ${r(c.y)}`;
      if (c.type === "Q") return `Q${r(c.x1)} ${r(c.y1)} ${r(c.x)} ${r(c.y)}`;
      if (c.type === "C") return `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${r(c.x)} ${r(c.y)}`;
      return "Z";
    })
    .join("");
}
function contours(cmds: Cmd[]) {
  const out: Cmd[][] = [];
  for (const c of cmds) {
    if (c.type === "M") out.push([]);
    out[out.length - 1]!.push(c);
  }
  return out;
}
function bboxOf(cmds: Cmd[]) {
  const p = new opentype.Path();
  p.commands = cmds;
  return p.getBoundingBox();
}

// Wordmarks at a 100-unit size, baseline at y=100; then normalised to a 0,0 origin.
const SIZE = 100;
const lat = latin.getPath("aalim", 0, SIZE, SIZE, { kerning: true });
const latBox = lat.getBoundingBox();
// The tittle of the i is the evidence dot: the topmost contour of the wordmark.
const latContours = contours(lat.commands);
const tittleIdx = latContours.reduce((best, c, i) => (bboxOf(c).y1 < bboxOf(latContours[best]!).y1 ? i : best), 0);
const shift = (cmds: Cmd[], dx: number, dy: number): Cmd[] =>
  cmds.map((c) => {
    const o = { ...c } as Record<string, number | string>;
    for (const k of ["x", "x1", "x2"]) if (typeof o[k] === "number") o[k] = (o[k] as number) + dx;
    for (const k of ["y", "y1", "y2"]) if (typeof o[k] === "number") o[k] = (o[k] as number) + dy;
    return o as unknown as Cmd;
  });
const latBody = latContours.filter((_, i) => i !== tittleIdx).flat();
const latTittle = latContours[tittleIdx]!;
const latW = latBox.x2 - latBox.x1;
const latH = latBox.y2 - latBox.y1;
const latBodyD = toD(shift(latBody, -latBox.x1, -latBox.y1));
const latTittleD = toD(shift(latTittle, -latBox.x1, -latBox.y1));
// x-height reference for optical alignment of the Arabic wordmark.
const baselineFromTop = SIZE - latBox.y1;

const ar = arabic.getPath("عالم", 0, SIZE, SIZE, { kerning: true });
const arBox = ar.getBoundingBox();
const arW = arBox.x2 - arBox.x1;
const arH = arBox.y2 - arBox.y1;
const arD = toD(shift(ar.commands, -arBox.x1, -arBox.y1));
const arBaselineFromTop = SIZE - arBox.y1;

// The symbol: the narrowing range in a 32-unit square.
const symbolInner = (track: string, trackOpacity: number, dot: string) =>
  `<rect x="5" y="15.2" width="22" height="1.6" rx="0.8" fill="${track}" opacity="${trackOpacity}"/><rect x="11.5" y="12.4" width="13" height="7.2" rx="3.6" fill="${SAFFRON}"/><circle cx="18.6" cy="16" r="1.9" fill="${dot}"/>`;
const symbolSvg = (size = 32) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}"><rect width="32" height="32" rx="9" fill="${INK}"/>${symbolInner(INK_FG, 0.38, INK)}</svg>`;
const glyphSvg = (reverse: boolean) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 11 24 10" width="240" height="100">${symbolInner(reverse ? INK_FG : INK, reverse ? 0.45 : 0.35, reverse ? INK : INK_FG)}</svg>`;

// Lockup: symbol, Latin wordmark, a hairline, Arabic wordmark. Heights in wordmark units.
function lockup({ fg, reverse, arabicOnly = false, latinOnly = false }: { fg: string; reverse: boolean; arabicOnly?: boolean; latinOnly?: boolean }) {
  const H = latH; // symbol height matches the Latin wordmark's full height
  const sym = H * 1.18;
  const gap = H * 0.42;
  const parts: string[] = [];
  let x = 0;
  parts.push(`<g transform="translate(0 ${r((H - sym) / 2)}) scale(${r(sym / 32)})"><rect width="32" height="32" rx="9" fill="${reverse ? INK_FG : INK}"/>${symbolInner(reverse ? INK : INK_FG, 0.38, reverse ? INK_FG : INK)}</g>`);
  x += sym + gap;
  if (!arabicOnly) {
    parts.push(`<g transform="translate(${r(x)} 0)"><path d="${latBodyD}" fill="${fg}"/><path d="${latTittleD}" fill="${SAFFRON}"/></g>`);
    x += latW;
  }
  if (!arabicOnly && !latinOnly) {
    x += gap * 0.9;
    parts.push(`<rect x="${r(x)}" y="${r(H * 0.12)}" width="${r(H * 0.03)}" height="${r(H * 0.82)}" fill="${fg}" opacity="0.25"/>`);
    x += gap * 0.9;
  }
  if (!latinOnly) {
    const scale = (latH * 0.9) / arH;
    // Align the Arabic baseline with the Latin baseline.
    const dy = baselineFromTop - arBaselineFromTop * scale;
    parts.push(`<g transform="translate(${r(x)} ${r(dy)}) scale(${r(scale)})"><path d="${arD}" fill="${fg}"/></g>`);
    x += arW * scale;
  }
  const pad = H * 0.04;
  const top = Math.min(0, (H - sym) / 2) - pad;
  const height = Math.max(H, sym) + pad * 2 + H * 0.3;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(-pad)} ${r(top)} ${r(x + pad * 2)} ${r(height)}">${parts.join("")}</svg>`;
}

const files: Record<string, string> = {
  "symbol.svg": symbolSvg(),
  "glyph.svg": glyphSvg(false),
  "glyph-reverse.svg": glyphSvg(true),
  "logo.svg": lockup({ fg: INK, reverse: false }),
  "logo-reverse.svg": lockup({ fg: INK_FG, reverse: true }),
  "logo-en.svg": lockup({ fg: INK, reverse: false, latinOnly: true }),
  "logo-ar.svg": lockup({ fg: INK, reverse: false, arabicOnly: true }),
  "logo-en-reverse.svg": lockup({ fg: INK_FG, reverse: true, latinOnly: true }),
  "logo-ar-reverse.svg": lockup({ fg: INK_FG, reverse: true, arabicOnly: true }),
  "wordmark.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(latW)} ${r(latH)}"><path d="${latBodyD}" fill="${INK}"/><path d="${latTittleD}" fill="${SAFFRON}"/></svg>`,
  "wordmark-ar.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(arW)} ${r(arH)}"><path d="${arD}" fill="${INK}"/></svg>`,
};
for (const [name, svg] of Object.entries(files)) writeFileSync(path.join(OUT, name), svg + "\n");

// Path data for the in-app <Logo>, so the product and the files never drift.
writeFileSync(
  path.join(ROOT, "src/components/brand/wordmark-paths.ts"),
  `// Generated by scripts/brand-assets.mts. Do not edit by hand.\n` +
    `export const LATIN = { width: ${r(latW)}, height: ${r(latH)}, baseline: ${r(baselineFromTop)}, body: "${latBodyD}", tittle: "${latTittleD}" };\n` +
    `export const ARABIC = { width: ${r(arW)}, height: ${r(arH)}, baseline: ${r(arBaselineFromTop)}, d: "${arD}" };\n`,
);
console.log(`brand: ${Object.keys(files).length} SVGs and wordmark-paths.ts written`);
