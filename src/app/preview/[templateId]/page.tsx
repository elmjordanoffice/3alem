import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requirePermission, tenantOf } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { templateAnalysis, roleProfileFor, type TemplateRow } from "@/lib/hire/templates";
import { curatedWorld } from "@/lib/hire/world";
import { createModel, selectNextTarget } from "@/lib/engine";
import { resolveBankItem, bankContent } from "@/lib/itembank/resolve";
import { PreviewView } from "@/components/recruiter/preview-view";

export const metadata: Metadata = { title: "Candidate preview" };

/** What a candidate sees first: the briefing and an opening scene. Nothing is saved. */
export default async function PreviewPage({ params }: { params: Promise<{ templateId: string }> }) {
  const viewer = await requirePermission("assessment.create");
  const { templateId } = await params;
  const t = await withTenant(tenantOf(viewer), (tx) => tx.assessmentTemplate.findUnique({ where: { id: templateId }, include: { skillWeights: true } }));
  if (!t) notFound();
  const row = t as unknown as TemplateRow;
  const analysis = templateAnalysis(row);
  const locale = t.language === "ar" ? "ar" : "en";
  const { world } = curatedWorld([analysis?.industry ?? "", ...(analysis?.industryKeywords ?? [])].join(" "), locale);
  const role = roleProfileFor(row);
  const target = selectNextTarget(createModel(role), role, { totalMinutes: t.durationMinutes, elapsedMinutes: 0 })!;
  const item = resolveBankItem(target, { usedIds: new Set(), roleFamily: analysis?.roleFamily ?? null });
  const tr = await getTranslations("preview");
  return (
    <PreviewView
      banner={tr("banner")}
      orgName={viewer.activeOrganization.name}
      world={{ ...world, yourRole: analysis?.roleTitle ?? world.yourRole }}
      item={item ? bankContent(item, world, locale) : null}
      minutes={t.durationMinutes}
    />
  );
}
