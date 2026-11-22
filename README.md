# Aalim (عالم)

Adaptive, AI-driven skills assessment and training. One engine, three modes:

- **Hire**: assess candidates against a job description through a realistic "week at a fictional company", with verbatim evidence for every score.
- **Grow**: individuals find their level, practise with honest feedback, follow tracks and talk to a coach. Their data stays theirs.
- **Team**: with each member's consent, managers see strengths, gaps, leadership readiness and pairing suggestions.

People make hiring decisions. Aalim informs them and never rejects anyone automatically.

> **Status: complete product.** All phases of the brief are built: foundations, the adaptive engine, full Hire (role-play, inbox, design and technical tasks, hypotheses and stress tests, report, PDF, sharing, comparison), Grow, Team, and hardening (fairness monitoring, outcome validity, audit log, competency library, item-bank review, ATS webhooks, data export and deletion, retention, security headers, spoken role-play). See [docs/architecture.md](docs/architecture.md).

## Quick start

Requirements: Node 22+, PostgreSQL 16. Redis is optional.

```bash
cp .env.example .env            # then set BETTER_AUTH_SECRET (and ANTHROPIC_API_KEY for real AI)
```

Create the two database roles (owner for migrations, non-owner runtime role so row-level security applies):

```bash
psql -U postgres -c "CREATE ROLE aalim LOGIN PASSWORD 'aalim' CREATEDB" \
  -c "CREATE ROLE aalim_app LOGIN PASSWORD 'aalim_app'" \
  -c "CREATE DATABASE aalim OWNER aalim" -c "CREATE DATABASE aalim_test OWNER aalim"
```

```bash
npm install
npm run db:deploy && npm run db:generate && npm run db:seed
npm run db:seed:demo             # optional: 18 simulated candidates and a 6-person team, run through the real pipeline
npm run dev                      # http://localhost:3000
```

Demo accounts (password `aalim-demo-2026`):

| Account | Sees |
|---|---|
| `orgadmin@aalim.dev` | Everything in Northwind Logistics: assessments, reports, fairness, audit log, integrations, library |
| `recruiter@aalim.dev` | Assessments, candidates, reports, sharing |
| `manager@aalim.dev` | Candidates and reports (hiring manager) |
| `team@aalim.dev` | The "Regional Operations" team |
| `candidate@aalim.dev` | Grow (personal development) |
| `admin@aalim.dev` | Platform admin and item-bank review |

A ready candidate link: `/a/demo-candidate-token-0001`. Development email is written to `.mail/`. The component gallery is at **/design**.

### AI

With `ANTHROPIC_API_KEY` set, Claude generates worlds, items and role-play replies, scores answers, writes reports and coaches. Without a key (or with `AI_PROVIDER=offline`), Aalim runs fully offline: a curated bank of over 80 bilingual items, a calibrated rubric-and-habit scorer (D-048), template-written reports, and offline versions of the shortlist, job-description reader, coach and planning features (D-054). Offline scoring is coarser than a model's and never reports more than 0.75 confidence, so use a key for real assessments.

In a Claude Code cloud environment, add the key as an environment variable in the environment's settings; network secrets can't be used for Anthropic's API.

## Configuration

| Variable | Purpose |
|---|---|
| `DATABASE_URL` / `DATABASE_APP_URL` | Owner and runtime (RLS) connections |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` | Auth; the secret also derives the key that encrypts webhook secrets at rest |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Extra allowed origins (comma-separated) |
| `APP_URL` | Public base URL used in emails, webhooks and CSV exports (defaults to `BETTER_AUTH_URL`) |
| `ANTHROPIC_API_KEY` | Enables Claude. `AI_PROVIDER=offline` forces offline mode; `AALIM_MODEL` overrides the model |
| `REDIS_URL` | Moves background jobs to BullMQ; run `npm run worker` alongside the web server |
| `CRON_SECRET` | Lets an external scheduler `POST /api/cron/retention` (nightly) and `POST /api/cron/reminders` (hourly, for opt-in Grow reminders) |
| `CHROMIUM_PATH` | Chromium for PDF export, if not the Playwright default |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run worker` | BullMQ worker (scoring, item preparation, reports, nightly retention) when `REDIS_URL` is set |
| `npm run lint` / `typecheck` | ESLint, TypeScript |
| `npm test` | Unit tests, the 30-persona engine harness and row-level security integration tests (uses `aalim_test`) |
| `npm run test:e2e` | Playwright end-to-end and accessibility tests (needs `npm run build` first) |
| `npm run screenshots` | Every Phase 0 screen × light/dark × English/Arabic × desktop/phone → `screenshots/out/` |
| `npm run db:migrate` / `db:deploy` / `db:seed` / `db:seed:demo` | Prisma migrations, base seed, demo data |
| `npm run brand:assets` | Regenerate the logo files, PNGs, social images and in-app wordmark paths from the brand fonts |

## Mobile app

`mobile/` is the native candidate app (Expo, React Native): the same week of scenes as a vertical deck of full-screen pages, in English and Arabic, light and dark, over the candidate API (`/api/m/:token`). See [mobile/README.md](mobile/README.md) to run it in Expo Go or a browser.

## Docs

- [Brand](docs/brand.md): name, platform, voice, logo, colour, type and assets (the live, bilingual brand book is at **/brand**)
- [Design references](docs/design-references.md): the eleven products studied for the current design, what each teaches, and the direction taken
- [Product patterns](docs/product-patterns.md): references from learning, AI-interviewer, hiring and people-analytics products, the design decisions taken from them, RTL rules and the first-version screen list
- [Architecture](docs/architecture.md): stack, engine, jobs, tenancy and RLS, privacy, security, i18n, design system
- [Decisions log](docs/decisions.md): every choice the brief left open, and why
- [Prompt catalogue](docs/prompt-catalogue.md): the AI agents, their contracts and versioning
