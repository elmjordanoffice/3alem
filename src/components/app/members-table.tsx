"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MoreHorizontal, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import type { OrgRole } from "@/generated/prisma/enums";
import { ORG_ROLES } from "@/lib/auth/roles";
import { addMember, removeMember, updateMemberRoles } from "@/app/actions/organizations";
import { Person } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/menu";

interface Member {
  userId: string;
  name: string;
  email: string;
  roles: OrgRole[];
}

export function MembersTable({ members, canManage, currentUserId }: { members: Member[]; canManage: boolean; currentUserId: string }) {
  const t = useTranslations("members");
  const tr = useTranslations("roles");
  const tc = useTranslations("common");
  const router = useRouter();
  const [editing, setEditing] = React.useState<Member | null>(null);
  const [adding, setAdding] = React.useState(false);

  const errorText = (code: string) => t.has(`errors.${code}`) ? t(`errors.${code}`) : t("errors.generic");

  return (
    <>
      {canManage ? (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setAdding(true)}>
            <UserPlus aria-hidden />
            {t("add")}
          </Button>
        </div>
      ) : null}

      {members.length === 0 ? (
        <EmptyState icon={Users} title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <div className="overflow-hidden rounded-card bg-surface shadow-card">
          <table className="w-full text-sm">
            <caption className="sr-only">{t("title")}</caption>
            <thead className="bg-surface-subtle text-start text-xs text-secondary">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">{t("columns.person")}</th>
                <th scope="col" className="hidden px-4 py-2.5 text-start font-medium sm:table-cell">{t("columns.roles")}</th>
                {canManage ? <th scope="col" className="w-12 px-2"><span className="sr-only">{tc("actions")}</span></th> : null}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.userId} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <span className="flex items-center gap-2">
                        <Person name={m.name} role={m.email} />
                        {m.userId === currentUserId ? <Badge>{t("you")}</Badge> : null}
                      </span>
                      <span className="flex flex-wrap gap-1 sm:hidden">
                        {m.roles.map((r) => <Badge key={r} tone="accent">{tr(r)}</Badge>)}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="flex flex-wrap gap-1">
                      {m.roles.map((r) => <Badge key={r} tone="accent">{tr(r)}</Badge>)}
                    </span>
                  </td>
                  {canManage ? (
                    <td className="px-2 py-3 text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={t("actionsFor", { name: m.name })}>
                            <MoreHorizontal aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setEditing(m)}>{t("editRoles")}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            destructive
                            onSelect={async () => {
                              const res = await removeMember(m.userId);
                              if (res.ok) {
                                toast.success(t("removed", { name: m.name }));
                                router.refresh();
                              } else toast.error(errorText(res.error));
                            }}
                          >
                            {t("remove")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RolesDialog
        key={`edit-${editing?.userId ?? "none"}`}
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing ? t("editRolesFor", { name: editing.name }) : ""}
        initialRoles={editing?.roles ?? []}
        submitLabel={tc("save")}
        onSubmit={async (roles) => {
          if (!editing) return null;
          const res = await updateMemberRoles({ userId: editing.userId, roles });
          if (!res.ok) return errorText(res.error);
          toast.success(t("rolesUpdated"));
          setEditing(null);
          router.refresh();
          return null;
        }}
      />

      <RolesDialog
        key={`add-${adding}`}
        open={adding}
        onOpenChange={setAdding}
        title={t("addTitle")}
        description={t("addDescription")}
        initialRoles={["RECRUITER"]}
        withEmail
        submitLabel={t("add")}
        onSubmit={async (roles, email) => {
          const res = await addMember({ email: email ?? "", roles });
          if (!res.ok) return errorText(res.error);
          toast.success(t("added"));
          setAdding(false);
          router.refresh();
          return null;
        }}
      />
    </>
  );
}

function RolesDialog({
  open,
  onOpenChange,
  title,
  description,
  initialRoles,
  withEmail,
  submitLabel,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  initialRoles: OrgRole[];
  withEmail?: boolean;
  submitLabel: string;
  /** Returns an error message, or null on success. */
  onSubmit: (roles: OrgRole[], email?: string) => Promise<string | null>;
}) {
  const t = useTranslations("members");
  const tr = useTranslations("roles");
  const tc = useTranslations("common");
  const [roles, setRoles] = React.useState<OrgRole[]>(initialRoles);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tc("close")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <form
          className="flex flex-col gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (roles.length === 0) {
              setError(t("errors.rolesRequired"));
              return;
            }
            setPending(true);
            const err = await onSubmit(roles, email);
            setPending(false);
            setError(err);
          }}
        >
          {withEmail ? (
            <Field label={t("emailLabel")}>
              {({ id }) => <Input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />}
            </Field>
          ) : null}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-medium text-text">{t("columns.roles")}</legend>
            {ORG_ROLES.map((r) => {
              const id = `role-${r}`;
              return (
                <div key={r} className="flex items-start gap-3">
                  <Checkbox
                    id={id}
                    checked={roles.includes(r)}
                    onCheckedChange={(c) => setRoles((prev) => (c ? [...prev, r] : prev.filter((x) => x !== r)))}
                    className="mt-0.5"
                  />
                  <label htmlFor={id} className="flex flex-col">
                    <span className="text-sm font-medium text-text">{tr(r)}</span>
                    <span className="text-sm text-secondary">{tr(`${r}_desc`)}</span>
                  </label>
                </div>
              );
            })}
          </fieldset>
          {error ? <p role="alert" className="text-sm text-critical">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit" loading={pending}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
