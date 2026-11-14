import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Layers, Palette, Users, ClipboardList } from "lucide-react";
import { requireViewer, viewerCan, tenantOf } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return { title: t("title") };
}

export default async function AppHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const viewer = await requireViewer();
  const t = await getTranslations("home");
  const tr = await getTranslations("roles");
  const { denied } = await searchParams;
  const org = viewer.activeOrganization;

  const counts = await withTenant(tenantOf(viewer), async (tx) => ({
    members: org ? await tx.membership.count({ where: { organizationId: org.id } }) : 0,
    templates: org ? await tx.assessmentTemplate.count({ where: { organizationId: org.id } }) : 0,
    competencies: await tx.competency.count(),
  }));

  const firstName = viewer.user.name.split(" ")[0] ?? viewer.user.name;

  return (
    <PageContainer>
      <PageHeader title={t("greeting", { name: firstName })} description={org ? t("orgSubtitle", { org: org.name }) : t("personalSubtitle")} />

      {denied ? (
        <Alert tone="warning" className="mb-6" title={t("deniedTitle")}>
          {t("deniedBody")}
        </Alert>
      ) : null}

      {org ? (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-sm text-secondary">{t("yourRoles")}</span>
          {org.roles.map((r) => (
            <Badge key={r} tone="accent">
              {tr(r)}
            </Badge>
          ))}
        </div>
      ) : null}

      <section aria-labelledby="assessments-heading" className="mb-10">
        <h2 id="assessments-heading" className="mb-3 text-base font-semibold text-text">
          {org ? t("assessments.title") : t("growTitle")}
        </h2>
        {counts.templates === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={org ? t("assessments.emptyTitle") : t("growEmptyTitle")}
            description={org ? t("assessments.emptyBody") : t("growEmptyBody")}
            action={
              <Button asChild variant="secondary">
                <Link href="/app/framework">
                  {t("assessments.emptyAction")}
                  <ArrowRight className="flip-rtl" aria-hidden />
                </Link>
              </Button>
            }
          />
        ) : null}
      </section>

      <section aria-labelledby="workspace-heading">
        <h2 id="workspace-heading" className="mb-3 text-base font-semibold text-text">
          {t("workspaceTitle")}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            href="/app/framework"
            icon={<Layers className="size-5" strokeWidth={1.5} aria-hidden />}
            title={t("links.framework.title")}
            body={t("links.framework.body", { count: counts.competencies })}
          />
          {org && viewerCan(viewer, "members.manage") ? (
            <QuickLink
              href="/app/org/members"
              icon={<Users className="size-5" strokeWidth={1.5} aria-hidden />}
              title={t("links.members.title")}
              body={t("links.members.body", { count: counts.members })}
            />
          ) : null}
          <QuickLink
            href="/design"
            icon={<Palette className="size-5" strokeWidth={1.5} aria-hidden />}
            title={t("links.design.title")}
            body={t("links.design.body")}
          />
        </ul>
      </section>
    </PageContainer>
  );
}

function QuickLink({ href, icon, title, body }: { href: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <li>
      <Link href={href} className="group block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
        <Card className="h-full transition-colors duration-150 group-hover:border-border-strong">
          <CardContent className="flex h-full flex-col gap-3">
            <span className="text-accent-text">{icon}</span>
            <span className="text-sm font-semibold text-text">{title}</span>
            <span className="text-sm text-secondary">{body}</span>
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
