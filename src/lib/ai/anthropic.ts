import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { AgentError, type CompletionRequest, type CompletionResult, type ModelProvider } from "./types";

/**
 * Claude, through the official SDK.
 *
 * - Model: Claude Opus 5.5 (override with AALIM_MODEL).
 * - Structured outputs (output_config.format) guarantee schema-valid JSON;
 *   the result is validated again with Zod.
 * - Current models take no sampling parameters, so "low temperature for
 *   scoring" is expressed as higher effort plus a strict schema (D-023).
 * - Server-side refusal fallbacks are on ("default" routing).
 * - The system prompt is cached; per-request data goes in the user turn.
 */
export class AnthropicProvider implements ModelProvider {
  readonly name = "anthropic" as const;
  readonly model: string;
  private client: Anthropic;

  constructor(opts?: { model?: string; apiKey?: string }) {
    this.model = opts?.model ?? process.env.AALIM_MODEL ?? "claude-opus-5-5";
    this.client = new Anthropic({ apiKey: opts?.apiKey, maxRetries: 2, timeout: 120_000 });
  }

  async complete<I, O>({ definition, input }: CompletionRequest<I, O>): Promise<CompletionResult<O>> {
    const started = Date.now();
    try {
      const response = await this.client.beta.messages.parse({
        model: this.model,
        max_tokens: definition.maxTokens,
        system: [{ type: "text", text: definition.system, cache_control: { type: "ephemeral" } }],
        messages: definition.messages(input),
        output_config: { format: betaZodOutputFormat(definition.schema), effort: definition.effort },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });

      if (response.stop_reason === "refusal") {
        throw new AgentError(`Refused: ${response.stop_details?.category ?? "unspecified"}`, "refusal");
      }
      if (response.stop_reason === "max_tokens") throw new AgentError("Output truncated at max_tokens", "truncated");
      const parsed = definition.schema.safeParse(response.parsed_output);
      if (!parsed.success) throw new AgentError(`Schema mismatch: ${parsed.error.message.slice(0, 500)}`, "invalid_output");

      return {
        output: parsed.data,
        provider: this.name,
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0,
        latencyMs: Date.now() - started,
      };
    } catch (error) {
      if (error instanceof AgentError) throw error;
      if (error instanceof Anthropic.APIError) throw new AgentError(`Anthropic API ${error.status}: ${error.message}`, "provider");
      throw new AgentError(error instanceof Error ? error.message : String(error), "provider");
    }
  }
}

/** USD per million tokens. */
const PRICING: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.1, cacheWrite: 2.5 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
  "claude-fable-5-2": { input: 8, output: 40, cacheRead: 0.2, cacheWrite: 10 },
};

export function costUsd(r: Pick<CompletionResult<unknown>, "model" | "inputTokens" | "outputTokens" | "cacheReadTokens" | "cacheWriteTokens">): number {
  const p = PRICING[r.model] ?? PRICING["claude-opus-5-5"]!;
  return (r.inputTokens * p.input + r.outputTokens * p.output + r.cacheReadTokens * p.cacheRead + r.cacheWriteTokens * p.cacheWrite) / 1_000_000;
}
