import type { z } from "zod";

export type AgentName =
  | "jd-analyst"
  | "world-builder"
  | "item-generator"
  | "guessability-checker"
  | "scorer"
  | "roleplay-actor"
  | "report-writer"
  | "practice-feedback"
  | "coach";

export type Effort = "low" | "medium" | "high";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** A prompt definition: one narrow job, a strict schema, a version. */
export interface AgentDefinition<I, O> {
  agent: AgentName;
  /** Bump on any wording change; recorded on every row it produces. */
  version: string;
  schema: z.ZodType<O>;
  effort: Effort;
  maxTokens: number;
  /** Stable system prompt (cached). Must not contain per-request data. */
  system: string;
  /** The per-request message(s). */
  messages: (input: I) => ChatTurn[];
}

export interface CompletionRequest<I, O> {
  definition: AgentDefinition<I, O>;
  input: I;
}

export interface CompletionResult<O> {
  output: O;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  latencyMs: number;
}

export interface ModelProvider {
  name: "anthropic" | "offline";
  model: string;
  complete<I, O>(req: CompletionRequest<I, O>): Promise<CompletionResult<O>>;
}

export class AgentError extends Error {
  constructor(
    message: string,
    readonly kind: "refusal" | "truncated" | "invalid_output" | "provider" | "unsupported",
  ) {
    super(message);
  }
}
