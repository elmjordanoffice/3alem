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
