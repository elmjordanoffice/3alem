import "server-only";
import { systemDb } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { generateToken, hashToken } from "./tokens";

export const INVITATION_DAYS = 14;

export function appUrl(): string {
  return (process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function candidateLink(token: string) {
  return `${appUrl()}/a/${token}`;
}

/**
 * Resolve a candidate token to its invitation. Tokens are the credential for
 * the candidate flow (like a magic link): only the hash is stored, links
 * expire, and revoked invitations stop working.
 */
export async function invitationForToken(token: string) {
  if (!token || token.length < 16) return null;
  const inv = await systemDb.invitation.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { template: { include: { skillWeights: true } }, organization: true, session: true },
  });
  if (!inv) return null;
  if (inv.status === "REVOKED") return { inv, state: "revoked" as const };
  if (inv.expiresAt < new Date() && !inv.session?.completedAt) return { inv, state: "expired" as const };
  return { inv, state: "valid" as const };
}

/** Create one invitation; optionally email it. Returns the raw token once. */
export async function createInvitation(opts: {
  organizationId: string;
  templateId: string;
  invitedById: string;
  email: string;
  name?: string | null;
  accommodations?: Record<string, unknown>;
  send: boolean;
  orgName: string;
  roleTitle: string;
  minutes: number;
}) {
  const token = generateToken();
  const inv = await systemDb.invitation.create({
    data: {
      organizationId: opts.organizationId,
      templateId: opts.templateId,
      invitedById: opts.invitedById,
      email: opts.email.toLowerCase().trim(),
      name: opts.name?.trim() || null,
      tokenHash: hashToken(token),
      accommodations: (opts.accommodations ?? {}) as object,
      expiresAt: new Date(Date.now() + INVITATION_DAYS * 86400_000),
    },
  });
  if (opts.send) {
    const greeting = opts.name ? `Hello ${opts.name},` : "Hello,";
    await sendMail({
      to: inv.email,
      subject: `${opts.orgName} invites you to an assessment for ${opts.roleTitle}`,
      text: `${greeting}

${opts.orgName} has invited you to complete a work-scenario assessment for the ${opts.roleTitle} role. It takes about ${opts.minutes} minutes, and you can pause between chapters.

There are no trick questions. You will work through realistic situations at a fictional company: reading messages, making decisions and writing replies. People at ${opts.orgName} make the hiring decision; the assessment gives them evidence.

Start here (the link expires in ${INVITATION_DAYS} days):
${candidateLink(token)}

If you need extra time or larger text, you can choose that before you begin.`,
    });
  }
  return { invitation: inv, token, link: candidateLink(token) };
}

/** Parse "name,email" or "email" lines (CSV or pasted list). */
export function parseCandidateList(text: string): { name: string | null; email: string }[] {
  const out: { name: string | null; email: string }[] = [];
  const seen = new Set<string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || /^name\s*[,;\t]\s*email/i.test(line) || /^email$/i.test(line)) continue;
    const parts = line.split(/[,;\t،؛]/).map((p) => p.trim().replace(/^"|"$/g, ""));
    const email = parts.find((p) => /^\S+@\S+\.\S+$/.test(p));
    if (!email) continue;
    const name = parts.find((p) => p !== email && p.length > 0) ?? null;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name, email: key });
  }
  return out;
}
