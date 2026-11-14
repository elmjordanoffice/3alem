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

export function InviteMembersDialog({ teamId }: { teamId: string }) {
  const t = useTranslations("team.invite");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [list, setList] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
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
        <DialogFooter>
          <Button
            loading={pending}
            disabled={!list.trim()}
            onClick={() =>
              start(async () => {
                const r = await inviteTeamAction(teamId, list);
                if (!r.ok) return setError(t("noEmails"));
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
