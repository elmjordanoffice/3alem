import "server-only";
import { itemContentSchema, type ItemContent, type ItemType } from "@/lib/assessment/item-schema";
import { worldSchema } from "@/lib/assessment/world-schema";
import { systemDb } from "@/lib/db";
import { candidateContext, currentItem, currentStage, minutesLeft, roleplayTranscript, type Stage } from "./session";
import { templateAccommodations, templateAnalysis, type TemplateRow } from "./templates";
import type { ItemMeta } from "./items";

export interface PublicWorld {
  companyName: string;
  industry: string;
  premise: string;
  yourRole: string;
  team: string;
  cast: { name: string; role: string }[];
  chapters: { title: string; summary: string }[];
}

export interface Branding {
  orgName: string;
  logoUrl: string | null;
  brandColor: string | null;
}

export type CandidateView =
  | { view: "invalid" }
  | { view: "expired" | "revoked"; branding: Branding }
  | {
      view: "landing";
      branding: Branding;
      roleTitle: string;
      minutes: number;
      candidateName: string | null;
      allowed: { extraTime: boolean; untimed: boolean; largerText: boolean };
      defaultLocale: "en" | "ar";
    }
  | { view: "briefing"; branding: Branding; world: PublicWorld; minutes: number; roleTitle: string }
  | { view: "preparing"; branding: Branding }
  | {
      view: "transition";
      branding: Branding;
      world: PublicWorld;
      chapterIndex: number;
      recap: string[];
    }
  | {
      view: "item";
      branding: Branding;
      world: PublicWorld;
      chapterIndex: number;
      minutesLeft: number;
      untimed: boolean;
      item: {
        id: string;
        type: ItemType;
        content: ItemContent;
        stage: Stage;
        timed: boolean;
        presentedAt: string;
        roleplay?: { transcript: { from: "candidate" | "stakeholder"; text: string }[] };
      };
    }
  | { view: "paused"; branding: Branding; world: PublicWorld; chapterIndex: number; minutesLeft: number }
  | { view: "complete"; branding: Branding; roleTitle: string };

function branding(org: { name: string; logoUrl: string | null; brandColor: string | null }): Branding {
  return { orgName: org.name, logoUrl: org.logoUrl, brandColor: org.brandColor };
}

function publicWorld(raw: unknown): PublicWorld {
  const w = worldSchema.parse(raw);
  return {
    companyName: w.companyName,
    industry: w.industry,
    premise: w.premise,
    yourRole: w.yourRole,
    team: w.team,
    cast: w.cast.map((c) => ({ name: c.name, role: c.role })),
    chapters: w.chapters,
  };
}

/** Everything the candidate screen needs, and nothing they shouldn't see. */
export async function candidateView(token: string): Promise<CandidateView> {
  const ctx = await candidateContext(token);
  if (ctx.state === "invalid") return { view: "invalid" };
  const inv = ctx.inv!;
  const brand = branding(inv.organization);
  if (ctx.state === "expired" || ctx.state === "revoked") return { view: ctx.state, branding: brand };

  const template = inv.template as unknown as TemplateRow;
  const analysis = templateAnalysis(template);
  const roleTitle = analysis?.roleTitle ?? template.title;
  const session = ctx.session;

  if (!session) {
    const acc = templateAccommodations(template);
    if (inv.status === "PENDING") await systemDb.invitation.update({ where: { id: inv.id }, data: { status: "OPENED" } });
    return {
      view: "landing",
      branding: brand,
      roleTitle,
      minutes: template.durationMinutes,
      candidateName: inv.name,
      allowed: { extraTime: acc.extraTimeAllowed, untimed: acc.untimedAllowed, largerText: acc.largerTextAllowed },
      defaultLocale: template.language === "ar" ? "ar" : "en",
    };
  }

  return viewForSession(session, brand, roleTitle);
}

type SessionLike = { id: string; status: string; currentChapter: number; timeBudgetMinutes: number; elapsedSeconds: number; accommodations: unknown };

/** The view for an existing session (shared by Hire candidates and Grow). */
export async function viewForSession(session: SessionLike, brand: Branding, roleTitle: string): Promise<CandidateView> {
  if (["COMPLETED", "SCORED", "REPORTED"].includes(session.status)) return { view: "complete", branding: brand, roleTitle };

  const worldRow = await systemDb.scenarioWorld.findUnique({ where: { sessionId: session.id } });
  if (!worldRow) return { view: "preparing", branding: brand };
  const world = publicWorld(worldRow.summary);

  if (session.status === "STARTED") return { view: "briefing", branding: brand, world, minutes: session.timeBudgetMinutes, roleTitle };

  const item = await currentItem(session.id);
  const left = await minutesLeft(session);
  const chapterIndex = Math.max(0, (item?.chapter ?? session.currentChapter) - 1);
  if (session.status === "PAUSED") return { view: "paused", branding: brand, world, chapterIndex, minutesLeft: Math.round(left) };
  if (!item) return { view: "preparing", branding: brand };

  if (item.chapter > session.currentChapter) {
    const decisions = ((worldRow.hooks as { decisions?: string[] }).decisions ?? []).slice(-3);
    return { view: "transition", branding: brand, world, chapterIndex, recap: decisions };
  }

  const content = itemContentSchema.parse(item.content);
  const stage = await currentStage(item.id, content);
  const meta = item.meta as unknown as ItemMeta;
  const acc = (session.accommodations ?? {}) as { untimed?: boolean; extraTime?: number };
  // Timed tasks get extra time with the accommodation; untimed mode removes the clock.
  if (content.timeLimitSeconds && acc.extraTime) content.timeLimitSeconds = Math.round(content.timeLimitSeconds * acc.extraTime);
  if (acc.untimed) delete content.timeLimitSeconds;

  return {
    view: "item",
    branding: brand,
    world,
    chapterIndex,
    minutesLeft: Math.round(left),
    untimed: Boolean(acc.untimed),
    item: {
      id: item.id,
      type: item.type,
      content,
      stage: stage === "DONE" ? "TWIST" : stage,
      timed: Boolean(meta?.timed && content.timeLimitSeconds),
      presentedAt: (item.presentedAt ?? item.createdAt).toISOString(),
      roleplay: item.type === "ROLE_PLAY" && content.task.roleplay ? { transcript: await roleplayTranscript(item.id, content.task.roleplay.openingLine) } : undefined,
    },
  };
}
