"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Archive, Library, Pencil, Plus, RotateCcw } from "lucide-react";
import { saveLibraryEntry, setLibraryEntryActive } from "@/app/actions/admin";
import type { LibraryEntry } from "@/lib/library";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, SegmentedList, SegmentedTrigger, TabsContent } from "@/components/ui/tabs";

type Pair = { en: string; ar: string };
interface Draft { id?: string; domain: string; name: Pair; description: Pair; anchors: Pair[] }
const empty = (domain: string): Draft => ({ domain, name: { en: "", ar: "" }, description: { en: "", ar: "" }, anchors: [1, 2, 3, 4, 5].map(() => ({ en: "", ar: "" })) });

export function LibraryEditor({ entries, domains }: { entries: LibraryEntry[]; domains: { key: string; name: string }[] }) {
  const t = useTranslations("library");
  const tl = useTranslations("levels");
  const locale = useLocale() === "ar" ? "ar" : "en";
  const router = useRouter();
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const domainName = (k: string) => domains.find((d) => d.key === k)?.name ?? k;

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const valid = draft && draft.name.en.trim() && draft.description.en.trim() && draft.anchors.every((a) => a.en.trim());

  const form = draft ? (
    <Card>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          const res = await saveLibraryEntry(draft);
          setPending(false);
          if (!res.ok) {
            setError(t("invalid"));
            return;
          }
          toast.success(t("saved"));
          setDraft(null);
          setError(null);
          router.refresh();
        }}
      >
        <CardHeader>
          <CardTitle>{draft.id ? t("editTitle") : t("newTitle")}</CardTitle>
          <CardDescription>{t("formHint")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {error ? <Alert tone="critical">{error}</Alert> : null}
          <Field label={t("domain")}>
            {({ id }) => (
              <Select value={draft.domain} onValueChange={(v) => set({ domain: v })}>
                <SelectTrigger id={id}><SelectValue /></SelectTrigger>
                <SelectContent>{domains.map((d) => <SelectItem key={d.key} value={d.key}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </Field>
          <Tabs defaultValue="en">
            <SegmentedList aria-label={t("languageLabel")}>
              <SegmentedTrigger value="en">English</SegmentedTrigger>
              <SegmentedTrigger value="ar">العربية</SegmentedTrigger>
            </SegmentedList>
            {(["en", "ar"] as const).map((lang) => (
              <TabsContent key={lang} value={lang} className="mt-4 flex flex-col gap-4" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
                {lang === "ar" ? <p className="text-xs text-tertiary">{t("arabicHint")}</p> : null}
                <Field label={t("name")}>{({ id }) => <Input id={id} required={lang === "en"} value={draft.name[lang]} onChange={(e) => set({ name: { ...draft.name, [lang]: e.target.value } })} />}</Field>
                <Field label={t("skillDescription")}>{({ id }) => <Textarea id={id} required={lang === "en"} className="min-h-16" value={draft.description[lang]} onChange={(e) => set({ description: { ...draft.description, [lang]: e.target.value } })} />}</Field>
                <fieldset className="flex flex-col gap-3">
                  <legend className="mb-1 text-sm font-medium text-text">{t("anchors")}</legend>
                  {draft.anchors.map((a, i) => (
                    <Field key={i} label={`${i + 1} · ${tl(String(i + 1) as "1")}`}>
                      {({ id }) => <Textarea id={id} required={lang === "en"} className="min-h-14" placeholder={t(`anchorPlaceholder.${i + 1}` as "anchorPlaceholder.1")} value={a[lang]} onChange={(e) => set({ anchors: draft.anchors.map((x, j) => (j === i ? { ...x, [lang]: e.target.value } : x)) })} />}
                    </Field>
                  ))}
                </fieldset>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => { setDraft(null); setError(null); }}>{t("cancel")}</Button>
          <Button type="submit" loading={pending} disabled={!valid}>{t("save")}</Button>
        </CardFooter>
      </form>
    </Card>
  ) : null;

  return (
    <div className="flex flex-col gap-6">
      <Alert tone="info">{t("explainer")}</Alert>
      {draft && !draft.id ? form : (
        <div>
          <Button onClick={() => setDraft(empty(domains[1]?.key ?? domains[0]!.key))} disabled={!!draft}><Plus aria-hidden /> {t("add")}</Button>
        </div>
      )}
      {entries.length === 0 && !draft ? (
        <EmptyState icon={Library} title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((e) =>
            draft?.id === e.id ? (
              <li key={e.id}>{form}</li>
            ) : (
              <li key={e.id} className="rounded-card border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-text">{e.name[locale] || e.name.en}</h3>
                      <Badge>{domainName(e.domain)}</Badge>
                      {!e.isActive ? <Badge tone="warning">{t("retired")}</Badge> : null}
                      <span className="text-xs text-tertiary">{t("version", { v: e.version })}</span>
                    </div>
                    <p className="mt-1 text-sm text-secondary">{e.description[locale] || e.description.en}</p>
                    <code className="mt-1 block w-fit font-mono text-[11px] text-tertiary" dir="ltr">{e.key}</code>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" disabled={!!draft} onClick={() => setDraft({ id: e.id, domain: e.domain, name: e.name, description: e.description, anchors: e.anchors })}><Pencil aria-hidden /> {t("edit")}</Button>
                    <Button variant="ghost" size="sm" onClick={async () => { await setLibraryEntryActive(e.id, !e.isActive); router.refresh(); }}>
                      {e.isActive ? <><Archive aria-hidden /> {t("retire")}</> : <><RotateCcw aria-hidden /> {t("restore")}</>}
                    </Button>
                  </div>
                </div>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-secondary hover:text-text">{t("showAnchors")}</summary>
                  <ol className="mt-2 flex flex-col gap-1.5">
                    {e.anchors.map((a, i) => (
                      <li key={i} className="flex gap-2"><span className="w-5 shrink-0 text-tertiary tabular">{i + 1}</span><span className="text-secondary">{a[locale] || a.en}</span></li>
                    ))}
                  </ol>
                </details>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
