import "server-only";
import { setPlanBudgetResolver } from "@/lib/ai/budget";
import { planAiBudgetUsd } from "./index";

/**
 * Let billing plans set each organisation's monthly AI budget (see
 * src/lib/ai/budget.ts). Called once at server start from instrumentation's
 * register(), and by the background worker.
 */
export function registerPlanBudgets() {
  setPlanBudgetResolver(planAiBudgetUsd);
}
