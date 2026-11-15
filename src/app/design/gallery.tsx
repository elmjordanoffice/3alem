"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Briefcase,
  ChevronDown,
  ClipboardList,
  Copy,
  Download,
  Info,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { setNumerals } from "@/app/actions/preferences";
import { useLocaleSettings, useNumbers } from "@/components/providers";
import { Logo } from "@/components/brand/logo";
import { LanguageToggle, ThemeMenu } from "@/components/app/preference-controls";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, Label } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox, RadioGroup, RadioItem, Switch } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger, SegmentedList, SegmentedTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "@/components/ui/menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, Person } from "@/components/ui/avatar";
import { AnswerEditor } from "@/components/assessment/answer-editor";
import { RankingList, type RankItem } from "@/components/assessment/ranking-list";
import { Allocation } from "@/components/assessment/allocation";
import { RoleplayChat, type ChatMessage } from "@/components/assessment/roleplay-chat";
import { DocumentViewer } from "@/components/assessment/document-viewer";
import { QuietTimer } from "@/components/assessment/quiet-timer";
import { ChapterList, ChapterProgress } from "@/components/assessment/chapter-progress";
import { AutosaveIndicator } from "@/components/assessment/autosave-indicator";
import { LevelLegend, LevelMeter, SkillChip } from "@/components/report/level";
import { EvidenceCard } from "@/components/report/evidence-card";
import { SkillBars, SkillHeatmap, SkillRadar } from "@/components/report/charts";
import type { samples as samplesFn } from "./samples";

type Samples = ReturnType<typeof samplesFn>;

const SECTIONS = ["foundations", "controls", "navigation", "feedback", "assessment", "report"] as const;

export function Gallery({ samples, domains }: { samples: Samples; domains: { key: string; label: string; short: string }[] }) {
  const t = useTranslations("gallery");
  const td = useTranslations("domainsShort");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="rounded-control focus-visible:outline-2 focus-visible:outline-focus">
            <Logo />
          </Link>
          <span className="hidden text-sm text-tertiary sm:inline">/</span>
          <span className="hidden text-sm font-medium text-text sm:inline">{t("title")}</span>
          <div className="ms-auto flex items-center gap-1">
            <NumeralsToggle />
            <LanguageToggle />
            <ThemeMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[11rem_1fr]">
        <nav aria-label={t("contents")} className="hidden lg:block">
          <ul className="sticky top-24 flex flex-col gap-1 text-sm">
            {SECTIONS.map((s) => (
              <li key={s}>
                <a href={`#${s}`} className="block rounded-control px-2.5 py-1.5 text-secondary hover:bg-surface-subtle hover:text-text">
                  {t(`sections.${s}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex min-w-0 flex-col gap-16">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-text">{t("title")}</h1>
            <p className="reading text-secondary">{t("intro")}</p>
          </div>

          <Foundations />
          <Controls />
          <Navigation />
          <Feedback />
          {/* Keyed by language so sample state resets when the language changes. */}
          <Assessment key={samples.candidateName} samples={samples} />
          <Report samples={samples} domains={domains.map((d) => ({ ...d, short: td(d.key) }))} />
        </main>
      </div>
    </div>
  );
}

function Section({ id, children }: { id: (typeof SECTIONS)[number]; children: React.ReactNode }) {
  const t = useTranslations("gallery");
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className="mb-6 flex flex-col gap-1 border-b border-border pb-3">
        <h2 id={`${id}-title`} className="text-lg font-semibold text-text">
          {t(`sections.${id}`)}
        </h2>
        <p className="text-sm text-secondary">{t(`sectionNotes.${id}`)}</p>
      </div>
      <div className="flex flex-col gap-10">{children}</div>
    </section>
  );
}

function Specimen({ title, note, children, className }: { title: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-3" data-specimen={title}>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {note ? <p className="text-sm text-secondary">{note}</p> : null}
      </div>
      <div className={className}>{children}</div>
    </div>
  );
}

function NumeralsToggle() {
  const t = useTranslations("gallery");
  const { numerals } = useLocaleSettings();
  const router = useRouter();
  const [pending, start] = React.useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      loading={pending}
      aria-label={t("numeralsToggle")}
      onClick={() =>
        start(async () => {
          await setNumerals(numerals === "latn" ? "arab" : "latn");
          router.refresh();
        })
      }
    >
      <span className="tabular">{numerals === "latn" ? "١٢٣" : "123"}</span>
    </Button>
  );
}

/* ─────────────────────────── Foundations ─────────────────────────── */

const COLOR_GROUPS = [
  { key: "neutrals", tokens: ["background", "surface", "surface-subtle", "surface-sunken", "border", "border-strong", "text", "text-secondary", "text-tertiary", "mark-muted"] },
  { key: "accent", tokens: ["accent", "accent-hover", "accent-subtle", "accent-text", "focus-ring"] },
  { key: "semantic", tokens: ["success", "warning", "critical", "info", "success-subtle", "warning-subtle", "critical-subtle", "info-subtle"] },
  { key: "levels", tokens: ["level-1", "level-2", "level-3", "level-4", "level-5", "level-empty"] },
  { key: "charts", tokens: ["chart-1", "chart-2", "chart-3", "chart-4"] },
];

function Foundations() {
  const t = useTranslations("gallery.foundations");
  const n = useNumbers();
  const sizes = [
    { cls: "text-3xl font-semibold", px: 40 },
    { cls: "text-2xl font-semibold", px: 32 },
    { cls: "text-xl font-semibold", px: 24 },
    { cls: "text-lg font-semibold", px: 20 },
    { cls: "text-base", px: 16 },
    { cls: "text-sm", px: 14 },
    { cls: "text-xs", px: 12 },
  ];
  return (
    <Section id="foundations">
      {COLOR_GROUPS.map((g) => (
        <Specimen key={g.key} title={t(`colors.${g.key}`)} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {g.tokens.map((token) => (
            <div key={token} className="overflow-hidden rounded-control border border-border bg-surface">
              <div className="h-12 border-b border-border" style={{ background: `var(--${token})` }} />
              <code className="block truncate px-2.5 py-2 font-mono text-[11px] text-secondary" dir="ltr">
                --{token}
              </code>
            </div>
          ))}
        </Specimen>
      ))}

      <Specimen title={t("type")} note={t("typeNote")} className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface">
        {sizes.map((s) => (
          <div key={s.px} className="flex items-baseline gap-4 px-4 py-3">
            <span className="w-10 shrink-0 text-xs text-tertiary tabular">{n.number(s.px)}</span>
            <span className={`${s.cls} min-w-0 truncate text-text`}>{t("typeSample")}</span>
          </div>
        ))}
      </Specimen>

      <div className="grid gap-10 md:grid-cols-2">
        <Specimen title={t("spacing")} note={t("spacingNote")} className="flex items-end gap-2">
          {[4, 8, 12, 16, 24, 32, 48].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <span className="block bg-accent/70" style={{ width: s, height: s }} />
              <span className="text-[11px] text-tertiary tabular">{n.number(s)}</span>
            </div>
          ))}
        </Specimen>
        <Specimen title={t("shape")} note={t("shapeNote")} className="flex flex-wrap gap-4">
          <div className="flex h-14 w-24 items-center justify-center rounded-control border border-border-strong bg-surface text-xs text-secondary">8px</div>
          <div className="flex h-14 w-24 items-center justify-center rounded-card border border-border bg-surface text-xs text-secondary">12px</div>
          <div className="flex h-14 w-24 items-center justify-center rounded-control border border-border bg-surface text-xs text-secondary shadow-popover">{t("popoverShadow")}</div>
        </Specimen>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <Specimen title={t("icons")} note={t("iconsNote")} className="flex flex-wrap gap-3 text-secondary">
          {[Briefcase, Users, ClipboardList, Search, Bell, Settings, Download, Copy, Info, Trash2].map((Icon, i) => (
            <span key={i} className="inline-flex size-10 items-center justify-center rounded-control border border-border bg-surface">
              <Icon className="size-5" strokeWidth={1.5} aria-hidden />
            </span>
          ))}
        </Specimen>
        <MotionSpecimen />
      </div>
    </Section>
  );
}

function MotionSpecimen() {
  const t = useTranslations("gallery.foundations");
  const [open, setOpen] = React.useState(false);
  return (
    <Specimen title={t("motion")} note={t("motionNote")} className="flex flex-col items-start gap-3">
      <Button variant="secondary" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <ChevronDown className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
        {open ? t("motionHide") : t("motionShow")}
      </Button>
      {open ? (
        <div className="w-full animate-slide-up rounded-card border border-border bg-surface p-4 text-sm text-secondary">{t("motionPanel")}</div>
      ) : null}
    </Specimen>
  );
}

/* ─────────────────────────── Controls ─────────────────────────── */

function Controls() {
  const t = useTranslations("gallery.controls");
  const [loading, setLoading] = React.useState(false);
  return (
    <Section id="controls">
      <Specimen title={t("buttons")} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button>{t("startChapter")}</Button>
          <Button variant="secondary">{t("saveDraft")}</Button>
          <Button variant="ghost">{t("cancel")}</Button>
          <Button variant="destructive">
            <Trash2 aria-hidden />
            {t("delete")}
          </Button>
          <Button variant="link">{t("learnMore")}</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">{t("small")}</Button>
          <Button size="md">{t("medium")}</Button>
          <Button size="lg">
            {t("continue")}
            <ArrowRight className="flip-rtl" aria-hidden />
          </Button>
          <Button size="icon" variant="secondary" aria-label={t("add")}>
            <Plus aria-hidden />
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => setLoading(false), 1500);
            }}
          >
            {t("submitAnswer")}
          </Button>
          <Button disabled>{t("disabled")}</Button>
        </div>
      </Specimen>

      <div className="grid gap-8 md:grid-cols-2">
        <Specimen title={t("inputs")} className="flex flex-col gap-5">
          <Field label={t("roleTitle")} hint={t("roleTitleHint")}>
            {({ id, describedBy }) => <Input id={id} placeholder={t("roleTitlePlaceholder")} aria-describedby={describedBy} />}
          </Field>
          <Field label={t("email")} error={t("emailError")}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} defaultValue="lina@northwind" aria-describedby={describedBy} aria-invalid={invalid} />
            )}
          </Field>
          <Field label={t("notes")} optionalLabel={t("optional")}>
            {({ id }) => <Textarea id={id} placeholder={t("notesPlaceholder")} />}
          </Field>
          <Field label={t("disabledInput")}>{({ id }) => <Input id={id} value={t("disabledValue")} disabled readOnly />}</Field>
        </Specimen>

        <Specimen title={t("choices")} className="flex flex-col gap-6">
          <Field label={t("duration")}>
            {({ id }) => (
              <Select defaultValue="50">
                <SelectTrigger id={id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["25", "40", "50", "60", "90"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {t("minutes", { count: Number(v) })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-text">{t("accommodations")}</span>
            {(["extraTime", "untimed", "largerText"] as const).map((k, i) => (
              <div key={k} className="flex items-center gap-3">
                <Checkbox id={`cb-${k}`} defaultChecked={i === 0} />
                <Label htmlFor={`cb-${k}`} className="font-normal">
                  {t(k)}
                </Label>
              </div>
            ))}
          </div>
          <RadioGroup defaultValue="must" aria-label={t("importance")}>
            <span className="text-sm font-medium text-text">{t("importance")}</span>
            {(["must", "nice", "baseline"] as const).map((k) => (
              <div key={k} className="flex items-center gap-3">
                <RadioItem id={`r-${k}`} value={k} />
                <Label htmlFor={`r-${k}`} className="font-normal">
                  {t(`importance_${k}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex items-center justify-between gap-4 rounded-control border border-border bg-surface px-3 py-2.5">
            <Label htmlFor="sw-share">{t("shareReport")}</Label>
            <Switch id="sw-share" defaultChecked />
          </div>
        </Specimen>
      </div>
    </Section>
  );
}

/* ─────────────────────────── Navigation & overlays ─────────────────────────── */

function Navigation() {
  const t = useTranslations("gallery.navigation");
  const tc = useTranslations("common");
  return (
    <Section id="navigation">
      <Specimen title={t("tabs")}>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
            <TabsTrigger value="evidence">{t("evidence")}</TabsTrigger>
            <TabsTrigger value="interview">{t("interview")}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-sm text-secondary">{t("overviewBody")}</TabsContent>
          <TabsContent value="evidence" className="text-sm text-secondary">{t("evidenceBody")}</TabsContent>
          <TabsContent value="interview" className="text-sm text-secondary">{t("interviewBody")}</TabsContent>
        </Tabs>
      </Specimen>

      <Specimen title={t("segmented")}>
        <Tabs defaultValue="radar">
          <SegmentedList aria-label={t("segmented")}>
            <SegmentedTrigger value="radar">{t("radar")}</SegmentedTrigger>
            <SegmentedTrigger value="bars">{t("bars")}</SegmentedTrigger>
          </SegmentedList>
          <TabsContent value="radar" className="text-sm text-secondary">{t("radar")}</TabsContent>
          <TabsContent value="bars" className="text-sm text-secondary">{t("bars")}</TabsContent>
        </Tabs>
      </Specimen>

      <Specimen title={t("overlays")} className="flex flex-wrap items-center gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">{t("openDialog")}</Button>
          </DialogTrigger>
          <DialogContent closeLabel={tc("close")}>
            <DialogHeader>
              <DialogTitle>{t("dialogTitle")}</DialogTitle>
              <DialogDescription>{t("dialogBody")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary">{t("keepWorking")}</Button>
              <Button>{t("pause")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              {t("menu")}
              <ChevronDown aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{t("report")}</DropdownMenuLabel>
            <DropdownMenuItem>
              <Download aria-hidden />
              {t("exportPdf")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy aria-hidden />
              {t("copyLink")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive>
              <Trash2 aria-hidden />
              {t("revoke")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">{t("howScored")}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <p className="font-medium text-text">{t("howScored")}</p>
            <p className="mt-1.5 text-secondary">{t("howScoredBody")}</p>
          </PopoverContent>
        </Popover>

        <Tooltip content={t("tooltipBody")}>
          <Button variant="ghost" size="icon" aria-label={t("tooltip")}>
            <Info aria-hidden />
          </Button>
        </Tooltip>

        <Button variant="secondary" onClick={() => toast.success(t("toastTitle"), { description: t("toastBody") })}>
          {t("showToast")}
        </Button>
      </Specimen>
    </Section>
  );
}

/* ─────────────────────────── Feedback & states ─────────────────────────── */

function Feedback() {
  const t = useTranslations("gallery.feedback");
  return (
    <Section id="feedback">
      <Specimen title={t("alerts")} className="flex flex-col gap-3">
        <Alert tone="info" title={t("infoTitle")}>{t("infoBody")}</Alert>
        <Alert tone="success" title={t("successTitle")}>{t("successBody")}</Alert>
        <Alert tone="warning" title={t("warningTitle")}>{t("warningBody")}</Alert>
        <Alert tone="critical" title={t("criticalTitle")} action={<Button size="sm" variant="secondary">{t("retry")}</Button>}>
          {t("criticalBody")}
        </Alert>
      </Specimen>

      <Specimen title={t("badges")} className="flex flex-wrap gap-2">
        <Badge>{t("draft")}</Badge>
        <Badge tone="accent">{t("inProgress")}</Badge>
        <Badge tone="success">{t("completed")}</Badge>
        <Badge tone="warning">{t("awaitingReview")}</Badge>
        <Badge tone="critical">{t("expired")}</Badge>
        <Badge tone="info">{t("earlyVersion")}</Badge>
      </Specimen>

      <div className="grid gap-8 md:grid-cols-2">
        <Specimen title={t("loading")} className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-9 w-28" />
            </CardContent>
          </Card>
          <Spinner label={t("preparing")} />
        </Specimen>
        <Specimen title={t("autosave")} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
          <AutosaveIndicator state="saved" />
          <AutosaveIndicator state="saving" />
          <AutosaveIndicator state="offline" />
          <AutosaveIndicator state="error" />
        </Specimen>
      </div>

      <Specimen title={t("empty")}>
        <EmptyState
          icon={Users}
          title={t("emptyTitle")}
          description={t("emptyBody")}
          action={
            <Button>
              <Plus aria-hidden />
              {t("emptyAction")}
            </Button>
          }
        />
      </Specimen>

      <Specimen title={t("cards")} className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("cardTitle")}</CardTitle>
            <CardDescription>{t("cardBody")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge tone="accent">{t("inProgress")}</Badge>
            <Badge>{t("draft")}</Badge>
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="sm" variant="secondary">{t("open")}</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <Person name="Lina Haddad" role={t("personRole")} size="lg" />
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {["Lina Haddad", "Tomás Reyes", "Amara Okafor", "Yuki Tanaka", "Omondi Maina"].map((n) => (
                <Avatar key={n} name={n} className="ring-2 ring-surface" />
              ))}
            </div>
          </CardContent>
        </Card>
      </Specimen>
    </Section>
  );
}

/* ─────────────────────────── Assessment ─────────────────────────── */

function Assessment({ samples }: { samples: Samples }) {
  const t = useTranslations("gallery.assessment");
  const [rank, setRank] = React.useState<RankItem[]>(samples.rankItems);
  const [alloc, setAlloc] = React.useState<Record<string, number>>({ fix: 40, monitor: 25, comms: 20, support: 0 });
  const [messages, setMessages] = React.useState<ChatMessage[]>(samples.chat);
  const [pending, setPending] = React.useState(false);
  const [ended, setEnded] = React.useState(false);
  const [deadline] = React.useState(() => Date.now() + 14 * 60 * 1000 + 32 * 1000);
  const [frozenNow] = React.useState(() => Date.now());

  return (
    <Section id="assessment">
      <Specimen title={t("progress")} note={t("progressNote")} className="grid gap-6 md:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-4">
          <ChapterProgress chapters={samples.chapters} current={1} />
          <div className="mt-4 flex items-center justify-between">
            <AutosaveIndicator state="saved" />
            <QuietTimer deadline={deadline} />
          </div>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <ChapterList chapters={samples.chapters} current={1} />
        </div>
      </Specimen>

      <Specimen title={t("lowTime")} note={t("lowTimeNote")}>
        <div className="inline-flex rounded-card border border-border bg-surface px-4 py-2">
          <QuietTimer deadline={frozenNow + 95 * 1000} now={frozenNow} />
        </div>
      </Specimen>

      <Specimen title={t("cast")} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {samples.cast.map((c) => (
          <div key={c.name} className="rounded-card border border-border bg-surface p-3">
            <Person name={c.name} role={c.role} />
          </div>
        ))}
      </Specimen>

      <Specimen title={t("documents")} note={t("documentsNote")}>
        <DocumentViewer materials={samples.materials} label={t("documents")} />
      </Specimen>

      <Specimen title={t("editor")} note={t("editorNote")}>
        <Field label={t("editorLabel")} hint={t("editorHint")}>
          {({ id, describedBy }) => (
            <AnswerEditor id={id} label={t("editorLabel")} describedBy={describedBy} onPaste={(n) => toast(t("pasteLogged", { count: n }))} />
          )}
        </Field>
      </Specimen>

      <div className="grid gap-8 lg:grid-cols-2">
        <Specimen title={t("ranking")} note={t("rankingNote")}>
          <RankingList items={rank} onChange={setRank} label={t("ranking")} />
        </Specimen>
        <Specimen title={t("allocation")} note={t("allocationNote")}>
          <Allocation rows={samples.allocationRows} value={alloc} onChange={setAlloc} label={t("allocation")} />
        </Specimen>
      </div>

      <Specimen title={t("roleplay")} note={t("roleplayNote")} className="h-[34rem]">
        <RoleplayChat
          stakeholder={samples.stakeholder}
          messages={messages}
          candidateName={samples.candidateName}
          pending={pending}
          ended={ended}
          onEnd={() => setEnded(true)}
          onSend={(text) => {
            setMessages((m) => [...m, { id: String(Date.now()), from: "candidate", text }]);
            setPending(true);
            window.setTimeout(() => {
              setPending(false);
              setMessages((m) => [...m, { id: String(Date.now() + 1), from: "stakeholder", text: t("roleplayReply") }]);
            }, 1400);
          }}
        />
      </Specimen>

      <Specimen title={t("transition")} note={t("transitionNote")}>
        <div className="mx-auto flex max-w-[680px] flex-col gap-5 rounded-card border border-border bg-surface p-6 sm:p-10">
          <p className="text-[13px] font-medium text-tertiary">{t("transitionEyebrow")}</p>
          <h3 className="text-xl font-semibold text-text">{t("transitionTitle")}</h3>
          <p className="leading-relaxed text-secondary">{t("transitionBody")}</p>
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="ghost">
              <ArrowLeft className="flip-rtl" aria-hidden />
              {t("pauseHere")}
            </Button>
            <Button>
              {t("startChapter3")}
              <ArrowRight className="flip-rtl" aria-hidden />
            </Button>
          </div>
        </div>
      </Specimen>
    </Section>
  );
}

/* ─────────────────────────── Report ─────────────────────────── */

const PROFILE: Record<string, [number, number, number]> = {
  technical: [3.6, 3.1, 0.82],
  "critical-thinking": [4.1, 3.4, 0.86],
  judgment: [4.3, 3.0, 0.8],
  leadership: [3.2, 3.8, 0.64],
  management: [3.4, 3.5, 0.7],
  communication: [2.7, 4.2, 0.78],
  "product-thinking": [4.0, 2.8, 0.58],
  collaboration: [3.5, 3.9, 0.72],
  adaptability: [3.9, 3.3, 0.66],
};

function Report({ samples, domains }: { samples: Samples; domains: { key: string; label: string; short: string }[] }) {
  const t = useTranslations("gallery.report");
  const [view, setView] = React.useState("radar");
  const heatRows = samples.team.map((name, i) => ({
    key: name,
    label: name,
    values: Object.fromEntries(
      domains.map((d, j) => [d.key, i === 4 && j > 5 ? null : Math.round((2 + ((i * 7 + j * 3) % 30) / 10) * 10) / 10]),
    ),
  }));

  return (
    <Section id="report">
      <div className="grid gap-8 md:grid-cols-2">
        <Specimen title={t("chips")} className="flex flex-wrap gap-2">
          <SkillChip name={domains[2]?.label ?? ""} estimate={4.3} importance="mustHave" />
          <SkillChip name={domains[5]?.label ?? ""} estimate={2.7} importance="mustHave" />
          <SkillChip name={domains[6]?.label ?? ""} estimate={4.0} importance="niceToHave" />
          <SkillChip name={domains[3]?.label ?? ""} />
        </Specimen>
        <Specimen title={t("legend")}>
          <LevelLegend />
        </Specimen>
      </div>

      <Specimen title={t("meters")} note={t("metersNote")} className="grid gap-5 rounded-card border border-border bg-surface p-5 md:grid-cols-2">
        <LevelMeter label={domains[2]?.label ?? ""} estimate={4.3} confidence={0.86} />
        <LevelMeter label={domains[6]?.label ?? ""} estimate={4.0} confidence={0.52} />
        <LevelMeter label={domains[5]?.label ?? ""} estimate={2.7} confidence={0.78} />
        <LevelMeter label={domains[3]?.label ?? ""} estimate={3.2} confidence={0.35} />
      </Specimen>

      <Specimen title={t("evidence")} note={t("evidenceNote")}>
        <EvidenceCard
          quote={samples.evidence.quote}
          context={samples.evidence.context}
          skill={domains[2]?.label}
          rationale={samples.evidence.rationale}
          confidence={0.84}
        />
      </Specimen>

      <Specimen title={t("profile")} note={t("profileNote")}>
        <Tabs value={view} onValueChange={setView}>
          <SegmentedList aria-label={t("profile")}>
            <SegmentedTrigger value="radar">{t("radar")}</SegmentedTrigger>
            <SegmentedTrigger value="bars">{t("bars")}</SegmentedTrigger>
            <SegmentedTrigger value="compare">{t("compare")}</SegmentedTrigger>
          </SegmentedList>
          <TabsContent value="radar">
            <SkillRadar
              label={t("profile")}
              series={[{ key: "a", label: samples.team[0]! }]}
              data={domains.map((d) => ({ key: d.key, label: d.short, values: { a: PROFILE[d.key]?.[0] ?? 3 } }))}
            />
          </TabsContent>
          <TabsContent value="bars">
            <SkillBars
              label={t("profile")}
              data={domains.map((d) => ({ key: d.key, label: d.label, estimate: PROFILE[d.key]?.[0] ?? 3, confidence: PROFILE[d.key]?.[2] ?? 0.6 }))}
            />
          </TabsContent>
          <TabsContent value="compare">
            <SkillRadar
              label={t("compare")}
              series={[
                { key: "a", label: samples.team[0]! },
                { key: "b", label: samples.team[2]! },
              ]}
              data={domains.map((d) => ({ key: d.key, label: d.short, values: { a: PROFILE[d.key]?.[0] ?? 3, b: PROFILE[d.key]?.[1] ?? 3 } }))}
            />
          </TabsContent>
        </Tabs>
      </Specimen>

      <Specimen title={t("heatmap")} note={t("heatmapNote")}>
        <div className="rounded-card border border-border bg-surface p-4">
          <SkillHeatmap label={t("heatmap")} rows={heatRows} columns={domains.map((d) => ({ key: d.key, label: d.label, short: d.short }))} />
          <LevelLegend className="mt-4 border-t border-border pt-3" />
        </div>
      </Specimen>
    </Section>
  );
}
