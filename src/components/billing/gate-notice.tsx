"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import type { GateReason } from "@/lib/billing/core";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNumbers } from "@/components/providers";

/**
 * Shown in place of an invite when the plan refuses it: why, what still
 * works, and the way forward (the billing page for admins, "ask your admin"
 * for everyone else).
 */
export function BillingGateNotice({ reason, remaining, canManage }: { reason: GateReason; remaining: number; canManage: boolean }) {
  const t = useTranslations("billing.gate");
  return (
    <Alert
      tone="warning"
      title={t(`${reason}.title`)}
      action={
        canManage ? (
          <Button asChild size="sm" variant="secondary">
            <Link href="/app/org/billing">
              {t("seePlans")}
              <ArrowRight className="flip-rtl" aria-hidden />
            </Link>
          </Button>
        ) : null
      }
    >
      <p>{t(`${reason}.body`, { remaining })}</p>
      {canManage ? null : <p className="mt-1 font-medium text-text">{t("askAdmin")}</p>}
    </Alert>
  );
}

/** "Candidate invitations left this month: 12 of 25", near the invite form. */
export function AllowanceHint({ allowance }: { allowance: { remaining: number; allowance: number; trial: boolean } }) {
  const t = useTranslations("billing.allowance");
  const n = useNumbers();
  return (
    <p className="text-xs text-secondary">
      <span className="font-medium text-text tabular">{t(allowance.trial ? "trial" : "paid", { n: n.number(allowance.remaining), total: n.number(allowance.allowance) })}</span>
      {" · "}
      {t("rule")}
    </p>
  );
}
