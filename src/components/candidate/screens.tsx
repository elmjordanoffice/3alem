"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Clock, Coffee, Lock, PauseCircle, ShieldCheck, Wifi } from "lucide-react";
import type { Branding, CandidateView, PublicWorld } from "@/lib/hire/candidate-state";
import { setLocale, setTextSize } from "@/app/actions/preferences";
import { Button } from "@/components/ui/button";
import { Checkbox, RadioGroup, RadioItem } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Person } from "@/components/ui/avatar";
import { ChapterList } from "@/components/assessment/chapter-progress";
import { useLocaleSettings, useNumbers } from "@/components/providers";
import { CandidateShell } from "./shell";
import { cn } from "@/lib/utils";

type View<K extends CandidateView["view"]> = Extract<CandidateView, { view: K }>;

export function StateScreen({ branding, icon: Icon, title, body }: { branding?: Branding; icon: typeof Lock; title: string; body: string }) {
  return (
    <CandidateShell branding={branding}>
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-surface-subtle text-secondary">
          <Icon className="size-5" strokeWidth={1.5} aria-hidden />
        </span>
        <h1 className="text-xl font-semibold text-text">{title}</h1>
        <p className="text-secondary">{body}</p>
      </div>
    </CandidateShell>
  );
}

export function Landing({ v, onStart }: { v: View<"landing">; onStart: (o: { locale: "en" | "ar"; extraTime: 1 | 1.25 | 1.5; untimed: boolean; largerText: boolean }) => Promise<void> }) {
  const t = useTranslations("candidate.landing");
  const n = useNumbers();
  const router = useRouter();
  const { locale: uiLocale } = useLocaleSettings();
  const [locale, setLoc] = React.useState<"en" | "ar">(uiLocale);
  const [extraTime, setExtraTime] = React.useState<"1" | "1.25" | "1.5">("1");
  const [untimed, setUntimed] = React.useState(false);
  const [largerText, setLargerText] = React.useState(false);
  const [consent, setConsent] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const chooseLanguage = async (l: "en" | "ar") => {
    setLoc(l);
    await setLocale(l);
    router.refresh();
  };

  return (
    <CandidateShell branding={v.branding}>
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="flex flex-col gap-6">
          <p className="text-sm font-medium text-accent-text">{t("eyebrow", { org: v.branding.orgName })}</p>
          <h1 className="text-2xl font-semibold leading-tight text-text sm:text-3xl">{v.candidateName ? t("titleNamed", { name: v.candidateName.split(" ")[0]!, role: v.roleTitle }) : t("title", { role: v.roleTitle })}</h1>
          <p className="reading text-lg leading-relaxed text-secondary">{t("intro", { minutes: n.number(v.minutes) })}</p>

          <ul className="grid gap-4 sm:grid-cols-2">
            {(["story", "noTricks", "pause", "people"] as const).map((k) => (
              <li key={k} className="flex flex-col gap-1 rounded-card border border-border bg-surface p-4">
                <span className="text-sm font-semibold text-text">{t(`expect.${k}.title`)}</span>
                <span className="text-sm text-secondary">{t(`expect.${k}.body`)}</span>
              </li>
            ))}
          </ul>

          <section aria-labelledby="data-use" className="rounded-card border border-border bg-surface-subtle p-5">
            <h2 id="data-use" className="flex items-center gap-2 text-sm font-semibold text-text">
              <ShieldCheck className="size-4 text-accent-text" aria-hidden />
              {t("data.title")}
            </h2>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 ps-5 text-sm text-secondary">
              {(["who", "how", "ai", "keep", "rights"] as const).map((k) => (
                <li key={k}>{t(`data.${k}`, { org: v.branding.orgName })}</li>
              ))}
            </ul>
          </section>
        </section>

        <aside className="flex flex-col gap-5 self-start rounded-card border border-border bg-surface p-5 lg:sticky lg:top-24">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text">{t("language")}</span>
            <div className="grid grid-cols-2 gap-1 rounded-control bg-surface-sunken p-0.5">
              {(["en", "ar"] as const).map((l) => (
                <button key={l} type="button" lang={l} aria-pressed={locale === l} onClick={() => chooseLanguage(l)} className={cn("h-9 rounded-[6px] text-sm font-medium", locale === l ? "bg-surface text-text shadow-[0_1px_2px_rgb(0_0_0/0.06)]" : "text-secondary hover:text-text")}>
                  {l === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>
          </div>

          {v.allowed.extraTime || v.allowed.untimed || v.allowed.largerText ? (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-medium text-text">{t("accommodations")}</legend>
              {v.allowed.extraTime ? (
                <RadioGroup value={extraTime} onValueChange={(x) => setExtraTime(x as typeof extraTime)} aria-label={t("extraTime")}>
                  <span className="text-sm text-secondary">{t("extraTime")}</span>
                  {(["1", "1.25", "1.5"] as const).map((x) => (
                    <div key={x} className="flex items-center gap-2.5">
                      <RadioItem id={`et-${x}`} value={x} />
                      <Label htmlFor={`et-${x}`} className="font-normal">{t(`extraTimeOption.${x.replace(".", "_")}`)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : null}
              {v.allowed.untimed ? (
                <div className="flex items-start gap-2.5">
                  <Checkbox id="untimed" checked={untimed} onCheckedChange={(c) => setUntimed(c === true)} className="mt-0.5" />
                  <Label htmlFor="untimed" className="font-normal">{t("untimed")}</Label>
                </div>
              ) : null}
              {v.allowed.largerText ? (
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="larger"
                    checked={largerText}
                    onCheckedChange={async (c) => {
                      setLargerText(c === true);
                      await setTextSize(c === true ? "large" : "default");
                      router.refresh();
                    }}
                    className="mt-0.5"
                  />
                  <Label htmlFor="larger" className="font-normal">{t("largerText")}</Label>
                </div>
              ) : null}
            </fieldset>
          ) : null}

          <div className="flex items-start gap-2.5 border-t border-border pt-4">
            <Checkbox id="consent" checked={consent} onCheckedChange={(c) => setConsent(c === true)} className="mt-0.5" />
            <Label htmlFor="consent" className="font-normal leading-snug">{t("consent", { org: v.branding.orgName })}</Label>
          </div>
          {error ? <Alert tone="critical">{error}</Alert> : null}
          <Button
            size="lg"
            disabled={!consent}
            loading={pending}
            onClick={async () => {
              setPending(true);
              setError(null);
              try {
                await onStart({ locale, extraTime: Number(extraTime) as 1 | 1.25 | 1.5, untimed, largerText });
              } catch {
                setError(t("startError"));
                setPending(false);
              }
            }}
          >
            {t("continue")}
            <ArrowRight className="flip-rtl" aria-hidden />
          </Button>
          <p className="text-xs text-tertiary">{t("minutesNote", { minutes: n.number(v.minutes) })}</p>
        </aside>
      </div>
    </CandidateShell>
  );
}

export function Briefing({ v, onBegin }: { v: View<"briefing">; onBegin: () => Promise<void> }) {
  const t = useTranslations("candidate.briefing");
  const n = useNumbers();
  const [step, setStep] = React.useState<"before" | "story">("before");
  const [pending, setPending] = React.useState(false);

  if (step === "before") {
    return (
      <CandidateShell branding={v.branding}>
        <div className="mx-auto flex max-w-[680px] flex-col gap-8 px-4 py-12 sm:py-20">
          <h1 className="text-2xl font-semibold text-text">{t("beforeTitle")}</h1>
          <ul className="flex flex-col gap-5">
            {[
              { icon: Coffee, k: "quiet" },
              { icon: Clock, k: "time" },
              { icon: PauseCircle, k: "pause" },
              { icon: Wifi, k: "offline" },
            ].map(({ icon: Icon, k }) => (
              <li key={k} className="flex gap-4">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-secondary">
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-text">{t(`before.${k}.title`)}</span>
                  <span className="text-sm text-secondary">{t(`before.${k}.body`, { minutes: n.number(v.minutes) })}</span>
                </span>
              </li>
            ))}
          </ul>
          <Button size="lg" className="self-start" onClick={() => setStep("story")}>
            {t("ready")}
            <ArrowRight className="flip-rtl" aria-hidden />
          </Button>
        </div>
      </CandidateShell>
    );
  }

  return (
    <CandidateShell branding={v.branding}>
      <article className="mx-auto flex max-w-[680px] flex-col gap-10 px-4 py-12 sm:py-16 animate-slide-up">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-accent-text">{t("eyebrow")}</p>
          <h1 className="text-[1.75rem] font-semibold leading-tight text-text sm:text-2xl">{t("title", { company: v.world.companyName })}</h1>
          <p className="text-lg leading-relaxed text-secondary" dir="auto">{v.world.premise}</p>
        </header>
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-tertiary">{t("yourRole")}</h2>
          <p className="text-[15px] text-text" dir="auto">
            <span className="font-medium">{v.world.yourRole}.</span> {v.world.team}
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-tertiary">{t("people")}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {v.world.cast.map((c) => (
              <li key={c.name}>
                <Person name={c.name} role={c.role} />
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-tertiary">{t("week")}</h2>
          <ChapterList chapters={v.world.chapters.map((c) => c.title)} current={0} />
        </section>
        <Alert tone="neutral">{t("howItWorks")}</Alert>
        <Button
          size="lg"
          className="self-start"
          loading={pending}
          onClick={async () => {
            setPending(true);
            await onBegin();
          }}
        >
          {t("start")}
          <ArrowRight className="flip-rtl" aria-hidden />
        </Button>
      </article>
    </CandidateShell>
  );
}

export function Transition({ v, onContinue, onPause }: { v: View<"transition">; onContinue: () => Promise<void>; onPause: () => Promise<void> }) {
  const t = useTranslations("candidate.transition");
  const ch = v.world.chapters[v.chapterIndex];
  const [pending, setPending] = React.useState<"go" | "pause" | null>(null);
  return (
    <CandidateShell branding={v.branding}>
      <div className="mx-auto flex max-w-[680px] flex-col gap-6 px-4 py-16 sm:py-24 animate-slide-up">
        <p className="text-xs font-medium uppercase tracking-wide text-tertiary">{t("eyebrow")}</p>
        <h1 className="text-2xl font-semibold text-text">{ch?.title}</h1>
        <p className="text-lg leading-relaxed text-secondary" dir="auto">{ch?.summary}</p>
        {v.recap.length ? (
          <section className="rounded-card border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">{t("soFar")}</h2>
            <ul className="mt-2 flex list-disc flex-col gap-1 ps-5 text-sm text-secondary">
              {v.recap.map((r) => (
                <li key={r} dir="auto">{r}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-secondary">{t("carryForward")}</p>
          </section>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            variant="ghost"
            loading={pending === "pause"}
            onClick={async () => {
              setPending("pause");
              try {
                await onPause();
              } catch {
                setPending(null);
              }
            }}
          >
            <PauseCircle aria-hidden />
            {t("pause")}
          </Button>
          <Button
            size="lg"
            loading={pending === "go"}
            onClick={async () => {
              setPending("go");
              try {
                await onContinue();
              } catch {
                setPending(null);
              }
            }}
          >
            {t("start", { n: v.chapterIndex + 1 })}
            <ArrowRight className="flip-rtl" aria-hidden />
          </Button>
        </div>
      </div>
    </CandidateShell>
  );
}

export function Paused({ v, onResume }: { v: View<"paused">; onResume: () => Promise<void> }) {
  const t = useTranslations("candidate.paused");
  const n = useNumbers();
  const [pending, setPending] = React.useState(false);
  return (
    <CandidateShell branding={v.branding}>
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-24 text-center">
        <PauseCircle className="size-10 text-accent-text" strokeWidth={1.25} aria-hidden />
        <h1 className="text-xl font-semibold text-text">{t("title")}</h1>
        <p className="text-secondary">{t("body", { minutes: n.number(v.minutesLeft) })}</p>
        <Button
          size="lg"
          loading={pending}
          onClick={async () => {
            setPending(true);
            await onResume();
          }}
        >
          {t("resume", { n: v.chapterIndex + 1 })}
        </Button>
      </div>
    </CandidateShell>
  );
}

export function Complete({ v, onFeedback }: { v: View<"complete">; onFeedback: (f: { rating: number; comment: string }) => Promise<void> }) {
  const t = useTranslations("candidate.complete");
  const n = useNumbers();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [sent, setSent] = React.useState(false);
  return (
    <CandidateShell branding={v.branding}>
      <div className="mx-auto flex max-w-[680px] flex-col gap-8 px-4 py-16 sm:py-24 animate-slide-up">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-text">{t("title")}</h1>
          <p className="text-lg leading-relaxed text-secondary">{t("body", { org: v.branding.orgName, role: v.roleTitle })}</p>
        </div>
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-text">{t("nextTitle")}</h2>
          <ul className="flex list-disc flex-col gap-1.5 ps-5 text-sm text-secondary">
            <li>{t("next1", { org: v.branding.orgName })}</li>
            <li>{t("next2")}</li>
            <li>{t("next3")}</li>
          </ul>
        </section>
        <section className="rounded-card border border-border bg-surface p-5">
          {sent ? (
            <p className="text-sm text-secondary" role="status">{t("thanks")}</p>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                await onFeedback({ rating, comment });
                setSent(true);
              }}
            >
              <fieldset>
                <legend className="text-sm font-semibold text-text">{t("feedbackTitle")}</legend>
                <p className="mt-1 text-sm text-secondary">{t("feedbackHint")}</p>
                <div className="mt-3 flex gap-1.5" role="radiogroup" aria-label={t("feedbackTitle")}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} type="button" role="radio" aria-checked={rating === r} onClick={() => setRating(r)} className={cn("h-10 w-12 rounded-control border text-sm font-medium tabular", rating === r ? "border-accent bg-accent-subtle text-accent-text" : "border-border-strong text-secondary hover:bg-surface-subtle")}>
                      {n.number(r)}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-tertiary">
                  <span>{t("low")}</span>
                  <span>{t("high")}</span>
                </div>
              </fieldset>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text">{t("comment")}</span>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} />
              </label>
              <Button type="submit" variant="secondary" className="self-start" disabled={rating === 0}>
                {t("send")}
              </Button>
            </form>
          )}
        </section>
      </div>
    </CandidateShell>
  );
}

export type { PublicWorld };
