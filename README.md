# Aalim (عالم)

Adaptive, AI-driven skills assessment and training. One engine, three modes:

- **Hire**: assess candidates against a job description, with evidence for every score.
- **Grow**: individuals find their level and practise with honest feedback. Their data stays theirs.
- **Team**: with consent, managers see strengths, gaps and leadership readiness.

People make hiring decisions. Aalim informs them and never rejects anyone automatically.

> **Status: Phase 0 (Foundations).** Design system, auth, organisations and roles, English/Arabic with RTL, the full database schema with row-level security, and the built-in competency framework. The assessment engine is Phase 1. See [docs/architecture.md](docs/architecture.md#build-phases).

## Quick start

Requirements: Node 22+, PostgreSQL 16.

```bash
cp .env.example .env            # then set BETTER_AUTH_SECRET
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
npm run dev                      # http://localhost:3000
```

Demo accounts (password `aalim-demo-2026`): `orgadmin@aalim.dev`, `recruiter@aalim.dev`, `manager@aalim.dev`, `team@aalim.dev`, `candidate@aalim.dev`, and the platform admin `admin@aalim.dev`. Development email (password resets) is written to `.mail/`.

The component gallery is at **/design**. Switch theme, language and numerals from its header.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint, TypeScript |
| `npm test` | Unit tests + row-level security integration tests (uses `aalim_test`) |
| `npm run test:e2e` | Playwright end-to-end tests (needs `npm run build` first) |
| `npm run screenshots` | Every screen × light/dark × English/Arabic × desktop/phone → `screenshots/out/` |
| `npm run db:migrate` / `db:deploy` / `db:seed` | Prisma migrations and seed |

## Docs

- [Architecture](docs/architecture.md): stack, tenancy and RLS, auth, i18n, design system, data model, build phases
- [Decisions log](docs/decisions.md): every choice the brief left open, and why
- [Prompt catalogue](docs/prompt-catalogue.md): the AI agents, their contracts and versioning
