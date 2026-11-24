# Decisions log

Choices the brief left open, or where I departed from it, with the reason. Newest last. Format: **D-nnn: decision.** Why. *(Phase)*

**D-001: Stack: Next.js 16 App Router, TypeScript, Tailwind 4, Radix-based shadcn pattern, Prisma 7.10.** As recommended. Prisma's `latest` npm tag is an 8.0 release candidate, so I pinned the latest stable 7.x. *(0)*

**D-002: Better Auth instead of Supabase Auth or Clerk.** Self-hosted, no third-party identity vendor holding candidate data, sessions live in our own Postgres next to RLS, and roles stay in our own `Membership` model. It covers email/password, password reset and rate limiting, with SSO/social providers available later. *(0)*

**D-003: Row-level security with two DB roles.** An owner role for migrations and trusted system work, and a non-owner runtime role on which policies are enforced. Context goes in through transaction-local `set_config`. App-level permission checks stay as well. Defence in depth: a missing `where` clause cannot leak another tenant's data. *(0)*

**D-004: Tertiary text is `#736D68`, not `#A8A29E`.** `#A8A29E` on `#FAFAF9` is about 2.5:1 and fails the brief's own AA requirement. It is kept as `--mark-muted` for non-text marks (disabled icons, chart grid, drag handles). *(0)*

**D-005: Dark-mode accent `#5B5FEF`, with darker hover/active states.** `#3B3FD8` is too dark to read as an accent on a near-black surface. Hover darkens rather than lightens because white text on a lighter indigo fell to 3.9:1. Accent-coloured *text* uses a separate lighter token (`--accent-text`). *(0)*

**D-006: No locale prefix in URLs.** Locale comes from a cookie kept in sync with the profile, then `Accept-Language`. One invitation link works in either language, and a candidate can switch mid-session without changing URL. *(0)*

**D-007: Latin digits by default, Arabic-Indic optional.** Latin digits are standard in Gulf and Levant business software and keep scores and tables consistent across languages. The setting is per person (Settings → Numbers). All numbers go through `Intl` with `-u-nu-`. *(0)*

**D-008: Self-hosted fonts (Fontsource).** No requests to Google Fonts from the candidate's browser: better privacy and no third-party dependency during a timed assessment. *(0)*

**D-009: `Session` → `AssessmentSession`; the auth session is `AuthSession`.** Avoids a name collision and makes queries self-explanatory. *(0)*

**D-010: Role model.** Candidate/Individual is implicit for every account. Org roles are an array on `Membership`, so one person can be Recruiter and Team manager. Platform admin is a server-only flag. Every org must keep at least one admin (enforced in code and tested). *(0)*

**D-011: Voluntary demographic data is deferred to Phase 5.** *(Superseded by D-026.)* *(5)*

**D-012: Mail transport.** Development and tests write messages to `.mail/` and the console. A production provider (SMTP / Postmark / SES) is chosen at deployment; the interface is `sendMail({to, subject, text})`. *(0)*

**D-013: Level ranges widen with uncertainty.** Displayed range = estimate ± (0.15 + 0.85 × (1 − confidence)), clamped to 1–5 and rounded to one decimal. Confidence is shown as low / moderate / high (thresholds 0.5 and 0.75), never as a percentage. Phase 1 will replace this with the Candidate Model's posterior interval and keep the same display contract. *(0)*

**D-014: Jobs run in-process by default, BullMQ when `REDIS_URL` is set.** A per-key promise chain keeps one candidate's jobs in order with no extra infrastructure for small deployments; BullMQ adds durability, retries and a separate worker for larger ones. Handlers are identical in both modes. *(1)*

**D-015: Phase 0 adds existing accounts to an organisation; email invitations for colleagues come in Phase 2** with the recruiter settings screen. Candidate invitations (`Invitation` model) are a separate flow in Phase 1. *(0)*

**D-016: The org brand colour is stored and validated in Phase 0 and applied in the candidate flow in Phase 1.** The settings screen warns when white text on the colour falls below 4.5:1. *(0)*

**D-017: Built-in framework: 9 domains, 46 sub-skills, 230 behavioural anchors in English and Arabic.** Open points for a native-speaker and psychometrician review before launch:
- The Arabic level names (ناشئ / في طور النمو / متمكّن / متقدّم / خبير). "Developing" has no clean one-word equivalent.
- Arabic anchors use the conventional generic masculine verb forms. A gender-neutral rewrite (verbal nouns) is possible if wanted.
- Deliberately adjacent sub-skills (`judgment.deciding-under-ambiguity` vs `adaptability.comfort-with-ambiguity`, `leadership.handling-conflict` vs `communication.difficult-conversations`): the first of each pair covers the decision or outcome, the second the behaviour or delivery. The Scorer prompt (Phase 1) will carry this guidance. *(0)*

**D-018: Heatmap column headers use short domain labels** (Tech, Think, Judge…) with the full name in `<abbr title>` and the screen-reader table. *(0)*

**D-019: `AUTH_RATE_LIMIT=off` exists only for the end-to-end suite**, which signs in many times a minute from one IP. Production always rate-limits. *(0)*

**D-020: Disabled primary buttons turn neutral** (sunken surface, tertiary text) instead of a faded indigo. Faded accent reads as "slightly available" and has poor contrast in dark mode. *(0)*

**D-021: Arabic initials are joined with a zero-width non-joiner** so they render as separate letters (ل‌ح), not as a two-letter word. *(0)*

**D-022: AI provider.** Claude when `ANTHROPIC_API_KEY` is set, behind a provider interface. Without a key the product still works end to end: a curated item bank, a rubric-and-signal offline scorer, an offline role-play actor and template-written reports. Tests, personas and the demo seed use offline mode, so they are deterministic and free. Prompts are versioned files in `src/lib/ai/prompts/`. *(1)*

**D-023: Reasoning effort instead of temperature.** Current Claude models do not take a sampling temperature. Each agent sets an effort level instead (low for the actor, world builder and guessability check; medium for generation, writing and coaching; high for the scorer) and relies on structured outputs for consistency. Requests opt into server-side model fallback, so a capacity problem doesn't stop a live assessment. *(1)*

**D-024: The candidate path uses the system connection, scoped by the token.** Candidates have no organisation membership, so RLS org context doesn't apply. Every candidate action re-resolves the token, loads only that invitation's session, and never takes an id from the client without checking it belongs to that session. Signed-in Grow and Team sessions use the owner check instead. *(1)*

**D-025: Time budget floor.** The engine plans against the larger of measured time and 60% of each finished scene's expected minutes. Without this, someone clicking through instantly would never run out of time and the session would not end. *(1)*

**D-026: Fairness answers live in one table with RLS on and no policy** (`fairness_response`), keyed by session reference without a foreign key. A separate schema (D-011) would add operational cost for the same guarantee: the runtime role cannot read the table at all, so no product screen can show an individual's answers. Only the owner connection reads it, to compute aggregates. Answers are deleted with the session (retention and erasure). *(5)*

**D-027: Four-fifths rule with a selectable cutoff.** Adverse impact depends on which result counts as "selected". The dashboard defaults to Good fit or better and offers Partial or better, because organisations use the report differently. Groups under five people are suppressed so nobody can be singled out. A flag is a prompt to review, not a finding of bias, and the screen says so. *(5)*

**D-028: Outcome correlation appears from 20 ratings,** marked as an early version. Below that, a correlation is mostly noise and would be over-read. *(5)*

**D-029: Organisation library skills sit inside framework domains** (keys `org.*`) and are added to an assessment from its setup. Claude can write scenarios and score against the organisation's anchors. The curated offline bank only covers the built-in framework, so library skills need a key to be measured; the library page says this. Editing bumps a version number. *(5)*

**D-030: Item-bank review uses live statistics:** uses, mean, spread and the third-pass rate. Flags appear after eight uses: little spread (doesn't discriminate), too easy, too hard, or scorers often disagree. Retiring an item excludes it from selection without touching past scores. *(5)*

**D-031: Webhook security.** HTTPS only. Private, loopback, link-local and unique-local addresses are refused, both when saved and after DNS resolution at delivery, and redirects are not followed. Secrets are shown once, stored AES-256-GCM encrypted with a key derived from the app secret, and used for HMAC-SHA256 signatures. *(5)*

**D-032: CSP without nonces.** Pages are rendered per request and load nothing from third parties, so a strict origin policy with `'unsafe-inline'` scripts (Next's own bootstrap) is the pragmatic choice. A nonce-based policy is a later option. *(5)*

**D-033: Spoken role-play is a progressive enhancement.** Dictation uses the browser's Web Speech API where available and fills the reply box, which the candidate can edit before sending. Read-aloud uses speech synthesis and is off by default. Typing always works, and the scored text is what was sent. Some browsers send dictation audio to their own speech service; the hint says dictation uses the browser's speech recognition. *(5)*

**D-034: Account deletion needs a hand-over** if the person is the only admin of an organisation that has other members, so no organisation is left without an admin. *(5)*

**D-035: Visual identity: ink, saffron and the narrowing range.** The brief's warm neutrals and indigo stay. A deep ink-indigo carries brand surfaces, and saffron is reserved for evidence. The recurring device is the estimate band narrowing on the 1–5 scale, because that is what the engine does. A generic look (identical card grids, gradient washes, tracked capitals, arrows on every button) was removed. *(UI)*

**D-036: Alexandria for display, IBM Plex for the interface,** replacing Inter. Alexandria is drawn for Latin and Arabic together, so English and Arabic titles share one voice. Plex Sans and Plex Sans Arabic are one family designed to pair, and read as precise without being cold. *(UI)*

**D-037: Section tabs and a command menu instead of a long sidebar.** Seventeen sidebar items became eight. Sub-pages of Grow, Organisation and Platform admin are tabs, and anything can be reached with ⌘K. *(UI)*

**D-038: The end-to-end suite cleans up after itself** (`tests/e2e/global-teardown.ts`): test data is recognisable (`@test.aalim` addresses, roles created from the test job description, "Pilot" teams) and removed after each run, so the demo organisation stays as the demo seed left it. `E2E_KEEP_DATA=1` keeps it for debugging. *(UI)*

**D-039: Demo candidates write like people.** Simulated answers turn each rubric signal into a first-person sentence and add the specifics the scorer looks for, so demo reports quote readable evidence. Role-play turns vary between phrasings. *(UI)*

**D-040: The brand is generated, not drawn by hand.** `npm run brand:assets` outlines the wordmarks from the Alexandria font files (opentype.js shapes the Arabic correctly), writes every lockup as SVG, renders PNGs and the social images with Playwright, and writes the path data the in-app `<Logo>` uses. One source, so the product, the files and the brand book (/brand) can never drift. The wordmark is lowercase "aalim" with the tittle in saffron; the symbol is the narrowing range. *(Brand)*

**D-041: Editor updates are transitions.** Typing in the rich-text answer editor updates a React copy of the draft (for autosave and the submit button). Under very fast input in production, those synchronous updates, together with Tiptap reapplying options on every render (new `extensions` array each time), could stack into React's nested-update limit (error 185) and break the scene. The extensions and editor props are now memoised, editability changes don't emit updates, and the draft updates inside `startTransition`. Found by the end-to-end suite; reproduced and verified fixed over repeated runs. *(Fix)*

**D-042: Emails share one branded, bilingual layout** (`src/lib/mail/templates.ts`): table-based HTML that renders in mail clients, RTL for Arabic, each message in the recipient's language, with a plain-text twin and an HTML preview written next to each message in `.mail/` during development. *(Brand)*

**D-043: Third design pass, from researched references.** The second pass was judged too plain. Eleven shipped products were studied (Linear, Attio, Raycast, Stripe, Metaview, Gong, Ashby, Mercury, the Jisr site, Tamara's bilingual wordmark, Maki People) and the direction written up in [design-references.md](design-references.md): "ink chrome, paper evidence". The navigation moved onto ink with the work on a light sheet; cards gained elevation instead of borders; the landing page now leads with a real report in a window frame on a lit ink stage, followed by the promise in both scripts, numbered figures, a bento grid and trust on ink; Home opens on a brief with drill-down numbers; sign-in became a lit scene. Saffron is still reserved for evidence, the logo dot and the range band. *(UI)*

**D-044: A cinematic marketing page built on the brand's own signature.** After the third pass was judged not good enough, the landing page became a scroll film on a night ground: the evidence field (rows of skill ranges narrowing from lavender to saffron as you scroll) is the hero asset, four beats tell the story (promise, world, range, evidence), and primary buttons are lit. Canvas 2D was chosen over WebGL: the field is flat geometry, so a 2D canvas with a downsample bloom gets the look at a fraction of the weight and works everywhere. Lenis smooth scroll runs on the marketing page only, never in the app or the candidate flow. Everything holds still under reduced motion. See the fourth-pass section of [design-references.md](design-references.md). *(UI)*

**D-045: Asking for a person to review every score.** Candidates can ask for this on the pre-start card. The scenes still adapt with automated scoring (adaptivity depends on it, and the "How AI is used" page says so plainly). The request is stored on the session, and until someone at the organisation confirms a review with a written note, the report can't be shared, sent to the candidate or exported as PDF, and the compare page flags it. Reviewers can adjust any skill area's level; a note is required, the change is shown on the report with the reviewer's name and date, it is in the audit log, and the assessment's own estimate stays visible beside it. *(Fairness)*

**D-046: One query at a time per database connection.** Prisma's query engine can send relation sub-queries concurrently inside an interactive transaction (`withTenant`). pg 8 queues them but warns that pg 9 will stop. `src/lib/db-pool.ts` gives the pool a client that serialises queries in the order they were issued, so behaviour is unchanged and the upgrade path is safe. *(Fix)*

**D-047: Direction C, "bright product", chosen from three mockups.** Instead of another guessed redesign, three directions were mocked on the report screen and the owner chose the bright one. The tokens keep their names, so the whole app re-themed at once: Readex Pro replaced Alexandria and IBM Plex (one family for both scripts), radii grew (12 px controls, 20 px cards), cards lost borders for soft depth, the sidebar became a floating white card, and dark ink panels became indigo gradient hero cards with translucent tiles. Every text pairing, including white on each gradient stop, is checked in `tests/unit/contrast.test.ts`. The marketing page keeps its night scroll film for now. *(UI)*


**D-048: The offline scorer is calibrated against real answers.** Without a model, scoring had clustered: weak answers often scored 3, sometimes above average ones, and 15 of 18 demo candidates came out Partial or Weak. Version 2 (`scorer-offline.v2`) matches keywords at the start of words, with Arabic's attached prefixes (و، ف، ب، ل، ال) and without false hits inside words (the Arabic "حد" no longer matches "واحدة"); ignores a red flag the writer negates ("I won't blame the supplier"); credits the habits each domain rewards (reasons, trade-offs, owners and dates, the other side's view, checking the facts; `src/lib/ai/offline/signals.ts`); and caps what thin evidence can reach (no level 4 without a specific indicator, no level 3 from a generic answer). `tests/fixtures/calibration-answers.ts` holds hand-written strong, average and weak answers in English and Arabic; the test requires strong > average > weak on every item and a spread across the scale (strong ≥ 4, weak ≤ 2.2). Confidence still never exceeds 0.75. *(Scoring)*

**D-049: An interview kit with independent scorecards, and recorded decisions.** Each report gets a kit (`/app/reports/[id]/interview`): up to five focus areas, in order: must-haves below the role's level, findings the assessment flagged but couldn't settle, the important skills it is least sure about, and a strength to confirm. Each has a behavioural question (and a situational one for people with little work experience), follow-ups, what to listen and watch for (`src/lib/framework/interview-guide.ts`) and the framework's level descriptions. Interviewers rate each area 1–5 *before* they see the assessment's levels or anyone else's scorecard, since independent ratings resist anchoring; after submitting, they see the comparison and every area where someone is more than a level from the assessment's range, to discuss in the debrief. The hiring team then records a decision (invite to interview, hire, hold, decline) with a required reason; it is audited, shown in the candidate list, and a hire or decline waits for any human review the candidate asked for. *(Hire)*

**D-050: Practice feedback says what to do next, and lets you try again.** Every practice answer, with or without a model, now gets two concrete habits to try (drawn from what its skills reward and the answer didn't show) and, for each skill, what the next level up looks like, taken from the framework's general descriptions so no item's answer key leaks. "Try this one again" reopens the same scenario with the first attempt's advice in view and shows the change in level. Team tracks are *offered*, not assigned: members see them as "Suggested by your team" and choose. Each team page opens on a brief of next steps (who hasn't finished, the track for the top gap, a mentoring pair, someone ready for a stretch assignment). *(Grow, Team)*

**D-051: Range, a complete brand chosen from three concepts.** The owner judged direction C still unfinished and asked for a whole brand: logo, colours, type and design. Three identities were presented as full boards (A · Ayn, the letter ع as an eye; B · Seal, a scholar's seal; C · Range), and the owner chose Range. The idea is the product's own mechanics: every answer narrows what we know about a person. The mark is three rounded bands narrowing upward into a vermilion dot (the estimate); stacked, they read as an A. The wordmark pairs AALIM in Archivo Expanded ExtraBold with عالم in Beiruti Black, outlined with HarfBuzz so the Arabic joins exactly as on screen (`scripts/brand-assets.mts`, OFL fonts in `brand/fonts`). Colour is ink, bone and one vermilion signal over warm stone; accent (actions, selection) is ink and vermilion is reserved for the dot, the range bands, the one hero call to action and focus (ink text on vermilion, never small vermilion text on bone). Type is IBM Plex Sans and IBM Plex Sans Arabic for reading, Archivo (often wide, in capitals for big moments) and Beiruti for display. Surfaces are flat with hairlines; each screen has one ink panel. The Narrowing (bands tightening into the dot) is the signature graphic. Every token pair is AA in light and dark (`tests/unit/contrast.test.ts`). *(Brand)*

**D-052: A JSON API for the candidate app, sharing code with the web.** Every candidate action (view, start, begin, submit, role-play turn, continue, pause, resume, finish, feedback, fairness) lives once in `src/lib/hire/candidate-actions.ts`. The web's server actions are thin wrappers around it, and `/api/m/:token` exposes the same actions to the mobile app: GET returns the current view, POST takes `{ action, ... }`. The invitation token is the only credential, exactly as in the web link. CORS is open because the token is the secret, and there is a per-token rate limit (120 a minute). Bad input returns 400 (zod) and an action that doesn't fit the session's state returns 409. `tests/e2e/mobile-api.spec.ts` runs a whole assessment through it. *(Mobile)*

**D-053: On phones, each scene is a vertical deck.** Under 768 px the scene becomes full-screen slides, as in a feed: the scenario, one slide per document, then the task with its submit button pinned to the bottom (`src/components/candidate/phone-deck.tsx`). Paging uses the browser's own scroll snapping, so momentum feels native. It snaps to each slide, steps aside while the person types (so the keyboard and caret never fight the pager), and lets a long slide scroll inside itself. Follow-ups arrive as the task slide and the deck glides to it; a rail shows where you are. *(Mobile)*

**D-054: Smarter without a model, in every mode.** With no language model configured, each feature still reasons from the evidence:
- **Role shortlist** (`src/lib/hire/shortlist.ts`): candidates are grouped as interview, take a closer look (one gap, thin evidence or hidden potential), better fit for another open role (judged on the same domain estimates), or not now. Each group comes with plain reasons.
- **Job-description reader** (`src/lib/hire/jd-signals.ts`): the role family is detected from weighted phrases with the title counted twice. Skill weights blend the family's profile with what the text asks for, and each weight names the words that moved it.
- **Today's focus in Grow** (`src/lib/grow/next-step.ts`): chosen by spacing and recent results, with the reason shown.
- **Home's next actions** (`src/lib/hire/next-actions.ts`): reports to review, people ready to interview, decisions waiting more than three days, invitations to nudge.
- **Team → next hire** (`src/lib/team/next-hire.ts`): a team's gaps become a drafted job description that the reader weights the same way.
- **Candidate recap** (`src/lib/hire/recap.ts`): what they got through, plus up to three habits that appeared in at least two of their own answers. It is descriptive and never a score.
- **Compare** (`src/lib/hire/compare.ts`): it names only the differences where the ranges don't overlap, with one quote from each person, and calls the rest too close to call.
- **Offline coach** (`src/lib/grow/offline-coach.ts`): it answers from practice history, self-view against the evidence, strengths in the person's own words, and the habits a situation needs.
- **First 90 days** (`src/lib/hire/first-days.ts`): for people moving forward, where to give early ownership and how to support each gap: a pairing, a Grow track and one habit to look for at the check-in.

Each of these has unit tests. *(Product)*

**D-055: A native candidate app, built on Expo.** `mobile/` is an Expo app (SDK 58, expo-router, Reanimated 4, Gesture Handler 3) that runs a whole invitation over the candidate API (D-052): welcome (paste a link or open `aalim://a/<token>`), landing with consent and accommodations, briefing, the world intro as pages, scenes, chapter breaks, pause, and the finish screen with the recap.
- **The scene deck:** each scene is a vertical deck: the situation, one page per material, then the task. Follow-ups arrive as new pages and the deck springs to them; an answered task folds into a sealed "Answer sent" page; earlier scenes stay sealed.
- **Paging:** a custom pager rather than `react-native-pager-view`. It runs on the UI thread and only takes a drag at a page's top or bottom edge, so long pages scroll first. It settles one page at a time on a spring that carries the finger's speed, and it can be caught mid-flight. On the web it uses CSS scroll snapping.
- **Copy and types:** copy comes straight from `messages/*.json`; item and response types are type-only imports from `src/lib/assessment`.
- **Answers:** drafts autosave on the device, and submissions go through an offline outbox with backoff.
- **Repo setup:** the root TypeScript, ESLint and Prettier configs skip `mobile/`.
- **Testing so far:** the web build was walked through every task kind in both languages and themes. The native gestures, haptics, blur, deep links and screen readers still need testing on real devices. *(Mobile)*

**D-056: Fun, without gamifying judgement.** The owner asked for the product to be fun to use. The rule we follow: celebrate what people *do*, never how an answer scored, and keep hiring free of points, leaderboards and fake urgency.
- **Grow** (`src/lib/grow/momentum.ts`):
  - A weekly ring, with the goal set by the hours chosen at onboarding: ink, with the brand's vermilion dot at its tip.
  - A streak counted in weeks, not days, so a missed day never breaks it.
  - Eight dated, private milestones, each earned by an action: a first practice, a reflection, a retry that beats the first attempt, a week goal, Advanced in practice, three weeks in a row, every plan skill, ten sessions.
  - Every fresh practice result gets a moment: a light one for an ordinary session, an ink card with a small burst for a level gained, a milestone or a week goal.
- **Candidates** (`src/components/candidate/delight.tsx`):
  - A brief "Sent" after each answer. It never delays the next scene; transitions stay at p90 of about 0.4 s.
  - A stamp for the chapter just finished, with the decisions so far revealed one by one.
  - A finish where the bands narrow into the dot with a burst and the recap counts up.
  - Nothing in these moments hints at how an answer went.
- **Hiring teams:** "All caught up" when nothing is waiting, and a recorded decision lands like a stamp.
- **The native app** gets the same candidate moments, with haptics.

All motion is CSS or Reanimated, uses springs and short eases, and goes still under reduced motion. *(UX)*

**D-057: The scene as a stack of designed cards, on the web and natively.** On phones, a scene is a stack of cards with the next one peeking in by about 20 pt.
- **Depth:** the leaving card shrinks and dims as it goes; the arriving one grows from 0.95 with its top edge fixed, so the peek never slides off-screen. On the web this uses scroll-driven CSS where supported. Natively it is computed on the UI thread from one shared scroll value, so dragging re-renders nothing, and the dimming is a canvas-coloured overlay so the card underneath doesn't show through.
- **Each card has its own face:**
  - The situation is an ink cover with art generated from the scene title (`src/lib/brand/scene-art.ts`, deterministic and shared by both apps, so a scene looks the same everywhere). It names the people involved and has chips for the documents.
  - Emails look like a mail app.
  - Memos carry the company letterhead.
  - Tables behave like spreadsheets: sticky row numbers, zebra rows, and a hint when they scroll sideways.
  - Charts are framed with their caption.
  - The task card says how to answer before the prompt.
- **Getting around:** long cards scroll inside before handing the swipe to the deck. Keys page through cards on the web. A single nudge on a device's first deck shows that it moves.
- **Reduced motion:** removes all of it but short fades. *(Mobile)*

**D-058: Grow practice is personal: CV, experience, goal and roadmap.** In Grow, questions should be about the person's own work. Hire stays the same for every applicant to a role, which is what makes a hiring assessment fair to compare.
- **The CV:** optional, pasted or uploaded as PDF, Word or text through `/api/grow/cv`, which extracts the text and saves nothing itself. It is kept private on the Grow profile.
- **The offline reader** (`src/lib/grow/cv.ts`) finds:
  - recent job titles;
  - years of experience (from date ranges with overlaps merged, or from "N years");
  - the industry, matched to a scene world;
  - the role family;
  - whether the person has managed people, and the team size;
  - which skills the CV clearly shows.

  Onboarding shows what was read before anything is saved.
- **What shapes each question:**
  - **Scene:** set in the industry from the CV, with the person in the role named by their goal ("Move from engineer to team lead" makes them the Team lead).
  - **Difficulty:** before any assessment, it starts from their experience (entry 2.5, mid 3, senior 3.5, lead 4).
  - **Skill:** the next step of their roadmap (the plan from their latest assessment); before a roadmap exists, the skill their target role needs most that the CV doesn't show.
  - **With a model configured:** the scenario writer gets a short summary of all of this. Baseline assessments use the goal's role family and the same summary.
- **"Why this one":** every practice scenario says why it was chosen (roadmap step, target role, industry).
- **The overview:** shows a numbered roadmap to the person's goal, with sessions and the best level so far for each step. *(Grow)*

**D-059: A habit loop for Grow, healthy by design.** The owner asked for the app to be more fun and addictive. In Grow (the part people return to) we built a habit loop that people are glad to keep, and left hiring untouched, since candidates take an assessment once and it must stay fair.
- **The cue:** an opt-in daily reminder at a local hour the person picks (`src/lib/grow/reminders.ts`, run hourly by `POST /api/cron/reminders`). It is one friendly email, only if they haven't practised that day, at most once a day, and can be turned off in one click. It never uses loss or urgency language; a test checks the wording.
- **The action:** a "2-minute rep", one quick decision on today's roadmap skill, pitched where the person is rather than above.
- **The reward:** every scenario practised becomes a collectible card drawn with its scene art (`src/lib/grow/collection.ts`). New cards turn over in the result, and the shelf shows "N of all scenes" with best levels and attempts. Collecting gives a reason to try new scenarios, which also widens practice.
- **The streak:** counts days (`src/lib/grow/habit.ts`), but one missed day a week is forgiven on its own as a rest day, and an unfinished today never breaks it.
- **What we left out on purpose:** penalties, countdowns, fake scarcity, leaderboards and guilt. *(Grow)*

**D-060: Real email through any provider's SMTP.** `sendMail` sends through `SMTP_URL` (from `MAIL_FROM`) when set, using nodemailer, which covers Resend, Postmark, SES, Mailgun and Google Workspace. Without it, development keeps writing to `.mail/`. The launch steps are in [deploy.md](deploy.md). *(Ops)*

**D-061: Night, a new look from the owner's reference.** The owner shared a reference dashboard (deep indigo, soft rounded cards, a raised glowing violet card, blue and teal gradient tiles, glowing area charts, a floating icon rail) and asked to "redo the whole app design to be this level", without the 3D characters.
- **Tokens:** `src/styles/tokens.css` now defines Night: dark indigo by default and a lavender light theme, violet accent, coral signal, blue and teal for data, a violet level ramp. All pairings stay AA-tested, including white labels on every stat tile.
- **Type and shape:** Plus Jakarta Sans and Readex Pro; 24 px cards, 12 px controls, pill tabs and badges.
- **Shell:** a floating rounded rail with round icon chips, a desktop top bar (search pill, language, theme, avatar), and section tabs as pills.
- **Screens:** Grow's overview follows the reference layout (a This-week ring, today's practice as raised tiles, a growth chart by day early on and by week later, streak and collection tiles). Home gains a two-week activity chart. Reports, lists, the candidate deck, auth, the landing page, the brand book and the phone app use the same system.
- **Kept:** the Range mark and its idea, the fairness rules for candidates (no scores or game mechanics in Hire) and the healthy-habit rules in Grow. *(Design)*

