# Aalim brand

The live, bilingual brand book is at **/brand** in the app. It is built from the product's own components and tokens, so it can't drift. This file is the written summary.

## Name

In Arabic, the same four letters (ع ا ل م) spell **ʿālim**, someone who knows a subject deeply, and **ʿālam**, a world. Aalim builds a world for each person (a realistic week at a fictional company) and finds out what they know in it.

Write **Aalim** in English text and **عالم** in Arabic. The lowercase **aalim** appears only in the wordmark.

## Platform

- **Positioning:** for organisations that hire and develop people, Aalim is the skills assessment that shows its working: realistic scenarios that adapt to every answer, and every score backed by the person's own words.
- **Promise / tagline:** Evidence, not impressions. · أدلة، لا انطباعات.
- **Values:**
  - Show the evidence: every claim links to the person's own words. If we can't quote it, we don't say it.
  - Be honest about certainty: ranges, not verdicts.
  - People decide: Aalim informs decisions about people. It never makes them, and it never rejects anyone.
  - Fair by design: checked for adverse impact, accessible, private by default.
  - Bilingual from the first line: Arabic and English are equals.
- **Personality:** rigorous, never cold. Warm, never cute. Direct, never blunt. Confident, never certain. Modern, never trendy.

## Voice

| Principle | In practice |
|---|---|
| Plain words | "Role fit", not "candidate–role alignment index" |
| Specific over impressive | "Spotted that station 2 closes at noon", not "strong analytical skills" |
| Numbers with ranges and reasons | Level, range and why; never a bare percentage |
| Calm | No exclamation marks, urgency tricks or hype ("revolutionary", "AI-powered") |
| Verbs on buttons | Sentence case, active voice: "Publish" → "Published" |

Tone shifts by audience:

- **Candidates:** calm and reassuring, clear about their data. *"Take the time you need. Your answers save as you type."*
- **Hiring teams:** precise and brief; lead with what to do. *"17 reports haven't been opened yet."*
- **People growing:** honest and encouraging, never flattering. *"You named the trade-off. An expert would also check who else the delay affects."*

## Logo

- **Symbol:** the narrowing range in miniature: a scale, the band of plausible levels (saffron) and the estimate. Ink rounded square.
- **Wordmark:** "aalim" in Alexandria Semibold with the dot of the i in saffron, and عالم in the same face on the same baseline, separated by a hairline.
- **Lockups:** bilingual (primary), English, Arabic, and reversed on ink.
- **Clear space:** at least the height of the band on every side. **Minimum size:** symbol 16 px; bilingual lockup 120 px wide.
- **Don't:** recolour the dot or band, stretch it, place it on saffron or busy images, or retype the wordmark in another font.

All files are outlined vectors (no font needed), generated from the brand fonts by `npm run brand:assets` into `public/brand/`. The same script writes `src/components/brand/wordmark-paths.ts`, so the in-app logo is identical to the files.

## Colour

| Name | Light | Dark | Role | Share |
|---|---|---|---|---|
| Ink | `#17184A` | `#15163A` | Brand surfaces: verdicts, chapter cards, hero panels | ~25% |
| Indigo | `#3B3FD8` | `#5B5FEF` | Primary actions, focus, current selection; nothing else | ~5% |
| Saffron | `#F2B532` | `#F2B532` | Evidence and the logo's dot; never decoration | ≤3% |
| Stone | `#FAFAF9` … `#1C1917` | `#0F0E0D` … `#F5F5F4` | Backgrounds, text, borders | ~67% |
| Level ramp | `#E4E5FB` → `#2F33AD` | `#262849` → `#B4B6FA` | Skill levels and role fit; one hue, never red/green | as needed |

Every text pairing is tested for WCAG AA in `tests/unit/contrast.test.ts`.

## Type

- **Alexandria** for display (page titles, verdicts, big numbers): drawn for Latin and Arabic together.
- **IBM Plex Sans / Plex Sans Arabic** for text: one family designed to pair across scripts.
- Arabic: line height 1.65 (text) and 1.32 (display), no letter spacing. Latin digits by default; Arabic-Indic digits are a personal setting.

## Signatures

- **The narrowing range:** every estimate is a band on the 1–5 scale that narrows with evidence, with a tick at the level the role expects. The brand's one moving idea.
- **The evidence highlighter:** the candidate's verbatim words marked in saffron.
- **The range field:** rows of estimates narrowing from lavender (uncertain) to saffron (evidenced). A texture for brand surfaces and social images, never inside the product's data views.

## Imagery, icons, motion

- Show the product and the range field. If you show people: real workplaces in the region, natural light, people working rather than posing. Never robots, brains or circuit boards for "AI".
- Icons: Lucide, 1.75 stroke, 16/20 px, text or secondary colour.
- Motion: one orchestrated moment per page at most (the band narrowing); responses in 150–250 ms; everything stops under reduced motion.

## Applications

- Social images: `public/brand/og-en.png`, `og-ar.png` (1200×630), set as the site's Open Graph image.
- App icons: `src/app/icon.svg`, `src/app/apple-icon.png`, PWA manifest (`src/app/manifest.ts`).
- Email: one branded, bilingual layout (`src/lib/mail/templates.ts`) for invitations, renewed links, team invitations, password resets and shared reports, each in the recipient's language, with a plain-text twin.
