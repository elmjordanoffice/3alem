# Legal and trust pages

Aalim publishes four public pages (D-067):

| Page | Route | What it covers |
|---|---|---|
| Privacy policy | `/privacy` | Roles (processor for organisations' candidate and team data, controller for accounts and personal Grow), what is collected for each kind of user, purposes, legal bases, AI processing, sharing and subprocessors, transfers, retention, security, cookies, rights, candidates, children, contact |
| Terms of service | `/terms` | The agreement with business customers, accounts and admins, acceptable use and fairness rules, customer data, confidentiality, AI outputs, subscriptions, suspension, IP, warranties, liability, changes, governing law, and a section for candidates and Grow individuals |
| How Aalim uses AI | `/ai` | Plain-language explainer of every AI step, what AI never does, human oversight, accommodations, fairness monitoring, spending caps and the offline engine, the provider, validity status, questions and human review |
| Security | `/security` | The protections that exist in the product, where data is stored, how to report a vulnerability |

They are linked from the landing footer, the sign-up form (consent line), the candidate's start screen and "How AI is used" sheet, and the foot of Settings.

These texts are a **starting draft written from how the product actually works. They are not legal advice.** Have them reviewed by a lawyer qualified where you, your customers and their candidates are, before launch.

## How it works

- **Copy** lives in the `legal` namespace of `messages/en.json` and `messages/ar.json`. Each document is an array of sections (`{ id, title, blocks }`); a block is a paragraph, `{ "h" }` (subheading), `{ "list" }`, `{ "steps" }`, `{ "note" }` or `{ "table" }`. The pages read them with `t.raw`, so strings are not ICU messages. Three marks are supported inside strings: `{name}` (a company detail), `[label](/path)` (a link) and `**words**` (emphasis). See `src/components/legal/rich.tsx`.
- **Both languages must keep the same shape** (same sections, same number of list items), or `tests/unit/i18n.test.ts` fails. Section `id`s are the anchors (`/privacy#candidates`), so keep them identical in both files.
- **Last updated:** change `LEGAL_LAST_UPDATED` in `src/lib/legal.ts` whenever the text changes. It drives the date on every page and `lastModified` in the sitemap.
- **Only the link labels** (`legal.links`) are sent to the browser; the long texts render on the server (see the root layout).
- **Company details** come from environment variables, read at request time. Anything unset is shown as a highlighted placeholder, never as a made-up value.

## What to fill in

Set these on the host (none are secrets):

| Variable | Used for | If unset |
|---|---|---|
| `LEGAL_ENTITY_NAME` | The company that provides Aalim (privacy, terms) | Placeholder, **and** the draft notice on every legal page; public pages stay `noindex` |
| `LEGAL_ADDRESS` | Registered address | Placeholder |
| `CONTACT_EMAIL` | General contact, terms questions | Placeholder (no link) |
| `PRIVACY_EMAIL` | Privacy requests, candidate questions | Falls back to `CONTACT_EMAIL`, then a placeholder |
| `SECURITY_EMAIL` | Vulnerability reports | Falls back to `CONTACT_EMAIL`, then a placeholder |
| `GOVERNING_LAW` | Governing law and courts in the terms, e.g. `England and Wales` (read as "the laws of …" and "the courts of …") | Placeholder |
| `HOSTING_PROVIDER` | Subprocessor table, security page | Placeholder |
| `HOSTING_REGION` | Where the app and database run, e.g. `Frankfurt, Germany` (read as "hosted in …") | Placeholder |
| `EMAIL_PROVIDER` | Subprocessor table (the SMTP provider behind `SMTP_URL`) | Placeholder |
| `DATABASE_PROVIDER` | Subprocessor table, security page | Placeholder |

Optional Arabic versions: `LEGAL_ENTITY_NAME_AR`, `LEGAL_ADDRESS_AR`, `GOVERNING_LAW_AR` and `HOSTING_REGION_AR` are used on the Arabic pages when set (for example `إنجلترا وويلز`, `فرانكفورت، ألمانيا`); otherwise the English value appears in both languages. Provider names and email addresses are shown as written.

Already used elsewhere: `APP_URL` (robots.txt, sitemap, canonical links) and, optionally, `SENTRY_DSN` (adds Sentry to the subprocessor table when error monitoring is on). The AI provider (Anthropic) and payments (Stripe) are fixed in `src/lib/legal.ts`.

While `LEGAL_ENTITY_NAME` is unset, every legal page shows "Draft: complete the company details and have these reviewed by a lawyer before launch", and the public pages (home, sign-in, sign-up, brand and the four legal pages) carry `noindex`. Setting it is the signal that the texts are ready.

Also decide, and add to the texts if needed:

- A data protection officer, and an EU or UK representative, if the law requires one for you.
- The supervisory authority complaints should go to, if you want to name one.
- Whether you will sign the data processing agreement ([dpa-template.md](dpa-template.md)) with every customer or publish it.
- A support channel for candidates other than replying to the invitation email.

## Points the texts depend on

The pages describe the product as it is. The review that wrote them found four gaps; three were fixed in the product (D-068) and the texts now say so:

1. **AI request logs** (`ai_call_log`): the text of each request is cleared after 30 days (`AI_LOG_RETENTION_DAYS`), rows (cost and timing only) are deleted after 13 months, and logs that belong to an assessment, a Grow practice, a coach conversation or an organisation are deleted with it. *(Fixed.)*
2. **Organisation deletion:** an organisation's admin can delete it, with all its data, in Organisation settings; an account that is the only member of an organisation takes the organisation with it when deleted. *(Fixed.)*
3. **Candidate feedback** on the finish screen is stored at platform level with no link to the organisation, the session or the person, so it really is anonymous to the hiring team. *(Fixed.)*
4. **The retention sweep covers Hire assessments only.** Team assessments are kept until the member deletes their account or the organisation deletes them or itself; the retention table says so. Decide whether that suits your customers.
5. **Server log retention** depends on the host; the policy defers to it.
6. **Billing:** check the terms' wording on trials, renewal, refunds and price-change notice against the billing integration and your Stripe settings (D-066).

## What a lawyer should review

- **Privacy policy:** the controller and processor split; the legal bases; the treatment of equal-opportunity answers (disability is health data and other answers may be sensitive); international transfer mechanisms; the retention table; the age threshold (16); rights and response times; the statement about the AI provider's commercial terms; breach notification wording.
- **Terms:** limitation of liability and its exclusions; warranties; governing law, venue or arbitration; subscriptions, auto-renewal, trials, refunds and price-change notice (consumer rules differ for individuals buying Grow plans, for example cooling-off rights); suspension; IP and feedback; confidentiality; acceptable use, including the fairness rules and Team mode's ban on dismissals, ratings and pay decisions.
- **How Aalim uses AI:** whether the disclosures meet the transparency and notice duties that apply to AI in hiring where customers operate, and that every statement still matches the product.
- **Security:** the good-faith research statement ("we won't take legal action…").
- **DPA template:** all of it, including the breach notice period, audit rights, liability and the transfer clauses.

## Regimes that may apply (check with counsel)

Which laws apply depends on where you are established and where your customers, their candidates and Grow users are. This is a checklist of questions to raise, not a conclusion about any of them.

- **EU GDPR**: controller and processor roles and an Article 28 agreement; legal bases; special category data (equal-opportunity answers); the rules on decisions based solely on automated processing; whether a data protection impact assessment is needed; records of processing; an EU representative if you have no EU establishment; transfer mechanisms for providers outside the EU.
- **EU AI Act**: AI used for recruitment and selection, or to make decisions affecting work relationships such as evaluating people, is in the Act's high-risk categories. Check whether Aalim is in scope, whether you are a provider and customers deployers, which obligations apply (risk management, data governance, documentation, logging, human oversight, accuracy, transparency to people affected) and from when; and the transparency rules for AI that people interact with, such as the role-play colleagues.
- **UK GDPR and the Data Protection Act 2018**, including recent reforms to the automated decision-making rules and ICO guidance on AI in recruitment.
- **United States**: state and city laws on automated employment decision tools, such as **New York City Local Law 144** (a bias audit before use, a published summary and notices to candidates); Colorado's AI Act on high-risk AI systems, including in employment (check its current effective date); Illinois law on AI in employment decisions; California's privacy law (CCPA/CPRA, which covers applicant data) and its regulations on automated decision-making in employment; and federal anti-discrimination law (Title VII, ADA, ADEA), including accommodation duties.
- **Saudi Arabia**: the Personal Data Protection Law (PDPL) and its implementing and transfer regulations from SDAIA, including registration, data protection officer and cross-border transfer requirements, and any sector rules for customers.
- **United Arab Emirates**: the federal PDPL (Federal Decree-Law No. 45 of 2021), and the separate regimes of the DIFC and ADGM free zones for customers based there.
- **Jordan**: the Personal Data Protection Law (Law No. 24 of 2023) and its instructions.
- **Elsewhere in the region**, if candidates are there: for example Qatar, Bahrain, Oman, Kuwait and Egypt have their own data protection laws.
- **Employment and anti-discrimination law** in each country where customers hire, which governs how assessments may be used and what candidates must be told.
- **Consumer law** for individuals who buy personal Grow plans (auto-renewal, cancellation and refund rights).
- **Accessibility** requirements that may apply to customers' hiring processes (for example the European Accessibility Act).
