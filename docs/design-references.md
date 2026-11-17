# Design references and direction

The brief behind the third design pass, after the second one was judged "very basic". This file records the references, what each one teaches, and the direction we took from them.

Sources used: the live product sites, the [SaaSFrame](https://www.saasframe.io/best-landing-pages) and [Lapa Ninja](https://www.lapa.ninja/category/saas/) galleries of shipped pages, the [Awwwards dark-site collection](https://www.awwwards.com/inspiration/dark-themed-website), vendor docs and design write-ups, and Nielsen Norman Group and Material Design for evidence.

## The brief as read

- **Surfaces:** the marketing site, the web app (recruiter home, report, navigation chrome), sign-in, and the candidate experience.
- **Audience:** hiring teams and HR leaders in the Gulf and Levant, and the candidates they invite.
- **Mood:** premium, editorial, confident; calm rather than loud. Bilingual with full RTL.
- **Constraints:** keep the brand (ink, indigo, saffron; Alexandria with IBM Plex), WCAG AA, Arabic and English equal, no fake logos or invented customer claims.

## References (11), grouped by what they teach

### 1. The product is the hero

| Reference | What to borrow | For Aalim |
|---|---|---|
| [Linear](https://linear.app) | Near-achromatic dark canvas with one accent; a real product view (an issue page) as the hero image; "Fig 0.1"-style captions that make product shots read as editorial figures. Analyses describe hierarchy built from shades of white opacity rather than colour ([LogRocket](https://blog.logrocket.com/?p=186781), [Linear: design refresh](https://linear.app/blog/behind-the-latest-design-refresh)). | Hero on ink with a real report as the image. Number product figures ("Fig. 01"). On ink, build hierarchy with foreground opacity, not new colours. |
| [Attio](https://attio.com) | A dark product preview under the hero copy that becomes light as you scroll ([DesignRush review](https://www.designrush.com/best-designs/websites/attio-website-design)). Numbered chapters (Build pipeline, Convert leads …), each a short headline plus a real UI mock. Big plain metric tiles. | Numbered chapters for the three moments of an assessment: the world, the adaptation, the evidence. Each gets a real piece of interface. |
| [Raycast](https://www.raycast.com) | Product shots framed as floating windows: rounded corners, deep layered shadow, hairline borders; one bright accent used like punctuation ([SaaSFrame](https://www.saasframe.io/examples/raycast-landing-page)). | A window frame around product composites, with hairline borders and a deep ink-tinted shadow. Saffron stays punctuation: evidence only. |
| [Stripe](https://stripe.com) | A signature gradient treated as a brand asset, tuned with a custom tool (blur, grain, rotation); a bento grid for a wide product range ([Stripe on its homepage](https://summify.io/discover/how-stripe-built-their-new-website-ypzNhw/)). | Our signature is the range field. Make it the luminous backdrop of the hero and the trust section. A bento grid for the modes and safeguards. |

### 2. Evidence you can check

| Reference | What to borrow | For Aalim |
|---|---|---|
| [Metaview](https://www.metaview.ai/interview-notes) | Every scorecard field pre-filled with evidence, "the candidate's own words behind the score"; it describes what was said rather than judging the person ([blog](https://www.metaview.ai/resources/blog/candidate-review-align)). | Put a verbatim quote directly under every score on the report and in marketing figures. Never a score without its quote. |
| [Gong](https://help.gong.io/hc/en-us/articles/15766021120013) | A call opens on a Highlights brief: a one-paragraph recap, key points and next steps; transcript lines jump to the moment. | Home opens on a brief: what changed since you last looked, and what to do next, before any list. |

### 3. Recruiting data with drill-down

| Reference | What to borrow | For Aalim |
|---|---|---|
| [Ashby](https://www.ashbyhq.com/platform/recruiting/analytics) | A ready dashboard per job; drill from any number to the records behind it in one click. | Every number on Home is a link to the candidates behind it. Pipeline bars per role. |

### 4. Calm, premium chrome

| Reference | What to borrow | For Aalim |
|---|---|---|
| [Mercury](https://mercury.com) | Deep navy with an indigo accent, a custom sans, restraint; background elements kept quiet so the one filled object carries the page ([SaaSFrame](https://www.saasframe.io/examples/mercury-landing-page)). Closest to our palette. | Dark ink navigation chrome around a light "paper" canvas. One filled object per view (the verdict, the brief). |

### 5. Bilingual from the first line

| Reference | What to borrow | For Aalim |
|---|---|---|
| [Jisr marketing site](https://www.thedigitalbunch.com/case-studies/jisr-a-marketing-site-worthy-of-saudi-arabias-1-hr-platform) (Saudi HR platform, by The Digital Bunch) | Arabic and English pages designed and reviewed as independent deliverables; RTL parity built into the system; motion that behaves the same in both directions. | Review every screen in both directions. Mirror the composites (floating cards, perspective) in RTL rather than leaving them LTR. |
| [Tamara bilingual wordmark](https://blog.29lt.com/2025/09/12/tamara-bilingual-wordmark/) (29LT) | Arabic and Latin logotypes drawn in parallel on a shared grid, the same width, so they sit as one. | Show both scripts together as a brand moment: the promise set in Arabic and English at equal weight. |

### 6. A candidate experience that respects the person

| Reference | What to borrow | For Aalim |
|---|---|---|
| [Maki People](https://www.makipeople.com/candidate-feedback) | Conversational, branded, multilingual journeys; candidates' own feedback published as a page. | Keep the candidate side calm and conversational; make the welcome feel like arriving at a workplace, not sitting an exam. |

All eleven are shipped products, not concepts. Galleries used for scanning: [SaaSFrame](https://www.saasframe.io/best-landing-pages), [Lapa Ninja](https://www.lapa.ninja/post/stripe-sessions), [SaaS UI](https://www.saasui.design/application/attio).

## Synthesis

**Recurring patterns.** The strongest examples lead with their real product, not illustration; keep colour to one accent on a quiet canvas; frame product shots as objects (windows, figures) with depth; and break long pages into numbered chapters with one idea each.

**Differentiators.** Stripe and Linear own a signature visual (the gradient wave, the issue view) that nobody else can use. Metaview and Gong earn trust by putting the source (the words said) next to every conclusion. Our equivalents are the range field and the evidence highlighter, so those carry the pages.

**Pitfalls.**
- Boxing everything: containers group content, but too many borders flatten hierarchy ([NN/g, common region](https://www.nngroup.com/articles/common-region/)). Use elevation and spacing; keep borders for tables and inputs.
- Colour as the main data encoding: position and length read fastest; colour is a secondary cue ([NN/g, dashboards](https://www.nngroup.com/articles/dashboards-preattentive/)). Keep the range bars and pipelines length-based, one hue.
- Mixed-span grids that collapse badly on phones ([NN/g, grids](https://www.nngroup.com/articles/using-grids-in-interface-designs/)). Plan the bento stacking order.
- Mirroring the wrong things in RTL: mirror layout and directional icons, but keep numbers, scales and charts left to right ([Material, bidirectionality](https://m3.material.io/foundations/layout/bidirectionality-rtl)).

## Direction: ink chrome, paper evidence

One idea, applied everywhere: **the brand lives in deep ink around the work; the work itself (answers, evidence, decisions) sits on light paper**, and saffron marks only the candidate's own words.

1. **Marketing site.** A full-bleed ink hero lit by the range field, a large Alexandria headline, a white-on-ink primary button, and a real report composite in a window frame with floating scene cards. Then a bilingual promise band, three numbered figures, a bento grid (Hire, Grow, Team, fairness, privacy, bilingual), trust on ink, and a closing call to action.
2. **App chrome.** An ink sidebar (Mercury, Linear) with foreground-opacity hierarchy and an indigo-lit current item; the content canvas stays light. Cards gain a soft ink-tinted elevation instead of borders alone.
3. **Home.** Opens on an ink brief (Gong): greeting, what changed, the next action, and four drill-down numbers (Ashby). Lists follow on paper.
4. **Sign-in.** The ink panel becomes a lit scene: the range field, a scene card and the evidence quote.
5. **Report.** Evidence sits under every score (Metaview); the verdict is the page's one filled object.

### Rules that keep it from drifting

- Ink for chrome and the single filled object per view. Never two ink panels competing.
- Saffron only on evidence, the logo dot and the range band. Never on buttons.
- Product figures are real components with realistic data, not illustrations.
- Every composite is checked in RTL and dark mode, at phone width.

## Fourth pass: cinematic

The third pass was still judged not good enough: competent, but a clean SaaS template. Scored against the Linear and Higgsfield home pages it came to about 4/10: the visual didn't carry the story (a static screenshot), the controls were flat, almost nothing moved, the hero was crowded, and nothing was reviewed against a bar.

What changed, following the cinematic-web playbook:

- **One hero asset, from the brand itself.** عالم means "a world", so the signature (a skill estimate drawn as a band on the 1–5 scale) became one: the **evidence field** (`src/components/brand/evidence-field.tsx`), rows of estimates on a perspective ground plane receding into fog. Far rows are wide and lavender (uncertain); with evidence they narrow and turn saffron. Canvas 2D with a downsample bloom; pixel ratio capped at 1.75 with a governor; renders only while visible; still under reduced motion.
- **A scroll film** (`src/components/landing/scroll-film.tsx`): a 440 vh section with a sticky stage. One smoothed progress value drives the field and four beats (the promise, the world, the range, the evidence) through CSS variables, so React never re-renders per frame. `window.__film(p)` forces a state for screenshots.
- **Night ground** (`--night`) for the whole marketing page, with blooms, a vignette, a ghost "عالم" the field overlaps, and stepped film grain.
- **Lit UI.** Primary buttons have a glass base, a light that follows the cursor and a backlit glow; hero buttons add an idle sheen. Applied to every primary button in the app.
- **Motion grammar.** Easing tokens for entering, leaving, moving and one hero overshoot; masked word reveals; Lenis smooth scrolling on the marketing page only.
- **Anti-slop removals.** No gradient headline text; the three-card trust row became an editorial numbered list; the bento's equal icon tiles were cut; Hire, Grow and Team became showcase pieces with real product fragments.
- **In the app** the same field lights the Home brief and the sign-in panel. It was tried behind the report verdict and removed: it hurt legibility on a reading surface.

### Review rounds

Each round was scored blind by a fresh reviewer from screenshots, against the Linear and Higgsfield home pages: 5, 5, 6 and 6 out of 10. Fixes that came out of the rounds: the field fades out before a labelled foreground row (a skill with no evidence yet); no saffron until evidence arrives; one range control everywhere (saffron band, ink or white thumb); no card ever covers text; the primary button wins the squint test; template tells removed (glowing eyebrow pill, two-tone headline, gradient text, ghost letterform in the hero, chapter rail, numbered lists, orphan icon tiles); the browser's yellow `<mark>` background no longer shows behind the highlight sweep. The remaining gap the reviewers name is lighting below the film and a shell that still follows a familiar dark-SaaS layout.

