import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Link2Off } from "lucide-react";
import { getViewer } from "@/lib/auth/session";
import { teamInvitation } from "@/lib/team";
import { TeamConsent } from "@/components/team/team-consent";
import { CandidateShell } from "@/components/candidate/shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Team assessment", referrer: "no-referrer", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function TeamInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = await getTranslations("teamInvite");
  const inv = await teamInvitation(token);
  if (!inv) {
    return (
      <CandidateShell>
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
          <Link2Off className="size-8 text-tertiary" strokeWidth={1.5} aria-hidden />
          <h1 className="text-xl font-semibold">{t("invalidTitle")}</h1>
          <p className="text-secondary">{t("invalidBody")}</p>
        </div>
      </CandidateShell>
    );
  }
  const viewer = await getViewer();
  const branding = { orgName: inv.team.organization.name, logoUrl: inv.team.organization.logoUrl, brandColor: inv.team.organization.brandColor };
  if (!viewer) {
    return (
      <CandidateShell branding={branding}>
        <div className="mx-auto flex max-w-[680px] flex-col gap-5 px-4 py-16">
          <h1 className="text-2xl font-semibold text-text">{t("title", { team: inv.team.name })}</h1>
          <p className="text-secondary">{t("signInFirst", { manager: inv.managerName })}</p>
          <div className="flex gap-2">
            <Button asChild><Link href={`/sign-up?next=/team-invite/${token}`}>{t("createAccount")}</Link></Button>
            <Button asChild variant="secondary"><Link href={`/sign-in?next=/team-invite/${token}`}>{t("signIn")}</Link></Button>
          </div>
          <p className="text-xs text-tertiary">{t("ownData")}</p>
        </div>
      </CandidateShell>
    );
  }
  return (
    <CandidateShell branding={branding}>
      <TeamConsent token={token} team={inv.team.name} manager={inv.managerName} status={inv.member.status} memberId={inv.member.id} />
    </CandidateShell>
  );
}
