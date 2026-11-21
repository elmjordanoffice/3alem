# Aalim brand: Range

The live, bilingual brand book is at **/brand** in the app (`src/app/brand/`). It is built from the product's own components, tokens and logo geometry, so it can't drift. This file is the written summary.

## The idea

**Every answer narrows the range.** An assessment starts out knowing almost nothing: the person could be anywhere on the scale. Each answer is evidence, and each piece of evidence rules something out, until what is left is an estimate we can stand behind, with the person's own words underneath it.

Range draws exactly that: wide bands of uncertainty below, narrower above, and one vermilion point at the top, the estimate. Centred, the bands stack into an A, for Aalim. Arabic name of the brand: **النطاق**.

Three words: **exact** (measured, aligned; every line means something), **warm** (bone, not white; stone, not grey) and **honest about certainty** (ranges, not verdicts).

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

The bands take the opposite of the ground (ink on bone, bone on ink). The dot is vermilion, always, except in one-colour reproduction, where it joins the bands. The geometry lives in one place, `scripts/brand-assets.mts` (`MARK`), which also writes `src/components/brand/wordmark-paths.ts` for the in-app `<Logo>`.

## Wordmark and lockups

- **AALIM** in Archivo Expanded ExtraBold, tracked open a little. **عالم** in Beiruti Black, never tracked; its alif rises 18% above the Latin capitals so both read at the same size. Baselines align, separated by a hairline at 22% ink. Both are outlined with HarfBuzz from the static fonts in `brand/fonts/`, so the Arabic joins exactly as a browser would shape it and no font is needed to open a file.
- **Lockups:** horizontal bilingual (primary), English, Arabic, one colour, reversed on ink, and the app tile (the mark at 70% on an ink square, 22.5% corner radius). A vermilion tile (ink bands, bone dot) is for marketing only.
- **Clear space:** x on every side, where x is the cap height of AALIM; around the mark alone, half its width.
- **Minimum sizes:** mark 16 px, app tile 20 px, horizontal lockup 120 px wide, English lockup 80 px wide. In print: lockup 30 mm, mark 5 mm.
- **Don't:** recolour the bands or the dot, stretch, rotate, add shadows, glows or gradients, put it on vermilion or a busy picture, retype the wordmark, rearrange the parts, or redraw the bands.

## Colour

| Name | Hex | Role |
|---|---|---|
| Ink | `#141414` | Text, the logo, primary actions, the one hero panel per screen |
| Bone | `#F2F0EB` | The canvas; white cards sit on it with a hairline |
| Vermilion (signal) | `#F04A23` | The estimate, range bands, focus, at most one call to action per screen |
| Evidence | `#FFD6C9` | The highlighter behind a person's own words; never decoration |
| White | `#FFFFFF` | Cards and panels on bone |
| Stone | `#4F4B45` · `#67635B` · `#8A857C` · `#CDC8BD` · `#E2DED5` | Secondary text, tertiary text, icons and large text, strong hairlines, hairlines |

Rough share of a screen: bone 62%, white 18%, ink 13%, stone 5%, vermilion 2%. Everything is flat: no gradients, no glows, no blur.

**The vermilion rule:** text on vermilion is ink (5.0:1), never bone. Vermilion on bone is 3.2:1, so it is never small text: only large display and shapes. Key ratios: ink on bone 16.1:1, stone `#4F4B45` on bone 7.6:1, `#67635B` on bone 5.2:1, `#8A857C` on bone 3.2:1 (large text and icons only). The brand book computes its contrast matrix with `src/lib/contrast.ts`; every token pairing used in the product is tested in `tests/unit/contrast.test.ts`. Tokens (with dark-mode counterparts) are in `src/styles/tokens.css`; some names are historical (`--saffron` is the signal colour).

## Type

- **Archivo**, at width 125% and ExtraBold, in capitals, for display (`.display-x`) and labels (`.eyebrow`, tracked +14%). Page and section titles use Archivo at 112%, 700, in sentence case. Archivo never sets running text.
- **Beiruti** for Arabic display (Black and ExtraBold).
- **IBM Plex Sans** and **IBM Plex Sans Arabic** for everything people read and use: 400 reading, 500 labels, 600 titles; 16 px and up for reading.
- Scale: display 72, page title 40, section title 32, card title 20, body 16, small 14, label 11 (14 in Arabic).

Rules for Arabic:

1. Arabic display is Beiruti, never Archivo. No capitals, and never letter-spaced: tracking breaks the joins.
2. Give it room: line height 1.65 for reading and about 1.3 for display.
3. Set Arabic display a step larger than the Latin beside it (in the logo, عالم rises 18% above the capitals).
4. Use the fonts' own weights; never stretch, slant or fake bold Arabic.
5. Mirror the layout, not the content: direction, alignment and range bands flip; logos, numbers, links and code don't.
6. Latin digits by default; Arabic-Indic digits are a personal setting. Use Arabic punctuation: ، ؛ ؟

## The narrowing motif

- **Range bands** (`src/components/report/range-scale.tsx`): every estimate is a vermilion band on the 1–5 scale, wide while the evidence is thin and narrow once it settles; the dot is the estimate and the tick is the level the role expects. The brand's one moving idea: a band narrows once, on arrival.
- **The hero panel** (`.hero-card`): one filled ink panel per screen, holding its one verdict, with the mark's bands at 9% bone in its corner and the dot in vermilion.
- **The section opener** (`.rule-signal`): a hairline with a short vermilion tick at its start (on the right in Arabic).
- **The evidence highlight** (`.evidence-mark`): verbatim quotes only.
- Bands run horizontally, wider means less certain, and the dot is the conclusion. Outside the logo and the hero corner, bands only ever show data.

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
- Social images: `og-en.png` and `og-ar.png` (1200 × 630): bone ground, the promise as a huge Archivo (or Beiruti) headline ending in the vermilion dot, the mark, and a vermilion strip with the line "Every score comes with the person's own words." Set as the site's Open Graph image in `src/app/layout.tsx`.
- App icons: `src/app/icon.svg` (browser tab), `src/app/apple-icon.png` (full-bleed ink), and the PWA manifest (`src/app/manifest.ts`, including a maskable icon).
- Email: one layout (`src/lib/mail/templates.ts`) for invitations, renewed links, team invitations, password resets and shared reports, in the recipient's language and direction, with a plain-text twin. Bone around a white card, `logo-email.png` at 140 px, a vermilion tick, ink text and one vermilion button with ink text.
