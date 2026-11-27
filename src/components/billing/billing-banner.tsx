import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, CircleAlert, Clock } from "lucide-react";
import { viewerCan, type Viewer } from "@/lib/auth/session";
import { billingOverview } from "@/lib/billing";

/**
 * A slim line on Home for org admins (D-066): the trial ends within three
 * days, the trial has ended, a payment failed, or the plan has ended.
 * Nothing when billing is off or all is well.
 */
export async function BillingBanner({ viewer }: { viewer: Viewer }) {
  const org = viewer.activeOrganization;
  if (!org || !viewerCan(viewer, "billing.manage")) return null;
  const overview = await billingOverview({ userId: viewer.user.id, organizationId: org.id });
  const banner = overview?.banner;
  if (!banner) return null;
  const t = await getTranslations("billing.banner");
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  const nu = viewer.user.numerals === "arab" ? "arab" : "latn";
  const date = banner.date ? new Intl.DateTimeFormat(`${locale === "ar" ? "ar" : "en-GB"}-u-nu-${nu}`, { day: "numeric", month: "long", timeZone: "UTC" }).format(banner.date) : "";
  const Icon = banner.kind === "trial_ending" ? Clock : CircleAlert;
  return (
    <aside aria-label={t("label")} className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-surface px-4 py-2.5 text-sm shadow-card ring-1 ring-warning/35 sm:rounded-full sm:ps-2.5 sm:pe-5">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-warning-subtle text-warning" aria-hidden>
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <p className="min-w-0 flex-1 text-text">{t(banner.kind, { date })}</p>
      <Link href="/app/org/billing" className="inline-flex shrink-0 items-center gap-1 rounded-full font-semibold text-accent-text underline-offset-4 hover:underline">
        {t(banner.kind === "payment_failed" ? "payment" : "plans")}
        <ArrowRight className="flip-rtl size-4" aria-hidden />
      </Link>
    </aside>
  );
}
