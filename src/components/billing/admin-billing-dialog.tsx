"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { adminUpdateBilling } from "@/app/actions/billing";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Platform admins: put an organisation on Enterprise (custom invitations and
 * AI budget, invoiced outside Stripe) or extend its trial.
 */
export function AdminBillingDialog({
  org,
  current,
  billingOn,
}: {
  org: { id: string; name: string };
  current: { plan: string; customInvitations: number | null; customAiBudgetUsd: number | null; trialEndsAt: string | null } | null;
  billingOn: boolean;
}) {
  const t = useTranslations("billing");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [plan, setPlan] = React.useState<"enterprise" | "trial">(current?.plan === "trial" ? "trial" : "enterprise");
  const [invitations, setInvitations] = React.useState(current?.customInvitations?.toString() ?? "");
  const [budget, setBudget] = React.useState(current?.customAiBudgetUsd?.toString() ?? "");
  const [trialEnds, setTrialEnds] = React.useState(current?.trialEndsAt?.slice(0, 10) ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, start] = React.useTransition();
  const num = (v: string) => (v.trim() === "" ? null : Math.max(0, Math.floor(Number(v))));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">{t("admin.edit")}</Button>
      </DialogTrigger>
      <DialogContent closeLabel={tc("close")}>
        <DialogHeader>
          <DialogTitle>{t("admin.editFor", { org: org.name })}</DialogTitle>
          <DialogDescription>{t("admin.description")}</DialogDescription>
        </DialogHeader>
        {billingOn ? null : <Alert tone="neutral">{t("admin.off")}</Alert>}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium text-text">{t("admin.plan")}</legend>
          <div className="flex flex-wrap gap-2">
            {(["enterprise", "trial"] as const).map((p) => (
              <label key={p} className={cn("flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm shadow-[inset_0_0_0_1px_var(--border-strong)]", plan === p && "bg-accent-subtle text-accent-text shadow-[inset_0_0_0_1px_var(--accent-text)]")}>
                <input type="radio" name="plan" value={p} checked={plan === p} onChange={() => setPlan(p)} className="accent-[var(--accent)]" />
                {t(`plans.${p}`)}
              </label>
            ))}
          </div>
        </fieldset>
        {plan === "enterprise" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("admin.invitations")}>{({ id }) => <Input id={id} type="number" min={0} inputMode="numeric" value={invitations} onChange={(e) => setInvitations(e.target.value)} dir="ltr" />}</Field>
            <Field label={t("admin.aiBudget")}>{({ id }) => <Input id={id} type="number" min={0} inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} dir="ltr" />}</Field>
          </div>
        ) : (
          <Field label={t("admin.trialEnds")}>{({ id }) => <Input id={id} type="date" value={trialEnds} onChange={(e) => setTrialEnds(e.target.value)} dir="ltr" />}</Field>
        )}
        {error ? <Alert tone="critical">{error}</Alert> : null}
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>{tc("cancel")}</Button>
          <Button
            loading={pending}
            onClick={() =>
              start(async () => {
                setError(null);
                const res = await adminUpdateBilling({ organizationId: org.id, plan, customInvitations: num(invitations), customAiBudgetUsd: num(budget), trialEndsOn: plan === "trial" ? trialEnds || null : null });
                if (!res.ok) return setError(t.has(`errors.${res.error}` as "errors.invalid") ? t(`errors.${res.error}` as "errors.invalid") : t("errors.invalid"));
                toast.success(t("admin.saved"));
                setOpen(false);
                router.refresh();
              })
            }
          >
            {t("admin.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
