import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowDownToLine, Ellipsis, Moon, RotateCcw, Search, X } from "lucide-react";
import { LogoMark, LogoTile, Wordmark } from "@/components/brand/logo";
import { AYN } from "@/components/brand/wordmark-paths";
import { NarrowingChart, curve } from "@/components/landing/narrowing-chart";
import { RangeScale } from "@/components/report/range-scale";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contrastRatio } from "@/lib/contrast";
import { cn } from "@/lib/utils";
import { CORAL, ClearSpace, CoverMark, EyeFigure, INDIGO, LockupArt, Mark, MarkConstruction, NarrowingFigure, Sweep, WHITE, WordmarkGuides, WordmarkShape } from "./figures";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("brandbook");
  return { title: t("title"), description: t("metaDescription") };
}

const SECTIONS = ["idea", "mark", "lockups", "space", "misuse", "colour", "type", "shape", "motif", "ui", "voice", "downloads"] as const;
const num = (i: number) => String(i + 1).padStart(2, "0");

/* Brand faces, named directly so a Latin word inside Arabic text keeps Plus Jakarta (and the reverse). */
const JAKARTA: CSSProperties = { fontFamily: '"Plus Jakarta Sans Variable", sans-serif' };
const READEX: CSSProperties = { fontFamily: '"Readex Pro Variable", sans-serif' };

/** Artboards: fixed brand grounds that never follow the theme, like a printed page. */
const BOARD = {
  white: "bg-white text-[#1b1840] ring-1 ring-inset ring-[#e1ddf5]",
  lavender: "bg-[#efedfb] text-[#1b1840] ring-1 ring-inset ring-[#e1ddf5]",
  night: "bg-[#141235] bg-[radial-gradient(90%_80%_at_85%_0%,rgb(108_92_231/0.35),transparent_70%)] text-white dark:ring-1 dark:ring-inset dark:ring-white/10",
  coral: "bg-[#ff5c7c] text-[#1b1840]",
  /** A stand-in for a busy photograph, for the misuse example. */
  busy: "bg-[#c9a27e] bg-[radial-gradient(40%_55%_at_20%_30%,#f4d35e,transparent),radial-gradient(45%_60%_at_80%_20%,#3a7d44,transparent),radial-gradient(50%_60%_at_60%_90%,#6b2d5c,transparent),repeating-linear-gradient(115deg,rgb(255_255_255/0.28)_0_6px,transparent_6px_14px)] text-[#1b1840]",
} as const;

/** The four words that start with ع (the product's name first). */
const WORDS = [
  ["alam", "عالم"],
  ["ilm", "علم"],
  ["amal", "عمل"],
  ["ayn", "عين"],
] as const;

function Board({ tone = "white", className, children }: { tone?: keyof typeof BOARD; className?: string; children: ReactNode }) {
  return <div className={cn("relative overflow-hidden rounded-card", BOARD[tone], className)}>{children}</div>;
}

/** A lifted card on the page (follows the theme). */
const CARD = "rounded-card bg-surface shadow-card";

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");
const ratio = (a: string, b: string) => Math.floor(contrastRatio(a, b) * 10) / 10;
const grade = (r: number) => (r >= 7 ? "aaa" : r >= 4.5 ? "aa" : r >= 3 ? "large" : "fail");

function fileSize(href: string) {
  try {
    const bytes = statSync(path.join(process.cwd(), "public", href)).size;
    return bytes < 1024 ? `${bytes} B` : `${Math.round(bytes / 1024)} KB`;
  } catch {
    return null;
  }
}

/** The two token blocks, read from the product's own token file so the swatches can't drift. */
type Tokens = Record<string, string>;
const FALLBACK: { light: Tokens; dark: Tokens } = {
  light: { background: "#efedfb", surface: "#ffffff", "surface-sunken": "#e6e3f8", text: "#1b1840", "text-secondary": "#4a4575", "text-tertiary": "#5f5a8c", accent: "#5847d6", "accent-text": "#4636c2", signal: "#d6345d", blue: "#2f6bff", teal: "#12a597", highlight: "#ddd7ff", "level-1": "#e6e3f8", "level-2": "#c9c3ec", "level-3": "#9283f2", "level-4": "#5847d6", "level-5": "#2b2273", "level-1-fg": "#1b1840", "level-2-fg": "#1b1840", "level-3-fg": "#1b1840", "level-4-fg": "#ffffff", "level-5-fg": "#ffffff", "chart-1": "#5847d6", "chart-2": "#22449f", "chart-3": "#12a597", "chart-4": "#d6345d" },
  dark: { background: "#1b1840", surface: "#26224f", "surface-sunken": "#141233", text: "#ffffff", "text-secondary": "#bdb8e3", "text-tertiary": "#a09bcb", accent: "#6c5ce7", "accent-text": "#b3a8ff", signal: "#ff5c7c", blue: "#3b78ff", teal: "#25c6b6", highlight: "#4a3ea8", "level-1": "#36306e", "level-2": "#4c43a0", "level-3": "#6c5ce7", "level-4": "#a497ff", "level-5": "#d9d3ff", "level-1-fg": "#ffffff", "level-2-fg": "#ffffff", "level-3-fg": "#ffffff", "level-4-fg": "#1b1840", "level-5-fg": "#1b1840", "chart-1": "#8b7cff", "chart-2": "#5874cc", "chart-3": "#25c6b6", "chart-4": "#ff5c7c" },
};
function readTokens(): { light: Tokens; dark: Tokens } {
  try {
    const css = readFileSync(path.join(process.cwd(), "src/styles/tokens.css"), "utf8");
    const block = (selector: string) => {
      const start = css.indexOf(`${selector} {`);
      const body = css.slice(start, css.indexOf("\n}", start));
      return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1]!, m[2]!.toLowerCase()]));
    };
    const light = { ...FALLBACK.light, ...block(":root") };
    const dark = { ...FALLBACK.dark, ...block(".dark") };
    return { light, dark };
  } catch {
    return FALLBACK;
  }
}

const THEME_TOKENS = [
  ["background", "background"],
  ["surface", "surface"],
  ["surface-sunken", "surfaceSunken"],
  ["text", "text"],
  ["text-secondary", "textSecondary"],
  ["text-tertiary", "textTertiary"],
  ["accent", "accent"],
  ["accent-text", "accentText"],
  ["signal", "signal"],
  ["blue", "blue"],
  ["teal", "teal"],
  ["highlight", "highlight"],
] as const;

/** The brand book: the ʿAyn in Night colours, built from the product's own components, in both languages and both themes. */
export default async function BrandPage() {
  const t = await getTranslations("brandbook");
  const tf = await getTranslations("landing.hero.figure");
  const th = await getTranslations("home");
  const locale = await getLocale();
  const rtl = locale === "ar";
  const q = rtl ? ["«", "»"] : ["“", "”"];
  const tk = readTokens();
  const D = tk.dark;
  const L = tk.light;
  const n = (k: string) => t(`colour.names.${k}`);
  // The edition's name in both scripts. In display the ʿayn sign is set as a turned comma (‘), which the brand face has.
  const names = [
    <span key="en" lang="en" dir="ltr" style={JAKARTA} className="font-extrabold leading-[0.9] tracking-[-0.045em]">
      ‘Ayn
    </span>,
    <span key="ar" lang="ar" dir="rtl" style={READEX} className="font-bold leading-[1.1]">
      عين
    </span>,
  ];

  const core = [
    { key: "night", hex: D.background!, alt: null, fg: WHITE, className: "lg:col-span-4" },
    { key: "violet", hex: D.accent!, alt: L.accent!, fg: WHITE, className: "lg:col-span-4" },
    { key: "coral", hex: D.signal!, alt: L.signal!, fg: INDIGO, className: "lg:col-span-4" },
    { key: "blue", hex: D.blue!, alt: L.blue!, fg: WHITE, className: "lg:col-span-4" },
    { key: "teal", hex: D.teal!, alt: L.teal!, fg: INDIGO, className: "lg:col-span-4" },
    { key: "lavender", hex: L.background!, alt: null, fg: INDIGO, className: "lg:col-span-4" },
  ] as const;

  return (
    <div className="min-h-dvh overflow-x-clip bg-background bg-[radial-gradient(70rem_40rem_at_100%_0%,var(--wash-1),transparent_65%)] bg-no-repeat text-text">
      <header>
        <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-8">
          <Link href="/" aria-label={t("topbar.home")} className="flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-focus">
            <LogoTile className="size-10" />
            <Wordmark className="h-[19px] text-text sm:h-[21px]" />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="r-pill r-label px-4! max-sm:hidden!">
              {t("topbar.label")} · <span className="tabular">{t("topbar.version")}</span>
            </span>
            <LanguageToggle className="rounded-full" />
            <ThemeMenu className="size-10 rounded-full shadow-[inset_0_0_0_1px_var(--border-strong)]" />
          </div>
        </div>

        {/* Cover */}
        <div className="mx-auto max-w-[1360px] px-4 pt-10 sm:px-8 sm:pt-16">
          <p className="r-pill r-label">
            <span className="grid size-6 place-items-center rounded-full bg-[var(--signal-subtle)]" aria-hidden>
              <span className="size-2 rounded-full bg-[var(--signal)] shadow-[0_0_8px_var(--signal)]" />
            </span>
            {t("cover.eyebrow")}
          </p>
          <h1 className="mt-6 flex flex-col items-start gap-y-3 text-[clamp(3.5rem,19vw,5rem)] sm:flex-row sm:items-center sm:gap-x-[0.18em] sm:text-[clamp(4rem,11vw,9.5rem)]" style={{ lineHeight: 1 }}>
            {rtl ? names[1] : names[0]}
            <span aria-hidden className="hidden size-[0.16em] shrink-0 rounded-full bg-[var(--signal)] shadow-[0_0_0.2em_var(--signal)] sm:inline-block" />
            {rtl ? names[0] : names[1]}
          </h1>
          <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <p className="text-[1.25rem] leading-snug text-text sm:text-[1.5rem]">{t("cover.statement")}</p>
              <dl className="mt-8 grid max-w-2xl grid-cols-3 gap-3 text-sm">
                {(["version", "updated", "scope"] as const).map((k) => (
                  <div key={k} className={cn(CARD, "rounded-[18px] p-4")}>
                    <dt className="text-xs text-tertiary">{t(`cover.meta.${k}`)}</dt>
                    <dd className="mt-1 font-medium text-text tabular">{t(`cover.meta.${k}Value`)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <nav aria-label={t("cover.contents")} className={cn(CARD, "p-5 sm:p-6 lg:col-span-5")}>
              <h2 className="r-label text-tertiary">{t("cover.contents")}</h2>
              <ol className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-2">
                {SECTIONS.map((s, i) => (
                  <li key={s}>
                    <a href={`#${s}`} className="flex items-center gap-2.5 rounded-full px-2 py-2 text-sm text-secondary transition-colors hover:bg-surface-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-focus">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-subtle text-[11px] font-bold text-accent-text tabular">{num(i)}</span>
                      {t(`nav.${s}`)}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <Board tone="night" className="mt-10 grid items-center gap-6 rounded-[28px] p-6 sm:mt-14 sm:rounded-[36px] sm:p-10 lg:grid-cols-12 lg:gap-8 lg:p-14">
            <div aria-hidden className="pointer-events-none absolute -bottom-40 -start-20 size-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(59_120_255/0.3),transparent)]" />
            <div className="relative mx-auto w-full max-w-[22rem] lg:col-span-5 lg:max-w-none">
              <CoverMark />
            </div>
            <div className="relative flex flex-col gap-8 lg:col-span-7 lg:ps-6">
              <span className="flex items-center gap-3" dir="ltr">
                <LogoTile className="size-12 sm:size-14" />
                <Wordmark className="h-[26px] text-white sm:h-[32px]" />
              </span>
              <p className="display-x text-[clamp(2.3rem,6vw,5rem)]">
                <WithDot text={t("cover.poster")} />
              </p>
            </div>
          </Board>
        </div>
      </header>

      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-12">
        <nav aria-label={t("navLabel")} className="hidden lg:block">
          <ol className="sticky top-8 mt-24 flex flex-col gap-0.5 text-sm">
            {SECTIONS.map((s, i) => (
              <li key={s}>
                <a href={`#${s}`} className="flex items-center gap-2.5 rounded-full px-2 py-1.5 text-secondary transition-colors hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-focus">
                  <span className="w-5 text-xs text-tertiary tabular">{num(i)}</span>
                  {t(`nav.${s}`)}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main className="flex min-w-0 flex-col gap-28 py-20 sm:gap-36 sm:py-28">
          {/* 01 The idea */}
          <Section id="idea" n={0} title={t("idea.title")} lede={t("idea.lede")}>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="flex flex-col gap-5 text-[17px] leading-relaxed text-secondary lg:col-span-5">
                <p>{t("idea.body1")}</p>
                <p>{t("idea.body2")}</p>
              </div>
              <figure className="lg:col-span-7">
                <div className={cn(CARD, "grid items-center gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_9rem] sm:gap-8 sm:p-9")}>
                  <NarrowingFigure
                    rtl={rtl}
                    rows={[
                      { label: t("idea.figure.after", { count: 1 }), lo: 1.25, hi: 4.75 },
                      { label: t("idea.figure.after", { count: 4 }), lo: 2.25, hi: 4.55 },
                      { label: t("idea.figure.after", { count: 9 }), lo: 3.15, hi: 4.35 },
                    ]}
                    estimate={{ label: t("idea.figure.estimate"), value: 3.8 }}
                    scale={[t("idea.figure.low"), t("idea.figure.high")]}
                  />
                  <div className="flex items-center gap-4 rounded-[18px] bg-surface-sunken p-4 sm:flex-col sm:items-start">
                    <Mark fg="var(--text)" dot="var(--saffron)" className="size-16 shrink-0 sm:size-20" />
                    <p className="text-sm leading-snug text-secondary">{t("idea.figure.pupil")}</p>
                  </div>
                </div>
                <figcaption className="mt-3 px-1 text-sm text-tertiary">{t("idea.figure.caption")}</figcaption>
              </figure>
            </div>

            <div className="mt-20 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("idea.nameTitle")}</h3>
                <p lang="ar" dir="rtl" style={READEX} className="mt-5 w-fit text-[clamp(4rem,9vw,6.5rem)] font-bold leading-none text-text">
                  {t("idea.letters")}
                </p>
              </div>
              <div className="lg:col-span-7">
                <dl className="grid grid-cols-2 gap-4">
                  {(["alim", "alam"] as const).map((k) => (
                    <div key={k} className={cn(CARD, "p-5")}>
                      <dt lang="ar" style={READEX} className="text-[2.5rem] font-bold leading-tight text-text">
                        {t(`idea.${k}`)}
                      </dt>
                      <dd className="mt-1 text-sm text-secondary">{t(`idea.${k}Meaning`)}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-8 text-[17px] leading-relaxed text-secondary">{t("idea.nameBody")}</p>
                <p className="mt-4 text-sm text-tertiary">{t("idea.usage")}</p>
              </div>
            </div>

            {/* One letter, four words: ع begins the name, knowledge, work and the eye. */}
            <div className="mt-20 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("idea.lettersTitle")}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-secondary">{t("idea.lettersBody")}</p>
              </div>
              <ul className="grid grid-cols-2 gap-4 lg:col-span-7">
                {WORDS.map(([k, word]) => (
                  <li key={k} className={cn(CARD, "flex flex-col p-5 sm:p-6")}>
                    <p lang="ar" dir="rtl" style={READEX} className="w-fit text-[2.75rem] font-bold leading-[1.3] text-text sm:text-[3.5rem]">
                      <span className="text-[var(--signal)]">{word.slice(0, 1)}</span>
                      {word.slice(1)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-text">{t(`idea.words.${k}.sound`)}</p>
                    <p className="mt-1 text-sm leading-snug text-secondary">{t(`idea.words.${k}.meaning`)}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* The eye: the hollow of the head, with the pupil in it. */}
            <div className="mt-20 grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
              <figure className="lg:col-span-7">
                <Board tone="night" className="px-4 py-6 sm:px-10 sm:py-10">
                  <EyeFigure labels={{ eye: t("idea.eyeLabels.eye"), pupil: t("idea.eyeLabels.pupil") }} />
                </Board>
              </figure>
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("idea.eyeTitle")}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-secondary">{t("idea.eyeBody")}</p>
              </div>
            </div>

            <div className="mt-20">
              <h3 className="r-label text-tertiary">{t("idea.traitsTitle")}</h3>
              <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                {(["exact", "warm", "honest"] as const).map((k, i) => (
                  <li key={k} className={cn(CARD, "p-6 sm:p-7")}>
                    <span className={cn("r-orb size-10", ["tile-violet", "tile-blue", "tile-teal"][i])} aria-hidden>
                      <span className="text-sm font-extrabold tabular">{num(i)}</span>
                    </span>
                    <p className="display-x mt-5 text-[1.75rem] sm:text-[2rem]">{t(`idea.traits.${k}.title`)}</p>
                    <p className="mt-3 leading-relaxed text-secondary">{t(`idea.traits.${k}.body`)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* 02 The mark */}
          <Section id="mark" n={1} title={t("mark.title")} lede={t("mark.lede")}>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <figure className="lg:col-span-7">
                <Board tone="white" className="p-3 sm:p-8">
                  <MarkConstruction labels={{ units: t("mark.labels.units"), head: t("mark.labels.head"), bowl: t("mark.labels.bowl"), stroke: t("mark.labels.stroke"), pupil: t("mark.labels.pupil"), neck: t("mark.labels.neck") }} />
                </Board>
                <figcaption className="sr-only">{t("mark.figureLabel")}</figcaption>
              </figure>
              <div className="lg:col-span-5">
                <p className="text-[17px] leading-relaxed text-secondary">{t("mark.body")}</p>
                <dl className={cn(CARD, "mt-8 px-5 py-2")}>
                  {(["grid", "head", "bowl", "stroke", "neck", "pupil", "ends"] as const).map((k) => (
                    <div key={k} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-border py-3 text-sm last:border-b-0">
                      <dt className="text-tertiary">{t(`mark.specs.${k}`)}</dt>
                      <dd className="text-text tabular">{t(`mark.specs.${k}Value`)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div className="mt-16">
              <h3 className="r-label text-tertiary">{t("mark.colourTitle")}</h3>
              <p className="mt-3 max-w-2xl leading-relaxed text-secondary">{t("mark.colourBody")}</p>
              <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                <Swatch label={t("mark.onNight")} tone="night">
                  <Mark fg={WHITE} dot={CORAL} className="size-20 sm:size-24" />
                </Swatch>
                <Swatch label={t("mark.onLavender")} tone="lavender">
                  <Mark className="size-20 sm:size-24" />
                </Swatch>
                <Swatch label={t("mark.onWhite")} tone="white">
                  <Mark className="size-20 sm:size-24" />
                </Swatch>
                <Swatch label={t("mark.oneColour")} tone="white">
                  <Mark dot={INDIGO} className="size-20 sm:size-24" />
                </Swatch>
                <Swatch label={t("mark.onTile")} tone="lavender">
                  <LogoTile className="size-20 sm:size-24" />
                </Swatch>
                <Swatch label={t("mark.signalTile")} tone="lavender">
                  {/* The coral tile, as the icon file draws it: indigo letter, white pupil. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/symbol-signal.svg" alt="" className="size-20 sm:size-24" />
                </Swatch>
              </ul>
            </div>

            {/* Motion: the product's own animated mark, live. */}
            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("mark.motionTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("mark.motionBody")}</p>
                <dl className={cn(CARD, "mt-8 px-5 py-2")}>
                  {(["draw", "pupil", "glance", "still"] as const).map((k) => (
                    <div key={k} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-4 border-b border-border py-3 text-sm last:border-b-0">
                      <dt className="text-tertiary">{t(`mark.motionSpecs.${k}`)}</dt>
                      <dd className="text-text tabular">{t(`mark.motionSpecs.${k}Value`)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="flex flex-col gap-4 lg:col-span-7">
                <figure>
                  <Board tone="night" className="grid min-h-80 place-items-center p-8 sm:min-h-[26rem]">
                    <div aria-hidden className="pointer-events-none absolute size-72 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.12),transparent)] blur-xl" />
                    {/* Replay without script: each toggle shows the other copy, and a newly shown animation starts from the top. */}
                    <input id="ayn-replay" type="checkbox" className="peer sr-only motion-reduce:hidden" />
                    <LogoMark animated className="relative size-44 text-white peer-checked:hidden sm:size-56" />
                    <LogoMark animated className="relative hidden size-44 text-white peer-checked:block sm:size-56" />
                    <label htmlFor="ayn-replay" className="absolute bottom-4 end-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors select-none hover:bg-white/20 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white motion-reduce:hidden">
                      <RotateCcw className="size-4" aria-hidden />
                      {t("mark.replay")}
                    </label>
                  </Board>
                  <figcaption className="mt-3 px-1 text-sm text-tertiary">{t("mark.liveCaption")}</figcaption>
                </figure>
                <div>
                  <p className="r-label px-1 text-tertiary">{t("mark.inProduct")}</p>
                  <div className="mt-3 flex items-center gap-5 rounded-card bg-surface p-5 shadow-card">
                    <LogoMark animated className="size-14 shrink-0 text-accent" />
                    <div>
                      <p className="text-lg font-semibold text-text">{th("caughtUp.title")}</p>
                      <p className="text-sm text-secondary">{th("caughtUp.body")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* 03 Lockups */}
          <Section id="lockups" n={2} title={t("lockups.title")} lede={t("lockups.lede")}>
            <ul className="grid gap-x-4 gap-y-8 md:grid-cols-6">
              <Lockup className="md:col-span-6" tone="lavender" name={t("lockups.items.horizontal.name")} body={t("lockups.items.horizontal.body")} boardClass="min-h-56 sm:min-h-80">
                <LockupArt className="h-[clamp(2.75rem,7vw,5.5rem)] w-auto max-w-full" />
              </Lockup>
              <Lockup className="md:col-span-3" tone="white" name={t("lockups.items.english.name")} body={t("lockups.items.english.body")}>
                <LockupArt variant="latin" className="h-12 w-auto max-w-full sm:h-14" />
              </Lockup>
              <Lockup className="md:col-span-3" tone="white" name={t("lockups.items.arabic.name")} body={t("lockups.items.arabic.body")}>
                <LockupArt variant="arabic" className="h-14 w-auto max-w-full sm:h-16" />
              </Lockup>
              <Lockup className="md:col-span-2" tone="white" name={t("lockups.items.mono.name")} body={t("lockups.items.mono.body")}>
                <LockupArt dot={INDIGO} className="h-9 w-auto max-w-full" />
              </Lockup>
              <Lockup className="md:col-span-2" tone="night" name={t("lockups.items.reverse.name")} body={t("lockups.items.reverse.body")}>
                <LockupArt fg={WHITE} dot={CORAL} className="h-9 w-auto max-w-full" />
              </Lockup>
              <Lockup className="md:col-span-2" tone="lavender" name={t("lockups.items.tile.name")} body={t("lockups.items.tile.body")} boardClass="items-end gap-4">
                {(["size-[72px]", "size-12", "size-8", "size-5"] as const).map((s) => (
                  <LogoTile key={s} className={s} />
                ))}
              </Lockup>
            </ul>
            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h3 className="r-label text-tertiary">{t("lockups.wordmarkTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("lockups.wordmarkBody")}</p>
              </div>
              <Board tone="white" className="flex items-center p-5 sm:p-10 lg:col-span-8">
                <WordmarkGuides labels={{ ascender: t("lockups.guides.ascender"), baseline: t("lockups.guides.baseline"), rise: t("lockups.guides.rise") }} />
              </Board>
            </div>
          </Section>

          {/* 04 Space and size */}
          <Section id="space" n={3} title={t("space.title")} lede={t("space.lede")}>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <Board tone="white" className="p-3 sm:p-8 lg:col-span-7">
                <ClearSpace x={t("space.x")} />
              </Board>
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("space.clearTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("space.clearBody")}</p>
              </div>
            </div>
            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("space.minTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("space.minBody")}</p>
                <p className="mt-3 text-sm text-tertiary">{t("space.print")}</p>
              </div>
              <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-[#e1ddf5] ring-1 ring-inset ring-[#e1ddf5] sm:grid-cols-4 lg:col-span-7">
                {(
                  [
                    ["mark", 20, <Mark key="m" style={{ width: 20, height: 20 }} />],
                    ["tile", 20, <LogoTile key="t" className="size-5" />],
                    ["horizontal", 120, <LockupArt key="h" style={{ width: 120 }} />],
                    ["english", 80, <LockupArt key="e" variant="latin" style={{ width: 80 }} />],
                  ] as const
                ).map(([k, px, el]) => (
                  <li key={k} className="flex flex-col justify-between gap-6 bg-white p-5 text-[#1b1840]">
                    <div className="flex h-12 items-end">{el}</div>
                    <div>
                      <p className="text-sm font-medium">{t(`space.sizes.${k}`)}</p>
                      <p className="mt-0.5 text-xs text-[#4a4575] tabular">{t("space.px", { value: px })}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* 05 Misuse */}
          <Section id="misuse" n={4} title={t("misuse.title")} lede={t("misuse.lede")}>
            {/* Each example breaks exactly the rule under it, and nothing else. */}
            <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-5">
              <Dont label={t("misuse.items.mirror")}>
                <Mark className="size-14 -scale-x-100 sm:size-16" />
              </Dont>
              <Dont label={t("misuse.items.close")}>
                <Mark closeHead className="size-14 sm:size-16" />
              </Dont>
              <Dont label={t("misuse.items.pupil")}>
                <span className="flex items-center gap-1">
                  <Mark pupil={{ cx: AYN.bowl.cx, cy: AYN.bowl.cy }} className="size-12 sm:size-14" />
                  <Mark dot="#25c6b6" className="size-12 sm:size-14" />
                </span>
              </Dont>
              <Dont label={t("misuse.items.recolour")}>
                <span className="flex items-center gap-2" dir="ltr">
                  <Mark fg="#2d9cdb" className="size-8 sm:size-10" />
                  <WordmarkShape fill="#2d9cdb" className="h-4 w-auto sm:h-5" />
                </span>
              </Dont>
              <Dont label={t("misuse.items.stretch")}>
                <LockupArt variant="latin" className="h-6 w-auto scale-x-[1.3] scale-y-[0.7] sm:h-8" />
              </Dont>
              <Dont label={t("misuse.items.rotate")}>
                <LockupArt variant="latin" className="h-6 w-auto -rotate-[14deg] sm:h-8" />
              </Dont>
              <Dont label={t("misuse.items.effects")}>
                <LockupArt variant="latin" className="h-6 w-auto [filter:drop-shadow(0_6px_5px_rgb(0_0_0/0.45))_drop-shadow(0_0_14px_rgb(108_92_231/0.9))] sm:h-8" />
              </Dont>
              <Dont label={t("misuse.items.retype")}>
                <span className="flex items-center gap-2" dir="ltr">
                  <Mark className="size-8 sm:size-10" />
                  <span className="text-xl italic sm:text-[26px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    Aalim
                  </span>
                </span>
              </Dont>
              <Dont label={t("misuse.items.busy")} tone="busy">
                <LockupArt variant="latin" className="h-6 w-auto sm:h-8" />
              </Dont>
              <Dont label={t("misuse.items.rearrange")}>
                <span className="flex flex-col items-center gap-1" dir="ltr">
                  <Mark className="size-9 sm:size-11" />
                  <WordmarkShape fill={INDIGO} className="h-4 w-auto sm:h-5" />
                </span>
              </Dont>
            </ul>
          </Section>

          {/* 06 Colour */}
          <Section id="colour" n={5} title={t("colour.title")} lede={t("colour.lede")}>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
              {core.map((c) => (
                <ColourCard
                  key={c.key}
                  className={c.className}
                  hex={c.hex}
                  alt={c.alt}
                  fg={c.fg}
                  name={t(`colour.swatches.${c.key}.name`)}
                  role={t(`colour.swatches.${c.key}.role`)}
                  labels={{ dark: t("colour.dark"), light: t("colour.light"), text: c.fg === WHITE ? n("white") : n("indigo"), levels: { aaa: t("colour.levels.aaa"), aa: t("colour.levels.aa"), large: t("colour.levels.large"), fail: t("colour.levels.fail") } }}
                  lightGround={c.key === "lavender"}
                />
              ))}
            </ul>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h3 className="r-label text-tertiary">{t("colour.themesTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("colour.themesBody")}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
                {(
                  [
                    ["dark", D, `${t("colour.dark")} · ${t("colour.default")}`],
                    ["light", L, t("colour.light")],
                  ] as const
                ).map(([key, tok, title]) => (
                  <div key={key} className={cn("rounded-card p-5 sm:p-6", key === "dark" ? "bg-[#1b1840] text-white ring-1 ring-inset ring-white/10" : "bg-[#efedfb] text-[#1b1840] ring-1 ring-inset ring-[#e1ddf5]")}>
                    <p className="font-semibold">{title}</p>
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {THEME_TOKENS.map(([token, label]) => (
                        <li key={token} className="flex items-center gap-3 text-sm">
                          <span className={cn("size-8 shrink-0 rounded-full", key === "dark" ? "ring-1 ring-inset ring-white/15" : "ring-1 ring-inset ring-[#1b1840]/10")} style={{ background: tok[token] }} />
                          <span className="min-w-0 flex-1 truncate">{t(`colour.tokens.${label}`)}</span>
                          <span className={cn("font-mono text-xs", key === "dark" ? "text-[#bdb8e3]" : "text-[#4a4575]")} dir="ltr">
                            {tok[token]!.toUpperCase()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="flex flex-col gap-8 lg:col-span-4">
                <div>
                  <h3 className="r-label text-tertiary">{t("colour.levelsTitle")}</h3>
                  <p className="mt-3 leading-relaxed text-secondary">{t("colour.levelsBody")}</p>
                </div>
                <div>
                  <h3 className="r-label text-tertiary">{t("colour.chartsTitle")}</h3>
                  <p className="mt-3 leading-relaxed text-secondary">{t("colour.chartsBody")}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
                {(
                  [
                    ["dark", D],
                    ["light", L],
                  ] as const
                ).map(([key, tok]) => (
                  <div key={key} className={cn("flex flex-col gap-5 rounded-card p-5 sm:p-6", key === "dark" ? "bg-[#1b1840] text-white ring-1 ring-inset ring-white/10" : "bg-[#efedfb] text-[#1b1840] ring-1 ring-inset ring-[#e1ddf5]")}>
                    <p className="text-sm font-semibold">{t(`colour.${key}`)}</p>
                    <div className="flex gap-1.5" dir="ltr">
                      {[1, 2, 3, 4, 5].map((l) => (
                        <span key={l} className="grid h-12 flex-1 place-items-center rounded-[12px] text-sm font-bold tabular" style={{ background: tok[`level-${l}`], color: tok[`level-${l}-fg`] }}>
                          {l}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-end gap-2" dir="ltr">
                      {[1, 2, 3, 4].map((c, i) => (
                        <span key={c} className="flex-1 rounded-full" style={{ height: `${[44, 30, 22, 12][i]}px`, background: tok[`chart-${c}`], boxShadow: `0 8px 18px -8px ${tok[`chart-${c}`]}` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16">
              <h3 className="r-label text-tertiary">{t("colour.shareTitle")}</h3>
              <div className="mt-4 flex h-14 overflow-hidden rounded-full shadow-card ring-1 ring-border-strong" aria-hidden dir="ltr">
                {(
                  [
                    [D.background!, 58],
                    [D.surface!, 24],
                    [D.accent!, 9],
                    [D.blue!, 3],
                    [D.teal!, 3],
                    [D.signal!, 3],
                  ] as const
                ).map(([c, w]) => (
                  <span key={c} style={{ background: c, width: `${w}%` }} />
                ))}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-secondary">
                {(
                  [
                    ["night", 58],
                    ["cards", 24],
                    ["violet", 9],
                    ["data", 6],
                    ["coral", 3],
                  ] as const
                ).map(([k, w]) => (
                  <li key={k}>
                    {t(`colour.share.${k}`)} <span className="text-tertiary tabular">{w}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h3 className="r-label text-tertiary">{t("colour.pairsTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("colour.pairsBody")}</p>
                <div className="mt-8 rounded-[18px] bg-[var(--signal-subtle)] p-5">
                  <p className="flex items-center gap-2 font-semibold text-text">
                    <span className="size-2.5 rounded-full bg-[var(--signal)] shadow-[0_0_8px_var(--signal)]" aria-hidden />
                    {t("colour.ruleTitle")}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-text">{t("colour.ruleBody", { ratio: ratio(D.signal!, D.background!) })}</p>
                </div>
              </div>
              <ContrastMatrix
                className="min-w-0 lg:col-span-8"
                t={{ fg: t("colour.fg"), bg: t("colour.bg"), levels: { aaa: t("colour.levels.aaa"), aa: t("colour.levels.aa"), large: t("colour.levels.large"), fail: t("colour.levels.fail") } }}
                fgs={[
                  [n("white"), WHITE],
                  [`${n("lilac")} ⁦${D["text-secondary"]!.toUpperCase()}⁩`, D["text-secondary"]!],
                  [`${n("violetText")} ⁦${D["accent-text"]!.toUpperCase()}⁩`, D["accent-text"]!],
                  [`${n("coral")} ⁦${D.signal!.toUpperCase()}⁩`, D.signal!],
                  [`${n("indigo")} ⁦${L.text!.toUpperCase()}⁩`, L.text!],
                  [`${n("slate")} ⁦${L["text-secondary"]!.toUpperCase()}⁩`, L["text-secondary"]!],
                  [`${n("violetDeep")} ⁦${L.accent!.toUpperCase()}⁩`, L.accent!],
                ]}
                bgs={[
                  [n("night"), D.background!],
                  [n("raised"), D.surface!],
                  [n("violet"), D.accent!],
                  [n("lavender"), L.background!],
                  [n("white"), WHITE],
                ]}
              />
            </div>
          </Section>

          {/* 07 Typography */}
          <Section id="type" n={6} title={t("type.title")} lede={t("type.lede")}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Specimen name={t("type.jakarta.name")} role={t("type.jakarta.role")} spec={t("type.jakarta.spec")}>
                <p lang="en" dir="ltr" style={JAKARTA} className="text-start text-[clamp(2.4rem,4.6vw,3.75rem)] font-extrabold leading-[1] tracking-[-0.04em]">
                  {t("type.jakarta.sample")}
                </p>
                <p lang="en" dir="ltr" style={JAKARTA} className="mt-8 text-start text-base font-semibold leading-relaxed text-secondary sm:text-lg">
                  <span className="block">ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
                  <span className="block">abcdefghijklmnopqrstuvwxyz</span>
                  <span className="block tabular">0123456789</span>
                </p>
              </Specimen>
              <Specimen name={t("type.readex.name")} role={t("type.readex.role")} spec={t("type.readex.spec")}>
                <p lang="ar" dir="rtl" style={READEX} className="text-start text-[clamp(2.6rem,5vw,4.25rem)] font-bold leading-[1.25]">
                  {t("type.readex.sample")}
                </p>
                <p lang="ar" dir="rtl" style={READEX} className="mt-6 text-start text-xl font-medium leading-relaxed text-secondary">
                  <span className="block">ا ب ت ث ج ح خ د ذ ر ز س ش ص</span>
                  <span className="block">ض ط ظ ع غ ف ق ك ل م ن ه و ي</span>
                  <span className="block">٠١٢٣٤٥٦٧٨٩</span>
                </p>
              </Specimen>
              <Specimen className="lg:col-span-2" name={t("type.pair.name")} role={t("type.pair.role")} spec={t("type.pair.spec")}>
                <div className="grid gap-8 md:grid-cols-2">
                  <p lang="en" dir="ltr" style={JAKARTA} className="text-start text-[19px] leading-[1.55]">
                    {t("type.pair.sampleEn")}
                  </p>
                  <p lang="ar" dir="rtl" style={READEX} className="text-start text-[19px] leading-[1.75]">
                    {t("type.pair.sampleAr")}
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3 rounded-[18px] bg-surface-sunken px-5 py-4">
                  {[400, 500, 600, 700].map((w) => (
                    <p key={w} className="flex items-baseline gap-3 text-3xl" style={{ fontWeight: w }}>
                      <span style={JAKARTA}>Aa</span>
                      <span style={READEX}>أب</span>
                      <span className="text-xs font-normal text-tertiary tabular">{w}</span>
                    </p>
                  ))}
                </div>
              </Specimen>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h3 className="r-label text-tertiary">{t("type.weightTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("type.weightBody")}</p>
              </div>
              <ol className={cn(CARD, "px-5 py-2 sm:px-6 lg:col-span-8")}>
                {[400, 500, 600, 700, 800].map((w) => (
                  <li key={w} className="flex items-center justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
                    <span className={cn("font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-tight tracking-[-0.03em] rtl:tracking-normal", w === 800 ? "text-text" : "text-tertiary")} style={{ fontWeight: w }}>
                      {t("type.samples.display")}
                    </span>
                    <span className={cn("flex items-center gap-2 text-xs tabular", w === 800 ? "font-semibold text-text" : "text-tertiary")}>
                      {w === 800 ? <span className="size-2 rounded-full bg-[var(--signal)]" aria-hidden /> : null}
                      {w}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-16">
              <h3 className="r-label text-tertiary">{t("type.scaleTitle")}</h3>
              <ol className={cn(CARD, "mt-5 px-5 sm:px-7")}>
                {TYPE_SCALE.map((row) => (
                  <li key={row.key} className="grid gap-2 border-b border-border py-5 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)_14rem] sm:items-baseline sm:gap-6">
                    <span className="text-sm text-tertiary">{t(`type.roles.${row.key}`)}</span>
                    <span className={cn("min-w-0 text-text", row.className)}>{t(`type.samples.${row.key}`)}</span>
                    <span className="font-mono text-[11px] leading-relaxed text-tertiary sm:text-end" dir="ltr">
                      {rtl ? row.ar : row.en}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-8">
              <Rules title={t("type.arabicTitle")} rules={t.raw("type.arabicRules") as string[]} />
              <Rules title={t("type.latinTitle")} rules={t.raw("type.latinRules") as string[]} />
            </div>
          </Section>

          {/* 08 Shape and light */}
          <Section id="shape" n={7} title={t("shape.title")} lede={t("shape.lede")}>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h3 className="r-label text-tertiary">{t("shape.radiiTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("shape.radiiBody")}</p>
              </div>
              <ul className="grid grid-cols-2 gap-4 lg:col-span-8 lg:grid-cols-4">
                {(
                  [
                    ["control", "12 px", <span key="c" className="block h-12 w-full rounded-control bg-accent shadow-[0_12px_26px_-12px_rgb(108_92_231/0.8)]" />],
                    ["card", "24 px", <span key="k" className="block h-24 w-full rounded-card bg-surface-sunken" />],
                    ["inner", "18 px", <span key="i" className="block w-full rounded-card bg-surface-sunken p-2.5"><span className="block h-[4.75rem] rounded-[18px] bg-surface shadow-card" /></span>],
                    ["pill", t("shape.round"), <span key="p" className="flex w-full items-center gap-2"><span className="block h-10 flex-1 rounded-full bg-surface-sunken" /><span className="block size-10 rounded-full bg-accent" /></span>],
                  ] as const
                ).map(([k, value, el]) => (
                  <li key={k} className={cn(CARD, "flex flex-col justify-between gap-5 p-4 sm:p-5")}>
                    <div className="flex min-h-24 items-center">{el}</div>
                    <div>
                      <p className="text-sm font-medium text-text">{t(`shape.radii.${k}`)}</p>
                      <p className="mt-0.5 text-xs text-tertiary tabular">{value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h3 className="r-label text-tertiary">{t("shape.lightTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("shape.lightBody")}</p>
              </div>
              <ul className="grid grid-cols-2 gap-5 rounded-card bg-surface-sunken p-5 sm:gap-6 sm:p-8 lg:col-span-8 lg:grid-cols-4">
                {(
                  [
                    ["card", "bg-surface text-text shadow-card"],
                    ["hover", "bg-surface text-text shadow-card-hover -translate-y-0.5"],
                    ["raised", "hero-card"],
                    ["window", "bg-surface text-text shadow-window"],
                  ] as const
                ).map(([k, cls]) => (
                  <li key={k} className={cn("flex h-28 items-end rounded-card p-4 text-sm font-medium", cls)}>
                    {t(`shape.elevations.${k}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h3 className="r-label text-tertiary">{t("shape.glowTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("shape.glowBody")}</p>
              </div>
              <div className={cn(CARD, "relative isolate overflow-hidden p-5 sm:p-8 lg:col-span-8")}>
                <div aria-hidden className="absolute -end-16 -top-24 -z-10 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(108_92_231/0.45),transparent)]" />
                <div aria-hidden className="absolute -bottom-28 end-40 -z-10 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(59_120_255/0.3),transparent)]" />
                <GlowLine rtl={rtl} />
              </div>
            </div>
          </Section>

          {/* 09 Motifs: the ʿayn's bowl and pupil as graphics, then the narrowing as data */}
          <Section id="motif" n={8} title={t("motif.title")} lede={t("motif.lede")}>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("motif.sweepTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("motif.sweepBody")}</p>
              </div>
              <Board tone="night" className="isolate flex min-h-80 flex-col justify-between gap-12 p-6 sm:min-h-[24rem] sm:p-9 lg:col-span-7">
                <Sweep className="absolute inset-0 -z-10 size-full" />
                <span className="flex items-center gap-2.5 self-start" dir="ltr">
                  <LogoTile className="size-9" />
                  <Wordmark className="h-[18px] text-white" />
                </span>
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/85 rtl:text-[13px]">
                    <span className="size-2 rounded-full shadow-[0_0_8px_#ff5c7c]" style={{ background: CORAL }} aria-hidden />
                    {t("motif.sweepStatus")}
                  </p>
                  <p className="display-x mt-4 max-w-[13ch] text-[clamp(2.2rem,5vw,3.75rem)] text-white">
                    <WithDot text={t("motif.sweepPoster")} />
                  </p>
                </div>
              </Board>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("motif.dotTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("motif.dotBody")}</p>
              </div>
              <ul className={cn(CARD, "grid gap-8 p-6 sm:grid-cols-3 sm:gap-6 sm:p-8 lg:col-span-7")}>
                <li className="flex flex-col justify-between gap-5">
                  <div className="flex min-h-16 items-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface-sunken px-3 py-1.5 text-sm text-text">
                      <span className="size-2 shrink-0 rounded-full bg-[var(--signal)] shadow-[0_0_8px_var(--signal)]" aria-hidden />
                      {t("motif.dotPill")}
                    </span>
                  </div>
                  <p className="text-xs text-tertiary rtl:text-[13px]">{t("motif.dots.status")}</p>
                </li>
                <li className="flex flex-col justify-between gap-5">
                  <div className="flex min-h-16 items-center">
                    <EstimateLine rtl={rtl} />
                  </div>
                  <p className="text-xs text-tertiary rtl:text-[13px]">{t("motif.dots.estimate")}</p>
                </li>
                <li className="flex flex-col justify-between gap-5">
                  <div className="flex min-h-16 items-center">
                    <p className="display-x text-[2.5rem] text-text">
                      <WithDot text={t("ui.hero.verdict")} />
                    </p>
                  </div>
                  <p className="text-xs text-tertiary rtl:text-[13px]">{t("motif.dots.stop")}</p>
                </li>
              </ul>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("motif.signTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("motif.signBody")}</p>
              </div>
              <div className="hero-card hero-sign rounded-[28px] p-7 pb-32 [--sign-inset:20px] [--sign-size:96px] sm:p-9 sm:[--sign-inset:28px] sm:[--sign-size:132px] lg:col-span-7">
                <p className="text-sm text-hero-secondary">{t("motif.sign.eyebrow")}</p>
                <p className="display-x mt-3 max-w-[14ch] text-[2.25rem] sm:text-[2.75rem]">{t("motif.sign.title")}</p>
                <p className="mt-4 max-w-[22rem] text-[15px] leading-relaxed text-hero-secondary">{t("motif.sign.body")}</p>
              </div>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("motif.bandsTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("motif.bandsBody")}</p>
                <ul className="mt-6 flex flex-wrap gap-2 text-sm text-secondary">
                  <li className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 shadow-card">
                    <span className="band-gold h-2.5 w-6 rounded-full" aria-hidden />
                    {t("motif.legend.band")}
                  </li>
                  <li className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 shadow-card">
                    <span className="size-3 rounded-full bg-text ring-2 ring-surface" aria-hidden />
                    {t("motif.legend.dot")}
                  </li>
                  <li className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 shadow-card">
                    <span className="h-4 w-0.5 rounded-full bg-accent" aria-hidden />
                    {t("motif.legend.tick")}
                  </li>
                </ul>
              </div>
              <ol className={cn(CARD, "flex flex-col gap-7 p-6 sm:p-9 lg:col-span-7")}>
                {(
                  [
                    ["early", 1.8, 4.4, 3.2],
                    ["mid", 2.9, 4.2, 3.6],
                    ["late", 3.5, 4.05, 3.8],
                  ] as const
                ).map(([k, lo, hi, est]) => (
                  <li key={k}>
                    <p className="mb-2.5 text-sm text-secondary">{t(`motif.states.${k}`)}</p>
                    <div dir="ltr">
                      <RangeScale low={lo} high={hi} estimate={est} expected={4} size="lg" labels={["1", "5"]} />
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("motif.chartTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("motif.chartBody")}</p>
              </div>
              <figure role="img" aria-label={tf("label")} className={cn(CARD, "p-5 sm:p-7 lg:col-span-7")}>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2" aria-hidden>
                  <p className="text-sm font-semibold sm:text-[15px]">{tf("skill")}</p>
                  <p className="inline-flex items-center gap-2 rounded-full bg-surface-sunken px-3 py-1 text-xs font-medium text-secondary rtl:text-[13px]">
                    <span className="size-2 rounded-full bg-[var(--signal)]" />
                    {tf("narrowing")}
                  </p>
                </div>
                <div className="mt-4">
                  <NarrowingChart rtl={rtl} id="bb" labels={{ start: tf("start"), scene: (v) => tf("scene", { n: v }), low: tf("low"), high: tf("high") }} />
                </div>
              </figure>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("motif.evidenceTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("motif.evidenceBody")}</p>
              </div>
              <blockquote className={cn(CARD, "p-6 text-lg leading-[1.8] text-text sm:p-8 lg:col-span-7")}>
                {q[0]}
                {t("motif.evidenceSample")} <mark className="evidence-mark">{t("motif.evidenceMark")}</mark>
                {q[1]}
              </blockquote>
            </div>
            <p className="mt-14 max-w-3xl rounded-[18px] bg-accent-subtle p-5 text-lg leading-relaxed text-text sm:p-6">{t("motif.rule")}</p>
          </Section>

          {/* 10 Interface */}
          <Section id="ui" n={9} title={t("ui.title")} lede={t("ui.lede")}>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("ui.heroTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("ui.heroBody")}</p>
              </div>
              <div className="hero-card rounded-[28px] p-7 sm:p-9 lg:col-span-7">
                <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs text-hero-foreground">{t("ui.hero.eyebrow")}</p>
                <p className="display-x mt-4 text-[2.75rem] sm:text-[3.5rem] rtl:text-[2.75rem]">{t("ui.hero.verdict")}</p>
                <p className="mt-3 max-w-[24rem] text-[15px] leading-relaxed text-hero-secondary">{t("ui.hero.body")}</p>
                <ul className="mt-8 flex flex-col gap-4">
                  {(t.raw("ui.hero.skills") as [string, string][]).map(([skill, level], i) => (
                    <li key={skill} className="hero-tile grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 text-sm sm:grid-cols-[9rem_minmax(0,1fr)_6rem]">
                      <span>{skill}</span>
                      <div dir="ltr" className="order-last col-span-2 sm:order-none sm:col-span-1">
                        <RangeScale low={[3.6, 2.9, 3.7][i]!} high={[4.2, 3.6, 4.3][i]!} estimate={[3.9, 3.3, 4][i]!} tone="ink" size="sm" />
                      </div>
                      <span className="text-end text-hero-secondary">{level}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("ui.tilesTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("ui.tilesBody")}</p>
              </div>
              <ul className="grid grid-cols-2 gap-4 lg:col-span-7">
                {(["blue", "violet", "teal", "coral"] as const).map((k) => {
                  const value = <p className="font-display text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] tabular">{t(`ui.tiles.${k}.value`)}</p>;
                  const label = <p className="text-sm font-semibold leading-snug">{t(`ui.tiles.${k}.label`)}</p>;
                  return (
                    <li key={k} className={cn(`tile-${k}`, "flex min-h-36 flex-col justify-between gap-4 p-5")}>
                      {/* White on every tile: each tile token passes AA at its lightest stop (tests/unit/contrast.test.ts). */}
                      {value}
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-16 grid gap-4 lg:grid-cols-12">
              <div className={cn(CARD, "p-6 sm:p-8 lg:col-span-7")}>
                <h3 className="r-label text-tertiary">{t("ui.buttonsTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{t("ui.buttonsBody")}</p>
                <ul className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-6">
                  {(["primary", "signal", "secondary", "ghost", "link"] as const).map((v) => (
                    <li key={v} className="flex flex-col items-start gap-2">
                      <Button variant={v} size={v === "link" ? "md" : "lg"}>
                        {t(`ui.buttons.${v}`)}
                      </Button>
                      <span className="text-xs text-tertiary">{t(`ui.variants.${v}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn(CARD, "p-6 sm:p-8 lg:col-span-5")}>
                <h3 className="r-label text-tertiary">{t("ui.badgesTitle")}</h3>
                <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3.5">
                  {(["neutral", "accent", "success", "warning", "critical", "info"] as const).map((tone) => (
                    <li key={tone} className="flex flex-col items-start gap-1">
                      <Badge tone={tone}>{t(`ui.badges.${tone}`)}</Badge>
                      <span className="font-mono text-[11px] text-tertiary" dir="ltr">
                        {tone}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn(CARD, "p-6 sm:p-8 lg:col-span-12")}>
                <h3 className="r-label text-tertiary">{t("ui.pillsTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{t("ui.pillsBody")}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-5">
                  <div className="flex gap-1 rounded-full bg-surface-sunken p-1" aria-hidden>
                    {(["overview", "skills", "evidence"] as const).map((k, i) => (
                      <span key={k} className={cn("rounded-full px-4 py-2 text-sm font-medium", i === 0 ? "bg-accent text-accent-foreground shadow-[0_8px_18px_-8px_rgb(108_92_231/0.9)]" : "text-secondary")}>
                        {t(`ui.pills.${k}`)}
                      </span>
                    ))}
                  </div>
                  <p className="r-pill r-label" aria-hidden>
                    <span className="r-chip r-index">02</span>
                    {t("ui.pills.section")}
                  </p>
                  <div className="flex gap-2">
                    {(
                      [
                        ["search", Search],
                        ["theme", Moon],
                        ["more", Ellipsis],
                      ] as const
                    ).map(([k, Icon]) => (
                      <Button key={k} variant="secondary" size="icon" className="rounded-full" aria-label={t(`ui.pills.${k}`)}>
                        <Icon aria-hidden />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="r-label text-tertiary">{t("ui.chartsTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("ui.chartsBody")}</p>
              </div>
              <figure className={cn(CARD, "p-5 sm:p-7 lg:col-span-7")}>
                <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <span className="text-sm font-semibold sm:text-[15px]">{t("ui.chart.title")}</span>
                  <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary rtl:text-[13px]">
                    {[0, 2].map((i, s) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full" style={{ background: `var(--chart-${s + 1})` }} aria-hidden />
                        {(t.raw("ui.skills") as [string, string][])[i]![0]}
                      </span>
                    ))}
                  </span>
                </figcaption>
                <AreaDemo rtl={rtl} weeks={[1, 2, 3, 4, 5, 6].map((w) => t("ui.chart.week", { n: w }))} />
              </figure>
            </div>

            <h3 className="r-label mt-16 text-tertiary">{t("ui.reportTitle")}</h3>
            <div className="mt-5 rounded-[28px] bg-surface-sunken p-3 sm:p-5">
              <p className="px-2 pb-3 pt-1 text-xs text-secondary sm:px-1">{t("ui.candidate")}</p>
              <div className="grid gap-3 lg:grid-cols-12">
                <div className={cn(CARD, "rounded-[18px] p-5 sm:p-6 lg:col-span-12")}>
                  <ul className="flex flex-col gap-5">
                    {(t.raw("ui.skills") as [string, string][]).map(([skill, level], i) => (
                      <li key={skill} className="grid items-center gap-x-6 gap-y-2 sm:grid-cols-[16rem_minmax(0,1fr)_6rem]">
                        <span className="text-sm font-medium text-text">{skill}</span>
                        <div dir="ltr">
                          <RangeScale low={[3.6, 2.8, 3.7][i]!} high={[4.2, 3.6, 4.3][i]!} estimate={[3.9, 3.2, 4][i]!} expected={[4, 4, 3][i]!} />
                        </div>
                        <span className="text-sm text-secondary sm:text-end">{level}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={cn(CARD, "rounded-[18px] p-5 sm:p-6 lg:col-span-7")}>
                  <p className="text-xs text-secondary">{t("ui.quoteLabel")}</p>
                  <p className="mt-3 text-[15px] leading-[1.8] text-text">
                    {q[0]}
                    {t("ui.quoteBefore")} <mark className="evidence-mark">{t("ui.quoteMark")}</mark>
                    {q[1]}
                  </p>
                </div>
                <div className={cn(CARD, "flex flex-col justify-between gap-5 rounded-[18px] p-5 sm:p-6 lg:col-span-5")}>
                  <div>
                    <p className="text-xs text-secondary">{t("ui.nextLabel")}</p>
                    <p className="mt-3 text-[15px] text-text">{t("ui.nextBody")}</p>
                  </div>
                  <Button variant="signal" className="self-start rounded-full">
                    {t("ui.nextCta")}
                  </Button>
                </div>
              </div>
            </div>
          </Section>

          {/* 11 Voice */}
          <Section id="voice" n={10} title={t("voice.title")} lede={t("voice.lede")}>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(["plain", "specific", "ranges", "calm", "verbs"] as const).map((k, i) => (
                <li key={k} className={cn(CARD, "p-6")}>
                  <p className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-subtle text-[11px] font-bold text-accent-text tabular">{num(i)}</span>
                    <span className="font-semibold text-text">{t(`voice.principles.${k}.title`)}</span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-secondary">{t(`voice.principles.${k}.body`)}</p>
                </li>
              ))}
            </ol>
            <h3 className="r-label mt-16 text-tertiary">{t("voice.toneTitle")}</h3>
            <ul className="mt-5 grid gap-4 md:grid-cols-3">
              {(["candidates", "teams", "growth"] as const).map((k) => (
                <li key={k} className={cn(CARD, "flex flex-col p-6")}>
                  <p className="font-semibold text-text">{t(`voice.tones.${k}.title`)}</p>
                  <p className="mt-1 text-sm text-secondary">{t(`voice.tones.${k}.body`)}</p>
                  <p className="mt-6 rounded-[18px] bg-surface-sunken p-4 text-[17px] leading-relaxed text-text">{t(`voice.tones.${k}.example`)}</p>
                </li>
              ))}
            </ul>
            <h3 className="r-label mt-16 text-tertiary">{t("voice.examplesTitle")}</h3>
            <div className={cn(CARD, "mt-5 overflow-hidden")}>
              <table className="w-full text-[15px]">
                <thead className="bg-surface-subtle text-xs text-secondary">
                  <tr>
                    <th scope="col" className="w-1/2 px-5 py-3 text-start font-medium sm:px-6">{t("voice.say")}</th>
                    <th scope="col" className="w-1/2 px-5 py-3 text-start font-medium sm:px-6">{t("voice.notThat")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(t.raw("voice.examples") as [string, string][]).map(([yes, no]) => (
                    <tr key={yes} className="border-b border-border align-top last:border-b-0">
                      <td className="px-5 py-4 leading-relaxed text-text sm:px-6">{yes}</td>
                      <td className="px-5 py-4 leading-relaxed text-tertiary line-through decoration-[var(--signal)] decoration-2 sm:px-6">{no}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 12 Downloads */}
          <Section id="downloads" n={11} title={t("downloads.title")} lede={t.rich("downloads.lede", { code: (c) => <code className="whitespace-nowrap font-mono text-[0.85em]" dir="ltr">{c}</code> })}>
            <div className="grid gap-4 lg:grid-cols-3">
              {DOWNLOADS.filter((g) => g.key !== "social").map((group) => (
                <div key={group.key} className={cn(CARD, "min-w-0 p-5")}>
                  <h3 className="r-label text-tertiary">{t(`downloads.groups.${group.key}`)}</h3>
                  <ul className="mt-3">
                    {group.items.map(([k, file, tone]) => {
                      const href = `/brand/${file}`;
                      const name = t(`downloads.items.${k}`);
                      const size = fileSize(href);
                      return (
                        <li key={k}>
                          <a href={href} download aria-label={t("downloads.download", { name })} className="group -mx-2 flex items-center gap-4 rounded-[16px] p-2 transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-focus">
                            <span className={cn("flex h-14 w-24 shrink-0 items-center justify-center rounded-[12px] p-2.5 transition-transform group-hover:scale-[1.03]", BOARD[tone])}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={href} alt="" className="size-full object-contain" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm text-text">{name}</span>
                              <span className="mt-0.5 block truncate font-mono text-[11px] text-tertiary" dir="ltr">
                                {file}
                                {size ? ` · ${size}` : ""}
                              </span>
                            </span>
                            <ArrowDownToLine className="size-4 shrink-0 text-tertiary transition-colors group-hover:text-text" aria-hidden />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <h3 className="r-label mt-14 text-tertiary">{t("downloads.groups.social")}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary">{t("downloads.socialBody")}</p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {DOWNLOADS.find((g) => g.key === "social")!.items.map(([k, file]) => {
                const href = `/brand/${file}`;
                const name = t(`downloads.items.${k}`);
                const size = fileSize(href);
                return (
                  <li key={k}>
                    <a href={href} download aria-label={t("downloads.download", { name })} className={cn(CARD, "group block p-3 focus-visible:outline-2 focus-visible:outline-focus")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={href} alt="" className="aspect-[1200/630] w-full rounded-[18px] object-cover" />
                      <span className="mt-3 flex items-center justify-between gap-3 px-2 pb-1">
                        <span className="min-w-0">
                          <span className="block text-sm text-text group-hover:underline group-hover:underline-offset-4">{name}</span>
                          <span className="mt-0.5 block font-mono text-[11px] text-tertiary" dir="ltr">
                            {file} · 1200 × 630{size ? ` · ${size}` : ""}
                          </span>
                        </span>
                        <ArrowDownToLine className="size-4 shrink-0 text-tertiary transition-colors group-hover:text-text" aria-hidden />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </Section>
        </main>
      </div>

      <footer className="rounded-t-[32px] bg-surface-sunken">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-10 text-sm text-tertiary sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="flex items-center gap-2.5" dir="ltr">
            <LogoTile className="size-8" />
            <Wordmark className="h-[18px] text-text" />
          </span>
          <p>{t("footer.line")}</p>
          <Link href="/" className="rounded-full text-secondary underline-offset-4 hover:text-text hover:underline">
            {t("footer.back")}
          </Link>
        </div>
      </footer>
    </div>
  );
}

const TYPE_SCALE = [
  { key: "display", className: "display-x text-[clamp(2.75rem,6vw,4.5rem)]", en: "Plus Jakarta · 800 · 72/72 · −3%", ar: "Readex Pro · 700 · 72/90" },
  { key: "h1", className: "font-display text-[2.5rem] font-[750] leading-[1.2] tracking-[-0.02em] rtl:tracking-normal", en: "Plus Jakarta · 750 · 40/48 · −2%", ar: "Readex Pro · 700 · 40/53" },
  { key: "h2", className: "font-display text-[2rem] font-[750] leading-[1.2] tracking-[-0.02em] rtl:tracking-normal", en: "Plus Jakarta · 750 · 32/38 · −2%", ar: "Readex Pro · 700 · 32/42" },
  { key: "title", className: "text-xl font-bold tracking-[-0.01em] rtl:tracking-normal", en: "Plus Jakarta · 700 · 20/27", ar: "Readex Pro · 700 · 20/30" },
  { key: "body", className: "text-base", en: "Plus Jakarta · 400 · 16/24", ar: "Readex Pro · 400 · 16/26" },
  { key: "small", className: "text-sm text-secondary", en: "Plus Jakarta · 400 · 14/21", ar: "Readex Pro · 400 · 14/23" },
  { key: "label", className: "r-label text-secondary", en: "Plus Jakarta · 600 · 13", ar: "Readex Pro · 600 · 14" },
] as const;

const DOWNLOADS: { key: "logos" | "marks" | "raster" | "social"; items: [string, string, keyof typeof BOARD][] }[] = [
  {
    key: "logos",
    items: [
      ["logo", "logo.svg", "lavender"],
      ["logoReverse", "logo-reverse.svg", "night"],
      ["logoMono", "logo-mono.svg", "white"],
      ["logoEn", "logo-en.svg", "lavender"],
      ["logoEnReverse", "logo-en-reverse.svg", "night"],
      ["logoAr", "logo-ar.svg", "lavender"],
      ["logoArReverse", "logo-ar-reverse.svg", "night"],
    ],
  },
  {
    key: "marks",
    items: [
      ["mark", "mark.svg", "lavender"],
      ["markReverse", "mark-reverse.svg", "night"],
      ["symbol", "symbol.svg", "white"],
      ["symbolSignal", "symbol-signal.svg", "white"],
      ["wordmark", "wordmark.svg", "white"],
      ["wordmarkAr", "wordmark-ar.svg", "white"],
    ],
  },
  {
    key: "raster",
    items: [
      ["logoPng", "logo.png", "lavender"],
      ["logoReversePng", "logo-reverse.png", "night"],
      ["symbolPng", "symbol-1024.png", "white"],
      ["maskable", "symbol-maskable-512.png", "white"],
      ["email", "logo-email.png", "white"],
    ],
  },
  {
    key: "social",
    items: [
      ["ogEn", "og-en.png", "lavender"],
      ["ogAr", "og-ar.png", "lavender"],
    ],
  },
];

/** The last word keeps the full stop, drawn as the pupil's coral dot. */
function WithDot({ text }: { text: string }) {
  const at = text.lastIndexOf(" ") + 1;
  return (
    <>
      {text.slice(0, at)}
      <span className="whitespace-nowrap">
        {text.slice(at)}
        <span aria-hidden className="ms-[0.06em] inline-block size-[0.2em] rounded-full shadow-[0_0_0.3em_#ff5c7c]" style={{ background: CORAL }} />
      </span>
    </>
  );
}

function Section({ id, n, title, lede, children }: { id: string; n: number; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-8">
      <p aria-hidden className="grid size-10 place-items-center rounded-full bg-accent font-display text-sm font-extrabold text-accent-foreground shadow-[0_10px_22px_-10px_rgb(108_92_231/0.9)] tabular">
        {num(n)}
      </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-12 lg:gap-8">
        <h2 id={`${id}-h`} className="display-x text-[2.25rem] text-text sm:text-[3.25rem] md:text-[4rem] xl:text-[4.75rem] lg:col-span-12 [&:lang(ar)]:text-[2.5rem] sm:[&:lang(ar)]:text-[3.5rem] md:[&:lang(ar)]:text-[4rem] xl:[&:lang(ar)]:text-[4.75rem]">
          {title}
        </h2>
        {lede ? <p className="text-xl leading-snug text-secondary sm:text-2xl lg:col-span-7 lg:col-start-6">{lede}</p> : null}
      </div>
      <div className="mt-12 sm:mt-16">{children}</div>
    </section>
  );
}

function Swatch({ label, tone, children }: { label: string; tone: keyof typeof BOARD; children: ReactNode }) {
  return (
    <li>
      <Board tone={tone} className="flex aspect-square items-center justify-center">
        {children}
      </Board>
      <p className="mt-2.5 px-1 text-sm text-secondary">{label}</p>
    </li>
  );
}

function Lockup({ name, body, tone, className, boardClass, children }: { name: string; body: string; tone: keyof typeof BOARD; className?: string; boardClass?: string; children: ReactNode }) {
  return (
    <li className={cn("flex flex-col", className)}>
      <Board tone={tone} className={cn("flex min-h-48 items-center justify-center p-8", boardClass)}>
        {children}
      </Board>
      <div className="mt-3 flex flex-col gap-1 px-1">
        <p className="text-sm font-medium text-text">{name}</p>
        <p className="text-sm leading-relaxed text-secondary">{body}</p>
      </div>
    </li>
  );
}

function Dont({ label, tone = "lavender", children }: { label: string; tone?: keyof typeof BOARD; children: ReactNode }) {
  return (
    <li className="flex flex-col">
      <Board tone={tone} className="flex aspect-[4/3] items-center justify-center p-4">
        {children}
        <span className="absolute end-3 top-3 grid size-7 place-items-center rounded-full bg-[#1b1840] text-white shadow-[0_6px_14px_-6px_rgb(27_24_64/0.6)]" aria-hidden>
          <X className="size-3.5" strokeWidth={3} />
        </span>
      </Board>
      <p className="mt-2.5 px-1 text-sm leading-snug text-secondary">{label}</p>
    </li>
  );
}

/** A core colour: the swatch with its partner text and their contrast, then its role and values in both themes. */
function ColourCard({ hex, alt, fg, name, role, labels, lightGround, className }: { hex: string; alt: string | null; fg: string; name: string; role: string; labels: { dark: string; light: string; text: string; levels: Record<"aaa" | "aa" | "large" | "fail", string> }; lightGround: boolean; className?: string }) {
  const r = ratio(fg, hex);
  const g = grade(r);
  return (
    <li className={cn(CARD, "flex flex-col overflow-hidden", className)}>
      <div className={cn("relative flex min-h-36 flex-1 items-end justify-between gap-4 p-5", lightGround ? "shadow-[inset_0_0_0_1px_#e1ddf5]" : "")} style={{ background: hex, color: fg }}>
        <span className="font-display text-[2.5rem] font-extrabold leading-none tracking-[-0.03em]" aria-hidden>
          Aa
        </span>
        {alt ? <span className="size-10 shrink-0 rounded-full ring-2 ring-white/70" style={{ background: alt }} title={`${labels.light} ${alt.toUpperCase()}`} aria-hidden /> : null}
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div>
          <p className="text-lg font-bold text-text">{name}</p>
          <p className="mt-1 text-sm leading-relaxed text-secondary">{role}</p>
        </div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-xs">
          <dt className="text-tertiary">{alt || !lightGround ? labels.dark : labels.light}</dt>
          <dd className="font-mono text-text" dir="ltr">
            {hex.toUpperCase()} <span className="text-tertiary">· RGB {rgb(hex)}</span>
          </dd>
          {alt ? (
            <>
              <dt className="text-tertiary">{labels.light}</dt>
              <dd className="font-mono text-text" dir="ltr">
                {alt.toUpperCase()} <span className="text-tertiary">· RGB {rgb(alt)}</span>
              </dd>
            </>
          ) : null}
          <dt className="text-tertiary">{labels.text}</dt>
          <dd className="flex items-center gap-2 text-text">
            <span className="tabular" dir="ltr">{r.toFixed(1)}:1</span>
            <GradeBadge g={g} label={labels.levels[g]} />
          </dd>
        </dl>
      </div>
    </li>
  );
}

function GradeBadge({ g, label }: { g: "aaa" | "aa" | "large" | "fail"; label: string }) {
  return <span className={cn("rounded-full px-1.5 py-px text-[10px] font-semibold", g === "fail" ? "text-tertiary" : g === "large" ? "bg-surface-sunken text-secondary" : "bg-accent text-accent-foreground")}>{label}</span>;
}

function ContrastMatrix({ fgs, bgs, t, className }: { fgs: [string, string][]; bgs: [string, string][]; t: { fg: string; bg: string; levels: Record<"aaa" | "aa" | "large" | "fail", string> }; className?: string }) {
  return (
    <div className={cn(CARD, "overflow-x-auto p-4 sm:p-5", className)}>
      <table className="w-full min-w-[36rem] border-separate border-spacing-x-1.5 border-spacing-y-0 text-xs">
        <thead>
          <tr>
            <th scope="col" className="pb-2 text-start font-normal text-tertiary">
              {t.fg} ╲ {t.bg}
            </th>
            {bgs.map(([name, hex]) => (
              <th key={hex} scope="col" className="pb-2 text-start font-medium text-secondary">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fgs.map(([name, fg]) => (
            <tr key={fg}>
              <th scope="row" className="py-1.5 pe-2 text-start font-medium text-secondary">
                {name}
              </th>
              {bgs.map(([, bg]) => {
                if (fg === bg) return <td key={bg} className="py-1.5" />;
                const r = ratio(fg, bg);
                const g = grade(r);
                return (
                  <td key={bg} className="py-1.5 align-top">
                    <span className={cn("flex h-14 items-center justify-center rounded-[12px]", (bg === WHITE || bg.toLowerCase() === "#efedfb") && "ring-1 ring-inset ring-[#e1ddf5]")} style={{ background: bg }}>
                      <WordmarkShape fill={fg} className="h-auto w-[68%]" />
                    </span>
                    <span className="mt-1.5 flex items-center justify-between gap-1">
                      <span className="tabular text-text">{r.toFixed(1)}</span>
                      <GradeBadge g={g} label={t.levels[g]} />
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Specimen({ name, role, spec, className, children }: { name: string; role: string; spec: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn(CARD, "flex flex-col justify-between gap-10 p-6 sm:p-9", className)}>
      <div>{children}</div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-[14px] bg-surface-subtle px-4 py-3 text-sm">
        <p>
          <span className="font-semibold">{name}</span>
          <span className="text-secondary"> · {role}</span>
        </p>
        <p className="text-xs text-secondary" dir="ltr">
          {spec}
        </p>
      </div>
    </div>
  );
}

function Rules({ title, rules }: { title: string; rules: string[] }) {
  return (
    <div>
      <h3 className="r-label text-tertiary">{title}</h3>
      <ol className={cn(CARD, "mt-5 px-5 sm:px-6")}>
        {rules.map((r, i) => (
          <li key={r} className="flex gap-4 border-b border-border py-4 leading-relaxed text-text last:border-b-0">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-subtle text-[11px] font-bold text-accent-text tabular">{num(i)}</span>
            <span>{r}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* Small chart drawings in the page's tokens. Time runs with the reading direction. */
const CW = 560;
const CH = 200;
const cx = (i: number, count: number, rtl: boolean) => {
  const x = 30 + (i / (count - 1)) * (CW - 50);
  return rtl ? CW - x : x;
};
const cy = (level: number) => 180 - ((level - 1) / 4) * 168;

/** Two series over six weeks: glowing lines over gradient areas, a dashed grid, no axis lines. */
function AreaDemo({ rtl, weeks }: { rtl: boolean; weeks: string[] }) {
  const series = [
    [2.6, 2.9, 3.1, 3.4, 3.6, 3.9],
    [2.2, 2.4, 2.8, 2.9, 3.3, 3.4],
  ];
  return (
    <div aria-hidden className="mt-5">
      <div className="relative">
        <svg viewBox={`0 0 ${CW} ${CH}`} className="block h-auto w-full overflow-visible">
          <defs>
            {series.map((_, s) => (
              <linearGradient key={s} id={`bb-area-${s}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`var(--chart-${s + 1})`} stopOpacity={0.42} />
                <stop offset="100%" stopColor={`var(--chart-${s + 1})`} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {[1, 2, 3, 4, 5].map((l) => (
            <line key={l} x1={cx(0, 2, rtl)} x2={cx(1, 2, rtl)} y1={cy(l)} y2={cy(l)} stroke="var(--chart-grid)" strokeDasharray="4 6" />
          ))}
          {series.map((vals, s) => {
            const pts = vals.map((v, i) => [cx(i, vals.length, rtl), cy(v)] as [number, number]);
            const line = curve(pts);
            const area = `${line} L${pts[pts.length - 1]![0]},${cy(1)} L${pts[0]![0]},${cy(1)} Z`;
            return (
              <g key={s}>
                <path d={area} fill={`url(#bb-area-${s})`} />
                <path d={line} fill="none" stroke={`var(--chart-${s + 1})`} strokeWidth={2.5} strokeLinecap="round" style={{ filter: `drop-shadow(0 6px 10px var(--chart-${s + 1}))` }} />
                {pts.map(([x, y]) => (
                  <circle key={x} cx={x} cy={y} r={3.5} fill={`var(--chart-${s + 1})`} />
                ))}
              </g>
            );
          })}
        </svg>
        {[1, 3, 5].map((l) => (
          <span key={l} className="absolute start-0 -translate-y-1/2 text-[11px] leading-none text-tertiary tabular" style={{ top: `${(cy(l) / CH) * 100}%` }}>
            {l}
          </span>
        ))}
      </div>
      <div className="mt-2 flex justify-between ps-3 text-[11px] text-tertiary rtl:text-xs">
        {weeks.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
    </div>
  );
}

/** The coral dot where a chart lands: a short violet line ending in the estimate. */
function EstimateLine({ rtl }: { rtl: boolean }) {
  const W = 140;
  const vals = [2.3, 2.9, 2.8, 3.4, 3.8];
  const pts = vals.map((v, i) => [rtl ? W - (8 + i * 30) : 8 + i * 30, 52 - (v - 1) * 12] as [number, number]);
  const end = pts[pts.length - 1]!;
  return (
    <svg viewBox={`0 0 ${W} 56`} className="block h-14 w-auto max-w-full overflow-visible" aria-hidden>
      <path d={curve(pts)} fill="none" stroke="var(--chart-1)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={end[0]} cy={end[1]} r={6.5} fill="var(--signal)" stroke="var(--surface)" strokeWidth={2.5} style={{ filter: "drop-shadow(0 0 6px var(--signal))" }} />
    </svg>
  );
}

/** Glow belongs to data: a line with a soft glow and a halo on the estimate. */
function GlowLine({ rtl }: { rtl: boolean }) {
  const vals = [2.4, 2.9, 2.7, 3.3, 3.5, 3.9];
  const pts = vals.map((v, i) => [cx(i, vals.length, rtl), cy(v)] as [number, number]);
  const end = pts[pts.length - 1]!;
  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="block h-auto w-full overflow-visible" aria-hidden>
      <defs>
        <filter id="bb-glow" x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <path d={curve(pts)} fill="none" stroke="var(--chart-1)" strokeWidth={8} opacity={0.6} filter="url(#bb-glow)" />
      <path d={curve(pts)} fill="none" stroke="var(--chart-1)" strokeWidth={3} strokeLinecap="round" />
      <circle className="r-halo" cx={end[0]} cy={end[1]} r={9} fill="var(--signal)" />
      <circle cx={end[0]} cy={end[1]} r={8} fill="var(--signal)" stroke="var(--surface)" strokeWidth={3} style={{ filter: "drop-shadow(0 0 8px var(--signal))" }} />
    </svg>
  );
}
