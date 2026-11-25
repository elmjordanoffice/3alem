# Aalim brand: Range, in Night

The live, bilingual brand book is at **/brand** in the app (`src/app/brand/`). It is built from the product's own components, tokens and logo geometry, so it can't drift. This file is the written summary.

## The idea

**Every answer narrows the range.** An assessment starts out knowing almost nothing: the person could be anywhere on the scale. Each answer is evidence, and each piece of evidence rules something out, until what is left is an estimate we can stand behind, with the person's own words underneath it.

Range draws exactly that: wide bands of uncertainty below, narrower above, and one coral point at the top, the estimate. Centred, the bands stack into an A, for Aalim. Arabic name of the brand: **النطاق**.

Three words: **exact** (measured, aligned; every line means something), **warm** (soft light, rounded shapes, a friendly voice) and **honest about certainty** (ranges, not verdicts).

The mark and the idea are unchanged. Since D-061 the product wears them in **Night**: a deep indigo canvas lit by violet, blue and teal, from the owner's reference.

## Name

In Arabic, the same four letters (ع ا ل م) spell **ʿālim**, someone who knows a subject deeply, and **ʿālam**, a world. Aalim builds a world for each person (a realistic week at a fictional company) and finds out what they know in it.

Write **Aalim** in English text and **عالِم** in Arabic. The capitals **AALIM** belong to the wordmark.

## The mark

Four rows on a 64-unit square:

| Part | Measure |
|---|---|
| Rows | 11 units tall, 3.5 apart |
| Bands | 58, 42, 26 wide, centred: each steps in 8 units a side |
| Dot | ⌀ 11, the step after 26: a band too narrow to be a band |
| Ends | Fully round (r 5.5) |
| Legs of the A | The tangent through the band ends meets just above the dot |

The bands take the opposite of the ground (indigo on light, white on dark). The dot is coral, always, except in one-colour reproduction, where it joins the bands. The geometry lives in one place, `scripts/brand-assets.mts` (`MARK`), which also writes `src/components/brand/wordmark-paths.ts` for the in-app `<Logo>`.

## Wordmark and lockups

- **AALIM** in Archivo Expanded ExtraBold, tracked open a little. **عالم** in Beiruti Black, never tracked; its alif rises 18% above the Latin capitals so both read at the same size. Baselines align, separated by a hairline at 22% ink. Both are outlined with HarfBuzz from the static fonts in `brand/fonts/`, so the Arabic joins exactly as a browser would shape it and no font is needed to open a file.
- **Lockups:** horizontal bilingual (primary), English, Arabic, one colour, reversed on indigo, and the app tile (the mark at 70% in white on the blue gradient square, 22.5% corner radius). A coral tile (indigo bands, white dot) is for marketing only.
- **Clear space:** x on every side, where x is the cap height of AALIM; around the mark alone, half its width.
- **Minimum sizes:** mark 16 px, app tile 20 px, horizontal lockup 120 px wide, English lockup 80 px wide. In print: lockup 30 mm, mark 5 mm.
- **Don't:** recolour the bands or the dot, stretch, rotate, add effects to the mark itself (the app tile's gradient and a soft glow behind it are the only exceptions), put it on coral or a busy picture, retype the wordmark, rearrange the parts, or redraw the bands.

## Colour: Night

Dark indigo is the default theme; the light theme is the same system on lavender and white. Every value is a token in `src/styles/tokens.css` (both themes) and every text pairing is checked for WCAG AA in `tests/unit/contrast.test.ts`.

| Name | Dark | Light | Role |
|---|---|---|---|
| Canvas | `#1B1840` | `#EFEDFB` | The page, lit by two soft radial washes (violet top left, blue bottom right) |
| Surface | `#26224F` | `#FFFFFF` | Cards, lifted by shadow and light, not hairlines |
| Text | `#FFFFFF` · `#BDB8E3` · `#A09BCB` | `#1B1840` · `#4A4575` · `#5F5A8C` | Primary, secondary, tertiary |
| Violet (accent) | `#6C5CE7` (text `#B3A8FF`) | `#5847D6` (text `#4636C2`) | Actions, the current selection, the raised highlight card |
| Coral (signal) | `#FF5C7C` | `#D6345D` | The estimate dot, range bands, the one call to action that matters most |
| Blue | `#3A63D8` (tiles `#2547C2` → `#172C80`) | `#2851D6` | Data: stat tiles, chart lines; a deep blue that sits with the indigo |
| Teal | `#25C6B6` (text `#5FE0D2`) | `#12A597` (text `#0A7A6F`) | Data: stat tiles, chart lines, progress |
| Levels | `#36306E` → `#D9D3FF` | `#E6E3F8` → `#2B2273` | One violet ramp for skill levels; never red and green |

**Light and depth.** Cards are rounded (24 px) and float on soft shadows. One raised violet card per screen (`.hero-card`, a violet gradient with a glow) holds what to look at first. Stat tiles (`.tile-blue`, `.tile-teal`, `.tile-violet`, `.tile-coral`) are bold gradients with a faint wave of light; their colours are tokens (`--tile-*`) chosen so white labels pass AA at the lightest stop. Charts are glowing gradient areas and lines in violet, blue, teal and coral.

**The coral rule:** coral marks the estimate and, at most, one call to action per screen. It is never decoration.

## Type

- **Plus Jakarta Sans** for Latin and **Readex Pro** for Arabic, everywhere (variable fonts, loaded with `@fontsource-variable`).
- Titles are bold to extra-bold (700–800) in sentence case with slightly tight tracking (−0.02 em); no all-capitals display type. Labels are 500–600.
- Reading text is 400, 15–16 px and up.
- Scale: page title 36–44, section title 20, card title 17, body 15–16, small 13–14, label 11–12 (14 in Arabic).
- The logo's wordmark keeps its own outlined letterforms (Archivo Expanded and Beiruti); they are drawings, not live type.

Rules for Arabic:

1. Arabic is never letter-spaced: tracking breaks the joins. Negative title tracking applies to Latin only.
2. Give it room: line height 1.65 for reading and about 1.3 for display.
3. Set Arabic display a step larger than the Latin beside it (in the logo, عالم rises 18% above the capitals).
4. Use the fonts' own weights; never stretch, slant or fake bold Arabic.
5. Mirror the layout, not the content: direction, alignment and range bands flip; logos, numbers, links and code don't.
6. Latin digits by default; Arabic-Indic digits are a personal setting. Use Arabic punctuation: ، ؛ ؟

## The narrowing motif

- **Range bands** (`src/components/report/range-scale.tsx`): every estimate is a coral band on the 1–5 scale, wide while the evidence is thin and narrow once it settles; the dot is the estimate and the tick is the level the role expects.
- **The highlight card** (`.hero-card`): one raised violet card per screen, holding its verdict or its one next step.
- **The evidence highlight** (`.evidence-mark`): a soft violet highlighter under a person's own words, used for verbatim quotes only. Evidence cards carry a violet-to-teal edge.
- **Glow, used for meaning:** the weekly ring, chart lines and stat tiles glow; text and reading surfaces do not.
- No characters, mascots or illustrations of people: the product shows real work and real evidence.

## Voice

Exact, warm and honest about certainty: a careful colleague, not a machine or a salesperson.

| Principle | In practice |
|---|---|
| Plain words | "Role fit", not "candidate–role alignment index" |
| Specific over impressive | "Spotted that station 2 closes at noon", not "strong analytical skills" |
| Numbers with ranges and reasons | Level, range and why; never a bare percentage |
| Calm | No exclamation marks, urgency tricks or hype ("revolutionary", "AI-powered") |
| Verbs on buttons | Sentence case, active voice: "Publish" → "Published" |

Tone shifts by audience: calm and reassuring with **candidates** ("Take the time you need. Your answers save as you type."), precise and brief with **hiring teams** ("17 reports haven't been opened yet."), honest and encouraging with **people growing** ("You named the trade-off. An expert would also check who else the delay affects."). The promise stays **Evidence, not impressions.** · **أدلة، لا انطباعات.**

## Files and applications

`npm run brand:assets` regenerates everything: `scripts/brand-assets.mts` writes the outlined SVGs and the in-app paths, then `scripts/brand-render.spec.ts` (Playwright, fonts embedded as data URIs) renders the PNGs.

- `public/brand/`: `logo*.svg` (horizontal, English, Arabic, reversed, one colour), `mark*.svg`, `symbol.svg` and `symbol-signal.svg` (app tiles), `wordmark*.svg`; PNGs `logo.png` and `logo-reverse.png` (transparent, clear space built in), `symbol-{1024,512,192}.png`, `symbol-maskable-512.png`, `logo-email.png`.
- Colours (Night): marks and logos are indigo `#1B1840` on light grounds and white on dark ones; the dot is coral `#E8436B` (3:1 or more on white and on the indigo canvas). The app tile is the mark in white on the deep blue gradient (`#3156D4` → `#1A3291`), as in the app's `LogoTile`.
- Social images: `og-en.png` and `og-ar.png` (1200 × 630): the indigo canvas lit violet and blue, the white logo, the promise as a huge Plus Jakarta Sans (or Readex Pro) headline ending in the coral dot, the glowing mark, and a violet strip with the line "Every score comes with the person's own words." Set as the site's Open Graph image in `src/app/layout.tsx`.
- App icons: `src/app/icon.svg` (browser tab), `src/app/apple-icon.png` (full-bleed blue), the PWA manifest (`src/app/manifest.ts`, including a maskable icon), and the phone app's icon, adaptive icon and splash in `mobile/assets/`.
- Email: one layout (`src/lib/mail/templates.ts`) for invitations, renewed links, team invitations, password resets, shared reports and reminders, in the recipient's language and direction, with a plain-text twin. A lavender ground around a rounded white card, `logo-email.png` at 140 px, a violet tick, indigo text and one violet pill button with white text.
