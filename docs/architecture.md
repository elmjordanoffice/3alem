# Architecture

## Stack

| Layer | Choice | Notes |
|---|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript (strict, `noUncheckedIndexedAccess`) | Server components by default; server actions for mutations |
| Styling | Tailwind CSS 4 with CSS-variable tokens (`src/styles/tokens.css`) | shadcn/ui pattern: Radix primitives restyled in `src/components/ui` |
| i18n | next-intl 4, English + Arabic, full RTL via logical properties | No locale in URLs (D-006) |
| Database | PostgreSQL 16 + Prisma 7 (driver adapter `@prisma/adapter-pg`) | Row-level security per organisation and per person |
| Auth | Better Auth (email + password, DB sessions) | D-002 |
| AI | Claude via `@anthropic-ai/sdk` (structured outputs validated with Zod) | Offline provider when no key (D-022) |
| Jobs | In-process per-key queues; BullMQ + Redis when `REDIS_URL` is set | D-014 |
| Charts / editor / DnD | Recharts 3, Tiptap 3, dnd-kit | Every chart has a screen-reader table |
| PDF | Headless Chromium (Playwright) printing `/print/reports/[id]` with the viewer's cookies | The PDF can't contain more than the viewer can see |
| Tests | Vitest (unit, persona harness, RLS integration), Playwright + axe-core (e2e, a11y) | |

## Folder map

```
prisma/                     schema, migrations (incl. RLS), seed, demo seed
messages/                   en.json, ar.json
scripts/worker.mts          BullMQ worker
src/app/                    routes
  a/[token]                 candidate assessment (the token is the credential)
  grow/session/[id]         Grow and Team assessments for signed-in people
  r/[token], team-invite/   expiring report share links, team invitations
  app/assessments, reports  Hire (recruiter)
  app/grow/*                Grow: onboarding, profile, practice, tracks, progress, coach
  app/teams/*               Team mode
  app/org/*                 members, settings, library, fairness, integrations, audit
  app/admin/*               platform admin, item-bank review
  api/                      PDF export, CSV export, personal data export, retention cron
src/app/actions/            server actions
src/components/             ui, candidate, recruiter, report, grow, team, admin, assessment
src/lib/engine/             adaptive engine: candidate model, hypotheses, selection, stop rules, role fit
src/lib/ai/                 provider, runner + logging, prompts, offline scorer/actor/writer
src/lib/itembank/           58 curated items and 6 scenario worlds (EN + AR)
src/lib/hire/               templates, invitations, sessions, scoring, reports, integrity
src/lib/grow/, team/        Grow and Team services
src/lib/jobs/               queue abstraction, handlers
src/lib/{fairness,privacy,webhooks,library,retention,crypto}.ts
tests/unit, tests/integration, tests/engine (personas), tests/e2e
```

## The adaptive engine

Deterministic, tested code decides *what* to measure next; the model only writes scenarios and scores answers (`src/lib/engine`).

- **Candidate model:** a three-level Gaussian model (person → domain → sub-skill). Each scored observation updates the posterior. Confidence is `1 − variance`, capped at 0.6 while a sub-skill has evidence from a single item and 0.79 from a single item type. An answer at an item's ceiling counts as a lower bound. Inconsistent evidence adds variance.
- **Flow:** calibrate (a work sample first) → work-style forced choice → explore by value (`(1 − confidence) × importance`) → hypotheses → validate (two or more fresh items, never the trigger) → stress test (strengths go harder; weaknesses are retested under different conditions, such as untimed) → stop.
- **Hypotheses** open only on surprising answers (at least 0.9 levels from the prediction, outside the role band): at most 3 open and 6 in total.
- **Stop rules:** a sub-skill closes at 0.8 confidence or 3 items; the session ends when every critical skill reaches 0.75, or when the time budget would be exceeded. It never runs over. At least 60% of items are production tasks.
- **Time budget:** the larger of measured time and 60% of each answered item's expected minutes (D-025).
- **Role fit** is computed in code from the posterior. Must-haves count double, and a gap of a level or more on a must-have caps fit at Partial.
- **Personas:** 30 simulated candidates (`tests/engine/personas.ts`) must be recovered within one level on at least 80% of sub-skills. Currently about 95%.

## Scoring

A separate Scorer sees only the item, its rubric and the answer. Every score needs a verbatim quote from the candidate's own words (`enforceVerbatim` drops any that isn't). High-impact items are scored twice; a gap of more than one level triggers a third pass. Model updates for one session are serialised with a Postgres advisory lock.

## Background jobs

`enqueue(name, payload, key)` runs `score-response`, `pregenerate`, `build-report` and `retention-sweep`. By default jobs run in the web process on a promise chain per key, so one candidate's jobs never race. With `REDIS_URL` they go to BullMQ (retries, backoff) and `npm run worker` runs them, including a nightly retention schedule. `JOBS_MODE=sync` runs them inline for scripts and tests.

## Tenancy and row-level security

Two Postgres roles:

- **`aalim`** (owner) runs migrations and trusted system work: auth, seeding, background jobs, AI call logging, fairness aggregation, platform-admin views. RLS policies are not `FORCE`d, so the owner bypasses them.
- **`aalim_app`** (runtime, non-owner) is used for all tenant data. Every request goes through `withTenant({ userId, organizationId }, tx => …)`, which opens a transaction and sets `app.org_id` and `app.user_id` with `set_config(…, true)`. The settings are transaction-local, so pooled connections can't leak context.

| Tables | Rule |
|---|---|
| `organization` | the active org, or orgs you're a member of |
| `membership` | the active org's members, plus your own memberships |
| templates, invitations, teams, team members, audit log, webhooks, deliveries, outcome ratings | `organizationId = app.org_id` |
| sessions, items, responses, scores, snapshots, hypotheses, reports, integrity events | the owning org **or** the person assessed (`subjectUserId`) |
| competency domains/competencies, tracks | built-in rows (`organizationId IS NULL`) readable by all; org rows by that org |
| development plans, practice sessions, enrolments, Grow profile, coach messages | owner only (`userId = app.user_id`) |
| `ai_call_log`, `fairness_response`, `bank_item_review` | RLS on, no policy: invisible to the app role |

`tests/integration/rls.test.ts` proves isolation without `where` clauses. Permissions are also checked in application code (`src/lib/auth/roles.ts`).

Candidate links: the token in the URL is the credential (only its SHA-256 hash is stored). Candidate actions resolve the token on every call and work only on that invitation's session (D-024).

## Roles and permissions

| Role | Permissions |
|---|---|
| Candidate / Individual | take assessments, use Grow (always private) |
| Recruiter | create assessments, invite, view and share reports, export candidates |
| Hiring manager | view candidates and reports, record outcomes |
| Team manager | Team mode |
| Organisation admin | everything in the org, including library, fairness, audit log, integrations, retention and data deletion; at least one per org |
| Platform admin | cross-tenant support views, item-bank review |

## Privacy and data rights

- **Consent** is recorded before an assessment starts; Team members consent separately, and raw answers are shared only if they opt in. Teams under five members see aggregates only.
- **Grow data is private** to the individual, enforced by RLS.
- **Export:** Settings → Your data downloads everything held about the person as JSON (`/api/me/export`).
- **Erasure:** a person can delete their account and all data (the last admin of an organisation with other members must hand over first). An organisation admin can delete one candidate's data from the report. The audit log keeps the fact of a deletion, not the content.
- **Retention:** each organisation sets a retention period (default 12 months). A nightly sweep deletes older Hire sessions, with "Run now" in organisation settings and `POST /api/cron/retention` for external schedulers.

## Fairness and validity

- **Voluntary equal-opportunity questions** (gender, age band, disability, first language; every question skippable) are offered after the assessment ends. They are stored in `fairness_response` keyed by session, invisible to the app role, and never shown to reviewers (D-026).
- **Fairness dashboard** (`/app/org/fairness`): role-fit distribution and selection rate per group. Groups under five people are suppressed, and the four-fifths rule flags any group below 80% of the highest group's selection rate. The cutoff ("Good or better" or "Partial or better") matches how the organisation uses results. Aggregation runs on the owner connection, and only aggregates leave it.
- **Outcome validity:** managers rate performance at 6 and 12 months on the report. The dashboard shows the correlation with role fit once there are 20 ratings, labelled "early version" before that.

## Integrations

Organisation admins add HTTPS webhooks for `candidate.started`, `candidate.completed` and `report.ready`. Each delivery is signed (`X-Aalim-Signature: sha256=<HMAC of the raw body>`) and logged with its result. Signing secrets are shown once and stored AES-256-GCM encrypted. Private, loopback and link-local addresses are refused, both at save time and after DNS resolution at delivery time, and redirects are not followed (SSRF). Candidate lists export as CSV, with formula injection neutralised.

## Security

- Headers on every response: Content-Security-Policy (no third-party origins, `frame-ancestors 'none'`), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` (microphone limited to this origin, for dictation), `Cross-Origin-Opener-Policy`, and HSTS over HTTPS.
- Links that carry a credential (`/a/`, `/r/`, `/team-invite/`) add `Referrer-Policy: no-referrer`, `noindex` and `no-store`.
- Auth rate limiting in production; tokens hashed at rest; webhook secrets encrypted at rest; RLS as defence in depth.
- Integrity signals (paste, tab switches, style shifts) are context for reviewers and never lower a score automatically.

## Internationalisation

- Locale: cookie → profile (synced at sign-in) → `Accept-Language`. `<html lang dir>` set on the server.
- Layout uses logical properties only, so Arabic mirrors without overrides. Directional icons use `.flip-rtl`; numeric ranges and identifiers are isolated (`<bdi dir="ltr">`).
- Numerals are a separate setting (`latn` default, `arab` optional), applied through `Intl` with `-u-nu-` (D-007).
- User-authored and generated text uses `dir="auto"`. Framework, bank items and worlds are stored as `{ en, ar }`.

## Design system

The identity rests on two signatures, both taken from how Aalim works:

- **The narrowing range.** Every estimate is drawn as a band on the 1–5 scale that tightens as evidence comes in, with a dot for the estimate and a tick for the level the role expects (`RangeScale`, `LevelMeter`). It appears in the logo mark, the landing hero (the page's one animation), the report verdict and every skill row.
- **The evidence highlighter.** The candidate's verbatim words are marked in saffron (`.evidence-mark`), like a reviewer's highlighter. Saffron is used for evidence and the brand mark only, never as decoration.

Tokens live in `src/styles/tokens.css` (light and dark) and map to Tailwind utilities in `globals.css`:

- **Colour:** warm stone neutrals; one indigo accent for actions, focus and selection; deep ink-indigo (`--ink`) for brand surfaces (verdict panel, chapter cards, auth panel); saffron (`--saffron`, `--highlight`) for evidence. Skill levels and role fit use a single-hue ramp, never red/green.
- **Type:** Alexandria (display: page and section titles, verdicts, big numbers), designed for Latin and Arabic together so both languages share one voice; IBM Plex Sans and IBM Plex Sans Arabic for the interface. Both are self-hosted. Arabic headings get extra line height for marks above and below.
- **Shape and depth:** radius 8 (controls), 12 (cards), 20 (brand panels). One raised shadow per page for the primary panel; borders elsewhere.
- **Motion:** 150–250 ms ease-out for responses to actions; one orchestrated moment per page at most. Disabled under `prefers-reduced-motion`.
- **Labels:** sentence case throughout; no tracked-out capitals.

Contrast for every token pair (including ink and highlight) is asserted in `tests/unit/contrast.test.ts`. `tests/e2e/pages-a11y.spec.ts` runs axe on the landing, sign-in, Home and report in English light and Arabic dark; the gallery, candidate flow and admin pages have their own scans.

## Navigation

- A short sidebar (Home, Assessments, Teams, My development, Framework; Organisation, Platform admin, Settings). Grow, Organisation and Platform admin each have a sticky row of section tabs, so their sub-pages don't lengthen the sidebar.
- **Command menu** (⌘K / Ctrl+K, or Search in the sidebar): jump to any page, run common actions (new assessment, theme, language), and search candidates, roles, teams and people. Search runs through RLS and the viewer's permissions (`src/app/actions/search.ts`).
- **Home** answers "what needs me?": reports nobody has opened yet (from the audit log), people taking an assessment right now, each role's pipeline, and team progress.

## Build phases

| Phase | Scope | Status |
|---|---|---|
| 0 | Foundations: tokens, gallery, auth, orgs and roles, EN/AR + RTL, schema + RLS, framework | Done |
| 1–2 | Hire: JD analysis, worlds, item generation and guessability, scoring, candidate model, hypotheses and stress tests, all 11 item types, candidate flow, full report, PDF, sharing, comparison, integrity | Done |
| 3 | Grow: onboarding, baseline, practice gym, tracks, progress, coach, private data | Done |
| 4 | Team: consent, heatmap, gaps, leadership pipeline, pairing, team plan, small-team aggregates | Done |
| 5 | Hardening: fairness and validity, audit log, competency library, item-bank review, ATS webhooks, CSV export, data export and erasure, retention scheduling, security headers, spoken role-play, accessibility and transition-time checks | Done |
