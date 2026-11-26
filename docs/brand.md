# Aalim brand: Focus, in Night

The live, bilingual brand book is at **/brand** in the app (`src/app/brand/`). It is built from the product's own components, tokens and logo geometry, so it can't drift. This file is the written summary.

## The idea

**Every answer narrows the range.** An assessment starts out knowing almost nothing: the person could be anywhere on the scale. Each answer is evidence, and each piece of evidence rules something out, until what is left is an estimate we can stand behind, with the person's own words underneath it.

**Focus** is that idea as a mark: two open rings closing in on one coral point. The rings are the picture coming into focus; the point is the estimate, the same coral dot that marks it on every range in a report. It reads as precision, a lens, a target: we look closely and conclude carefully.

Three words: **exact** (measured, aligned; every line means something), **warm** (soft light, rounded shapes, a friendly voice) and **honest about certainty** (ranges, not verdicts).

History: Range (stacked bands narrowing into a dot, v2), then briefly the ʿAyn (the letter ع with a coral pupil, D-063), then Focus (D-064), chosen by the owner from four directions. Night (D-061) is the colour system throughout.

## Name

In Arabic, the same four letters (ع ا ل م) spell **ʿālim**, someone who knows a subject deeply, and **ʿālam**, a world. Aalim builds a world for each person (a realistic week at a fictional company) and finds out what they know in it.

Write **Aalim** in English text and **عالِم** in Arabic. The lowercase **aalim** belongs to the wordmark.

## The mark

Two rings and a point on a 64-unit square, centred on (32, 32):

| Part | Measure |
|---|---|
| Outer ring | r 24, stroke 6, clockwise from 200° to 480°: a 280° arc, open 80° towards the lower left; 55% of the mark's colour |
| Inner ring | r 15.5, stroke 6.5, from 230° to 490°: 260°, open 100°, also towards the lower left; 85% |
| Ends | Fully round |
| Point | r 6.5 at the centre, coral |
| Balance | The ink spans about x 6.4–59 and y 5–59; lockups place the mark by its ink |

The rings take the opposite of the ground (indigo `#1B1840` on light, white on dark and on the tile). The point is coral, always, except in one-colour reproduction, where both rings go to full strength and the point joins them. The geometry lives in one place, `scripts/brand-assets.mts` (`MARK`, `LOCKUP`), which writes `src/lib/brand/mark.ts` (shared with the phone app) and `src/components/brand/wordmark-paths.ts` for the in-app `<Logo>`.

**Motion.** In the product the mark comes alive (`<LogoMark animated>`, `.mark-live`): the outer ring draws in, then the inner, and the point lands with a small overshoot; then every few seconds the rings turn a little in opposite directions and the point pulses, like a lens finding focus. It appears where the product is thinking or done: the sign-in panel, the candidate loading and finish screens, and "all caught up". Still under reduced motion.

## Wordmark and lockups

- **aalim** in lowercase, Plus Jakarta Sans ExtraBold, set tight (−42/1000). **عالم** in Readex Pro Bold, never tracked; its alif rises about 6% above the Latin ascender, baselines aligned, with a rounded hairline at 24% between them. Both are outlined with HarfBuzz from static cuts in `brand/fonts/` (made from the product's variable fonts with fontTools), so the Arabic joins exactly as a browser shapes it and no font is needed to open a file.
- **Lockups:** horizontal bilingual (primary), English, Arabic (the mark on the right, where Arabic reading starts), one colour, reversed, and the app tile: the white rings on a squircle running violet `#7564EE` to navy `#1E2F86`, the point coral (30% radius in the app, 22.5% in icon files). A coral tile (solid indigo rings, white point) is for marketing only.
- **Clear space:** x on every side, where x is the height of aalim; around the mark alone, half its width.
- **Minimum sizes:** mark 16 px, app tile 20 px, horizontal lockup 120 px wide, English lockup 80 px wide. In print: lockup 30 mm, mark 5 mm.
- **Don't:** close the rings, turn the gaps, change the rings' weights or strengths, move the point off centre or recolour it, recolour the mark outside the palette, stretch, add effects to the mark itself (the tile's gradient and a soft glow behind it are the only exceptions), put it on coral or a busy picture, or retype the wordmark.

## Colour: Night

Dark indigo is the default theme; the light theme is the same system on lavender and white. Every value is a token in `src/styles/tokens.css` (both themes) and every text pairing is checked for WCAG AA in `tests/unit/contrast.test.ts`.

| Name | Dark | Light | Role |
|---|---|---|---|
| Canvas | `#1B1840` | `#EFEDFB` | The page, lit by two soft radial washes (violet top left, blue bottom right) |
| Surface | `#26224F` | `#FFFFFF` | Cards, lifted by shadow and light, not hairlines |
| Text | `#FFFFFF` · `#BDB8E3` · `#A09BCB` | `#1B1840` · `#4A4575` · `#5F5A8C` | Primary, secondary, tertiary |
| Violet (accent) | `#6C5CE7` (text `#B3A8FF`) | `#5847D6` (text `#4636C2`) | Actions, the current selection, the raised highlight card |
| Coral (signal) | `#FF5C7C` | `#D6345D` | The estimate dot, range bands, the one call to action that matters most |
| Blue | `#3558C4` (tiles `#21409E` → `#12245E`) | `#22449F` | Data: stat tiles, chart lines; a navy blue that sits with the indigo |
| Teal | `#25C6B6` (text `#5FE0D2`) | `#12A597` (text `#0A7A6F`) | Data: stat tiles, chart lines, progress |
| Levels | `#36306E` → `#D9D3FF` | `#E6E3F8` → `#2B2273` | One violet ramp for skill levels; never red and green |

**Light and depth.** Cards are rounded (24 px) and float on soft shadows. One raised violet card per screen (`.hero-card`, a violet gradient with a glow) holds what to look at first. Stat tiles (`.tile-blue`, `.tile-teal`, `.tile-violet`, `.tile-coral`) are bold gradients with a faint wave of light; their colours are tokens (`--tile-*`) chosen so white labels pass AA at the lightest stop. Charts are glowing gradient areas and lines in violet, blue, teal and coral.

**The coral rule:** coral marks the estimate and, at most, one call to action per screen. It is never decoration.

## Type

- **Plus Jakarta Sans** for Latin and **Readex Pro** for Arabic, everywhere (variable fonts, loaded with `@fontsource-variable`).
- Titles are bold to extra-bold (700–800) in sentence case with slightly tight tracking (−0.02 em); no all-capitals display type. Labels are 500–600.
- Reading text is 400, 15–16 px and up.
- Scale: page title 36–44, section title 20, card title 17, body 15–16, small 13–14, label 11–12 (14 in Arabic).
- The wordmark is drawn from the same two fonts (outlined paths), so it matches the type around it without needing the fonts installed.

Rules for Arabic:

1. Arabic is never letter-spaced: tracking breaks the joins. Negative title tracking applies to Latin only.
2. Give it room: line height 1.65 for reading and about 1.3 for display.
3. Set Arabic display a step larger than the Latin beside it (in the logo, عالم rises 18% above the capitals).
4. Use the fonts' own weights; never stretch, slant or fake bold Arabic.
5. Mirror the layout, not the content: direction, alignment and range bands flip; logos, numbers, links and code don't.
6. Latin digits by default; Arabic-Indic digits are a personal setting. Use Arabic punctuation: ، ؛ ؟

## Motifs

- **The coral point:** wherever something is concluded: the estimate on every range, status dots, the full stop in a headline.
- **The sweep:** the rings drawn very large as open arcs sweeping in from an edge. Each scene's cover art (`src/lib/brand/scene-art.ts`, shared with the phone app) is two or three open rings closing in on a coral point with faint ripples further out, composed from the scene's title so it is the same everywhere and different for every scene.
- **Range bands** (`src/components/report/range-scale.tsx`): every estimate is a coral band on the 1–5 scale, wide while the evidence is thin and narrow once it settles; the dot is the estimate and the tick is the level the role expects. These are data, not decoration.
- **The highlight card** (`.hero-card`): one raised violet card per screen, holding its verdict or its one next step; it may carry the rings faintly in a corner (`.hero-sign`).
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
- Colours (Night): marks and logos are indigo `#1B1840` on light grounds and white on dark ones; the point is coral `#E8436B` (3:1 or more on white and on the indigo canvas). The app tile is the white rings on the violet-to-navy squircle (`#7564EE` → `#1E2F86`), as in the app's `LogoTile`.
- Social images: `og-en.png` and `og-ar.png` (1200 × 630): the indigo canvas lit violet and blue, the white logo, the promise as a huge Plus Jakarta Sans (or Readex Pro) headline ending in the coral dot, the glowing rings, and a violet strip with the line "Every score comes with the person's own words." Set as the site's Open Graph image in `src/app/layout.tsx`.
- App icons: `src/app/icon.svg` (browser tab), `src/app/apple-icon.png` (full-bleed blue), the PWA manifest (`src/app/manifest.ts`, including a maskable icon), and the phone app's icon, adaptive icon and splash in `mobile/assets/`.
- Email: one layout (`src/lib/mail/templates.ts`) for invitations, renewed links, team invitations, password resets, shared reports and reminders, in the recipient's language and direction, with a plain-text twin. A lavender ground around a rounded white card, `logo-email.png` at 140 px, a violet tick, indigo text and one violet pill button with white text.
