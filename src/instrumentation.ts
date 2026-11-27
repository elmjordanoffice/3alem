import type { Instrumentation } from "next";
import { reportError, toReport } from "@/lib/ops/report-error";

/** Every server error Next.js captures goes to the error reporter (logs, and Sentry or a webhook when configured). */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  await reportError(toReport(err, request, context));
};
