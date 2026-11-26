# Aalim brand: ʿAyn, in Night

The live, bilingual brand book is at **/brand** in the app (`src/app/brand/`). It is built from the product's own components, tokens and logo geometry, so it can't drift. This file is the written summary.

## The idea

**ع: one letter for the world, knowledge, work and the eye.** In Arabic, عالم (ʿālam, a world; ʿālim, one who knows: our name), علم (knowledge), عمل (work) and عين (eye) all begin with the letter ʿayn. That is the product in four words: a world built around real work, an eye that looks at what people actually do, and knowledge we can stand behind.

The mark is that letter. In calligraphy the inside of ع's head is called its **eye** (عين); we put a coral **pupil** there. It looks at the work, not at the person's CV or their confidence.

**Every answer narrows the range** stays the product's idea: an assessment starts out knowing almost nothing; each answer is evidence, and the band of plausible levels tightens until what is left is an estimate we can stand behind, with the person's own words underneath it. The range bands in reports draw that; the logo no longer does.

Three words: **exact** (measured, aligned; every line means something), **warm** (soft light, rounded shapes, a friendly voice) and **honest about certainty** (ranges, not verdicts).

Since D-061 the product wears Night (a deep indigo canvas lit by violet, navy blue and teal); since D-063 the mark is the ʿAyn. It replaced Range (stacked bands narrowing into a dot).

## Name

In Arabic, the same four letters (ع ا ل م) spell **ʿālim**, someone who knows a subject deeply, and **ʿālam**, a world. Aalim builds a world for each person (a realistic week at a fictional company) and finds out what they know in it.

Write **Aalim** in English text and **عالِم** in Arabic. The lowercase **aalim** belongs to the wordmark.

## The mark

One rounded stroke on a 64-unit square: a small head open to the right over a larger bowl, joined by a short neck, with the pupil in the head.

| Part | Measure |
|---|---|
| Head | Circle r 10 at (30.6, 17), drawn from −28° (the tip, upper right) round the top and left to its foot |
| Neck | A short stroke from the head's foot to the bowl |
| Bowl | Circle r 16 at (32.6, 41), from the upper left round the left and bottom to the tail at 22° |
| Stroke | 8.5, round caps and joins; about 106 long (for drawing it on) |
| Pupil | Circle r 3.6 at (31.8, 17.4), coral, a little towards the head's opening |
| Balance | Optically centred: the ink spans about x 12–52 and y 4–62 |

The letter takes the opposite of the ground (indigo `#1B1840` on light, white on dark and on the tile). The pupil is coral, always, except in one-colour reproduction, where it joins the letter. The geometry lives in one place, `scripts/brand-assets.mts` (`AYN`, `LOCKUP`), which also writes `src/components/brand/wordmark-paths.ts` for the in-app `<Logo>` and the phone app.

**Motion.** In the product the mark comes alive (`<LogoMark animated>`, `.ayn-live`): the stroke draws itself once, the pupil pops in, then it glances right and left and blinks every few seconds. It appears where the product is thinking or done: the sign-in panel, the candidate loading and finish screens, and "all caught up". Still under reduced motion.

## Wordmark and lockups

- **aalim** in lowercase, Plus Jakarta Sans ExtraBold, set tight (−42/1000). **عالم** in Readex Pro Bold, never tracked; its alif rises about 6% above the Latin ascender, baselines aligned, with a rounded hairline at 24% between them. Both are outlined with HarfBuzz from static cuts in `brand/fonts/` (made from the product's variable fonts with fontTools), so the Arabic joins exactly as a browser shapes it and no font is needed to open a file.
- **Lockups:** horizontal bilingual (primary), English, Arabic (the mark on the right, where Arabic reading starts), one colour, reversed, and the app tile: the white ʿayn on a squircle running violet `#7564EE` to navy `#1E2F86`, the pupil coral (30% radius in the app, 22.5% in icon files). A coral tile (indigo letter, white pupil) is for marketing only.
- **Clear space:** x on every side, where x is the height of aalim; around the mark alone, half its width.
- **Minimum sizes:** mark 16 px, app tile 20 px, horizontal lockup 120 px wide, English lockup 80 px wide. In print: lockup 30 mm, mark 5 mm.
- **Don't:** mirror the letter, close or reshape the head, move, resize or recolour the pupil, recolour the letter outside the palette, stretch, rotate, add effects to the mark itself (the tile's gradient and a soft glow behind it are the only exceptions), put it on coral or a busy picture, or retype the wordmark.

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

- **The pupil:** the coral dot recurs wherever something is being looked at or concluded: the estimate on every range, status dots, the full stop in a headline.
- **The sweep:** the ʿayn's bowl as a bold open arc. Each scene's cover art (`src/lib/brand/scene-art.ts`, shared with the phone app) is two or three sweeps round a coral pupil with faint ripples further out, composed from the scene's title so it is the same everywhere and different for every scene.
- **Range bands** (`src/components/report/range-scale.tsx`): every estimate is a coral band on the 1–5 scale, wide while the evidence is thin and narrow once it settles; the dot is the estimate and the tick is the level the role expects. These are data, not decoration.
- **The highlight card** (`.hero-card`): one raised violet card per screen, holding its verdict or its one next step; it may carry the ʿayn faintly in a corner (`.hero-sign`).
- **The evidence highlight** (`.evidence-mark`): a soft violet highlighter under a person's own words, used for verbatim quotes only. Evidence cards carry a violet-to-teal edge.
- **Glow, used for meaning:** the weekly ring, chart lines and stat tiles glow; text and reading surfaces do not.
- No characters, mascots or illustrations of people: the product shows real work and real evidence. The ʿayn's eye is a letter's, not a face's.

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
- Colours (Night): marks and logos are indigo `#1B1840` on light grounds and white on dark ones; the pupil is coral `#E8436B` (3:1 or more on white and on the indigo canvas). The app tile is the white ʿayn on the violet-to-navy squircle (`#7564EE` → `#1E2F86`), as in the app's `LogoTile`.
- Social images: `og-en.png` and `og-ar.png` (1200 × 630): the indigo canvas lit violet and blue, the white logo, the promise as a huge Plus Jakarta Sans (or Readex Pro) headline ending in the coral dot, the glowing ʿayn, and a violet strip with the line "Every score comes with the person's own words." Set as the site's Open Graph image in `src/app/layout.tsx`.
- App icons: `src/app/icon.svg` (browser tab), `src/app/apple-icon.png` (full-bleed blue), the PWA manifest (`src/app/manifest.ts`, including a maskable icon), and the phone app's icon, adaptive icon and splash in `mobile/assets/`.
- Email: one layout (`src/lib/mail/templates.ts`) for invitations, renewed links, team invitations, password resets, shared reports and reminders, in the recipient's language and direction, with a plain-text twin. A lavender ground around a rounded white card, `logo-email.png` at 140 px, a violet tick, indigo text and one violet pill button with white text.
