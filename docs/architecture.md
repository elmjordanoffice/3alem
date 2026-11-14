# Architecture

## Stack

| Layer | Choice | Notes |
|---|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript (strict, `noUncheckedIndexedAccess`) | Server components by default; client components only for interaction |
| Styling | Tailwind CSS 4 with CSS-variable tokens (`src/styles/tokens.css`) | shadcn/ui pattern: Radix primitives restyled in `src/components/ui` |
| i18n | next-intl 4, English + Arabic, full RTL via logical properties | No locale in URLs (D-006) |
| Database | PostgreSQL 16 + Prisma 7 (driver adapter `@prisma/adapter-pg`) | Row-level security per organisation |
| Auth | Better Auth (email + password, DB sessions) | D-002 |
| Charts | Recharts 3 | Each chart has a screen-reader table |
| Editor | Tiptap 3 (bold, italic, lists) | Plain text is what gets scored |
| Tests | Vitest (unit + DB integration), Playwright + axe-core (e2e, a11y) | |

Planned for Phase 1: Redis + BullMQ for scoring/report jobs, the AI provider interface (Claude by default, `mock` for tests), Sentry.

## Folder map

```
prisma/                 schema, migrations (incl. RLS), seed
messages/               en.json, ar.json
src/app/                routes: / (landing), (auth)/*, onboarding, app/* (signed in), design (gallery)
src/app/actions/        server actions (preferences, organisations)
src/components/ui/      design-system primitives
src/components/assessment/  candidate-facing components (editor, ranking, allocation, chat, documents, timer, progress)
src/components/report/  level meter, skill chip, evidence card, radar, bars, heatmap
src/lib/auth/           Better Auth config, viewer/session helpers, roles & permissions
src/lib/db*.ts          system client + withTenant() for RLS
src/lib/framework/      competency framework types and built-in data (EN + AR)
src/lib/assessment/     Zod contracts shared by the AI and the UI (materials)
tests/unit, tests/integration, tests/e2e
```

## Tenancy and row-level security

Two Postgres roles:

- **`aalim`** (owner) runs migrations and trusted system work: auth, seeding, background jobs, AI call logging, platform-admin views. RLS policies are not `FORCE`d, so the owner bypasses them.
- **`aalim_app`** (runtime, non-owner) is used for all tenant data. Every request goes through `withTenant({ userId, organizationId }, tx => …)`, which opens a transaction and sets `app.org_id` and `app.user_id` with `set_config(…, true)` (transaction-local, so pooled connections can't leak context).

Policies (`prisma/migrations/*_row_level_security`):

| Tables | Rule |
|---|---|
| `organization` | the active org, or orgs you're a member of |
| `membership` | the active org's members, plus your own memberships |
| templates, invitations, teams, audit log | `organizationId = app.org_id` |
| sessions, items, responses, scores, snapshots, hypotheses, reports, integrity events | the owning org **or** the person assessed (`subjectUserId`) |
| competency domains/competencies, tracks | built-in rows (`organizationId IS NULL`) readable by all; org rows by that org |
| development plans, practice sessions, track enrolments | owner only (`userId = app.user_id`): Grow data is private |
| `ai_call_log` | RLS on, no policy: invisible to the app role |

`organizationId` and `subjectUserId` are denormalised onto child tables so policies stay simple and fast. `tests/integration/rls.test.ts` proves isolation with no `where` clauses.

Permissions are also checked in application code (`src/lib/auth/roles.ts`): RLS stops cross-tenant leaks; roles decide what a member may do inside their tenant.

## Roles

| Role | Where it lives | Can |
|---|---|---|
| Candidate / Individual | every signed-in person | take assessments, use Grow |
| Recruiter | `Membership.roles` | create assessments, invite, view and share reports |
| Hiring manager | `Membership.roles` | view candidates and reports |
| Team manager | `Membership.roles` | Team mode |
| Organisation admin | `Membership.roles` | everything in the org; at least one per org is enforced |
| Platform admin | `User.isPlatformAdmin` (never client-settable) | cross-tenant support views |

## Auth

Better Auth with the Prisma adapter, sessions in Postgres (`auth_session`), 14-day expiry, password reset by email (dev transport writes to `.mail/`), rate limiting on in production. The session carries `activeOrganizationId`; `getViewer()` resolves memberships once per request.

## Internationalisation

- Locale: cookie → profile (synced at sign-in) → `Accept-Language`. `<html lang dir>` set on the server.
- Layout uses logical properties only (`ms-`, `pe-`, `start-`, `inset-inline-start`), so Arabic mirrors without overrides. Directional icons use `.flip-rtl`.
- Numerals are a separate setting (`latn` default, `arab` optional) applied through `Intl` with `-u-nu-` (D-007). ICU plurals receive a pre-formatted `{formatted}` value for the same reason.
- User-authored and generated text uses `dir="auto"`.
- Framework content is stored as `{ en, ar }` JSON.

## Design system

Tokens in `src/styles/tokens.css` (light and `.dark`), mapped to Tailwind utilities in `globals.css`. Rules:

- Warm stone neutrals; one indigo accent for primary actions, focus and current selection only.
- Skill levels: a 5-step single-hue ramp with per-step foreground colours. Never red/green.
- Type 12/14/16/20/24/32/40; Inter (Latin) and IBM Plex Sans Arabic, self-hosted.
- Radius 8 (controls) / 12 (cards); one shadow, for popovers.
- Motion 150–250 ms ease-out, disabled under `prefers-reduced-motion`.
- Contrast for every text/background pair is asserted in `tests/unit/contrast.test.ts`.

The gallery at `/design` shows every component in both themes and languages; `tests/e2e/gallery.spec.ts` renders it in all four combinations and runs axe (WCAG 2.2 AA).

## Data model

See `prisma/schema.prisma`. Core entities: Organization, User, Membership, CompetencyDomain, Competency, AssessmentTemplate, TemplateSkillWeight, Invitation, AssessmentSession, ScenarioWorld, Item, Response, ItemScore, CandidateModelSnapshot, Hypothesis, Report, ReportShareLink, IntegrityEvent, DevelopmentPlan, Track, TrackEnrollment, PracticeSession, Team, TeamMember, Consent, AuditLog, AiCallLog.

Session lifecycle: `INVITED → STARTED → IN_PROGRESS ⇄ PAUSED → COMPLETED → SCORED → REPORTED`.

Item content (candidate-visible) and rubric (never sent to the client) are separate columns. Responses carry a client-generated `clientId` so offline answers sync idempotently.

## Build phases

| Phase | Scope | Status |
|---|---|---|
| 0 | Foundations: tokens, gallery, auth, orgs & roles, EN/AR + RTL, schema + RLS, framework | **Done** |
| 1 | Core engine (Hire MVP): JD Analyst, World Builder, Item Generator, Guessability Checker, Scorer, Candidate Model, stop rules, candidate flow, basic report, 30 personas | Next |
| 2 | Full Hire: role-play, inbox, design/technical tasks, consequence chains, hypotheses & stress tests, full report + PDF, comparison, recruiter dashboard, integrity logging | |
| 3 | Grow | |
| 4 | Team | |
| 5 | Hardening: fairness dashboard, audit UI, WCAG 2.2 AA audit, performance, security review, spoken role-play, ATS integrations | |
