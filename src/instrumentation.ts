import type { Instrumentation } from "next";
import { reportError, toReport } from "@/lib/ops/report-error";

/** At server start (Node.js only): billing plans set each organisation's monthly AI budget (D-066). */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerPlanBudgets } = await import("@/lib/billing/register");
    registerPlanBudgets();
  }
}

/** Every server error Next.js captures goes to the error reporter (logs, and Sentry or a webhook when configured). */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  await reportError(toReport(err, request, context));
};
