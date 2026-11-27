import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { systemDb } from "@/lib/db";
import { AnthropicProvider, costUsd } from "./anthropic";
import { checkBudget, recordSpend } from "./budget";
import { AgentError, type AgentDefinition, type CompletionResult, type ModelProvider } from "./types";

/**
 * The single way the app talks to a language model.
 *
 * - Picks the provider: Claude when ANTHROPIC_API_KEY is set (and AI_PROVIDER
 *   isn't "offline"), otherwise none — callers then use their offline path.
 * - Logs every call (input, output, tokens, cost, latency, errors) to
 *   ai_call_log with the system client; the log is invisible to tenants.
 * - Retries once on invalid output; refusals and provider errors surface as
 *   AgentError so callers can fall back to the curated bank / offline logic.
 * - Respects the monthly spending caps (./budget.ts): over budget, it throws
 *   an "unsupported" AgentError and callers use their offline path.
 */

let cached: ModelProvider | null | undefined;

export function getProvider(): ModelProvider | null {
  if (cached !== undefined) return cached;
  const mode = process.env.AI_PROVIDER ?? "auto";
  if (mode === "offline" || mode === "mock") cached = null;
  else if (process.env.ANTHROPIC_API_KEY || mode === "anthropic") cached = new AnthropicProvider();
  else cached = null;
  return cached;
}

/** For tests. */
export function setProvider(p: ModelProvider | null) {
  cached = p;
}

export function aiMode(): "anthropic" | "offline" {
  return getProvider() ? "anthropic" : "offline";
}

export interface AgentContext {
  organizationId?: string | null;
  sessionId?: string | null;
}

export async function runAgent<I, O>(
  definition: AgentDefinition<I, O>,
  input: I,
  ctx: AgentContext = {},
): Promise<{ output: O; meta: CompletionResult<O> }> {
  const provider = getProvider();
  if (!provider) throw new AgentError("No language model configured", "unsupported");
  const verdict = await checkBudget(ctx);
  if (!verdict.allowed) throw new AgentError(`Monthly AI budget reached (${verdict.pool})`, "unsupported");

  let lastError: AgentError | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const started = Date.now();
    try {
      const meta = await provider.complete({ definition, input });
      await log(definition, input, ctx, provider, { meta, ok: true });
      await recordSpend(ctx, costUsd(meta));
      return { output: meta.output, meta };
    } catch (e) {
      const err = e instanceof AgentError ? e : new AgentError(String(e), "provider");
      await log(definition, input, ctx, provider, { ok: false, error: err, latencyMs: Date.now() - started });
      lastError = err;
      if (err.kind !== "invalid_output" && err.kind !== "truncated") break;
    }
  }
  throw lastError ?? new AgentError("Unknown failure", "provider");
}

async function log<I, O>(
  definition: AgentDefinition<I, O>,
  input: I,
  ctx: AgentContext,
  provider: ModelProvider,
  r: { ok: true; meta: CompletionResult<O> } | { ok: false; error: AgentError; latencyMs: number },
) {
  try {
    await systemDb.aiCallLog.create({
      data: {
        organizationId: ctx.organizationId ?? null,
        sessionId: ctx.sessionId ?? null,
        agent: definition.agent,
        promptVersion: definition.version,
        provider: provider.name,
        model: r.ok ? r.meta.model : provider.model,
        inputTokens: r.ok ? r.meta.inputTokens + r.meta.cacheReadTokens + r.meta.cacheWriteTokens : 0,
        outputTokens: r.ok ? r.meta.outputTokens : 0,
        costUsd: r.ok ? costUsd(r.meta) : 0,
        latencyMs: r.ok ? r.meta.latencyMs : r.latencyMs,
        ok: r.ok,
        error: r.ok ? null : `${r.error.kind}: ${r.error.message}`.slice(0, 1000),
        input: input as Prisma.InputJsonValue,
        output: r.ok ? (r.meta.output as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch (e) {
    console.error("[ai] failed to log call", e);
  }
}
