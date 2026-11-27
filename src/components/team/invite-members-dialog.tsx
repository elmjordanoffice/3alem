"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { inviteTeamAction } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AllowanceHint, BillingGateNotice } from "@/components/billing/gate-notice";
import type { BillingBlock } from "@/lib/billing/core";

/** `allowance`: invitations left on the plan this month, when billing is on and the plan has a limit. */
export function InviteMembersDialog({ teamId, allowance }: { teamId: string; allowance?: { remaining: number; allowance: number; trial: boolean } | null }) {
  const t = useTranslations("team.invite");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [list, setList] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [blocked, setBlocked] = React.useState<BillingBlock | null>(null);
  const [pending, start] = React.useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus aria-hidden />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={tc("close")}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("body")}</DialogDescription>
        </DialogHeader>
        <Textarea value={list} onChange={(e) => setList(e.target.value)} aria-label={t("label")} placeholder="name@company.com" className="min-h-32 font-mono text-sm" dir="ltr" />
        <Alert tone="neutral">{t("consentNote")}</Alert>
        {error ? <Alert tone="critical">{error}</Alert> : null}
        {blocked ? <BillingGateNotice reason={blocked.reason} remaining={blocked.remaining} canManage={blocked.canManage} /> : null}
        {allowance ? <AllowanceHint allowance={allowance} /> : null}
        <DialogFooter>
          <Button
            loading={pending}
            disabled={!list.trim()}
            onClick={() =>
              start(async () => {
                setError(null);
                setBlocked(null);
                const r = await inviteTeamAction(teamId, list);
                if (!r.ok) return r.error === "billing" ? setBlocked(r) : setError(t("noEmails"));
                toast.success(t("sent", { count: r.count }));
                setOpen(false);
                setList("");
                router.refresh();
              })
            }
          >
            {t("send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
