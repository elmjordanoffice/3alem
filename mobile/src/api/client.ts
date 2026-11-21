import type { CandidateView, FairnessAnswers, StartInput, SubmitPayload, TranscriptTurn } from "./types";

/**
 * The candidate API (/api/m/:token). The invitation token in the path is the
 * only credential; no cookies. See src/app/api/m/[token]/route.ts.
 */

export const DEFAULT_API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3400").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    /** network: no response at all (offline, DNS, timeout). http: the server answered with an error. */
    readonly kind: "network" | "http",
    readonly status = 0,
    readonly code?: string,
  ) {
    super(code ?? kind);
  }
  get offline() {
    return this.kind === "network";
  }
}

async function request<T>(url: string, init: RequestInit, timeoutMs: number): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: ctrl.signal, headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : null) } });
  } catch {
    throw new ApiError("network");
  } finally {
    clearTimeout(timer);
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* empty or not JSON */
  }
  if (!res.ok) throw new ApiError("http", res.status, (body as { error?: string } | null)?.error);
  return body as T;
}

export interface Api {
  view(): Promise<CandidateView>;
  refresh(): Promise<CandidateView>;
  start(input: StartInput): Promise<CandidateView>;
  begin(): Promise<CandidateView>;
  submit(p: SubmitPayload): Promise<{ ok: boolean; error?: string; view: CandidateView }>;
  roleplay(input: { itemId: string; clientId: string; text: string }): Promise<{ ok: boolean; reply?: string; ended?: boolean; transcript?: TranscriptTurn[] }>;
  continueChapter(): Promise<CandidateView>;
  pause(): Promise<CandidateView>;
  resume(): Promise<CandidateView>;
  finish(): Promise<CandidateView>;
  feedback(f: { rating: number; comment: string }): Promise<void>;
  fairness(a: FairnessAnswers): Promise<void>;
}

export function createApi(baseUrl: string, token: string): Api {
  const url = `${baseUrl.replace(/\/+$/, "")}/api/m/${encodeURIComponent(token)}`;
  const post = <T>(action: string, payload: Record<string, unknown> = {}, timeoutMs = 20_000) =>
    request<T>(url, { method: "POST", body: JSON.stringify({ action, ...payload }) }, timeoutMs);
  const viewOf = async (p: Promise<{ view: CandidateView }>) => (await p).view;
  return {
    view: () => request<CandidateView>(url, { method: "GET" }, 15_000),
    refresh: () => viewOf(post("refresh")),
    start: (input) => viewOf(post("start", { ...input }, 30_000)),
    begin: () => viewOf(post("begin", {}, 30_000)),
    submit: (p) => post("submit", { ...p }, 30_000),
    // The AI stakeholder can take a while to answer.
    roleplay: (input) => post("roleplay", input, 60_000),
    continueChapter: () => viewOf(post("continue", {}, 30_000)),
    pause: () => viewOf(post("pause")),
    resume: () => viewOf(post("resume")),
    finish: () => viewOf(post("finish")),
    feedback: async (f) => void (await post("feedback", f)),
    fairness: async (a) => void (await post("fairness", a)),
  };
}

/**
 * The token from whatever the candidate pasted or opened: a web invitation
 * link (https://host/a/<token>), the app link (aalim://a/<token>), or the bare
 * code. Returns null if it can't be an invitation.
 */
export function parseInvitation(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const fromPath = s.match(/(?:^|[/:])a\/([A-Za-z0-9_-]{16,128})(?:[/?#]|$)/);
  if (fromPath) return fromPath[1]!;
  if (/^[A-Za-z0-9_-]{16,128}$/.test(s)) return s;
  return null;
}
