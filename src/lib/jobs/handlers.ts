import "server-only";
import { registerHandler, type JobName, type JobPayloads } from "./index";
import { scoreResponse } from "@/lib/hire/scoring";
import { pregenerate } from "@/lib/hire/session";
import { buildReport } from "@/lib/hire/report";

export const HANDLERS: { [N in JobName]: (p: JobPayloads[N]) => Promise<void> } = {
  "score-response": async ({ responseId }) => scoreResponse(responseId),
  pregenerate: async ({ sessionId }) => pregenerate(sessionId),
  "build-report": async ({ sessionId }) => buildReport(sessionId),
  "retention-sweep": async () => {
    const { retentionSweep } = await import("@/lib/retention");
    await retentionSweep();
  },
};

for (const [name, fn] of Object.entries(HANDLERS)) registerHandler(name as JobName, fn as never);
