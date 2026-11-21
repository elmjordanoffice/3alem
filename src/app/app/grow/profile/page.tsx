import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Loader2, Target } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { getGrowProfile, growSessions } from "@/lib/grow/profile";
import { SelfViewComparison } from "@/components/grow/self-view";
import type { ReportContent } from "@/lib/hire/report-types";
import { PageContainer } from "@/components/app/page-header";
import { HireReport } from "@/components/report/hire-report";
import { GrowPlan } from "@/components/grow/grow-plan";
import { ShareProfile } from "@/components/grow/share-profile";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AutoRefresh } from "@/components/app/auto-refresh";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("grow");
  return { title: t("profileTitle") };
}

export default async function GrowProfilePage() {
  const viewer = await requireViewer();
  const t = await getTranslations("grow");
  const sessions = await growSessions(viewer.user.id);
  const latest = sessions.find((s) => s.report?.status === "READY");
  const scoring = sessions.find((s) => ["COMPLETED", "SCORED"].includes(s.status));
  if (!latest) {
    return (
      <PageContainer>
        {scoring ? <AutoRefresh seconds={4} /> : null}
        <EmptyState
          icon={scoring ? Loader2 : Target}
          title={scoring ? t("profilePending") : t("profileEmptyTitle")}
          description={scoring ? t("profilePendingBody") : t("profileEmptyBody")}
          action={scoring ? undefined : <Button asChild><Link href="/app/grow">{t("baseline.start")}</Link></Button>}
        />
      </PageContainer>
    );
  }
  const content = latest.report!.content as unknown as ReportContent;
  const own = ((await getGrowProfile(viewer.user.id))?.selfView ?? {}) as Record<string, number>;
  const selfRows = content.domains.filter((d) => typeof own[d.key] === "number").map((d) => ({ key: d.key, name: d.name, own: own[d.key]!, estimate: d.estimate, range: d.range }));
  return (
    <PageContainer className="max-w-6xl">
      <HireReport content={{ ...content, candidate: { name: viewer.user.name } }} audience="candidate" actions={<ShareProfile />} />
      {content.narrative.plan?.length ? (
        <div className="mt-12 lg:ps-[13.5rem]">
          <GrowPlan plan={content.narrative.plan} />
        </div>
      ) : null}
      <SelfViewComparison rows={selfRows} />
    </PageContainer>
  );
}
