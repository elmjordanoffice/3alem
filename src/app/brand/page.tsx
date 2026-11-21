import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { statSync } from "node:fs";
import path from "node:path";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowDownToLine, ArrowRight, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { MARK } from "@/components/brand/wordmark-paths";
import { RangeScale } from "@/components/report/range-scale";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contrastRatio } from "@/lib/contrast";
import { cn } from "@/lib/utils";
import { BONE, ClearSpace, CoverMark, INK, Mark, MarkConstruction, NarrowingFigure, SIGNAL, WordmarkGuides, WordmarkShape } from "./figures";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("brandbook");
  return { title: t("title"), description: t("metaDescription") };
}

const SECTIONS = ["idea", "mark", "lockups", "space", "misuse", "colour", "type", "motif", "ui", "voice", "downloads"] as const;
const num = (i: number) => String(i + 1).padStart(2, "0");

/* Brand faces, named directly so a Latin word inside Arabic text keeps Archivo (and the reverse). */
const ARCHIVO: CSSProperties = { fontFamily: '"Archivo Variable", sans-serif', fontStretch: "125%" };
const BEIRUTI: CSSProperties = { fontFamily: '"Beiruti Variable", sans-serif' };
const PLEX: CSSProperties = { fontFamily: '"IBM Plex Sans Variable", sans-serif' };
const PLEX_AR: CSSProperties = { fontFamily: '"IBM Plex Sans Arabic", sans-serif' };

const STONE = { s700: "#4f4b45", s600: "#67635b", s500: "#8a857c", s300: "#cdc8bd", s200: "#e2ded5" } as const;
const EVIDENCE = "#ffd6c9";
const WHITE = "#ffffff";

/** Artboards: fixed brand colours that never follow the theme, like a printed page. */
const BOARD = {
  white: "bg-white text-[#141414] ring-1 ring-inset ring-[#e2ded5]",
  bone: "bg-[#f2f0eb] text-[#141414] ring-1 ring-inset ring-[#e2ded5]",
  ink: "bg-[#141414] text-[#f2f0eb] dark:ring-1 dark:ring-inset dark:ring-white/10",
  signal: "bg-[#f04a23] text-[#141414]",
} as const;

function Board({ tone = "white", className, children }: { tone?: keyof typeof BOARD; className?: string; children: ReactNode }) {
  return <div className={cn("relative overflow-hidden rounded-[20px]", BOARD[tone], className)}>{children}</div>;
}

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

/** The brand book: the Range brand, built from the product's own components, in both languages. */
export default async function BrandPage() {
  const t = await getTranslations("brandbook");
  const locale = await getLocale();
  const rtl = locale === "ar";
  const on = { bone: t("colour.swatches.bone.name"), ink: t("colour.swatches.ink.name") };
  const q = rtl ? ["«", "»"] : ["“", "”"];
  const names = [
    <span key="en" lang="en" dir="ltr" style={ARCHIVO} className="font-extrabold uppercase leading-[0.84] tracking-[-0.01em]">
      Range
    </span>,
    <span key="ar" lang="ar" dir="rtl" style={BEIRUTI} className="font-black leading-[0.95]">
      النطاق
    </span>,
  ];

  return (
    <div className="min-h-dvh bg-background text-text">
      <header>
        <div className="border-b border-border">
          <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-8">
            <Link href="/" aria-label={t("topbar.home")} className="rounded-control focus-visible:outline-2 focus-visible:outline-focus">
              <Logo className="text-[15px] sm:text-[16px]" />
            </Link>
            <div className="flex items-center gap-1 sm:gap-3">
              <span className="eyebrow hidden text-tertiary sm:inline">
                {t("topbar.label")} · <span className="tabular">{t("topbar.version")}</span>
              </span>
              <LanguageToggle />
              <ThemeMenu />
            </div>
          </div>
        </div>

        {/* Cover */}
        <div className="mx-auto max-w-[1360px] px-4 pt-12 sm:px-8 sm:pt-20">
          <p className="eyebrow text-tertiary">{t("cover.eyebrow")}</p>
          <h1 className="mt-6 flex flex-col items-start gap-y-3 text-[clamp(3.5rem,19vw,5rem)] sm:flex-row sm:items-center sm:gap-x-[0.16em] sm:text-[clamp(4rem,11vw,10.25rem)]" style={{ lineHeight: 1 }}>
            {rtl ? names[1] : names[0]}
            <span aria-hidden className="hidden size-[0.17em] shrink-0 rounded-full bg-[var(--signal)] sm:inline-block" />
            {rtl ? names[0] : names[1]}
          </h1>
          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-8">
            <p className="text-[1.3rem] leading-snug text-text sm:text-[1.625rem] lg:col-span-7">{t("cover.statement")}</p>
            <nav aria-label={t("cover.contents")} className="lg:col-span-4 lg:col-start-9">
              <h2 className="eyebrow text-tertiary">{t("cover.contents")}</h2>
              <ol className="mt-4 grid grid-cols-2 gap-x-6 border-t border-border sm:grid-cols-3 lg:grid-cols-2">
                {SECTIONS.map((s, i) => (
                  <li key={s} className="border-b border-border">
                    <a href={`#${s}`} className="flex items-baseline gap-3 py-2.5 text-sm text-secondary transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-focus">
                      <span className="tabular text-xs text-tertiary">{num(i)}</span>
                      {t(`nav.${s}`)}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm sm:max-w-2xl">
            {(["version", "updated", "scope"] as const).map((k) => (
              <div key={k}>
                <dt className="text-xs text-tertiary">{t(`cover.meta.${k}`)}</dt>
                <dd className="mt-1 text-text tabular">{t(`cover.meta.${k}Value`)}</dd>
              </div>
            ))}
          </dl>
          <Board tone="ink" className="mt-12 grid items-center gap-6 p-6 sm:mt-16 sm:p-10 lg:grid-cols-12 lg:gap-8 lg:p-14">
            <div className="mx-auto w-full max-w-[22rem] lg:col-span-5 lg:max-w-none">
              <CoverMark />
            </div>
            <div className="flex flex-col gap-8 lg:col-span-7 lg:ps-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-reverse.svg" alt="" className="h-7 w-auto self-start sm:h-9" />
              <p className="display-x text-[clamp(2.3rem,6vw,5.25rem)]">
                <WithDot text={t("cover.poster")} />
              </p>
            </div>
          </Board>
        </div>
      </header>

      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-14">
        <nav aria-label={t("navLabel")} className="hidden lg:block">
          <ol className="sticky top-8 mt-24 flex flex-col text-sm">
            {SECTIONS.map((s, i) => (
              <li key={s}>
                <a href={`#${s}`} className="flex items-baseline gap-3 rounded-control py-1.5 text-secondary transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-focus">
                  <span className="tabular text-xs text-tertiary">{num(i)}</span>
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
                <Board tone="white" className="grid items-center gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_9rem] sm:gap-8 sm:p-9">
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
                  <div className="flex items-center gap-4 border-t border-[#e2ded5] pt-5 sm:flex-col sm:items-start sm:border-s sm:border-t-0 sm:ps-7 sm:pt-0">
                    <ArrowRight className="size-5 shrink-0 text-[#67635b] flip-rtl sm:hidden" aria-hidden />
                    <Mark className="size-16 shrink-0 sm:size-24" />
                    <p className="text-sm leading-snug text-[#4f4b45]">{t("idea.figure.centred")}</p>
                  </div>
                </Board>
                <figcaption className="mt-3 text-sm text-tertiary">{t("idea.figure.caption")}</figcaption>
              </figure>
            </div>

            <div className="mt-20 grid gap-10 border-t border-border pt-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="eyebrow text-tertiary">{t("idea.nameTitle")}</h3>
                <p lang="ar" dir="rtl" style={BEIRUTI} className="mt-5 w-fit text-[clamp(4rem,9vw,6.5rem)] font-black leading-none text-text">
                  {t("idea.letters")}
                </p>
              </div>
              <div className="lg:col-span-7">
                <dl className="grid grid-cols-2 gap-6">
                  {(["alim", "alam"] as const).map((k) => (
                    <div key={k} className="border-t-2 border-text pt-4">
                      <dt lang="ar" style={BEIRUTI} className="text-[2.5rem] font-black leading-tight text-text">
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

            <div className="mt-20">
              <h3 className="eyebrow text-tertiary">{t("idea.traitsTitle")}</h3>
              <ul className="mt-5 grid border-t border-border sm:grid-cols-3">
                {(["exact", "warm", "honest"] as const).map((k, i) => (
                  <li key={k} className={cn("border-b border-border py-6 sm:border-b-0 sm:py-8", i > 0 && "sm:border-s sm:ps-8", i < 2 && "sm:pe-8")}>
                    <p className="display-x text-[1.75rem] sm:text-[2rem]">{t(`idea.traits.${k}.title`)}</p>
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
                  <MarkConstruction labels={{ units: t("mark.labels.units"), row: t("mark.labels.row"), gap: t("mark.labels.gap"), step: t("mark.labels.step"), dot: t("mark.labels.dot"), radius: t("mark.labels.radius") }} />
                </Board>
                <figcaption className="sr-only">{t("mark.figureLabel")}</figcaption>
              </figure>
              <div className="lg:col-span-5">
                <p className="text-[17px] leading-relaxed text-secondary">{t("mark.body")}</p>
                <dl className="mt-8 border-t border-border">
                  {(["grid", "rows", "bands", "dot", "ends", "legs"] as const).map((k) => (
                    <div key={k} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-border py-3 text-sm">
                      <dt className="text-tertiary">{t(`mark.specs.${k}`)}</dt>
                      <dd className="text-text tabular">{t(`mark.specs.${k}Value`)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div className="mt-16">
              <h3 className="eyebrow text-tertiary">{t("mark.colourTitle")}</h3>
              <p className="mt-3 max-w-2xl leading-relaxed text-secondary">{t("mark.colourBody")}</p>
              <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Swatch label={t("mark.onBone")} tone="bone">
                  <Mark className="size-20 sm:size-24" />
                </Swatch>
                <Swatch label={t("mark.onInk")} tone="ink">
                  <Mark fg={BONE} className="size-20 sm:size-24" />
                </Swatch>
                <Swatch label={t("mark.oneColour")} tone="white">
                  <Mark dot={INK} className="size-20 sm:size-24" />
                </Swatch>
                <Swatch label={t("mark.onSignal")} tone="bone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/symbol-signal.svg" alt="" className="size-20 sm:size-24" />
                </Swatch>
              </ul>
            </div>
          </Section>

          {/* 03 Lockups */}
          <Section id="lockups" n={2} title={t("lockups.title")} lede={t("lockups.lede")}>
            <ul className="grid gap-x-4 gap-y-8 md:grid-cols-6">
              <Lockup className="md:col-span-6" tone="bone" name={t("lockups.items.horizontal.name")} body={t("lockups.items.horizontal.body")} file="logo.svg" height="h-[clamp(2.75rem,7vw,5.5rem)]" boardClass="min-h-56 sm:min-h-80" />
              <Lockup className="md:col-span-3" tone="white" name={t("lockups.items.english.name")} body={t("lockups.items.english.body")} file="logo-en.svg" height="h-12 sm:h-14" />
              <Lockup className="md:col-span-3" tone="white" name={t("lockups.items.arabic.name")} body={t("lockups.items.arabic.body")} file="logo-ar.svg" height="h-14 sm:h-16" />
              <Lockup className="md:col-span-2" tone="white" name={t("lockups.items.mono.name")} body={t("lockups.items.mono.body")} file="logo-mono.svg" height="h-9" />
              <Lockup className="md:col-span-2" tone="ink" name={t("lockups.items.reverse.name")} body={t("lockups.items.reverse.body")} file="logo-reverse.svg" height="h-9" />
              <li className="flex flex-col md:col-span-2">
                <Board tone="bone" className="flex min-h-48 items-end justify-center gap-4 p-8" >
                  {[72, 48, 32, 20].map((s) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={s} src="/brand/symbol.svg" alt="" style={{ width: s, height: s }} />
                  ))}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/symbol-signal.svg" alt="" style={{ width: 48, height: 48 }} />
                </Board>
                <LockupCaption name={t("lockups.items.tile.name")} body={t("lockups.items.tile.body")} file="symbol.svg" />
              </li>
            </ul>
            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h3 className="eyebrow text-tertiary">{t("lockups.wordmarkTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("lockups.wordmarkBody")}</p>
              </div>
              <Board tone="white" className="p-5 sm:p-10 lg:col-span-8">
                <WordmarkGuides labels={{ cap: t("lockups.guides.cap"), baseline: t("lockups.guides.baseline"), rise: t("lockups.guides.rise") }} />
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
                <h3 className="eyebrow text-tertiary">{t("space.clearTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("space.clearBody")}</p>
              </div>
            </div>
            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="eyebrow text-tertiary">{t("space.minTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("space.minBody")}</p>
                <p className="mt-3 text-sm text-tertiary">{t("space.print")}</p>
              </div>
              <ul className="grid grid-cols-2 overflow-hidden rounded-[20px] bg-white ring-1 ring-inset ring-[#e2ded5] sm:grid-cols-4 lg:col-span-7">
                {(
                  [
                    ["mark", 16, <Mark key="m" style={{ width: 16, height: 16 }} />],
                    ["tile", 20, <img key="t" src="/brand/symbol.svg" alt="" style={{ width: 20, height: 20 }} />], // eslint-disable-line @next/next/no-img-element
                    ["horizontal", 120, <img key="h" src="/brand/logo.svg" alt="" style={{ width: 120 }} />], // eslint-disable-line @next/next/no-img-element
                    ["english", 80, <img key="e" src="/brand/logo-en.svg" alt="" style={{ width: 80 }} />], // eslint-disable-line @next/next/no-img-element
                  ] as const
                ).map(([k, px, el], i) => (
                  <li key={k} className={cn("flex flex-col justify-between gap-6 p-5 text-[#141414]", i % 2 === 1 && "border-s border-[#e2ded5]", i >= 2 && "border-t border-[#e2ded5] sm:border-t-0", i === 2 && "sm:border-s")}>
                    <div className="flex h-12 items-end">{el}</div>
                    <div>
                      <p className="text-sm font-medium">{t(`space.sizes.${k}`)}</p>
                      <p className="mt-0.5 text-xs text-[#4f4b45] tabular">{t("space.px", { value: px })}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* 05 Misuse */}
          <Section id="misuse" n={4} title={t("misuse.title")} lede={t("misuse.lede")}>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
              <Dont label={t("misuse.items.recolour")}>
                <span className="flex items-center gap-2">
                  <Mark fg="#2d5bd7" dot="#1f9d55" className="size-8 sm:size-10" />
                  <WordmarkShape fill="#2d5bd7" className="h-4 w-auto sm:h-5" />
                </span>
              </Dont>
              <Dont label={t("misuse.items.stretch")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-en.svg" alt="" className="h-6 w-auto sm:h-9 scale-x-[1.25] scale-y-[0.7] sm:scale-x-[1.35]" />
              </Dont>
              <Dont label={t("misuse.items.rotate")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-en.svg" alt="" className="h-6 w-auto sm:h-9 -rotate-[14deg]" />
              </Dont>
              <Dont label={t("misuse.items.effects")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-en.svg" alt="" className="h-6 w-auto sm:h-9 [filter:drop-shadow(0_6px_5px_rgb(0_0_0/0.45))_drop-shadow(0_0_14px_rgb(240_74_35/0.9))]" />
              </Dont>
              <Dont label={t("misuse.items.ground")} tone="signal">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-en.svg" alt="" className="h-6 w-auto sm:h-9" />
              </Dont>
              <Dont label={t("misuse.items.retype")}>
                <span className="flex items-center gap-2" dir="ltr">
                  <Mark className="size-8 sm:size-10" />
                  <span className="text-xl italic sm:text-[26px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    Aalim
                  </span>
                </span>
              </Dont>
              <Dont label={t("misuse.items.rearrange")}>
                <span className="flex flex-col items-center gap-1.5" dir="ltr">
                  <WordmarkShape fill={INK} className="h-4 w-auto sm:h-5" />
                  <Mark className="size-7 rotate-180 sm:size-9" />
                </span>
              </Dont>
              <Dont label={t("misuse.items.redraw")}>
                <Mark
                  className="size-10 sm:size-14"
                  bars={MARK.bars.map((b, i) => ({ x: 7 + i * 3, y: b.y, w: 50 - i * 6 }))}
                />
              </Dont>
            </ul>
          </Section>

          {/* 06 Colour */}
          <Section id="colour" n={5} title={t("colour.title")} lede={t("colour.lede")}>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
              <ColourCard className="lg:col-span-5 lg:row-span-2 lg:min-h-[26rem]" hex={INK} fg={BONE} name={t("colour.swatches.ink.name")} role={t("colour.swatches.ink.role")} on={on} />
              <ColourCard className="lg:col-span-4 lg:row-span-2" hex={BONE} fg={INK} name={t("colour.swatches.bone.name")} role={t("colour.swatches.bone.role")} on={on} ring />
              <ColourCard className="lg:col-span-3 lg:row-span-2" hex={SIGNAL} fg={INK} name={t("colour.swatches.signal.name")} role={t("colour.swatches.signal.role")} on={on} />
              <ColourCard className="lg:col-span-6" hex={EVIDENCE} fg={INK} name={t("colour.swatches.evidence.name")} role={t("colour.swatches.evidence.role")} on={on} />
              <ColourCard className="lg:col-span-6" hex={WHITE} fg={INK} name={t("colour.swatches.white.name")} role={t("colour.swatches.white.role")} on={on} ring />
            </ul>

            <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h3 className="eyebrow text-tertiary">{t("colour.stoneTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("colour.stoneBody")}</p>
              </div>
              <ul className="grid grid-cols-5 gap-2 sm:gap-3 lg:col-span-8">
                {(Object.keys(STONE) as (keyof typeof STONE)[]).map((k) => (
                  <li key={k}>
                    <span className="block h-20 rounded-xl sm:h-28" style={{ background: STONE[k] }} />
                    <p className="mt-2 font-mono text-[11px] text-text sm:text-xs" dir="ltr">
                      {STONE[k].toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-tertiary sm:text-xs">{t(`colour.stone.${k}`)}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-14">
              <h3 className="eyebrow text-tertiary">{t("colour.shareTitle")}</h3>
              <div className="mt-4 flex h-14 overflow-hidden rounded-xl ring-1 ring-inset ring-border-strong" aria-hidden>
                {(
                  [
                    [BONE, 62],
                    [WHITE, 18],
                    [INK, 13],
                    [STONE.s300, 5],
                    [SIGNAL, 2],
                  ] as const
                ).map(([c, w]) => (
                  <span key={c} style={{ background: c, width: `${w}%` }} />
                ))}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-secondary">
                {(
                  [
                    ["bone", 62],
                    ["white", 18],
                    ["ink", 13],
                    ["stone", 5],
                    ["signal", 2],
                  ] as const
                ).map(([k, w]) => (
                  <li key={k}>
                    {k === "stone" ? t("colour.stoneTitle") : t(`colour.swatches.${k}.name`)} <span className="tabular text-tertiary">{w}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h3 className="eyebrow text-tertiary">{t("colour.pairsTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("colour.pairsBody")}</p>
                <div className="mt-8 border-s-2 border-[var(--signal)] ps-4">
                  <p className="font-semibold text-text">{t("colour.ruleTitle")}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-secondary">{t("colour.ruleBody", { ratio: ratio(SIGNAL, BONE) })}</p>
                </div>
              </div>
              <ContrastMatrix
                className="min-w-0 lg:col-span-8"
                t={{ fg: t("colour.fg"), bg: t("colour.bg"), levels: { aaa: t("colour.levels.aaa"), aa: t("colour.levels.aa"), large: t("colour.levels.large"), fail: t("colour.levels.fail") } }}
                fgs={[
                  [t("colour.swatches.ink.name"), INK],
                  [t("colour.swatches.bone.name"), BONE],
                  [t("colour.swatches.signal.name"), SIGNAL],
                  [`${t("colour.stoneTitle")} \u2066${STONE.s700.toUpperCase()}\u2069`, STONE.s700],
                  [`${t("colour.stoneTitle")} \u2066${STONE.s600.toUpperCase()}\u2069`, STONE.s600],
                  [`${t("colour.stoneTitle")} \u2066${STONE.s500.toUpperCase()}\u2069`, STONE.s500],
                ]}
                bgs={[
                  [t("colour.swatches.bone.name"), BONE],
                  [t("colour.swatches.white.name"), WHITE],
                  [t("colour.swatches.ink.name"), INK],
                  [t("colour.swatches.signal.name"), SIGNAL],
                  [t("colour.swatches.evidence.name"), EVIDENCE],
                ]}
              />
            </div>
          </Section>

          {/* 07 Typography */}
          <Section id="type" n={6} title={t("type.title")} lede={t("type.lede")}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Specimen name={t("type.archivo.name")} role={t("type.archivo.role")} spec={t("type.archivo.spec")}>
                <p lang="en" dir="ltr" style={ARCHIVO} className="text-start text-[clamp(2.4rem,4.6vw,3.75rem)] font-extrabold uppercase leading-[0.95]">
                  {t("type.archivo.sample")}
                </p>
                <p lang="en" dir="ltr" style={ARCHIVO} className="mt-8 text-start text-base font-extrabold uppercase leading-relaxed tracking-[0.02em] text-[#4f4b45] sm:text-lg">
                  <span className="block">ABCDEFGHIJKLM</span>
                  <span className="block">NOPQRSTUVWXYZ</span>
                  <span className="block tabular">0123456789</span>
                </p>
              </Specimen>
              <Specimen name={t("type.beiruti.name")} role={t("type.beiruti.role")} spec={t("type.beiruti.spec")}>
                <p lang="ar" dir="rtl" style={BEIRUTI} className="text-start text-[clamp(2.8rem,5.4vw,4.5rem)] font-black leading-[1.15]">
                  {t("type.beiruti.sample")}
                </p>
                <p lang="ar" dir="rtl" style={BEIRUTI} className="mt-6 text-start text-xl font-extrabold leading-relaxed text-[#4f4b45]">
                  <span className="block">ا ب ت ث ج ح خ د ذ ر ز س ش ص</span>
                  <span className="block">ض ط ظ ع غ ف ق ك ل م ن ه و ي</span>
                  <span className="block">٠١٢٣٤٥٦٧٨٩</span>
                </p>
              </Specimen>
              <Specimen className="lg:col-span-2" name={t("type.plex.name")} role={t("type.plex.role")} spec={t("type.plex.spec")}>
                <div className="grid gap-8 md:grid-cols-2">
                  <p lang="en" dir="ltr" style={PLEX} className="text-start text-[19px] leading-[1.5]">
                    {t("type.plex.sampleEn")}
                  </p>
                  <p lang="ar" dir="rtl" style={PLEX_AR} className="text-start text-[19px] leading-[1.65]">
                    {t("type.plex.sampleAr")}
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3 border-t border-[#e2ded5] pt-6">
                  {[400, 500, 600].map((w) => (
                    <p key={w} className="flex items-baseline gap-3 text-3xl" style={{ fontWeight: w }}>
                      <span style={PLEX}>Aa</span>
                      <span style={PLEX_AR}>أب</span>
                      <span className="text-xs font-normal text-[#4f4b45] tabular" style={PLEX}>
                        {w}
                      </span>
                    </p>
                  ))}
                </div>
              </Specimen>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h3 className="eyebrow text-tertiary">{t("type.widthTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("type.widthBody")}</p>
              </div>
              <ol className="border-t border-border lg:col-span-8" dir="ltr">
                {[62, 87.5, 100, 112.5, 125].map((w) => (
                  <li key={w} className="flex items-center justify-between gap-4 border-b border-border py-2">
                    <span lang="en" className={cn("text-[clamp(1.75rem,4vw,3rem)] font-extrabold uppercase leading-none", w === 125 ? "text-text" : "text-tertiary")} style={{ ...ARCHIVO, fontStretch: `${w}%` }}>
                      Range
                    </span>
                    <span className={cn("flex items-center gap-2 text-xs tabular", w === 125 ? "font-semibold text-text" : "text-tertiary")}>
                      {w === 125 ? <span className="size-2 rounded-full bg-[var(--signal)]" aria-hidden /> : null}
                      {w}%
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-16">
              <h3 className="eyebrow text-tertiary">{t("type.scaleTitle")}</h3>
              <ol className="mt-5 border-t border-border">
                {TYPE_SCALE.map((row) => (
                  <li key={row.key} className="grid gap-2 border-b border-border py-5 sm:grid-cols-[9rem_minmax(0,1fr)_14rem] sm:items-baseline sm:gap-6">
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

          {/* 08 The narrowing */}
          <Section id="motif" n={7} title={t("motif.title")} lede={t("motif.lede")}>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="eyebrow text-tertiary">{t("motif.bandsTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("motif.bandsBody")}</p>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-secondary">
                  <li className="flex items-center gap-2">
                    <span className="band-gold h-2.5 w-6 rounded-full" aria-hidden />
                    {t("motif.legend.band")}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-text" aria-hidden />
                    {t("motif.legend.dot")}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-0.5 rounded-full bg-accent" aria-hidden />
                    {t("motif.legend.tick")}
                  </li>
                </ul>
              </div>
              <ol className="flex flex-col gap-7 rounded-[20px] bg-surface p-6 shadow-card sm:p-9 lg:col-span-7">
                {(
                  [
                    ["early", 1.8, 4.4, 3.2],
                    ["mid", 2.9, 4.2, 3.6],
                    ["late", 3.5, 4.05, 3.8],
                  ] as const
                ).map(([k, lo, hi, est]) => (
                  <li key={k}>
                    <p className="mb-2.5 text-sm text-secondary">{t(`motif.states.${k}`)}</p>
                    <RangeScale low={lo} high={hi} estimate={est} expected={4} size="lg" labels={["1", "5"]} />
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h3 className="eyebrow text-tertiary">{t("motif.heroTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("motif.heroBody")}</p>
              </div>
              <figure className="lg:col-span-7">
                <div className="hero-card rounded-[28px] p-7 sm:p-9">
                  <p className="eyebrow text-hero-secondary">{t("motif.hero.eyebrow")}</p>
                  <p className="display-x mt-3 text-[2.75rem] sm:text-[3.5rem]">{t("motif.hero.verdict")}</p>
                  <p className="mt-12 max-w-[22rem] text-[15px] leading-relaxed text-hero-secondary sm:mt-3">{t("motif.hero.body")}</p>
                  <ul className="mt-8 flex flex-col gap-4">
                    {(t.raw("motif.hero.skills") as [string, string][]).map(([skill, level], i) => (
                      <li key={skill} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 text-sm sm:grid-cols-[9rem_minmax(0,1fr)_6rem]">
                        <span>{skill}</span>
                        <RangeScale className="order-last col-span-2 sm:order-none sm:col-span-1" low={[3.6, 2.9, 3.7][i]!} high={[4.2, 3.6, 4.3][i]!} estimate={[3.9, 3.3, 4][i]!} tone="ink" size="sm" />
                        <span className="text-end text-hero-secondary">{level}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <figcaption className="mt-3 flex items-center gap-2 text-sm text-tertiary">
                  <Mark fg={STONE.s300} className="size-4" />
                  {t("motif.cornerLabel")}
                </figcaption>
              </figure>
            </div>

            <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:gap-8">
              <div>
                <h3 className="eyebrow text-tertiary">{t("motif.openerTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("motif.openerBody")}</p>
                <div className="mt-8 rounded-[20px] bg-surface p-6 shadow-card">
                  <div className="rule-signal" aria-hidden />
                  <p className="display-x mt-4 text-2xl">{t("ui.title")}</p>
                </div>
              </div>
              <div>
                <h3 className="eyebrow text-tertiary">{t("motif.evidenceTitle")}</h3>
                <p className="mt-3 leading-relaxed text-secondary">{t("motif.evidenceBody")}</p>
                <blockquote className="mt-8 rounded-[20px] bg-surface p-6 text-lg leading-[1.8] text-text shadow-card">
                  {q[0]}{t("motif.evidenceSample")} <mark className="evidence-mark">{t("motif.evidenceMark")}</mark>{q[1]}
                </blockquote>
              </div>
            </div>
            <p className="mt-14 max-w-3xl border-s-2 border-text ps-4 text-lg leading-relaxed text-text">{t("motif.rule")}</p>
          </Section>

          {/* 09 Interface */}
          <Section id="ui" n={8} title={t("ui.title")} lede={t("ui.lede")}>
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="rounded-[20px] bg-surface p-6 shadow-card sm:p-8 lg:col-span-7">
                <h3 className="eyebrow text-tertiary">{t("ui.buttonsTitle")}</h3>
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
              <div className="rounded-[20px] bg-surface p-6 shadow-card sm:p-8 lg:col-span-5">
                <h3 className="eyebrow text-tertiary">{t("ui.badgesTitle")}</h3>
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
            </div>

            <h3 className="eyebrow mt-14 text-tertiary">{t("ui.reportTitle")}</h3>
            <div className="mt-5 rounded-[24px] bg-surface-sunken p-3 sm:p-5">
              <p className="px-2 pb-3 pt-1 text-xs text-secondary sm:px-1">{t("ui.candidate")}</p>
              <div className="grid gap-3 lg:grid-cols-12">
                <div className="rounded-[18px] bg-surface p-5 shadow-card sm:p-6 lg:col-span-12">
                  <ul className="flex flex-col gap-5">
                    {(t.raw("ui.skills") as [string, string][]).map(([skill, level], i) => (
                      <li key={skill} className="grid items-center gap-x-6 gap-y-2 sm:grid-cols-[16rem_minmax(0,1fr)_6rem]">
                        <span className="text-sm font-medium text-text">{skill}</span>
                        <RangeScale low={[3.6, 2.8, 3.7][i]!} high={[4.2, 3.6, 4.3][i]!} estimate={[3.9, 3.2, 4][i]!} expected={[4, 4, 3][i]!} />
                        <span className="text-sm text-secondary sm:text-end">{level}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[18px] bg-surface p-5 shadow-card sm:p-6 lg:col-span-7">
                  <p className="text-xs text-secondary">{t("ui.quoteLabel")}</p>
                  <p className="mt-3 text-[15px] leading-[1.8] text-text">
                    {q[0]}{t("ui.quoteBefore")} <mark className="evidence-mark">{t("ui.quoteMark")}</mark>{q[1]}
                  </p>
                </div>
                <div className="flex flex-col justify-between gap-5 rounded-[18px] bg-surface p-5 shadow-card sm:p-6 lg:col-span-5">
                  <div>
                    <p className="text-xs text-secondary">{t("ui.nextLabel")}</p>
                    <p className="mt-3 text-[15px] text-text">{t("ui.nextBody")}</p>
                  </div>
                  <Button variant="signal" className="self-start">
                    {t("ui.nextCta")}
                  </Button>
                </div>
              </div>
            </div>
          </Section>

          {/* 10 Voice */}
          <Section id="voice" n={9} title={t("voice.title")} lede={t("voice.lede")}>
            <ol className="grid gap-x-8 border-t border-border sm:grid-cols-2 lg:grid-cols-3">
              {(["plain", "specific", "ranges", "calm", "verbs"] as const).map((k, i) => (
                <li key={k} className="border-b border-border py-6">
                  <p className="flex items-baseline gap-3">
                    <span className="tabular text-xs text-tertiary">{num(i)}</span>
                    <span className="font-semibold text-text">{t(`voice.principles.${k}.title`)}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-secondary">{t(`voice.principles.${k}.body`)}</p>
                </li>
              ))}
            </ol>
            <h3 className="eyebrow mt-16 text-tertiary">{t("voice.toneTitle")}</h3>
            <ul className="mt-5 grid gap-4 md:grid-cols-3">
              {(["candidates", "teams", "growth"] as const).map((k) => (
                <li key={k} className="flex flex-col rounded-[20px] bg-surface p-6 shadow-card">
                  <p className="font-semibold text-text">{t(`voice.tones.${k}.title`)}</p>
                  <p className="mt-1 text-sm text-secondary">{t(`voice.tones.${k}.body`)}</p>
                  <p className="mt-6 border-s-2 border-[var(--signal)] ps-3 text-[17px] leading-relaxed text-text">{t(`voice.tones.${k}.example`)}</p>
                </li>
              ))}
            </ul>
            <h3 className="eyebrow mt-16 text-tertiary">{t("voice.examplesTitle")}</h3>
            <div className="mt-5 overflow-hidden rounded-[20px] bg-surface shadow-card">
              <table className="w-full text-[15px]">
                <thead className="text-xs text-secondary">
                  <tr className="border-b border-border">
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

          {/* 11 Downloads */}
          <Section id="downloads" n={10} title={t("downloads.title")} lede={t.rich("downloads.lede", { code: (c) => <code className="whitespace-nowrap font-mono text-[0.85em]" dir="ltr">{c}</code> })}>
            <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
              {DOWNLOADS.filter((g) => g.key !== "social").map((group) => (
                <div key={group.key} className="min-w-0">
                  <h3 className="eyebrow text-tertiary">{t(`downloads.groups.${group.key}`)}</h3>
                  <ul className="mt-5 border-t border-border">
                    {group.items.map(([k, file, tone]) => {
                      const href = `/brand/${file}`;
                      const name = t(`downloads.items.${k}`);
                      const size = fileSize(href);
                      return (
                        <li key={k} className="border-b border-border">
                          <a href={href} download aria-label={t("downloads.download", { name })} className="group flex items-center gap-4 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-focus">
                            <span className={cn("grid h-14 w-24 shrink-0 place-items-center rounded-lg p-2.5 transition-transform group-hover:scale-[1.03]", BOARD[tone])}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={href} alt="" className="size-full object-contain" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm text-text group-hover:underline group-hover:underline-offset-4">{name}</span>
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
            <h3 className="eyebrow mt-14 text-tertiary">{t("downloads.groups.social")}</h3>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {DOWNLOADS.find((g) => g.key === "social")!.items.map(([k, file]) => {
                const href = `/brand/${file}`;
                const name = t(`downloads.items.${k}`);
                const size = fileSize(href);
                return (
                  <li key={k}>
                    <a href={href} download aria-label={t("downloads.download", { name })} className="group block focus-visible:outline-2 focus-visible:outline-focus">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={href} alt="" className="aspect-[1200/630] w-full rounded-[18px] object-cover ring-1 ring-inset ring-border" />
                      <span className="mt-3 flex items-center justify-between gap-3">
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

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-10 text-sm text-tertiary sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Logo className="text-[15px]" />
          <p>{t("footer.line")}</p>
          <Link href="/" className="text-secondary underline-offset-4 hover:text-text hover:underline">
            {t("footer.back")}
          </Link>
        </div>
      </footer>
    </div>
  );
}

const TYPE_SCALE = [
  { key: "display", className: "display-x text-[clamp(2.75rem,6vw,4.5rem)]", en: "Archivo 125% · 800 · 72/70 · caps", ar: "Beiruti · 800 · 72/90" },
  { key: "h1", className: "font-display text-[2.5rem] font-bold leading-[1.2] [font-stretch:112%]", en: "Archivo 112% · 700 · 40/48", ar: "Beiruti · 700 · 40/53" },
  { key: "h2", className: "font-display text-[2rem] font-bold leading-[1.2] [font-stretch:112%]", en: "Archivo 112% · 700 · 32/38", ar: "Beiruti · 700 · 32/42" },
  { key: "title", className: "text-xl font-semibold", en: "Plex · 600 · 20/27", ar: "Plex Arabic · 600 · 20/30" },
  { key: "body", className: "text-base", en: "Plex · 400 · 16/24", ar: "Plex Arabic · 400 · 16/26" },
  { key: "small", className: "text-sm text-secondary", en: "Plex · 400 · 14/21", ar: "Plex Arabic · 400 · 14/23" },
  { key: "label", className: "eyebrow text-secondary", en: "Archivo 125% · 700 · 11 · +14% · caps", ar: "Beiruti · 700 · 14" },
] as const;

const DOWNLOADS: { key: "logos" | "marks" | "raster" | "social"; items: [string, string, keyof typeof BOARD][] }[] = [
  {
    key: "logos",
    items: [
      ["logo", "logo.svg", "bone"],
      ["logoReverse", "logo-reverse.svg", "ink"],
      ["logoMono", "logo-mono.svg", "white"],
      ["logoEn", "logo-en.svg", "bone"],
      ["logoEnReverse", "logo-en-reverse.svg", "ink"],
      ["logoAr", "logo-ar.svg", "bone"],
      ["logoArReverse", "logo-ar-reverse.svg", "ink"],
    ],
  },
  {
    key: "marks",
    items: [
      ["mark", "mark.svg", "bone"],
      ["markReverse", "mark-reverse.svg", "ink"],
      ["symbol", "symbol.svg", "white"],
      ["symbolSignal", "symbol-signal.svg", "white"],
      ["wordmark", "wordmark.svg", "white"],
      ["wordmarkAr", "wordmark-ar.svg", "white"],
    ],
  },
  {
    key: "raster",
    items: [
      ["logoPng", "logo.png", "bone"],
      ["logoReversePng", "logo-reverse.png", "ink"],
      ["symbolPng", "symbol-1024.png", "white"],
      ["email", "logo-email.png", "white"],
    ],
  },
  {
    key: "social",
    items: [
      ["ogEn", "og-en.png", "bone"],
      ["ogAr", "og-ar.png", "bone"],
    ],
  },
];

/** The last word keeps the full stop, drawn as the mark's vermilion dot. */
function WithDot({ text }: { text: string }) {
  const at = text.lastIndexOf(" ") + 1;
  return (
    <>
      {text.slice(0, at)}
      <span className="whitespace-nowrap">
        {text.slice(at)}
        <span aria-hidden className="ms-[0.06em] inline-block size-[0.2em] rounded-full bg-[#f04a23]" />
      </span>
    </>
  );
}

function Section({ id, n, title, lede, children }: { id: string; n: number; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-8">
      {/* Section opener: a hairline with the vermilion tick at its start. */}
      <div className="relative h-px bg-border" aria-hidden>
        <span className="absolute -top-px start-0 h-[3px] w-10 bg-[var(--signal)]" />
      </div>
      <p className="eyebrow mt-6 tabular text-tertiary">{num(n)}</p>
      <div className="mt-3 grid gap-5 lg:grid-cols-12 lg:gap-8">
        <h2
          id={`${id}-h`}
          className="display-x text-[2.25rem] text-text sm:text-[3.25rem] md:text-[4rem] xl:text-[5rem] lg:col-span-12 [&:lang(ar)]:text-[2.75rem] sm:[&:lang(ar)]:text-[4rem] md:[&:lang(ar)]:text-[4.75rem] xl:[&:lang(ar)]:text-[5.75rem]"
        >
          {title}
        </h2>
        {lede ? <p className="text-xl leading-snug text-text sm:text-2xl lg:col-span-7 lg:col-start-6">{lede}</p> : null}
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
      <p className="mt-2.5 text-sm text-secondary">{label}</p>
    </li>
  );
}

function LockupCaption({ name, body, file }: { name: string; body: string; file: string }) {
  return (
    <div className="mt-3 flex flex-col gap-1">
      <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span className="font-medium text-text">{name}</span>
        <span className="font-mono text-[11px] text-tertiary" dir="ltr">
          {file}
        </span>
      </p>
      <p className="text-sm leading-relaxed text-secondary">{body}</p>
    </div>
  );
}

function Lockup({ name, body, file, tone, height, className, boardClass }: { name: string; body: string; file: string; tone: keyof typeof BOARD; height: string; className?: string; boardClass?: string }) {
  return (
    <li className={cn("flex flex-col", className)}>
      <Board tone={tone} className={cn("flex min-h-48 items-center justify-center p-8", boardClass)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/brand/${file}`} alt="" className={cn("w-auto max-w-full", height)} />
      </Board>
      <LockupCaption name={name} body={body} file={file} />
    </li>
  );
}

function Dont({ label, tone = "bone", children }: { label: string; tone?: keyof typeof BOARD; children: ReactNode }) {
  return (
    <li className="flex flex-col">
      <Board tone={tone} className="flex aspect-[4/3] items-center justify-center p-4">
        {children}
        <span className="absolute end-3 top-3 grid size-6 place-items-center rounded-full bg-[#141414] text-[#f2f0eb]" aria-hidden>
          <X className="size-3.5" strokeWidth={3} />
        </span>
      </Board>
      <p className="mt-2.5 text-sm leading-snug text-secondary">{label}</p>
    </li>
  );
}

function ColourCard({ hex, fg, name, role, on, ring = false, className }: { hex: string; fg: string; name: string; role: string; on: { bone: string; ink: string }; ring?: boolean; className?: string }) {
  const onBone = ratio(hex, BONE);
  const onInk = ratio(hex, INK);
  return (
    <li className={cn("flex min-h-56 flex-col justify-between gap-8 rounded-[20px] p-6", ring ? "ring-1 ring-inset ring-[#e2ded5]" : "dark:ring-1 dark:ring-inset dark:ring-white/10", className)} style={{ background: hex, color: fg }}>
      <div>
        <p className="text-2xl font-semibold">{name}</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed">{role}</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs" dir="ltr">
        <dt className="sr-only">HEX</dt>
        <dd className="col-span-2 text-lg font-semibold tracking-wide">{hex.toUpperCase()}</dd>
        <dt className="sr-only">RGB</dt>
        <dd className="col-span-2">RGB {rgb(hex)}</dd>
        <dt className="sr-only">Contrast</dt>
        <dd className="col-span-2 mt-2 flex gap-4">
          {hex !== BONE ? <span>{onBone.toFixed(1)}:1 · {on.bone}</span> : null}
          {hex !== INK ? <span>{onInk.toFixed(1)}:1 · {on.ink}</span> : null}
        </dd>
      </dl>
    </li>
  );
}

function ContrastMatrix({ fgs, bgs, t, className }: { fgs: [string, string][]; bgs: [string, string][]; t: { fg: string; bg: string; levels: Record<"aaa" | "aa" | "large" | "fail", string> }; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[34rem] border-separate border-spacing-x-1.5 border-spacing-y-0 text-xs">
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
                    <span className={cn("flex h-14 items-center justify-center rounded-lg", (bg === WHITE || bg === BONE) && "ring-1 ring-inset ring-[#e2ded5]")} style={{ background: bg }}>
                      <WordmarkShape fill={fg} className="h-auto w-[68%]" />
                    </span>
                    <span className="mt-1.5 flex items-center justify-between gap-1">
                      <span className="tabular text-text">{r.toFixed(1)}</span>
                      <span className={cn("rounded px-1 py-px text-[10px] font-semibold", g === "fail" ? "text-tertiary" : g === "large" ? "bg-surface-sunken text-secondary" : "bg-text text-background")}>{t.levels[g]}</span>
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
    <Board tone="white" className={cn("flex flex-col justify-between gap-10 p-6 sm:p-9", className)}>
      <div>{children}</div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-[#e2ded5] pt-4 text-sm">
        <p>
          <span className="font-semibold" lang="en">
            {name}
          </span>
          <span className="text-[#4f4b45]"> · {role}</span>
        </p>
        <p className="text-xs text-[#4f4b45]">{spec}</p>
      </div>
    </Board>
  );
}

function Rules({ title, rules }: { title: string; rules: string[] }) {
  return (
    <div>
      <h3 className="eyebrow text-tertiary">{title}</h3>
      <ol className="mt-5 border-t border-border">
        {rules.map((r, i) => (
          <li key={r} className="flex gap-4 border-b border-border py-4 leading-relaxed text-text">
            <span className="tabular w-6 shrink-0 pt-0.5 text-xs text-tertiary">{num(i)}</span>
            <span>{r}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
