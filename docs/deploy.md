# Going live

A step-by-step launch for Aalim, assuming no prior setup. Allow about half a day for the website. Payments, the legal review and the phone app are separate tracks you can run in parallel.

There are two ways to host it, both using the same container image (`Dockerfile`):

- **Option A, a platform** (Railway, Render, Fly.io, DigitalOcean App Platform): they run the container, the database and HTTPS for you. Easiest to operate.
- **Option B, your own server** with Docker Compose (`deploy/`): one Linux server runs everything, including HTTPS and nightly backups. Cheapest, and you control where the data lives.

## What you need

| Thing | Why | Example |
|---|---|---|
| A host for a long-running container | Background work (scoring, reports) runs inside the server unless you add Redis | Railway, Render, Fly.io, or a Linux server with Docker |
| PostgreSQL 16 | All data; you'll create two roles | The platform's Postgres, Neon, Supabase (Option B includes it) |
| An email provider with SMTP | Invitations, password resets, reports, reminders | Resend, Postmark, Amazon SES |
| A domain | Candidates and users open links on it | `aalim.yourcompany.com` |
| An Anthropic API key (recommended) | Real AI scoring, reports, scenarios and coaching; without it Aalim runs on its offline engine, which is coarser | console.anthropic.com |
| A Stripe account (to charge) | Subscriptions, invoices and tax | stripe.com |
| Error tracking (recommended) | Hear about failures before customers do | Sentry, or a Slack webhook |
| A lawyer's review | The privacy policy, terms and DPA are templates | |

Don't use a serverless-only host (for example Vercel on its own) unless you also run Redis and the worker elsewhere: in-process background jobs stop when a serverless request ends.

## Option A: a platform

### A1. Put the code on the main branch

Merge the development branch into `main` (via a pull request), then connect the platform to the repository so it deploys `main`. Choose **Dockerfile** as the build method if asked.

### A2. Create the database and its two roles

Aalim connects with two roles:
- **Owner** (`DATABASE_URL`): runs migrations and trusted system tasks.
- **Runtime** (`DATABASE_APP_URL`): a non-owner role, so row-level security keeps organisations apart.

On the new database, run this as an admin, with long random passwords (`openssl rand -hex 24`):

```sql
CREATE ROLE aalim LOGIN PASSWORD 'owner-password';
CREATE ROLE aalim_app LOGIN PASSWORD 'app-password';
CREATE DATABASE aalim OWNER aalim;
```

If your provider created the database and owner for you, create only `aalim_app`. The migrations grant it access.

### A3. Set the environment variables

Required:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://aalim:owner-password@HOST:5432/aalim?sslmode=require` |
| `DATABASE_APP_URL` | `postgresql://aalim_app:app-password@HOST:5432/aalim?sslmode=require` |
| `BETTER_AUTH_SECRET` | 32+ random characters: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://aalim.yourcompany.com` |
| `APP_URL` | the same URL (links in emails, PDFs and exports) |
| `SMTP_URL` | your provider's SMTP URL, e.g. `smtps://resend:API_KEY@smtp.resend.com:465` |
| `MAIL_FROM` | `Aalim <hello@yourcompany.com>` (a sender your provider has verified) |
| `CRON_SECRET` | another random string: `openssl rand -hex 24` |

Recommended: `ANTHROPIC_API_KEY`, `SENTRY_DSN` (or `ERROR_WEBHOOK_URL`), and your company details for the legal pages (`LEGAL_ENTITY_NAME` and friends). Payments need the `STRIPE_*` variables. Every optional setting is listed, with its default, in `.env.example` and in [Settings reference](#settings-reference) below.

### A4. Service settings

| Setting | Value |
|---|---|
| Build | the repository's `Dockerfile` |
| Release / pre-deploy command | `npx prisma migrate deploy` |
| Port | `3000` |
| Health check path | `/api/health` |

The image includes headless Chromium, so **Export PDF** works. If you build without the Dockerfile (Nixpacks, Heroku-style buildpacks), use build `npm ci && npm run db:generate && npm run build && npx playwright-core install --with-deps --only-shell chromium` and start `npm run start -- -p $PORT`; without Chromium, Export PDF falls back to the browser's own print-to-PDF.

### A5. Seed the framework, once

From the platform's shell or a one-off job:

```bash
npm run db:seed
```

In production this loads only the competency framework, role families and tracks. Never run `npm run db:seed:demo` in production: it creates demo accounts with a published password.

### A6. Point the domain

- Add the domain in the platform's settings and create the DNS record it gives you; HTTPS is issued automatically.
- Make sure `BETTER_AUTH_URL` and `APP_URL` match it exactly.
- Open `https://aalim.yourcompany.com/api/health`: you should see `"status":"ok"`.

### A7. Set up email

- In your email provider, verify the sending domain by adding its SPF and DKIM DNS records, and ideally DMARC.
- Test with a password reset to your own address.

### A8. Schedule the two jobs

Either use the platform's cron feature (or cron-job.org, GitHub Actions):

```bash
# nightly: retention sweep (deletes data past each organisation's retention period)
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://aalim.yourcompany.com/api/cron/retention
# hourly, at minute 0: opt-in Grow reminders
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://aalim.yourcompany.com/api/cron/reminders
```

or add a second, small service from the same image with the command `node scripts/scheduler.mjs` and `SCHEDULER_TARGET=https://aalim.yourcompany.com` (plus `CRON_SECRET`). It calls both on schedule.

### A9. (When you grow) add Redis and a worker

Set `REDIS_URL` and add another service from the same image with the command `npm run worker`. Jobs then become durable and retried, and the web server stays light.

## Option B: your own server with Docker Compose

You need a Linux server (2 vCPU and 4 GB of memory is plenty to start) with Docker installed, ports 80 and 443 open, and a DNS `A` record for your domain pointing at it. Choose the server's region with your customers' data-location expectations in mind.

1. Copy the repository to the server (`git clone`, then check out `main`).
2. Fill in the settings:
   ```bash
   cd deploy
   cp env.example .env
   ```
   Set `DOMAIN`, the two database passwords, `BETTER_AUTH_SECRET`, `CRON_SECRET`, email and (optionally) `ANTHROPIC_API_KEY`. Use `openssl rand -hex 32` for secrets. Add any optional setting from `.env.example` to the same file.
3. Start everything:
   ```bash
   docker compose up -d --build
   ```
   This starts Postgres (with both roles), the app (it applies migrations on start), the scheduler for the two jobs, nightly backups into `deploy/backups/`, and Caddy, which gets the HTTPS certificate.
4. Seed the framework, once:
   ```bash
   docker compose exec app npm run db:seed
   ```
5. Open `https://your-domain/api/health`.

To update later: `git pull && docker compose up -d --build`. To add Redis and the worker: put `REDIS_URL=redis://redis:6379` in `deploy/.env` and run `docker compose --profile scale up -d`.

## Payments (Stripe)

Billing stays off, and everything is unlimited, until `STRIPE_SECRET_KEY` is set. Do this first in Stripe's **test mode**, then repeat with live keys.

1. **Products and prices.** In Stripe, create two products, *Starter* and *Growth*, each with a monthly and (optionally) a yearly recurring price. Prices and allowances shown on the site come from `src/lib/billing/plans.ts`; keep them in step with Stripe.
2. **Keys and price IDs.** Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER_MONTHLY`, `STRIPE_PRICE_STARTER_YEARLY`, `STRIPE_PRICE_GROWTH_MONTHLY` and `STRIPE_PRICE_GROWTH_YEARLY`. Leave the yearly ones empty to offer monthly only.
3. **Webhook.** Add an endpoint at `https://your-domain/api/billing/webhook` with the events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` and `invoice.payment_failed`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
4. **Customer portal.** In Stripe's billing portal settings, allow updating payment methods, viewing invoices, switching between your plans and cancelling.
5. **Tax.** If you charge tax (VAT and similar), turn on Stripe Tax for your registrations and set `STRIPE_AUTOMATIC_TAX=on`. Checkout then collects addresses and tax IDs.
6. **Enterprise.** Set `SALES_EMAIL` for the "Talk to us" button. A platform admin sets a custom allowance on the organisation's billing record.
7. **Test** with card `4242 4242 4242 4242`: subscribe from **Organisation → Billing**, check the plan shows as active, open the portal, and cancel.

New organisations start a 14-day trial with 5 candidate invitations. When a plan runs out, only *new* invitations stop: anyone already invited can always finish, and reports, exports and data rights stay available.

## AI

1. Set `ANTHROPIC_API_KEY`. `AALIM_MODEL` overrides the default model.
2. Run the smoke test once. It makes a handful of real calls, checks the results and prints the cost per call and an estimate per assessment:
   ```bash
   npm run ai:smoke                       # Option A: from the platform's shell
   docker compose exec app npm run ai:smoke   # Option B
   ```
3. Set monthly spending caps (USD): `AI_BUDGET_ORG_MONTHLY_USD` (each organisation, default 100; a paid plan sets its own), `AI_BUDGET_PERSONAL_MONTHLY_USD` (all personal Grow use together, default 200) and optionally `AI_BUDGET_TOTAL_MONTHLY_USD` (everything). Organisation admins get an email at 80% and 100%. Past the cap, new work runs on the offline engine; an assessment already scored by the model finishes on it.
4. Set a matching monthly limit in the Anthropic console as a final backstop.

## Legal and trust

The site has a privacy policy (`/privacy`), terms (`/terms`), "How Aalim uses AI" (`/ai`) and a security page (`/security`), in English and Arabic. Until `LEGAL_ENTITY_NAME` is set they show a "draft" notice, so placeholders can't go live unnoticed.

1. Set your company details: `LEGAL_ENTITY_NAME`, `LEGAL_ADDRESS`, `CONTACT_EMAIL`, `PRIVACY_EMAIL`, `SECURITY_EMAIL`, `GOVERNING_LAW`, and your providers: `HOSTING_PROVIDER`, `HOSTING_REGION`, `DATABASE_PROVIDER`, `EMAIL_PROVIDER`.
2. Have a lawyer review the pages and the data processing agreement template. `docs/legal/README.md` lists what to check and the regimes that may apply (for example GDPR and the EU AI Act, UK GDPR, New York City's rules on automated employment decision tools, and Saudi, UAE and Jordanian data protection laws).
3. In each organisation's settings, set the retention period (default 12 months).

## Monitoring

- **Uptime:** point a monitor (Better Stack, UptimeRobot, the platform's own) at `/api/health`. It returns 503 if the database is unreachable, and reports which AI, email and billing modes are on (never secrets).
- **Errors:** set `SENTRY_DSN` to send server errors to Sentry, and/or `ERROR_WEBHOOK_URL` to post a one-line summary to Slack or Teams (an incoming-webhook URL). Private links are masked in reports; request headers and cookies are never sent.
- **Logs:** errors are also written as one JSON line each to the server log.
- **Versions:** set `APP_VERSION` (for example the git commit) to see which build is running in `/api/health`; Railway and Render are detected automatically.

## Backups

- **Managed Postgres (Option A):** turn on daily backups and point-in-time recovery in the provider's settings.
- **Option B:** a compressed dump is written to `deploy/backups/` every night and kept for 14 days (`BACKUP_KEEP_DAYS`). Copy that folder off the server (object storage, or your provider's volume snapshots).
- **Test a restore** before launch, into a scratch database:
  ```bash
  gunzip -c aalim-2026-12-01.sql.gz | psql "postgresql://aalim:PASSWORD@HOST:5432/aalim_restore_test"
  ```

## Create your organisation and the first admin

1. Open the site, sign up, choose **For my organisation**, and name it. You become its admin.
2. To unlock platform tools (item review, admin), make yourself a platform admin once:
   ```sql
   UPDATE "user" SET "isPlatformAdmin" = true WHERE email = 'you@yourcompany.com';
   ```
3. Try it end to end before inviting anyone real:
   - create a role from a job description;
   - invite yourself;
   - take the assessment on a phone;
   - read the report, export the PDF and record a decision;
   - try Grow from a second account;
   - if billing is on, subscribe with a test card.

## (Optional) Publish the phone app

The candidate app is in `mobile/` (Expo). You need an Expo account, an Apple Developer account (yearly fee) and a Google Play developer account (one-off fee).

1. In `mobile/`, set:
   - `EXPO_PUBLIC_API_URL=https://aalim.yourcompany.com`;
   - `APP_LINK_HOST=aalim.yourcompany.com`, so invitation links open the app;
   - your own bundle identifier and package name in `app.config.ts`.
2. Build and submit with Expo's EAS: `npx eas build --platform all`, then `npx eas submit`. This uploads your code to Expo's build service.
3. For links to open the app, serve Apple's `apple-app-site-association` and Android's `assetlinks.json` from the domain. Expo's universal-links guide has the exact files.
4. The stores ask for a privacy policy URL (`https://your-domain/privacy`), screenshots and a data-safety form; the privacy policy describes what the app collects.

Until then, candidates use the website on their phones, which already uses the swipe deck.

## Launch checklist

- [ ] `/api/health` is `ok` on the real domain, over HTTPS
- [ ] A password reset email arrives, and isn't in spam (SPF, DKIM, DMARC)
- [ ] `npm run ai:smoke` passes; budgets and the Anthropic console limit are set
- [ ] Stripe: test subscription, portal and cancellation work; webhook shows deliveries succeeding; live keys swapped in
- [ ] Company details set; lawyer has reviewed privacy, terms and the DPA
- [ ] Uptime monitor and error reporting are on, and a test error reached you
- [ ] Backups are on, and one restore has been tried
- [ ] The scheduled jobs ran (check the scheduler's or cron's log)
- [ ] A pilot with a few internal volunteers, reports read together with a hiring manager
- [ ] For the first week, watch logs, email delivery, AI spend and Stripe

## Settings reference

Everything optional, with its default. Required settings are in step A3.

| Variable | Default | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | none (offline engine) | Turns on the AI |
| `AI_PROVIDER` | `auto` | `anthropic`, `offline` or `auto` (uses the key if set) |
| `AALIM_MODEL` | built-in default | Model for every AI call |
| `AI_BUDGET_ORG_MONTHLY_USD` | `100` | Each organisation's monthly AI cap (a paid plan sets its own) |
| `AI_BUDGET_PERSONAL_MONTHLY_USD` | `200` | All personal Grow use together |
| `AI_BUDGET_TOTAL_MONTHLY_USD` | none | Ceiling for everything |
| `STRIPE_SECRET_KEY` | none (billing off) | Turns on billing |
| `STRIPE_WEBHOOK_SECRET` | none | Verifies Stripe's webhook calls |
| `STRIPE_PRICE_STARTER_MONTHLY`, `STRIPE_PRICE_STARTER_YEARLY`, `STRIPE_PRICE_GROWTH_MONTHLY`, `STRIPE_PRICE_GROWTH_YEARLY` | none | Stripe price IDs; yearly ones are optional |
| `STRIPE_AUTOMATIC_TAX` | off | `on` to calculate tax and collect tax IDs at checkout |
| `SALES_EMAIL` | `CONTACT_EMAIL` | Enterprise "Talk to us" address |
| `LEGAL_ENTITY_NAME`, `LEGAL_ADDRESS`, `GOVERNING_LAW` | draft placeholders | Company details on the legal pages |
| `CONTACT_EMAIL`, `PRIVACY_EMAIL`, `SECURITY_EMAIL` | placeholders | Contact addresses on the legal and trust pages |
| `HOSTING_PROVIDER`, `HOSTING_REGION`, `DATABASE_PROVIDER`, `EMAIL_PROVIDER` | placeholders | Subprocessors listed in the privacy policy |
| `SENTRY_DSN` | none | Sends server errors to Sentry |
| `ERROR_WEBHOOK_URL` | none | Posts error summaries to Slack or Teams |
| `APP_VERSION` | detected or `dev` | Shown in `/api/health` |
| `REDIS_URL` | none (in-process jobs) | Durable background jobs; run `npm run worker` |
| `WORKER_CONCURRENCY` | `4` | Jobs the worker runs at once |
| `BETTER_AUTH_TRUSTED_ORIGINS` | none | Extra allowed origins, comma-separated |
| `CHROMIUM_PATH` | Playwright's Chromium | Browser used for PDF export, if not the bundled one |
| `MIGRATE_ON_START` | off | `1` to apply migrations when the container starts |
| `DESIGN_GALLERY` | off | `on` to show the internal component gallery at `/design` in production |
| `AALIM_WEBHOOK_SECRET` | none | Signs outgoing webhooks to your own systems |
