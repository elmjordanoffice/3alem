import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { candidate, CandidateError } from "@/lib/hire/candidate-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The candidate API for the mobile app (mobile/). The invitation token in the
 * path is the credential, exactly as for the web link; no cookies are used,
 * so any origin may call it.
 *
 *   GET  /api/m/:token                 → CandidateView
 *   POST /api/m/:token { action, ... } → see ACTIONS below
 *
 * Every action runs the same code as the web app's server actions
 * (src/lib/hire/candidate-actions.ts).
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { ...CORS, "Cache-Control": "no-store" } });
}

// A small per-invitation limit: generous for a person, tight for a script.
const WINDOW_MS = 60_000;
const LIMIT = 120;
const hits = new Map<string, { n: number; reset: number }>();
function limited(token: string): boolean {
  const now = Date.now();
  const h = hits.get(token);
  if (!h || h.reset < now) {
    hits.set(token, { n: 1, reset: now + WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return false;
  }
  h.n++;
  return h.n > LIMIT;
}

type Ctx = { params: Promise<{ token: string }> };

const ACTIONS = {
  refresh: async (t: string) => ({ view: await candidate.view(t) }),
  start: async (t: string, b: unknown) => ({ view: await candidate.start(t, b) }),
  begin: async (t: string) => ({ view: await candidate.begin(t) }),
  submit: async (t: string, b: unknown) => candidate.submit(t, b),
  roleplay: async (t: string, b: unknown) => candidate.roleplay(t, b),
  continue: async (t: string) => ({ view: await candidate.continueChapter(t) }),
  pause: async (t: string) => ({ view: await candidate.pause(t) }),
  resume: async (t: string) => ({ view: await candidate.resume(t) }),
  finish: async (t: string) => ({ view: await candidate.finish(t) }),
  feedback: async (t: string, b: unknown) => (await candidate.feedback(t, b), { ok: true }),
  fairness: async (t: string, b: unknown) => (await candidate.fairness(t, b), { ok: true }),
} as const;

type MobileAction = keyof typeof ACTIONS;

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(_req: Request, { params }: Ctx) {
  const { token } = await params;
  if (limited(token)) return json({ error: "rate_limited" }, 429);
  return json(await candidate.view(token));
}

export async function POST(req: Request, { params }: Ctx) {
  const { token } = await params;
  if (limited(token)) return json({ error: "rate_limited" }, 429);
  let body: { action?: string } & Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const action = body.action as MobileAction | undefined;
  if (!action || !(action in ACTIONS)) return json({ error: "unknown_action" }, 400);
  const payload: Record<string, unknown> = { ...body };
  delete payload.action;
  try {
    return json(await ACTIONS[action](token, payload));
  } catch (e) {
    if (e instanceof ZodError) return json({ error: "invalid_input", issues: e.issues.slice(0, 5) }, 400);
    if (e instanceof CandidateError) return json({ error: e.message }, 409);
    console.error("[api/m] action failed", action, e);
    return json({ error: "server_error" }, 500);
  }
}
