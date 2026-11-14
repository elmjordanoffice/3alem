import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Clock } from "lucide-react";
import { systemDb } from "@/lib/db";
import { hashToken } from "@/lib/hire/tokens";
import { audit } from "@/lib/audit";
import type { ReportContent } from "@/lib/hire/report-types";
import { HireReport } from "@/components/report/hire-report";
import { Logo } from "@/components/brand/logo";
import { ThemeMenu, LanguageToggle } from "@/components/app/preference-controls";

export const metadata: Metadata = { title: "Report", referrer: "no-referrer", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** A shared report: read-only, expires, revocable, every view audited. */
export default async function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = await getTranslations("report");
  const link = await systemDb.reportShareLink.findUnique({ where: { tokenHash: hashToken(token) }, include: { report: { include: { session: { include: { organization: true } } } } } });
  const valid = link && !link.revokedAt && link.expiresAt > new Date() && link.report.status === "READY";
  if (valid) await audit({ organizationId: link.organizationId, action: "report.share_viewed", targetType: "share_link", targetId: link.id, metadata: { audience: link.audience } });

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="flex items-center gap-3">
            <Logo showArabic={false} />
            {valid ? <span className="text-sm text-secondary">· {link.report.session.organization?.name}</span> : null}
          </span>
          <span className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeMenu />
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {valid ? (
          <HireReport content={link.report.content as unknown as ReportContent} audience={link.audience === "candidate" ? "candidate" : "team"} />
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
            <Clock className="size-8 text-tertiary" strokeWidth={1.5} aria-hidden />
            <h1 className="text-xl font-semibold text-text">{t("linkInvalidTitle")}</h1>
            <p className="text-secondary">{t("linkInvalidBody")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
