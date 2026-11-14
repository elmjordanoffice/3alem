"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { DOMAINS } from "@/lib/framework/data";
import { createTeamAction } from "@/app/actions/team";
import { useLocaleSettings } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function CreateTeamDialog() {
  const t = useTranslations("team.create");
  const tc = useTranslations("common");
  const { locale } = useLocaleSettings();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [goals, setGoals] = React.useState<string[]>([]);
  const [pending, start] = React.useTransition();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={tc("close")} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("body")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field label={t("name")}>{({ id }) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
          <Field label={t("purpose")} hint={t("purposeHint")} optionalLabel={tc("optional")}>
            {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20" />}
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-text">{t("goals")}</legend>
            <p className="text-sm text-secondary">{t("goalsHint")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {DOMAINS.map((d) => (
                <label key={d.key} className="flex items-center gap-2.5 rounded-control border border-border px-3 py-2 text-sm">
                  <Checkbox checked={goals.includes(d.key)} disabled={!goals.includes(d.key) && goals.length >= 4} onCheckedChange={(c) => setGoals((g) => (c ? [...g, d.key] : g.filter((x) => x !== d.key)))} />
                  {d.name[locale]}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <DialogFooter>
          <Button disabled={name.trim().length < 2} loading={pending} onClick={() => start(async () => void (await createTeamAction({ name, goals, description })))}>
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
