import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Download, X } from "lucide-react";
import { Logo, LogoMark, Wordmark } from "@/components/brand/logo";
import { RangeField } from "@/components/brand/range-field";
import { RangeScale } from "@/components/report/range-scale";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("brandbook");
  return { title: t("title"), description: t("metaDescription") };
}

const SECTIONS = ["story", "platform", "voice", "logo", "colour", "type", "signatures", "imagery", "downloads"] as const;

const SWATCHES = [
  { key: "ink", hex: "#17184A", dark: "#15163A", className: "bg-ink text-ink-foreground", share: 25 },
  { key: "indigo", hex: "#3B3FD8", dark: "#5B5FEF", className: "bg-accent text-accent-foreground", share: 5 },
  { key: "saffron", hex: "#F2B532", dark: "#F2B532", className: "bg-saffron text-[#1c1917]", share: 3 },
  { key: "stone", hex: "#FAFAF9", dark: "#0F0E0D", className: "bg-background text-text ring-1 ring-inset ring-border", share: 67 },
] as const;

/** The brand book: built from the product's own components and tokens, in both languages. */
export default async function BrandPage() {
  const t = await getTranslations("brandbook");
  const values = ["evidence", "certainty", "people", "fair", "bilingual"] as const;
  const traits = ["rigorous", "warm", "direct", "confident", "modern"] as const;
  const examples = t.raw("voice.examples") as [string, string][];

  return (
    <div className="min-h-dvh">
      <header className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="rounded-control text-ink-foreground focus-visible:outline-2 focus-visible:outline-focus">
            <span className="inline-flex items-center gap-2.5 text-[19px]">
              <LogoMark className="[&>rect:first-child]:fill-ink-raised" />
              <Wordmark />
            </span>
          </Link>
          <div className="flex items-center gap-1 [&_button]:text-ink-foreground [&_button:hover]:bg-ink-raised">
            <LanguageToggle />
            <ThemeMenu />
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:pb-28 lg:pt-16">
          <div className="animate-rise">
            <p className="text-sm text-ink-secondary">{t("hero.kicker")}</p>
            <h1 className="mt-4 text-[3rem] font-semibold leading-[1] sm:text-[4.5rem]">{t("hero.tagline")}</h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-secondary">{t("hero.intro")}</p>
          </div>
          <RangeField className="w-full max-w-md justify-self-end opacity-95" />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[11rem_minmax(0,1fr)] lg:py-24">
        <nav aria-label={t("hero.kicker")} className="hidden lg:block">
          <ul className="sticky top-10 flex flex-col gap-0.5 text-sm">
            {SECTIONS.map((s) => (
              <li key={s}>
                <a href={`#${s}`} className="block rounded-control px-2.5 py-1.5 text-secondary hover:bg-surface-subtle hover:text-text">{t(`nav.${s}`)}</a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex min-w-0 flex-col gap-28">
          {/* Story */}
          <Section id="story" title={t("story.title")}>
            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
              <div>
                <p className="font-display text-[5.5rem] font-semibold leading-none text-text" lang="ar" dir="rtl">{t("story.letters")}</p>
                <dl className="mt-8 grid grid-cols-2 gap-6">
                  <div className="border-t border-border pt-4">
                    <dt className="font-display text-2xl font-semibold text-text">{t("story.alimLabel")}</dt>
                    <dd className="mt-1 text-sm text-secondary">{t("story.alimMeaning")}</dd>
                  </div>
                  <div className="border-t border-border pt-4">
                    <dt className="font-display text-2xl font-semibold text-text">{t("story.alamLabel")}</dt>
                    <dd className="mt-1 text-sm text-secondary">{t("story.alamMeaning")}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col gap-4 text-lg leading-relaxed text-text">
                <p>{t("story.body1")}</p>
                <p>{t("story.body2")}</p>
                <p className="text-sm text-tertiary">{t("story.usage")}</p>
              </div>
            </div>
          </Section>

          {/* Platform */}
          <Section id="platform" title={t("platform.title")}>
            <figure className="rounded-[20px] bg-ink p-8 text-ink-foreground sm:p-12">
              <p className="text-sm text-ink-secondary">{t("platform.positioningLabel")}</p>
              <blockquote className="mt-3 max-w-3xl font-display text-2xl font-medium leading-snug sm:text-[1.75rem]">{t("platform.positioning")}</blockquote>
              <div className="mt-10 border-t border-ink-foreground/15 pt-6">
                <p className="text-sm text-ink-secondary">{t("platform.promiseLabel")}</p>
                <p className="mt-2 font-display text-4xl font-semibold text-saffron sm:text-5xl">{t("platform.promise")}</p>
              </div>
            </figure>
            <h3 className="mt-14 text-xl font-semibold text-text">{t("platform.valuesTitle")}</h3>
            <ul className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((v) => (
                <li key={v} className="border-t-2 border-ink pt-4 dark:border-ink-foreground/40">
                  <p className="font-semibold text-text">{t(`platform.values.${v}.title`)}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-secondary">{t(`platform.values.${v}.body`)}</p>
                </li>
              ))}
            </ul>
            <h3 className="mt-14 text-xl font-semibold text-text">{t("platform.personalityTitle")}</h3>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {traits.map((k) => {
                const [yes, no] = t.raw(`platform.traits.${k}`) as [string, string];
                return (
                  <li key={k} className="flex items-baseline gap-3 py-4">
                    <span className="font-display text-2xl font-semibold text-text">{yes}</span>
                    <span className="text-secondary">{t("platform.weAreNot")}</span>
                    <span className="text-lg text-tertiary line-through decoration-saffron decoration-2">{no}</span>
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Voice */}
          <Section id="voice" title={t("voice.title")}>
            <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {(["plain", "specific", "ranges", "calm", "verbs"] as const).map((k) => (
                <li key={k}>
                  <p className="font-semibold text-text">{t(`voice.principles.${k}.title`)}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-secondary">{t(`voice.principles.${k}.body`)}</p>
                </li>
              ))}
            </ul>
            <h3 className="mt-14 text-xl font-semibold text-text">{t("voice.toneTitle")}</h3>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {(["candidates", "teams", "growth"] as const).map((k) => (
                <li key={k} className="flex flex-col rounded-card border border-border bg-surface p-5">
                  <p className="font-semibold text-text">{t(`voice.tones.${k}.title`)}</p>
                  <p className="mt-1 text-sm text-secondary">{t(`voice.tones.${k}.body`)}</p>
                  <p className="mt-5 border-s-2 border-saffron ps-3 text-[15px] leading-relaxed text-text">{t(`voice.tones.${k}.example`)}</p>
                </li>
              ))}
            </ul>
            <h3 className="mt-14 text-xl font-semibold text-text">{t("voice.examplesTitle")}</h3>
            <div className="mt-6 overflow-hidden rounded-card border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-subtle text-start text-xs text-secondary">
                  <tr>
                    <th scope="col" className="w-1/2 px-5 py-3 text-start font-medium">{t("voice.say")}</th>
                    <th scope="col" className="w-1/2 px-5 py-3 text-start font-medium">{t("voice.notThat")}</th>
                  </tr>
                </thead>
                <tbody className="bg-surface">
                  {examples.map(([yes, no]) => (
                    <tr key={yes} className="border-t border-border align-top">
                      <td className="px-5 py-4 text-text">{yes}</td>
                      <td className="px-5 py-4 text-tertiary line-through decoration-border-strong">{no}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Logo */}
          <Section id="logo" title={t("logo.title")}>
            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
              <SymbolAnatomy labels={{ scale: t("logo.anatomy.scale"), band: t("logo.anatomy.band"), estimate: t("logo.anatomy.estimate") }} />
              <div>
                <h3 className="text-xl font-semibold text-text">{t("logo.symbolTitle")}</h3>
                <p className="mt-2 leading-relaxed text-secondary">{t("logo.symbolBody")}</p>
                <h3 className="mt-8 text-xl font-semibold text-text">{t("logo.wordmarkTitle")}</h3>
                <p className="mt-2 leading-relaxed text-secondary">{t("logo.wordmarkBody")}</p>
              </div>
            </div>
            <h3 className="mt-14 text-xl font-semibold text-text">{t("logo.lockupsTitle")}</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Tile label={t("logo.lockups.primary")} className="sm:col-span-2"><Logo className="text-[44px] [&>svg:first-child]:size-14" /></Tile>
              <Tile label={t("logo.lockups.english")}><Logo showArabic={false} className="text-[32px] [&>svg:first-child]:size-10" /></Tile>
              <Tile label={t("logo.lockups.arabic")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-ar.svg" alt="" className="h-12 w-auto dark:hidden" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-ar-reverse.svg" alt="" className="hidden h-12 w-auto dark:block" />
              </Tile>
              <Tile label={t("logo.lockups.reverse")} ink className="sm:col-span-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-reverse.svg" alt="" className="h-14 w-auto" />
              </Tile>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold text-text">{t("logo.rulesTitle")}</h3>
                <ul className="mt-3 flex flex-col gap-2 text-secondary">
                  <li>{t("logo.clearSpace")}</li>
                  <li>{t("logo.minSize")}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text">{t("logo.dontsTitle")}</h3>
                <ul className="mt-4 grid grid-cols-2 gap-3">
                  <Dont label={t("logo.donts.recolour")}><span style={{ "--saffron": "#16a34a" } as React.CSSProperties}><Logo showArabic={false} /></span></Dont>
                  <Dont label={t("logo.donts.stretch")}><span className="inline-block origin-center scale-x-[1.6] scale-y-[0.8]"><Logo showArabic={false} /></span></Dont>
                  <Dont label={t("logo.donts.busy")} className="bg-saffron"><Logo showArabic={false} /></Dont>
                  <Dont label={t("logo.donts.redraw")}><span className="inline-flex items-center gap-2"><LogoMark /><span style={{ fontFamily: "Georgia, serif" }} className="text-xl italic text-text">Aalim</span></span></Dont>
                </ul>
              </div>
            </div>
          </Section>

          {/* Colour */}
          <Section id="colour" title={t("colour.title")} intro={t("colour.body")}>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SWATCHES.map((s) => (
                <li key={s.key} className="overflow-hidden rounded-card border border-border bg-surface">
                  <div className={cn("flex h-36 items-end p-4", s.className)}>
                    <span className="font-display text-xl font-semibold">{t(`colour.swatches.${s.key}.name`)}</span>
                  </div>
                  <div className="p-4">
                    <p className="font-mono text-xs text-secondary" dir="ltr">{s.hex} <span className="text-tertiary">/ {s.dark}</span></p>
                    <p className="mt-2 text-sm leading-relaxed text-secondary">{t(`colour.swatches.${s.key}.role`)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-secondary">{t("colour.ratio")}</p>
            <div className="mt-3 flex h-4 overflow-hidden rounded-full ring-1 ring-border" aria-hidden>
              {[...SWATCHES].sort((a, b) => b.share - a.share).map((s) => (
                <span key={s.key} className={cn(s.key === "stone" ? "bg-surface-sunken" : s.className, "ring-0")} style={{ width: `${s.share}%` }} />
              ))}
            </div>
            <div className="mt-10">
              <p className="font-semibold text-text">{t("colour.swatches.levels.name")}</p>
              <p className="mt-1 text-sm text-secondary">{t("colour.swatches.levels.role")}</p>
              <div className="mt-4 flex h-12 gap-1">
                {[1, 2, 3, 4, 5].map((l) => (
                  <span key={l} className={cn("flex flex-1 items-end rounded-control p-2 text-xs font-medium tabular", `bg-level-${l}`, l >= 4 ? "text-[var(--level-4-fg)]" : "text-[var(--level-1-fg)]")}>{l}</span>
                ))}
              </div>
            </div>
            <p className="mt-6 text-sm text-tertiary">{t("colour.darkNote")}</p>
          </Section>

          {/* Type */}
          <Section id="type" title={t("type.title")}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-card border border-border bg-surface p-6">
                <p className="text-sm text-secondary">{t("type.displayTitle")}</p>
                <p className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-text">Aa عع</p>
                <p className="mt-4 font-display text-2xl font-semibold text-text">{t("type.sampleDisplay")}</p>
                <p className="mt-3 text-sm leading-relaxed text-secondary">{t("type.displayBody")}</p>
              </div>
              <div className="rounded-card border border-border bg-surface p-6">
                <p className="text-sm text-secondary">{t("type.textTitle")}</p>
                <p className="mt-4 text-5xl font-medium leading-[1.05] text-text">Aa عع</p>
                <p className="mt-4 text-lg leading-relaxed text-text">{t("type.sampleText")}</p>
                <p className="mt-3 text-sm leading-relaxed text-secondary">{t("type.textBody")}</p>
              </div>
            </div>
            <ol className="mt-8 flex flex-col divide-y divide-border border-y border-border">
              {[
                ["4.5rem", "font-display font-semibold", "72"],
                ["2.75rem", "font-display font-semibold", "44"],
                ["2rem", "font-display font-semibold", "32"],
                ["1.25rem", "font-semibold", "20"],
                ["1rem", "", "16"],
                ["0.875rem", "text-secondary", "14"],
              ].map(([size, cls, px]) => (
                <li key={px} className="flex items-baseline gap-6 py-3">
                  <span className="w-10 shrink-0 text-xs text-tertiary tabular">{px}</span>
                  <span className={cn("truncate leading-tight text-text", cls)} style={{ fontSize: size }}>{t("type.sampleDisplay")}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm leading-relaxed text-secondary">{t("type.rules")}</p>
          </Section>

          {/* Signatures */}
          <Section id="signatures" title={t("signatures.title")}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[20px] bg-ink p-7 text-ink-foreground">
                <h3 className="text-xl font-semibold">{t("signatures.rangeTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{t("signatures.rangeBody")}</p>
                <RangeScale low={3.4} high={4.1} estimate={3.8} expected={4} tone="ink" size="lg" animate className="mt-8" labels={["1", "5"]} />
              </div>
              <div className="rounded-[20px] border border-border bg-surface p-7">
                <h3 className="text-xl font-semibold text-text">{t("signatures.evidenceTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{t("signatures.evidenceBody")}</p>
                <p className="mt-6 text-lg leading-[1.75] text-text">
                  {t("signatures.evidenceSample")} <mark className="evidence-mark">{t("signatures.evidenceMark")}</mark>
                </p>
              </div>
              <div className="grid items-center gap-6 rounded-[20px] bg-ink p-7 text-ink-foreground lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div>
                  <h3 className="text-xl font-semibold">{t("signatures.fieldTitle")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{t("signatures.fieldBody")}</p>
                </div>
                <RangeField height={300} rows={7} className="w-full" />
              </div>
            </div>
          </Section>

          {/* Imagery, icons, motion */}
          <Section id="imagery" title={t("imagery.title")}>
            <div className="grid gap-8 md:grid-cols-3">
              {(["imagery", "icons", "motion"] as const).map((k) => (
                <div key={k} className="border-t-2 border-ink pt-4 dark:border-ink-foreground/40">
                  <p className="font-semibold text-text">{t(`imagery.${k}Title`)}</p>
                  <p className="mt-2 text-sm leading-relaxed text-secondary">{t(`imagery.${k}Body`)}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Downloads */}
          <Section id="downloads" title={t("downloads.title")} intro={t("downloads.body")}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {([
                ["logo", "/brand/logo.svg", false],
                ["logoReverse", "/brand/logo-reverse.svg", true],
                ["logoEn", "/brand/logo-en.svg", false],
                ["logoAr", "/brand/logo-ar.svg", false],
                ["symbol", "/brand/symbol.svg", false],
                ["wordmark", "/brand/wordmark.svg", false],
                ["wordmarkAr", "/brand/wordmark-ar.svg", false],
                ["field", "/brand/range-field.svg", true],
                ["og", "/brand/og-en.png", true],
                ["ogAr", "/brand/og-ar.png", true],
              ] as const).map(([k, href, ink]) => (
                <li key={k}>
                  <a href={href} download className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-focus">
                    <span className={cn("flex h-28 items-center justify-center p-5", ink ? "bg-ink" : "bg-white")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={href} alt="" className={cn("max-h-full max-w-full object-contain", k === "symbol" && "size-16")} />
                    </span>
                    <span className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className="text-text">{t(`downloads.items.${k}`)}</span>
                      <span className="flex items-center gap-1.5 text-xs text-tertiary" dir="ltr">
                        {href.split(".").pop()?.toUpperCase()}
                        <Download className="size-3.5" aria-hidden />
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        </main>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-8 text-sm text-tertiary sm:px-6">
          <Logo />
          <p>{t("hero.tagline")}</p>
        </div>
      </footer>
    </div>
  );
}

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-10">
      <h2 id={`${id}-h`} className="text-[2rem] font-semibold leading-tight text-text sm:text-[2.5rem]">{title}</h2>
      {intro ? <p className="mt-3 max-w-2xl text-lg leading-relaxed text-secondary">{intro}</p> : null}
      <div className="mt-10">{children}</div>
    </section>
  );
}

function Tile({ label, ink = false, className, children }: { label: string; ink?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <figure className={cn("flex flex-col overflow-hidden rounded-card border border-border", className)}>
      <div className={cn("flex min-h-40 items-center justify-center p-8", ink ? "bg-ink" : "bg-white dark:bg-surface")}>{children}</div>
      <figcaption className="border-t border-border bg-surface px-4 py-2.5 text-xs text-secondary">{label}</figcaption>
    </figure>
  );
}

function Dont({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-card border border-border">
      <div className={cn("relative flex h-24 items-center justify-center bg-white dark:bg-surface", className)}>
        {children}
        <span className="absolute end-2 top-2 inline-flex size-5 items-center justify-center rounded-full bg-critical text-white" aria-hidden>
          <X className="size-3" strokeWidth={3} />
        </span>
      </div>
      <p className="border-t border-border bg-surface px-3 py-2 text-xs text-secondary">{label}</p>
    </li>
  );
}

/** The symbol drawn large with its three parts named. */
function SymbolAnatomy({ labels }: { labels: { scale: string; band: string; estimate: string } }) {
  return (
    <figure className="relative mx-auto w-full max-w-sm">
      <svg viewBox="0 0 32 32" className="w-full" aria-hidden>
        <rect width="32" height="32" rx="9" fill="var(--ink)" />
        <rect x="5" y="15.2" width="22" height="1.6" rx="0.8" fill="var(--ink-foreground)" opacity="0.38" />
        <rect x="11.5" y="12.4" width="13" height="7.2" rx="3.6" fill="var(--saffron)" />
        <circle cx="18.6" cy="16" r="1.9" fill="var(--ink)" />
        <g stroke="var(--ink-foreground)" strokeWidth="0.15" opacity="0.7">
          <line x1="6.5" y1="16.8" x2="6.5" y2="24.5" />
          <line x1="12.5" y1="12.4" x2="12.5" y2="7" />
          <line x1="18.6" y1="17.9" x2="18.6" y2="24.5" />
        </g>
      </svg>
      <figcaption className="pointer-events-none absolute inset-0 text-[11px] text-ink-foreground sm:text-xs" dir="ltr">
        <span className="absolute start-[13%] top-[78%]">{labels.scale}</span>
        <span className="absolute start-[33%] top-[14%]">{labels.band}</span>
        <span className="absolute start-[52%] top-[78%]">{labels.estimate}</span>
      </figcaption>
    </figure>
  );
}
