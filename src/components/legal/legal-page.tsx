import { Fragment } from "react";
import type * as React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { FileText, Hash, LockKeyhole, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
import { Alert } from "@/components/ui/alert";
import { getViewer } from "@/lib/auth/session";
import { AI_PROVIDER_NAME, LEGAL_DOCS, LEGAL_LAST_UPDATED, LEGAL_PATHS, PAYMENTS_PROVIDER_NAME, companyDetails, type LegalDoc } from "@/lib/legal";
import { NUMERALS_COOKIE, isLocale, isNumeralSystem } from "@/i18n/config";
import { intlLocale } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { Placeholder, RichLink, rich, type RichVars } from "./rich";

/** One block of long-form copy, as stored in the `legal` messages. */
type Block = string | { h: string } | { list: string[] } | { steps: string[] } | { note: string } | { table: TableName };
type TableName = "subprocessors" | "cookies" | "retention";
interface Section {
  id: string;
  title: string;
  blocks: Block[];
}
interface Doc {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
}

const ICONS: Record<LegalDoc, LucideIcon> = { privacy: LockKeyhole, terms: FileText, ai: Sparkles, security: ShieldCheck };
const num = (i: number) => String(i + 1).padStart(2, "0");

/**
 * The shared frame of /privacy, /terms, /ai and /security: the landing
 * page's header and footer around a long-form document. A readable column
 * (about 70 characters), a sticky table of contents on desktop and a folding
 * one on phones, numbered sections with anchor links, and the date of the
 * last change. Company details come from the environment; anything missing
 * shows as a marked placeholder, under a draft notice.
 */
export async function LegalPage({ doc }: { doc: LegalDoc }) {
  const t = await getTranslations("legal");
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : "en";
  const numeralsCookie = (await cookies()).get(NUMERALS_COOKIE)?.value;
  const numerals = isNumeralSystem(numeralsCookie) ? numeralsCookie : "latn";
  const viewer = await getViewer();
  const c = companyDetails(locale);
  const content = t.raw(doc) as Doc;

  const ph = (key: string) => <Placeholder>{t(`placeholders.${key}`)}</Placeholder>;
  const value = (v: string | null, key: string) => (v ? <bdi>{v}</bdi> : ph(key));
  const mail = (v: string | null) =>
    v ? (
      <RichLink href={`mailto:${v}`}>
        <bdi>{v}</bdi>
      </RichLink>
    ) : (
      ph("email")
    );
  const vars: RichVars = {
    entity: value(c.entity, "entity"),
    address: value(c.address, "address"),
    contactEmail: mail(c.contactEmail),
    privacyEmail: mail(c.privacyEmail),
    securityEmail: mail(c.securityEmail),
    law: value(c.governingLaw, "law"),
    hosting: value(c.hostingProvider, "hosting"),
    region: value(c.hostingRegion, "region"),
    database: value(c.databaseProvider, "database"),
    emailProvider: value(c.emailProvider, "emailProvider"),
    payments: <bdi>{PAYMENTS_PROVIDER_NAME}</bdi>,
  };

  const ctx: RenderContext = { vars, table: (key) => t.raw(`tables.${key}`), errorMonitoring: c.errorMonitoring };

  const updated = new Intl.DateTimeFormat(intlLocale(locale, numerals), { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${LEGAL_LAST_UPDATED}T00:00:00Z`));
  const others = LEGAL_DOCS.filter((d) => d !== doc);
  const DocIcon = ICONS[doc];

  return (
    <div className="range-page flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-[60] rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-3">
        {t("common.skip")}
      </a>
      <LandingNav signedIn={Boolean(viewer)} base="/" solid />

      <main id="main" className="flex-1 pb-[clamp(4rem,8vw,7rem)] pt-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="r-wrap">
          <div className="mx-auto grid max-w-[68rem] gap-y-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-14 lg:gap-y-10 xl:gap-x-20">
            <header className="flex flex-col lg:col-start-2">
              {c.isDraft ? (
                <Alert tone="warning" title={t("common.draftTitle")} className="mb-8">
                  {t("common.draftBody")}
                </Alert>
              ) : null}
              <p className="r-pill r-label self-start">
                <span className="grid size-6 place-items-center rounded-full bg-accent-subtle text-accent-text" aria-hidden>
                  <DocIcon className="size-3.5" strokeWidth={2.25} />
                </span>
                {content.eyebrow}
              </p>
              <h1 className="display-x r-h2 mt-6 max-w-[20ch]">{content.title}</h1>
              <p className="r-lead mt-5 max-w-[60ch] text-secondary">{rich(content.intro, vars)}</p>
              <p className="mt-6 text-sm text-tertiary">
                {t("common.lastUpdated")} <time dateTime={LEGAL_LAST_UPDATED} className="font-medium text-secondary">{updated}</time>
              </p>
            </header>

            {/* Contents: sticky beside the text on desktop, folded above it on phones. */}
            <aside className="lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:pt-1">
              <nav aria-label={t("common.contents")} className="lg:sticky lg:top-28">
                <details className="r-card group p-4 lg:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[12px] font-semibold text-text [&::-webkit-details-marker]:hidden">
                    {t("common.contents")}
                    <span className="text-sm font-normal text-tertiary group-open:hidden">{t("common.show")}</span>
                    <span className="hidden text-sm font-normal text-tertiary group-open:inline">{t("common.hide")}</span>
                  </summary>
                  <TocList sections={content.sections} className="mt-3" />
                </details>
                <div className="hidden lg:block">
                  <p className="r-label px-2 text-tertiary">{t("common.contents")}</p>
                  <TocList sections={content.sections} className="mt-3 max-h-[calc(100dvh-10rem)] overflow-y-auto pe-1" />
                </div>
              </nav>
            </aside>

            <article className="r-card min-w-0 px-5 py-2 sm:px-10 sm:py-4 lg:col-start-2">
              {content.sections.map((s, i) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className={cn("scroll-mt-28 py-8 sm:py-10", i > 0 && "border-t border-border")}>
                  <h2 id={`${s.id}-h`} className="r-h3 group flex items-baseline gap-3 text-text">
                    <span className="r-index shrink-0 text-[0.8125rem] text-tertiary" aria-hidden>
                      {num(i)}
                    </span>
                    <span className="min-w-0">
                      {s.title}
                      <a href={`#${s.id}`} className="ms-2 inline-grid size-7 translate-y-0.5 place-items-center rounded-full align-baseline text-tertiary opacity-60 transition hover:bg-surface-subtle hover:text-text hover:opacity-100 focus-visible:opacity-100" aria-label={t("common.anchor", { title: s.title })}>
                        <Hash className="size-4" aria-hidden />
                      </a>
                    </span>
                  </h2>
                  <div className="mt-5 flex max-w-[70ch] flex-col gap-4 text-[1rem] leading-[1.75] text-secondary rtl:text-[1.0625rem] rtl:leading-[1.95]">
                    {s.blocks.map((b, j) => renderBlock(b, j, ctx))}
                  </div>
                </section>
              ))}
            </article>

            <nav aria-label={t("common.related")} className="lg:col-start-2">
              <p className="r-label text-tertiary">{t("common.related")}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {others.map((d) => {
                  const Icon = ICONS[d];
                  return (
                    <li key={d}>
                      <Link href={LEGAL_PATHS[d]} className="r-card r-lift flex h-full items-center gap-3 p-4 text-[15px] font-semibold text-text focus-visible:outline-2 focus-visible:outline-focus">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-subtle text-accent-text" aria-hidden>
                          <Icon className="size-[18px]" strokeWidth={2} />
                        </span>
                        {t(`links.${d}`)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </main>

      <LandingFooter signedIn={Boolean(viewer)} base="/" current={LEGAL_PATHS[doc]} />
    </div>
  );
}

interface RenderContext {
  vars: RichVars;
  /** Reads a raw value from the `legal.tables` messages. */
  table: (key: string) => unknown;
  /** Optional rows, e.g. error monitoring when it is configured. */
  errorMonitoring: string | null;
}

function renderBlock(block: Block, key: number, ctx: RenderContext): React.ReactNode {
  const v = ctx.vars;
  if (typeof block === "string") return <p key={key}>{rich(block, v)}</p>;
  if ("h" in block)
    return (
      <h3 key={key} className="mt-3 text-[1.0625rem] font-semibold leading-snug text-text rtl:text-[1.125rem]">
        {rich(block.h, v)}
      </h3>
    );
  if ("list" in block)
    return (
      <ul key={key} className="flex list-disc flex-col gap-2.5 ps-5 marker:text-tertiary">
        {block.list.map((item, k) => (
          <li key={k} className="ps-1">
            {rich(item, v)}
          </li>
        ))}
      </ul>
    );
  if ("steps" in block)
    return (
      <ol key={key} className="flex list-decimal flex-col gap-2.5 ps-5 marker:font-semibold marker:text-tertiary">
        {block.steps.map((item, k) => (
          <li key={k} className="ps-1">
            {rich(item, v)}
          </li>
        ))}
      </ol>
    );
  if ("note" in block)
    return (
      <p key={key} className="rounded-[16px] bg-surface-sunken px-4 py-3.5 text-text">
        {rich(block.note, v)}
      </p>
    );
  return <Fragment key={key}>{renderTable(block.table, ctx)}</Fragment>;
}

function renderTable(name: TableName, ctx: RenderContext): React.ReactNode {
  const v = ctx.vars;
  const s = (k: string) => String(ctx.table(`${name}.${k}`));
  if (name === "subprocessors") {
    const rows: { key: string; name: React.ReactNode }[] = [
      { key: "hosting", name: v.hosting },
      { key: "database", name: v.database },
      { key: "email", name: v.emailProvider },
      { key: "ai", name: <bdi>{AI_PROVIDER_NAME}</bdi> },
      { key: "payments", name: <bdi>{PAYMENTS_PROVIDER_NAME}</bdi> },
      ...(ctx.errorMonitoring ? [{ key: "errors", name: <bdi>{ctx.errorMonitoring}</bdi> }] : []),
    ];
    return (
      <DataTable
        caption={s("caption")}
        columns={[s("cols.provider"), s("cols.purpose"), s("cols.location")]}
        rows={rows.map((r) => [
          <span key="n" className="flex flex-col gap-0.5">
            <span className="font-semibold text-text">{r.name}</span>
            <span className="text-[13px] text-tertiary">{s(`rows.${r.key}.service`)}</span>
          </span>,
          rich(s(`rows.${r.key}.purpose`), v),
          rich(s(`rows.${r.key}.location`), v),
        ])}
      />
    );
  }
  const cols = ctx.table(`${name}.cols`) as string[];
  const rows = ctx.table(`${name}.rows`) as string[][];
  return (
    <DataTable
      caption={s("caption")}
      columns={cols}
      rows={rows.map((r) =>
        r.map((cell, k) =>
          name === "cookies" && k === 0 ? (
            <code key={k} dir="ltr" className="break-all rounded-[6px] bg-surface-sunken px-1.5 py-0.5 font-mono text-[13px] text-text">
              {cell}
            </code>
          ) : (
            rich(cell, v)
          ),
        ),
      )}
    />
  );
}

function TocList({ sections, className }: { sections: Section[]; className?: string }) {
  return (
    <ol className={cn("flex flex-col gap-0.5 text-sm", className)}>
      {sections.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className="flex items-baseline gap-2.5 rounded-[12px] px-2 py-1.5 leading-snug text-secondary transition-colors hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-focus">
            <span className="r-index w-5 shrink-0 text-xs text-tertiary" aria-hidden>
              {num(i)}
            </span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** A table on wider screens; a stack of labelled cards on phones (only one is ever displayed). */
function DataTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: React.ReactNode[][] }) {
  return (
    <figure className="my-2">
      <figcaption className="mb-3 text-sm font-semibold text-text">{caption}</figcaption>
      <ul className="flex flex-col gap-3 sm:hidden">
        {rows.map((r, i) => (
          <li key={i} className="rounded-[16px] bg-surface-sunken p-4">
            <dl className="flex flex-col gap-2.5 text-[15px]">
              {r.map((cell, k) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="text-xs font-semibold text-tertiary">{columns[k]}</dt>
                  <dd className="text-secondary">{cell}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-[16px] shadow-[inset_0_0_0_1px_var(--border)] sm:block">
        <table className="w-full border-collapse text-start text-[14px] leading-relaxed rtl:text-[15px]">
          <thead className="bg-surface-sunken">
            <tr>
              {columns.map((col) => (
                <th key={col} scope="col" className="px-4 py-3 text-start text-xs font-semibold text-secondary">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border align-top">
                {r.map((cell, k) => (
                  <td key={k} className={cn("px-4 py-3 text-secondary", k === 0 && "w-[30%]")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
