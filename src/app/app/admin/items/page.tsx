import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireViewer } from "@/lib/auth/session";
import { bankItemStats, generatedItemHealth, MIN_USES_FOR_FLAGS } from "@/lib/itembank/stats";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FormattedNumber } from "@/components/app/formatted";
import { ItemReviewTable } from "@/components/admin/item-review";
import { QuerySelect } from "@/components/admin/query-select";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("itemReview");
  return { title: t("title") };
}

export default async function ItemReviewPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const viewer = await requireViewer();
  if (!viewer.user.isPlatformAdmin) redirect("/app?denied=1");
  const t = await getTranslations("itemReview");
  const { show } = await searchParams;
  const [stats, health] = await Promise.all([bankItemStats(), generatedItemHealth()]);
  const filtered = stats.filter((s) => (show === "flagged" ? s.flags.length > 0 : show === "retired" ? s.status === "retired" : true));
  const flagged = stats.filter((s) => s.flags.length).length;
  return (
    <PageContainer className="max-w-6xl">
      <PageHeader
        title={t("title")}
        description={t("description", { n: MIN_USES_FOR_FLAGS })}
        actions={<QuerySelect param="show" value={show === "flagged" || show === "retired" ? show : "all"} label={t("filterLabel")} className="w-48" options={[{ value: "all", label: t("showAll") }, { value: "flagged", label: t("showFlagged") }, { value: "retired", label: t("showRetired") }]} />}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card><CardContent><p className="text-sm text-secondary">{t("curated")}</p><p className="mt-1 text-2xl font-semibold tabular"><FormattedNumber value={stats.length} /></p></CardContent></Card>
        <Card><CardContent><p className="text-sm text-secondary">{t("flagged")}</p><p className="mt-1 text-2xl font-semibold tabular"><FormattedNumber value={flagged} /></p></CardContent></Card>
        <Card><CardContent><p className="text-sm text-secondary">{t("generated30")}</p><p className="mt-1 text-2xl font-semibold tabular"><FormattedNumber value={health.generated} /></p></CardContent></Card>
        <Card><CardContent><p className="text-sm text-secondary">{t("guessable30")}</p><p className="mt-1 text-2xl font-semibold tabular"><FormattedNumber value={health.failed} /></p></CardContent></Card>
      </div>
      <ItemReviewTable items={filtered} />
    </PageContainer>
  );
}
