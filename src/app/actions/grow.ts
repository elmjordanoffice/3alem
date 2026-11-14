"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireViewer } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { saveGrowProfile, startGrowSession } from "@/lib/grow/profile";
import { startPractice, submitPractice, saveReflection } from "@/lib/grow/practice";
import { askCoach } from "@/lib/grow/coach";
import { generateToken, hashToken } from "@/lib/hire/tokens";
import { appUrl } from "@/lib/hire/invitations";
import { audit } from "@/lib/audit";
import { trackByKey } from "@/lib/grow/tracks";

function localeOf(v: { user: { locale: string } }): "en" | "ar" {
  return v.user.locale === "ar" ? "ar" : "en";
}

const onboardingSchema = z.object({
  currentRole: z.string().trim().min(2).max(120),
  experienceYears: z.number().int().min(0).max(50),
  goal: z.string().trim().min(3).max(300),
  hoursPerWeek: z.number().int().min(1).max(20),
});

export async function saveOnboardingAction(input: z.input<typeof onboardingSchema>) {
  const viewer = await requireViewer();
  const p = onboardingSchema.safeParse(input);
  if (!p.success) return { ok: false as const, error: "invalid" };
  await saveGrowProfile(viewer.user.id, p.data);
  revalidatePath("/app/grow");
  return { ok: true as const };
}

export async function startBaselineAction() {
  const viewer = await requireViewer();
  const session = await startGrowSession(viewer.user.id, localeOf(viewer));
  redirect(`/grow/session/${session.id}`);
}

export async function startPracticeAction(input: { skillKey?: string; trackKey?: string; trackIndex?: number; twistOf?: string }) {
  const viewer = await requireViewer();
  if (input.trackKey && !trackByKey(input.trackKey)) throw new Error("Unknown track");
  const session = await startPractice(viewer.user.id, localeOf(viewer), {
    skillKey: input.skillKey,
    track: input.trackKey ? { key: input.trackKey, index: input.trackIndex ?? 0 } : undefined,
    twistOf: input.twistOf,
  });
  redirect(`/app/grow/practice/${session.id}`);
}

export async function submitPracticeAction(id: string, content: unknown) {
  const viewer = await requireViewer();
  await submitPractice(viewer.user.id, localeOf(viewer), id, content);
  revalidatePath(`/app/grow/practice/${id}`);
  return { ok: true as const };
}

export async function saveReflectionAction(id: string, note: string) {
  const viewer = await requireViewer();
  await saveReflection(viewer.user.id, id, note);
  return { ok: true as const };
}

export async function coachAction(text: string) {
  const viewer = await requireViewer();
  const msg = z.string().trim().min(1).max(4000).parse(text);
  return askCoach(viewer.user.id, viewer.user.name, localeOf(viewer), msg);
}

/** A verified, read-only link to the person's latest Grow profile, with an expiry. Their choice, always. */
export async function shareProfileAction(days: 7 | 14 | 30) {
  const viewer = await requireViewer();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + days * 86400_000);
  const report = await withTenant({ userId: viewer.user.id }, async (tx) => {
    const r = await tx.report.findFirst({ where: { subjectUserId: viewer.user.id, kind: "GROW", status: "READY" }, orderBy: { createdAt: "desc" } });
    if (!r) return null;
    await tx.reportShareLink.create({ data: { reportId: r.id, subjectUserId: viewer.user.id, tokenHash: hashToken(token), audience: "candidate", expiresAt, createdById: viewer.user.id } });
    return r;
  });
  if (!report) return { ok: false as const, error: "noReport" };
  await audit({ actorUserId: viewer.user.id, action: "grow.profile_shared", targetType: "report", targetId: report.id, metadata: { days } });
  return { ok: true as const, link: `${appUrl()}/r/${token}`, expiresAt: expiresAt.toISOString() };
}
