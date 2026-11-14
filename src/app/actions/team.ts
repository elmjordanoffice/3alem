"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission, requireViewer } from "@/lib/auth/session";
import { assignTrack, createTeam, inviteMembers, respondToTeamInvite, startTeamSession } from "@/lib/team";
import { parseCandidateList } from "@/lib/hire/invitations";
import { systemDb } from "@/lib/db";

export async function createTeamAction(input: { name: string; goals: string[]; description: string }) {
  const viewer = await requirePermission("team.manage");
  const p = z.object({ name: z.string().trim().min(2).max(80), goals: z.array(z.string()).max(4), description: z.string().max(500) }).safeParse(input);
  if (!p.success) return { ok: false as const, error: "invalid" };
  const team = await createTeam(viewer, p.data);
  redirect(`/app/teams/${team.id}`);
}

export async function inviteTeamAction(teamId: string, list: string) {
  const viewer = await requirePermission("team.manage");
  const people = parseCandidateList(list);
  if (!people.length) return { ok: false as const, error: "noEmails" };
  const created = await inviteMembers(viewer, teamId, people);
  revalidatePath(`/app/teams/${teamId}`);
  return { ok: true as const, count: created.length, links: created };
}

export async function assignTrackAction(teamId: string, trackKey: string) {
  const viewer = await requirePermission("team.manage");
  const n = await assignTrack(viewer, teamId, trackKey);
  revalidatePath(`/app/teams/${teamId}`);
  return { ok: true as const, n };
}

export async function respondInviteAction(token: string, accept: boolean, shareRaw: boolean) {
  const viewer = await requireViewer();
  await respondToTeamInvite(token, viewer.user.id, accept, shareRaw);
  if (!accept) redirect("/app?declined=1");
  const member = await systemDb.teamMember.findFirstOrThrow({ where: { userId: viewer.user.id, status: "CONSENTED" }, orderBy: { consentedAt: "desc" } });
  const session = await startTeamSession(member.id, viewer.user.id, viewer.user.locale === "ar" ? "ar" : "en");
  redirect(`/grow/session/${session.id}`);
}

export async function resumeTeamAssessmentAction(memberId: string) {
  const viewer = await requireViewer();
  const session = await startTeamSession(memberId, viewer.user.id, viewer.user.locale === "ar" ? "ar" : "en");
  redirect(`/grow/session/${session.id}`);
}
