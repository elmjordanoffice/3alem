import { z } from "zod";
import type { AgentDefinition, ChatTurn } from "../types";
import { LANGUAGE_NAME } from "./shared";

export const actorOutputSchema = z.object({
  reply: z.string(),
  mood: z.enum(["calm", "guarded", "frustrated", "angry", "sceptical", "warming", "satisfied"]),
  /** 0–1: how far the stakeholder's hidden goals have been met. */
  goalProgress: z.number().min(0).max(1),
  shouldEnd: z.boolean(),
});
export type ActorOutput = z.infer<typeof actorOutputSchema>;

export interface ActorInput {
  language: "en" | "ar";
  stakeholder: { name: string; role: string; personality: string };
  publicContext: string;
  hiddenGoals: string[];
  startingMood: string;
  softensWhen: string[];
  hardensWhen: string[];
  resolution: string;
  companyName: string;
  candidateRole: string;
  maxTurns: number;
  conversation: ChatTurn[];
}

export const roleplayActor: AgentDefinition<ActorInput, ActorOutput> = {
  agent: "roleplay-actor",
  version: "roleplay-actor.v1",
  schema: actorOutputSchema,
  effort: "low",
  maxTokens: 1500,
  system: `You play a workplace stakeholder in a live role-play that is part of a skills assessment. Stay in character at all times; never mention the assessment, skills, scoring or that you are an AI.

How to play:
- Pursue your hidden goals. Do not reveal them unless the candidate earns it by asking good questions and listening.
- Your mood starts where the brief says and moves realistically with how the candidate communicates: it softens when they do what the brief lists under "softens", hardens when they do what it lists under "hardens". Real people do not flip instantly; move one step at a time.
- Speak like a real person at work: 1–4 sentences, specific, no speeches. Push back when it is in character.
- If the candidate makes a promise, hold them to specifics (who, what, by when).
- End (shouldEnd true) when a resolution is reached, when the conversation clearly cannot progress, or at the turn limit; your final reply then closes the conversation naturally.
- Reply in the requested language.`,
  messages: (i) => {
    const brief = `Language: ${LANGUAGE_NAME[i.language]}
You are ${i.stakeholder.name}, ${i.stakeholder.role} at ${i.companyName}. Personality: ${i.stakeholder.personality}
The candidate is the ${i.candidateRole}.
What the candidate knows: ${i.publicContext}
Your hidden goals: ${i.hiddenGoals.join("; ")}
Starting mood: ${i.startingMood}
You soften when the candidate: ${i.softensWhen.join("; ")}
You harden when the candidate: ${i.hardensWhen.join("; ")}
A resolution looks like: ${i.resolution}
Turn limit: ${i.maxTurns} candidate messages.`;
    const transcript = i.conversation.map((t) => `${t.role === "user" ? "CANDIDATE" : "YOU"}: ${t.content}`).join("\n");
    return [{ role: "user", content: `${brief}\n\nConversation so far:\n${transcript || "(you speak first)"}\n\nYour next reply:` }];
  },
};
