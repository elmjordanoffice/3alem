import { z } from "zod";
import type { ItemContent } from "./item-schema";

/** What the candidate submits for each task kind. Validated on the server. */
export const responseContentSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("choice"), optionId: z.string(), justification: z.string().max(8000) }),
  z.object({ kind: z.literal("ranking"), order: z.array(z.string()).min(1), reasoning: z.string().max(8000) }),
  z.object({ kind: z.literal("allocation"), values: z.record(z.string(), z.number().int().min(0)), reasoning: z.string().max(8000) }),
  z.object({ kind: z.literal("written"), text: z.string().max(20000), doc: z.unknown().optional() }),
  z.object({
    kind: z.literal("inbox"),
    order: z.array(z.string()),
    triage: z.record(z.string(), z.enum(["reply", "delegate", "later", "ignore"])),
    replies: z.array(z.object({ messageId: z.string(), text: z.string().max(8000) })),
  }),
  z.object({ kind: z.literal("roleplay"), transcript: z.array(z.object({ from: z.enum(["candidate", "stakeholder"]), text: z.string() })) }),
  z.object({ kind: z.literal("design"), sections: z.record(z.string(), z.string().max(8000)) }),
  z.object({ kind: z.literal("chain"), choices: z.array(z.object({ roundId: z.string(), optionId: z.string(), reason: z.string().max(4000) })) }),
  z.object({ kind: z.literal("forced_choice"), picks: z.record(z.string(), z.enum(["a", "b"])) }),
]);
export type ResponseContent = z.infer<typeof responseContentSchema>;

/** Client-side events recorded with a response (context only, never a verdict). */
export const responseEventSchema = z.object({
  type: z.enum(["paste", "tab_hidden", "focus_lost"]),
  at: z.number(),
  chars: z.number().optional(),
});

/**
 * Plain-text rendering of a response, as the Scorer reads it and as evidence
 * quotes are taken from. Options are written out in full so quotes read well.
 */
export function responseText(content: ResponseContent, item: ItemContent): string {
  const task = item.task;
  switch (content.kind) {
    case "choice": {
      const o = task.options?.find((x) => x.id === content.optionId);
      return `Chosen option: ${o?.label ?? content.optionId}\n\n${content.justification}`.trim();
    }
    case "ranking": {
      const label = (id: string) => task.rankItems?.find((x) => x.id === id)?.label ?? id;
      return `${content.order.map((id, i) => `${i + 1}. ${label(id)}`).join("\n")}\n\n${content.reasoning}`.trim();
    }
    case "allocation": {
      const rows = task.allocation?.rows ?? [];
      return `${rows.map((r) => `${r.label}: ${content.values[r.id] ?? 0}`).join("\n")}\n\n${content.reasoning}`.trim();
    }
    case "written":
      return content.text.trim();
    case "inbox": {
      const msgs = task.inbox?.messages ?? [];
      const subject = (id: string) => msgs.find((m) => m.id === id)?.subject ?? id;
      const order = content.order.map((id, i) => `${i + 1}. ${subject(id)} — ${content.triage[id] ?? "later"}`).join("\n");
      const replies = content.replies.map((r) => `Reply to "${subject(r.messageId)}":\n${r.text}`).join("\n\n");
      return `${order}\n\n${replies}`.trim();
    }
    case "roleplay":
      return content.transcript.map((t) => `${t.from === "candidate" ? "Candidate" : "Stakeholder"}: ${t.text}`).join("\n");
    case "design": {
      const sections = task.design?.sections ?? [];
      return sections.map((s) => `${s.label}:\n${content.sections[s.id] ?? ""}`).join("\n\n").trim();
    }
    case "chain": {
      const rounds = task.chain?.rounds ?? [];
      return content.choices
        .map((c, i) => {
          const round = rounds.find((r) => r.id === c.roundId);
          const opt = round?.options.find((o) => o.id === c.optionId);
          return `Round ${i + 1}: ${opt?.label ?? c.optionId}${c.reason ? `\n${c.reason}` : ""}`;
        })
        .join("\n\n");
    }
    case "forced_choice":
      return "";
  }
}

/** Only the candidate's own words, for evidence quotes and style analysis. */
export function candidateWords(content: ResponseContent): string {
  switch (content.kind) {
    case "choice":
      return content.justification;
    case "ranking":
    case "allocation":
      return content.reasoning;
    case "written":
      return content.text;
    case "inbox":
      return content.replies.map((r) => r.text).join("\n\n");
    case "roleplay":
      return content.transcript.filter((t) => t.from === "candidate").map((t) => t.text).join("\n");
    case "design":
      return Object.values(content.sections).join("\n\n");
    case "chain":
      return content.choices.map((c) => c.reason).join("\n");
    case "forced_choice":
      return "";
  }
}

/** One-line summary of a decision, fed back into later scenes (consequences carry forward). */
export function decisionSummary(content: ResponseContent, item: ItemContent): string | null {
  const first = (s: string) => s.split(/(?<=[.!?؟])\s/)[0]?.slice(0, 160) ?? "";
  switch (content.kind) {
    case "choice": {
      const o = item.task.options?.find((x) => x.id === content.optionId);
      return o ? `${item.title}: chose "${o.label}"` : null;
    }
    case "ranking": {
      const top = item.task.rankItems?.find((x) => x.id === content.order[0]);
      return top ? `${item.title}: put "${top.label}" first` : null;
    }
    case "allocation": {
      const rows = item.task.allocation?.rows ?? [];
      const top = [...rows].sort((a, b) => (content.values[b.id] ?? 0) - (content.values[a.id] ?? 0))[0];
      return top ? `${item.title}: gave most resources to "${top.label}"` : null;
    }
    case "chain": {
      const last = content.choices.at(-1);
      const round = item.task.chain?.rounds.find((r) => r.id === last?.roundId);
      const opt = round?.options.find((o) => o.id === last?.optionId);
      return opt ? `${item.title}: finally chose "${opt.label}"` : null;
    }
    case "written":
    case "design":
      return `${item.title}: ${first(candidateWords(content))}`;
    case "roleplay":
      return `${item.title}: had a conversation with the stakeholder`;
    default:
      return null;
  }
}
