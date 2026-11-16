"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/input";
import { useNumbers } from "@/components/providers";
import { useDraft } from "../hooks";
import { MIN_WRITTEN, type TaskProps } from "./types";

type Triage = "reply" | "delegate" | "later" | "ignore";
const TRIAGE: Triage[] = ["reply", "delegate", "later", "ignore"];

/**
 * The inbox: read and triage every message, put them in order, and reply to
 * the ones that matter most. One message hides a critical detail.
 */
export function InboxTask({ itemId, content, onChange, onSaveState, disabled, timeUp }: TaskProps & { timeUp?: boolean }) {
  const t = useTranslations("candidate.tasks.inbox");
  const n = useNumbers();
  const inbox = content.task.inbox!;
  const [draft, setDraft] = useDraft(
    `aalim:draft:${itemId}:MAIN`,
    { order: inbox.messages.map((m) => m.id), triage: {} as Record<string, Triage>, replies: {} as Record<string, string>, open: inbox.messages[0]?.id ?? "" },
    onSaveState,
  );
  const byId = (id: string) => inbox.messages.find((m) => m.id === id)!;
  const replyIds = draft.order.filter((id) => draft.triage[id] === "reply");
  const triaged = inbox.messages.filter((m) => draft.triage[m.id]).length;

  React.useEffect(() => {
    const replies = replyIds.map((id) => ({ messageId: id, text: draft.replies[id] ?? "" })).filter((r) => r.text.trim().length > 0);
    const complete = triaged === inbox.messages.length && replies.length >= inbox.replyCount && replies.every((r) => r.text.trim().length >= MIN_WRITTEN);
    const value = { kind: "inbox" as const, order: draft.order, triage: draft.triage, replies };
    onChange(complete || (timeUp && (triaged > 0 || replies.length > 0)) ? value : null);
  }, [draft, triaged, replyIds, inbox, onChange, timeUp]);

  const move = (id: string, dir: -1 | 1) =>
    setDraft((d) => {
      const i = d.order.indexOf(id);
      const j = i + dir;
      if (j < 0 || j >= d.order.length) return d;
      const order = [...d.order];
      [order[i], order[j]] = [order[j]!, order[i]!];
      return { ...d, order };
    });

  const open = draft.open ? byId(draft.open) : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-secondary">
        {t("progress", { triaged: n.number(triaged), total: n.number(inbox.messages.length), replies: n.number(replyIds.length), needed: n.number(inbox.replyCount) })}
      </p>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <ol aria-label={t("listLabel")} className="flex flex-col gap-1.5">
          {draft.order.map((id, idx) => {
            const m = byId(id);
            const active = draft.open === id;
            return (
              <li key={id} className={cn("rounded-control border bg-surface", active ? "border-accent" : "border-border")}>
                <div className="flex items-start gap-1 p-2">
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, open: id }))}
                    aria-current={active ? "true" : undefined}
                    className="flex min-w-0 flex-1 items-start gap-2.5 rounded-[6px] p-1 text-start focus-visible:outline-2 focus-visible:outline-focus"
                  >
                    <span className="mt-0.5 w-4 shrink-0 text-xs text-tertiary tabular">{n.number(idx + 1)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium text-text">{m.from.name}</span>
                        <span className="shrink-0 text-[11px] text-tertiary">{m.receivedAt}</span>
                      </span>
                      <span className="block truncate text-sm text-secondary" dir="auto">
                        {m.subject}
                      </span>
                      {draft.triage[id] ? <span className="mt-1 inline-block rounded-full bg-accent-subtle px-2 py-0.5 text-[11px] font-medium text-accent-text">{t(`triage.${draft.triage[id]}`)}</span> : null}
                    </span>
                  </button>
                  <span className="flex flex-col">
                    <button type="button" disabled={disabled || idx === 0} onClick={() => move(id, -1)} aria-label={t("moveUp", { subject: m.subject })} className="inline-flex size-7 items-center justify-center rounded-[6px] text-tertiary hover:bg-surface-subtle disabled:opacity-30">
                      <ChevronUp className="size-4" aria-hidden />
                    </button>
                    <button type="button" disabled={disabled || idx === draft.order.length - 1} onClick={() => move(id, 1)} aria-label={t("moveDown", { subject: m.subject })} className="inline-flex size-7 items-center justify-center rounded-[6px] text-tertiary hover:bg-surface-subtle disabled:opacity-30">
                      <ChevronDown className="size-4" aria-hidden />
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        {open ? (
          <article className="flex min-w-0 flex-col overflow-hidden rounded-card bg-surface shadow-card">
            <header className="flex flex-col gap-3 border-b border-border p-4">
              <h3 className="text-base font-semibold text-text" dir="auto">
                {open.subject}
              </h3>
              <div className="flex items-center gap-2.5 text-sm">
                <Avatar name={open.from.name} size="sm" />
                <span className="font-medium text-text">{open.from.name}</span>
                {open.from.role ? <span className="text-secondary">· {open.from.role}</span> : null}
                <span className="ms-auto text-xs text-tertiary">{open.receivedAt}</span>
              </div>
            </header>
            <div className="whitespace-pre-line p-4 text-[15px] leading-relaxed text-text" dir="auto">
              {open.body}
            </div>
            {open.footnote ? (
              <p className="border-t border-border px-4 py-3 text-xs text-secondary" dir="auto">
                {open.footnote}
              </p>
            ) : null}
            <div className="border-t border-border p-4">
              <fieldset disabled={disabled}>
                <legend className="mb-2 text-sm font-medium text-text">{t("decide")}</legend>
                <div className="flex flex-wrap gap-1.5">
                  {TRIAGE.map((k) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={draft.triage[open.id] === k}
                      onClick={() => setDraft((d) => ({ ...d, triage: { ...d.triage, [open.id]: k } }))}
                      className={cn(
                        "h-8 rounded-control border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-focus",
                        draft.triage[open.id] === k ? "border-accent bg-accent-subtle font-medium text-accent-text" : "border-border-strong text-secondary hover:bg-surface-subtle",
                      )}
                    >
                      {t(`triage.${k}`)}
                    </button>
                  ))}
                </div>
              </fieldset>
              {draft.triage[open.id] === "reply" ? (
                <div className="mt-4 flex flex-col gap-1.5">
                  <label htmlFor={`reply-${open.id}`} className="text-sm font-medium text-text">
                    {t("replyLabel", { name: open.from.name })}
                  </label>
                  <Textarea
                    id={`reply-${open.id}`}
                    value={draft.replies[open.id] ?? ""}
                    disabled={disabled}
                    onChange={(e) => setDraft((d) => ({ ...d, replies: { ...d.replies, [open.id]: e.target.value } }))}
                    className="min-h-36"
                  />
                </div>
              ) : null}
            </div>
          </article>
        ) : (
          <div className="flex items-center justify-center rounded-card border border-dashed border-border-strong p-10 text-sm text-secondary">
            <Mail className="me-2 size-4" aria-hidden />
            {t("pick")}
          </div>
        )}
      </div>
    </div>
  );
}
