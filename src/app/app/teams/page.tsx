import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight, UsersRound } from "lucide-react";
import { requirePermission, viewerCan, tenantOf } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { CreateTeamDialog } from "@/components/team/create-team-dialog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("team");
  return { title: t("title") };
}

export default async function TeamsPage() {
  const viewer = await requirePermission("team.view");
  const t = await getTranslations("team");
  const teams = await withTenant(tenantOf(viewer), (tx) => tx.team.findMany({ where: { organizationId: viewer.activeOrganization.id }, include: { members: { select: { status: true } } }, orderBy: { createdAt: "desc" } }));
  const canManage = viewerCan(viewer, "team.manage");
  return (
    <PageContainer className="max-w-5xl">
      <PageHeader title={t("title")} description={t("description")} actions={canManage ? <CreateTeamDialog /> : null} />
      <Alert tone="neutral" className="mb-6">{t("devTool")}</Alert>
      {teams.length === 0 ? (
        <EmptyState icon={UsersRound} title={t("emptyTitle")} description={t("emptyBody")} action={canManage ? <CreateTeamDialog /> : undefined} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {teams.map((team, i) => {
            const assessed = team.members.filter((m) => m.status === "ASSESSED").length;
            const active = team.members.filter((m) => m.status !== "REMOVED" && m.status !== "DECLINED").length;
            const pct = active ? assessed / active : 0;
            const r = 22;
            const c = 2 * Math.PI * r;
            return (
              <li key={team.id}>
                <Link
                  href={`/app/teams/${team.id}`}
                  className="group flex items-center gap-4 rounded-card bg-surface p-5 shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-focus"
                >
                  <span className={["tile-violet", "tile-blue", "tile-teal", "tile-coral"][i % 4] + " grid size-14 shrink-0 place-items-center rounded-2xl"} aria-hidden>
                    <UsersRound className="size-6" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-bold text-text">{team.name}</span>
                    <span className="mt-0.5 block text-sm text-secondary">{t("assessedOf", { assessed, total: active })}</span>
                  </span>
                  <svg viewBox="0 0 56 56" className="size-14 shrink-0" aria-hidden>
                    <circle cx="28" cy="28" r={r} fill="none" stroke="var(--level-empty)" strokeWidth="6" />
                    <circle cx="28" cy="28" r={r} fill="none" stroke="var(--teal)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 28 28)" style={{ filter: "drop-shadow(0 0 6px var(--teal))" }} />
                  </svg>
                  <ArrowRight className="size-4 shrink-0 text-tertiary transition-transform group-hover:translate-x-0.5 flip-rtl" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PageContainer>
  );
}
