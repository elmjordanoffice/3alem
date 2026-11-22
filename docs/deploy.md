# Going live

A step-by-step launch for Aalim. It assumes no prior setup. Allow about half a day for the website; the phone app is a separate, optional track (step 11).

## What you need

| Thing | Why | Example |
|---|---|---|
| A host that keeps a Node server running | Background work (scoring, reports) runs inside the server unless you add Redis | Railway, Render, Fly.io, or any Linux VM |
| PostgreSQL 16 | All data; you'll create two roles | The host's managed Postgres, Neon, Supabase |
| An email provider with SMTP | Invitations, password resets, reports, reminders | Resend, Postmark, Amazon SES |
| A domain | Candidates and users open links on it | `aalim.yourcompany.com` |
| An Anthropic API key (recommended) | Real AI scoring, reports, scenarios and coaching; without it Aalim runs offline and coarser | console.anthropic.com |

Don't use a serverless-only host (for example Vercel on its own) unless you also run Redis and the worker elsewhere: in-process background jobs stop when a serverless request ends.

## 1. Put the code on the main branch

Merge the development branch into `main` (via a pull request), then connect the host to the repository so it deploys `main`.

## 2. Create the database and its two roles

Aalim connects with two roles:
- **Owner** (`DATABASE_URL`): runs migrations and trusted system tasks.
- **Runtime** (`DATABASE_APP_URL`): a non-owner role, so row-level security isolates organisations.

On the new database, run this as an admin, with long random passwords:

```sql
CREATE ROLE aalim LOGIN PASSWORD 'owner-password';
CREATE ROLE aalim_app LOGIN PASSWORD 'app-password';
CREATE DATABASE aalim OWNER aalim;
```

If your provider created the database and owner for you, create only `aalim_app`. The migrations grant it access.

## 3. Set the environment variables on the host

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://aalim:owner-password@HOST:5432/aalim?sslmode=require` |
| `DATABASE_APP_URL` | `postgresql://aalim_app:app-password@HOST:5432/aalim?sslmode=require` |
| `BETTER_AUTH_SECRET` | 32+ random characters: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://aalim.yourcompany.com` |
| `APP_URL` | the same URL (links in emails and exports) |
| `SMTP_URL` | your provider's SMTP URL, e.g. `smtps://resend:API_KEY@smtp.resend.com:465` |
| `MAIL_FROM` | `Aalim <hello@yourcompany.com>` (a sender your provider has verified) |
| `ANTHROPIC_API_KEY` | your key (leave unset to run offline) |
| `CRON_SECRET` | another random string: `openssl rand -hex 24` |
| `NEXT_TELEMETRY_DISABLED` | `1` |

Optional: `REDIS_URL` (see step 9) and `AALIM_MODEL` (to override the model).

## 4. Configure build, release and start

| Step | Command |
|---|---|
| Build | `npm ci && npm run db:generate && npm run build` |
| Release (before each deploy goes live) | `npm run db:deploy` |
| Start | `npm run start -- -p $PORT` |

## 5. Seed the framework, once

From the host's shell (or once as a one-off job), with `NODE_ENV=production`:

```bash
npm run db:seed
```

In production this loads only the competency framework, role families and tracks. Never run `npm run db:seed:demo` in production: it creates demo accounts with a published password.

## 6. Point the domain

- Add the domain in the host's settings and create the DNS record it gives you; HTTPS is issued automatically.
- Make sure `BETTER_AUTH_URL` and `APP_URL` match it exactly.

## 7. Set up email

- In your email provider, verify the sending domain by adding its SPF and DKIM DNS records, and ideally DMARC.
- Test with a password reset to your own address.

## 8. Schedule the two jobs

Use the host's cron feature, or any scheduler such as cron-job.org or GitHub Actions:

```bash
# nightly: retention sweep
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://aalim.yourcompany.com/api/cron/retention
# hourly, at minute 0: opt-in Grow reminders
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://aalim.yourcompany.com/api/cron/reminders
```

## 9. (When you grow) add Redis and a worker

Set `REDIS_URL` and add a second service from the same repository with the start command `npm run worker`. Jobs then become durable and retried, and the web server stays light.

## 10. Create your organisation and the first admin

1. Open the site, sign up, choose **For my organisation**, and name it. You become its admin.
2. To unlock platform tools (item review, admin), make yourself a platform admin once:
   ```sql
   UPDATE "user" SET "isPlatformAdmin" = true WHERE email = 'you@yourcompany.com';
   ```
3. Smoke test before inviting anyone real:
   - create a role from a job description;
   - invite yourself;
   - take the assessment on a phone;
   - read the report and record a decision;
   - try Grow from a second account.

## 11. (Optional) Publish the phone app

The candidate app is in `mobile/` (Expo). You need an Expo account, an Apple Developer account (yearly fee) and a Google Play developer account (one-off fee).

1. In `mobile/`, set:
   - `EXPO_PUBLIC_API_URL=https://aalim.yourcompany.com`;
   - `APP_LINK_HOST=aalim.yourcompany.com`, so invitation links open the app;
   - your own bundle identifier and package name in `app.config.ts`.
2. Build and submit with Expo's EAS: `npx eas build --platform all`, then `npx eas submit`. This uploads your code to Expo's build service.
3. For links to open the app, serve Apple's `apple-app-site-association` and Android's `assetlinks.json` from the domain. Expo's universal-links guide has the exact files.

Until then, candidates use the website on their phones, which already uses the swipe deck.

## 12. Before inviting real candidates

- Publish a privacy notice and terms that cover assessment data, AI use and retention. The candidate pages link to "How AI is used".
- In each organisation's settings, set the retention period (default 12 months).
- Run a pilot with a few internal volunteers, and read their reports together with a hiring manager.
- Watch for a week:
  - the host's logs and error rates;
  - email delivery in the provider's dashboard;
  - Anthropic usage and costs in its console.
