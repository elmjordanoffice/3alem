import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";

const ROOT = path.resolve(__dirname, "..");
const BRAND = path.join(ROOT, "public/brand");
const font = (pkg: string, file: string) => `url(data:font/woff2;base64,${readFileSync(path.join(ROOT, "node_modules", pkg, "files", file)).toString("base64")}) format("woff2")`;
const FACES = `
@font-face { font-family: "Alexandria"; font-weight: 100 900; src: ${font("@fontsource-variable/alexandria", "alexandria-latin-wght-normal.woff2")}; unicode-range: U+0000-00FF, U+2013-2014, U+2018-201E; }
@font-face { font-family: "Alexandria"; font-weight: 100 900; src: ${font("@fontsource-variable/alexandria", "alexandria-arabic-wght-normal.woff2")}; unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF; }
@font-face { font-family: "Plex"; font-weight: 100 700; src: ${font("@fontsource-variable/ibm-plex-sans", "ibm-plex-sans-latin-wght-normal.woff2")}; }
@font-face { font-family: "PlexAr"; font-weight: 500; src: ${font("@fontsource/ibm-plex-sans-arabic", "ibm-plex-sans-arabic-arabic-500-normal.woff2")}; }
`;
const svg = (name: string) => readFileSync(path.join(BRAND, name), "utf8");

/** The range field: rows of estimates narrowing as they go down. The brand's graphic texture. */
function rangeField(width: number, height: number, rows = 9) {
  const out: string[] = [];
  for (let i = 0; i < rows; i++) {
    const y = (height / (rows + 1)) * (i + 1);
    const spread = 0.62 - i * 0.055;
    const centre = 0.58 + Math.sin(i * 1.7) * 0.12;
    const lo = Math.max(0.04, centre - spread / 2) * width;
    const hi = Math.min(0.96, centre + spread / 2) * width;
    out.push(`<rect x="0" y="${y - 1}" width="${width}" height="2" rx="1" fill="#f5f4ff" opacity="0.10"/>`);
    // Uncertain estimates are lavender; as the band narrows it turns saffron (evidence).
    const t = i / (rows - 1);
    const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
    const fill = `rgb(${mix(0x8f, 0xf2)},${mix(0x92, 0xb5)},${mix(0xf7, 0x32)})`;
    out.push(`<rect x="${lo}" y="${y - 9}" width="${hi - lo}" height="18" rx="9" fill="${fill}" opacity="${0.35 + t * 0.65}"/>`);
    out.push(`<circle cx="${(lo + hi) / 2}" cy="${y}" r="5" fill="#f5f4ff" opacity="${0.35 + i * 0.07}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${out.join("")}</svg>`;
}
writeFileSync(path.join(BRAND, "range-field.svg"), rangeField(640, 560) + "\n");

const OG = {
  en: { title: "Evidence, not impressions.", sub: "Adaptive skills assessment. Every score comes with the person’s own words.", dir: "ltr", font: "Alexandria" },
  ar: { title: "أدلة، لا انطباعات.", sub: "تقييم تكيّفي للمهارات، كل درجة فيه تستند إلى كلمات صاحبها.", dir: "rtl", font: "Alexandria" },
} as const;

test("render brand assets", async ({ page }) => {
  for (const [name, size] of [["symbol-1024.png", 1024], ["symbol-512.png", 512], ["symbol-192.png", 192]] as const) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;background:transparent}</style>${svg("symbol.svg").replace('width="32" height="32"', `width="${size}" height="${size}"`)}`);
    await page.screenshot({ path: path.join(BRAND, name), omitBackground: true });
  }
  // iOS home-screen icon: full-bleed square (iOS rounds the corners itself).
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`<style>html,body{margin:0;background:#17184a}</style>${svg("symbol.svg").replace('width="32" height="32"', 'width="180" height="180"').replace('rx="9"', 'rx="0"')}`);
  await page.screenshot({ path: path.join(ROOT, "src/app/apple-icon.png") });

  for (const [file, bg] of [["logo.svg", "#ffffff"], ["logo-reverse.svg", "#17184a"]] as const) {
    await page.setViewportSize({ width: 1600, height: 400 });
    await page.setContent(`<style>html,body{margin:0;height:100%;display:grid;place-items:center;background:${bg}} svg{width:1400px;height:auto}</style>${svg(file)}`);
    await page.screenshot({ path: path.join(BRAND, file.replace(".svg", ".png")) });
  }

  // Tight, transparent logo for the email header (shown at 140 px wide).
  await page.setViewportSize({ width: 600, height: 200 });
  await page.setContent(`<style>html,body{margin:0;background:transparent} svg{width:280px;height:auto;display:block}</style>${svg("logo-reverse.svg")}`);
  await page.locator("svg").screenshot({ path: path.join(BRAND, "logo-email.png"), omitBackground: true });

  for (const [lang, o] of Object.entries(OG)) {
    await page.setViewportSize({ width: 1200, height: 630 });
    await page.setContent(`<!doctype html><html dir="${o.dir}"><head><style>${FACES}
      html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#17184a;color:#f5f4ff}
      .wrap{position:relative;height:100%;padding:72px 80px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between}
      .logo svg{height:64px;width:auto}
      h1{font-family:${o.font};font-weight:650;font-size:${lang === "ar" ? 78 : 84}px;line-height:${lang === "ar" ? 1.3 : 1.02};letter-spacing:${lang === "ar" ? 0 : "-0.025em"};margin:0;max-width:640px}
      p{font-family:${lang === "ar" ? "PlexAr" : "Plex"};font-size:28px;line-height:1.45;color:#bfc1f2;margin:22px 0 0;max-width:600px}
      .field{position:absolute;top:35px;${o.dir === "rtl" ? "left" : "right"}:40px;opacity:.95}
    </style></head><body><div class="field">${rangeField(470, 560)}</div><div class="wrap"><div class="logo">${svg("logo-reverse.svg")}</div><div><h1>${o.title}</h1><p>${o.sub}</p></div></div></body></html>`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(BRAND, `og-${lang}.png`) });
  }
});
