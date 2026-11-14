"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, ChevronDown, Eye, Plus, Sparkles, Trash2 } from "lucide-react";
import { Collapsible, Slider } from "radix-ui";
import { toast } from "sonner";
import { publishAssessment, saveSetup } from "@/app/actions/assessments";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, Label } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox, Switch } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useNumbers } from "@/components/providers";
import { cn } from "@/lib/utils";

type Importance = "MUST_HAVE" | "NICE_TO_HAVE" | "BASELINE";
const IMPORTANCE: Importance[] = ["MUST_HAVE", "NICE_TO_HAVE", "BASELINE"];

interface Initial {
  title: string;
  seniority: "entry" | "mid" | "senior" | "lead" | "executive";
  summary: string;
  industry: string;
  source: string;
  flags: { quote: string; category: string; explanation: string; suggestion: string }[];
  acknowledgedFlags: boolean;
  durationMinutes: number;
  language: "en" | "ar";
  accommodations: { extraTimeAllowed: boolean; untimedAllowed: boolean; largerTextAllowed: boolean };
  domains: { key: string; name: string; description: string; importance: Importance; rationale: string }[];
  technical: { key: string; name: string; description: string; anchors: string[]; importance: Importance }[];
}

function ImportancePicker({ value, onChange, label, disabled }: { value: Importance; onChange: (v: Importance) => void; label: string; disabled?: boolean }) {
  const t = useTranslations("setup");
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex shrink-0 rounded-control bg-surface-sunken p-0.5">
      {IMPORTANCE.map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          disabled={disabled}
          onClick={() => onChange(i)}
          className={cn("h-8 rounded-[6px] px-2.5 text-xs font-medium transition-colors disabled:opacity-60", value === i ? "bg-surface text-text shadow-[0_1px_2px_rgb(0_0_0/0.06)]" : "text-secondary hover:text-text")}
        >
          {t(`importance.${i}`)}
        </button>
      ))}
    </div>
  );
}

export function SetupForm({ id, status, locked, initial }: { id: string; status: string; locked: boolean; initial: Initial }) {
  const t = useTranslations("setup");
  const tl = useTranslations("levels");
  const n = useNumbers();
  const router = useRouter();
  const [s, setS] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const mustHaves = s.domains.filter((d) => d.importance === "MUST_HAVE").length + s.technical.filter((x) => x.importance === "MUST_HAVE").length;

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await saveSetup({
      id,
      title: s.title,
      seniority: s.seniority,
      durationMinutes: s.durationMinutes,
      language: s.language,
      accommodations: s.accommodations,
      domains: s.domains.map((d) => ({ key: d.key, importance: d.importance })),
      technical: s.technical,
      acknowledgedFlags: s.acknowledgedFlags,
    });
    setSaving(false);
    if (!res.ok) {
      setError(t("errors.save"));
      return false;
    }
    toast.success(t("saved"));
    router.refresh();
    return true;
  };

  const setTech = (i: number, patch: Partial<Initial["technical"][number]>) => setS((x) => ({ ...x, technical: x.technical.map((tch, j) => (j === i ? { ...tch, ...patch } : tch)) }));

  return (
    <div className="flex flex-col gap-6">
      {locked ? <Alert tone="info">{t("locked")}</Alert> : null}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("role")}
            <Badge tone="info">
              <Sparkles aria-hidden />
              {s.source === "anthropic" ? t("drafted.ai") : t("drafted.offline")}
            </Badge>
          </CardTitle>
          <CardDescription>{t("roleHint")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_14rem]">
          <Field label={t("roleTitle")}>{({ id: fid }) => <Input id={fid} value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} />}</Field>
          <Field label={t("seniority")}>
            {({ id: fid }) => (
              <Select value={s.seniority} onValueChange={(v) => setS({ ...s, seniority: v as Initial["seniority"] })} disabled={locked}>
                <SelectTrigger id={fid}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["entry", "mid", "senior", "lead", "executive"] as const).map((x) => (
                    <SelectItem key={x} value={x}>
                      {t(`seniorityLevel.${x}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
          <p className="text-sm leading-relaxed text-secondary sm:col-span-2" dir="auto">
            {s.summary}
            {s.industry ? <span className="text-tertiary"> · {t("storySetIn", { industry: s.industry })}</span> : null}
          </p>
        </CardContent>
      </Card>

      {s.flags.length ? (
        <Card className="border-warning/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="size-4" aria-hidden />
              {t("flagsTitle", { n: s.flags.length })}
            </CardTitle>
            <CardDescription>{t("flagsHint")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {s.flags.map((f, i) => (
                <li key={i} className="rounded-control border border-border bg-surface-subtle p-3 text-sm">
                  <p className="font-medium text-text" dir="auto">
                    “{f.quote}”
                  </p>
                  <p className="mt-1 text-secondary" dir="auto">{f.explanation}</p>
                  <p className="mt-1 text-secondary" dir="auto">
                    <span className="font-medium text-text">{t("suggestion")} </span>
                    {f.suggestion}
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-2.5">
              <Checkbox id="ack" checked={s.acknowledgedFlags} onCheckedChange={(c) => setS({ ...s, acknowledgedFlags: c === true })} className="mt-0.5" />
              <Label htmlFor="ack" className="font-normal">{t("acknowledge")}</Label>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("technical")}</CardTitle>
          <CardDescription>{t("technicalHint")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {s.technical.map((tech, i) => (
            <Collapsible.Root key={tech.key || i} className="group rounded-control border border-border bg-surface">
              <div className="flex flex-wrap items-center gap-3 p-3">
                <Input aria-label={t("skillName")} value={tech.name} onChange={(e) => setTech(i, { name: e.target.value })} className="h-9 min-w-48 flex-1" disabled={locked} />
                <ImportancePicker value={tech.importance} onChange={(v) => setTech(i, { importance: v })} label={t("importanceOf", { name: tech.name })} disabled={locked} />
                <Collapsible.Trigger className="inline-flex size-8 items-center justify-center rounded-control text-tertiary hover:bg-surface-subtle" aria-label={t("editAnchors", { name: tech.name })}>
                  <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
                </Collapsible.Trigger>
                <Button variant="ghost" size="icon-sm" aria-label={t("remove", { name: tech.name })} disabled={locked || s.technical.length <= 1} onClick={() => setS((x) => ({ ...x, technical: x.technical.filter((_, j) => j !== i) }))}>
                  <Trash2 aria-hidden />
                </Button>
              </div>
              <Collapsible.Content className="flex flex-col gap-3 border-t border-border p-3">
                <Field label={t("skillDescription")}>{({ id: fid }) => <Input id={fid} value={tech.description} onChange={(e) => setTech(i, { description: e.target.value })} disabled={locked} />}</Field>
                {tech.anchors.map((a, li) => (
                  <Field key={li} label={`${n.number(li + 1)} · ${tl(String(li + 1))}`}>
                    {({ id: fid }) => <Textarea id={fid} value={a} onChange={(e) => setTech(i, { anchors: tech.anchors.map((x, k) => (k === li ? e.target.value : x)) })} className="min-h-16" disabled={locked} />}
                  </Field>
                ))}
              </Collapsible.Content>
            </Collapsible.Root>
          ))}
          <Button
            variant="secondary"
            size="sm"
            className="self-start"
            disabled={locked || s.technical.length >= 8}
            onClick={() => setS((x) => ({ ...x, technical: [...x.technical, { key: "", name: t("newSkill"), description: "", anchors: [1, 2, 3, 4, 5].map((l) => t(`anchorTemplate.${l}`)), importance: "NICE_TO_HAVE" }] }))}
          >
            <Plus aria-hidden />
            {t("addSkill")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("domains")}</CardTitle>
          <CardDescription>{t("domainsHint")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {s.domains.map((d, i) => (
            <div key={d.key} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-text">{d.name}</span>
                <span className="text-xs text-secondary" dir="auto">{d.rationale || d.description}</span>
              </div>
              <ImportancePicker value={d.importance} onChange={(v) => setS((x) => ({ ...x, domains: x.domains.map((y, j) => (j === i ? { ...y, importance: v } : y)) }))} label={t("importanceOf", { name: d.name })} disabled={locked} />
            </div>
          ))}
          {mustHaves > 5 ? <Alert tone="warning" className="mt-3">{t("tooManyMustHaves")}</Alert> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="duration">{t("duration")}</Label>
              <span className="text-sm font-medium text-text tabular">{t("minutes", { n: n.number(s.durationMinutes) })}</span>
            </div>
            <Slider.Root id="duration" className="relative flex h-5 touch-none select-none items-center" min={25} max={90} step={5} value={[s.durationMinutes]} onValueChange={([v]) => setS({ ...s, durationMinutes: v ?? 50 })} disabled={locked}>
              <Slider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-surface-sunken">
                <Slider.Range className="absolute h-full bg-accent" />
              </Slider.Track>
              <Slider.Thumb aria-label={t("duration")} className="block size-4 rounded-full border-2 border-accent bg-surface shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" />
            </Slider.Root>
            <p className="text-xs text-secondary">{t("durationHint")}</p>
          </div>
          <Field label={t("language")}>
            {({ id: fid }) => (
              <Select value={s.language} onValueChange={(v) => setS({ ...s, language: v as "en" | "ar" })} disabled={locked}>
                <SelectTrigger id={fid} className="max-w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            )}
          </Field>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-sm font-medium text-text">{t("accommodations")}</legend>
            {(["extraTimeAllowed", "untimedAllowed", "largerTextAllowed"] as const).map((k) => (
              <div key={k} className="flex items-center justify-between gap-4 rounded-control border border-border px-3 py-2.5">
                <Label htmlFor={k} className="font-normal">{t(`acc.${k}`)}</Label>
                <Switch id={k} checked={s.accommodations[k]} onCheckedChange={(c) => setS({ ...s, accommodations: { ...s.accommodations, [k]: c } })} />
              </div>
            ))}
          </fieldset>
        </CardContent>
      </Card>

      {error ? <Alert tone="critical">{error}</Alert> : null}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:mx-0 sm:rounded-card sm:border">
        <Button variant="ghost" asChild>
          <Link href={`/preview/${id}`} target="_blank">
            <Eye aria-hidden />
            {t("preview")}
          </Link>
        </Button>
        <Button variant="secondary" onClick={save} loading={saving}>
          {t("save")}
        </Button>
        {status !== "PUBLISHED" ? (
          <Button
            loading={publishing}
            disabled={s.flags.length > 0 && !s.acknowledgedFlags}
            onClick={async () => {
              setPublishing(true);
              if (!(await save())) return setPublishing(false);
              const res = await publishAssessment(id);
              setPublishing(false);
              if (!res.ok) return setError(t(`errors.${res.error === "flags" ? "flags" : "publish"}`));
              toast.success(t("published"));
              router.push(`/app/assessments/${id}`);
            }}
          >
            {t("publish")}
          </Button>
        ) : (
          <Button asChild>
            <Link href={`/app/assessments/${id}`}>{t("toCandidates")}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
