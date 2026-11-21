/**
 * Renders the Range brand's raster files from the outlined SVGs that
 * scripts/brand-assets.mts writes (npm run brand:assets runs both):
 *
 *   public/brand/symbol-{1024,512,192}.png  app tile, transparent corners (PWA manifest)
 *   public/brand/symbol-maskable-512.png    full-bleed ink, mark in the safe zone (Android)
 *   src/app/apple-icon.png                  180 × 180, full-bleed ink (iOS rounds it)
 *   public/brand/logo.png                   bilingual lockup, ink, transparent, with clear space
 *   public/brand/logo-reverse.png           the same in bone, for dark grounds
 *   public/brand/logo-email.png             tight, transparent, 3× for a 140 px email header
 *   public/brand/og-{en,ar}.png             1200 × 630 social images
 *
 * Fonts are embedded as data URIs so the renders never depend on what the
 * machine has installed.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";
import { LATIN } from "../src/components/brand/wordmark-paths";

const ROOT = path.resolve(__dirname, "..");
const BRAND = path.join(ROOT, "public/brand");

const INK = "#141414";
const BONE = "#f2f0eb";
const SIGNAL = "#f04a23";
const STONE = "#4f4b45";
const HAIRLINE = "#cdc8bd";

const font = (pkg: string, file: string) =>
  `url(data:font/woff2;base64,${readFileSync(path.join(ROOT, "node_modules", pkg, "files", file)).toString("base64")}) format("woff2")`;
const FACES = `
@font-face { font-family: "Archivo"; font-weight: 100 900; font-stretch: 62% 125%; src: ${font("@fontsource-variable/archivo", "archivo-latin-standard-normal.woff2")}; }
@font-face { font-family: "Beiruti"; font-weight: 200 900; src: ${font("@fontsource-variable/beiruti", "beiruti-arabic-wght-normal.woff2")}; unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF; }
@font-face { font-family: "Plex"; font-weight: 100 700; src: ${font("@fontsource-variable/ibm-plex-sans", "ibm-plex-sans-latin-wght-normal.woff2")}; }
@font-face { font-family: "PlexAr"; font-weight: 500; src: ${font("@fontsource/ibm-plex-sans-arabic", "ibm-plex-sans-arabic-arabic-500-normal.woff2")}; }
`;

const svg = (name: string) => readFileSync(path.join(BRAND, name), "utf8");

/** Grow an SVG's viewBox by `pad` units on every side (the logo's clear space). */
function padViewBox(source: string, pad: number) {
  return source.replace(/viewBox="([^"]+)"/, (_, box: string) => {
    const [x, y, w, h] = box.split(/\s+/).map(Number) as [number, number, number, number];
    return `viewBox="${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}"`;
  });
}

/**
 * Social images. The headline is the brand promise (the same words as the
 * site's title); the strip says what the product is. No URL: the card shows it.
 */
const OG = {
  en: {
    dir: "ltr",
    lines: ["Evidence,", "not", "impressions"],
    /** How many lines the mark stands beside. */
    beside: 2,
    eyebrow: "Adaptive skills assessment",
    strip: "Every score comes with the person’s own words.",
  },
  ar: {
    dir: "rtl",
    lines: ["أدلة،", "لا انطباعات"],
    beside: 1,
    eyebrow: "تقييم تكيّفي للمهارات",
    strip: "كل درجة تستند إلى كلمات صاحبها.",
  },
} as const;

test("render brand assets", async ({ page }) => {
  // App tile at three sizes, transparent outside the rounded square.
  for (const size of [1024, 512, 192]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg("symbol.svg").replace('width="64" height="64"', `width="${size}" height="${size}"`)}`);
    await page.screenshot({ path: path.join(BRAND, `symbol-${size}.png`), omitBackground: true });
  }

  // Android maskable icon: full-bleed ink, the mark at 62% so it stays inside the 80% safe circle.
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`<style>html,body{margin:0;background:${INK}}svg{display:block}</style>${svg("symbol.svg").replace('width="64" height="64"', 'width="512" height="512"').replace('rx="14.4"', 'rx="0"').replace("translate(9.6 9.6) scale(0.7)", "translate(12.16 12.16) scale(0.62)")}`);
  await page.screenshot({ path: path.join(BRAND, "symbol-maskable-512.png") });

  // iOS home-screen icon: full-bleed ink square with the mark (iOS applies its own mask).
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`<style>html,body{margin:0;background:${INK}}svg{display:block}</style>${svg("symbol.svg").replace('width="64" height="64"', 'width="180" height="180"').replace('rx="14.4"', 'rx="0"')}`);
  await page.screenshot({ path: path.join(ROOT, "src/app/apple-icon.png") });

  // Lockups as PNG for documents and slides: transparent, with the clear space (x = cap height) built in.
  for (const [file, out] of [["logo.svg", "logo.png"], ["logo-reverse.svg", "logo-reverse.png"]] as const) {
    await page.setViewportSize({ width: 2400, height: 800 });
    await page.setContent(`<style>html,body{margin:0;background:transparent} svg{display:block;width:2000px;height:auto}</style>${padViewBox(svg(file), LATIN.height)}`);
    await page.locator("svg").screenshot({ path: path.join(BRAND, out), omitBackground: true });
  }

  // Email header logo: tight, transparent, drawn at 3× for a 140 px slot.
  await page.setViewportSize({ width: 800, height: 300 });
  await page.setContent(`<style>html,body{margin:0;background:transparent} svg{width:420px;height:auto;display:block}</style>${svg("logo.svg")}`);
  await page.locator("svg").screenshot({ path: path.join(BRAND, "logo-email.png"), omitBackground: true });

  for (const [lang, o] of Object.entries(OG)) {
    const ar = lang === "ar";
    await page.setViewportSize({ width: 1200, height: 630 });
    await page.setContent(`<!doctype html><html lang="${lang}" dir="${o.dir}"><head><style>${FACES}
      *{box-sizing:border-box}
      html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:${BONE};color:${INK}}
      .page{position:relative;height:100%;display:flex;flex-direction:column}
      .top{display:flex;align-items:center;justify-content:space-between;margin:0 64px;height:116px;border-bottom:1.5px solid ${HAIRLINE}}
      .top svg{height:46px;width:auto;display:block}
      .eyebrow{font-family:${ar ? "PlexAr" : "Archivo"};font-stretch:125%;font-weight:${ar ? 500 : 700};font-size:${ar ? 22 : 15}px;letter-spacing:${ar ? 0 : "0.16em"};text-transform:uppercase;color:${STONE}}
      .body{flex:1;margin:0 64px;display:flex;align-items:center}
      .stage{position:relative;width:100%}
      h1{margin:0;font-family:${ar ? "Beiruti" : "Archivo"};font-weight:${ar ? 900 : 800};font-stretch:125%;text-transform:${ar ? "none" : "uppercase"};
         font-size:var(--size);line-height:${ar ? 1.02 : 0.92};letter-spacing:${ar ? 0 : "-0.01em"};white-space:nowrap}
      h1 span{display:block;width:max-content}
      /* The full stop is the estimate: the mark's vermilion dot. */
      .dot{display:inline-block;width:0.2em;height:0.2em;border-radius:50%;background:${SIGNAL};margin-inline-start:0.08em;vertical-align:baseline}
      .mark{position:absolute;inset-inline-end:0;top:0}
      .mark svg{width:100%;height:100%;display:block}
      .strip{height:112px;background:${SIGNAL};display:flex;align-items:center;padding:0 64px}
      .strip p{margin:0;font-family:${ar ? "PlexAr" : "Plex"};font-weight:500;font-size:${ar ? 31 : 29}px;line-height:1.3;color:${INK}}
    </style></head><body><div class="page">
      <div class="top"><div class="logo">${svg("logo.svg")}</div><div class="eyebrow">${o.eyebrow}</div></div>
      <div class="body"><div class="stage">
        <h1>${o.lines.map((l, i) => `<span>${l}${i === o.lines.length - 1 ? '<i class="dot"></i>' : ""}</span>`).join("")}</h1>
        <div class="mark">${svg("mark.svg")}</div>
      </div></div>
      <div class="strip"><p>${o.strip}</p></div>
    </div></body></html>`);
    await page.evaluate(() => document.fonts.ready);
    // Fit the headline as large as it goes; the mark stands beside the first lines, as tall as they are.
    await page.evaluate((beside) => {
      const h1 = document.querySelector("h1") as HTMLElement;
      const mark = document.querySelector(".mark") as HTMLElement;
      const lines = [...h1.children] as HTMLElement[];
      const room = (document.querySelector(".stage") as HTMLElement).clientWidth;
      const maxHeight = (document.querySelector(".body") as HTMLElement).clientHeight - 56;
      for (let size = 200; size > 40; size -= 2) {
        h1.style.setProperty("--size", `${size}px`);
        const markSize = lines.slice(0, beside).reduce((sum, l) => sum + l.offsetHeight, 0) * 0.92;
        const fits = lines.every((l, i) => l.offsetWidth <= (i < beside ? room - markSize - 40 : room)) && h1.offsetHeight <= maxHeight;
        if (fits) {
          Object.assign(mark.style, { width: `${markSize}px`, height: `${markSize}px`, top: `${(lines[0]!.offsetHeight * beside - markSize) / 2}px` });
          break;
        }
      }
    }, o.beside);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(BRAND, `og-${lang}.png`) });
  }
});
