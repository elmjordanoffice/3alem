"use client";
import * as React from "react";
import { Mic, MicOff, SendHorizontal, Volume2, VolumeX } from "lucide-react";
import { useDictation, useReadAloud } from "./speech";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ChatMessage {
  id: string;
  from: "candidate" | "stakeholder";
  text: string;
}

export interface Stakeholder {
  name: string;
  role: string;
  /** What the candidate knows going in. Hidden goals are never shown. */
  context: string;
}

interface RoleplayChatProps {
  stakeholder: Stakeholder;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onEnd: () => void;
  /** The stakeholder is composing a reply. */
  pending?: boolean;
  ended?: boolean;
  candidateName: string;
  /** The stakeholder's turn limit, for the reply counter. */
  maxTurns?: number;
}

/** Chat with an AI stakeholder. Calm: no read receipts, no typing pressure. */
export function RoleplayChat({ stakeholder, messages, onSend, onEnd, pending, ended, candidateName, maxTurns }: RoleplayChatProps) {
  const t = useTranslations("components.roleplay");
  const [draft, setDraft] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  const dictation = useDictation((text) => setDraft((d) => (d ? `${d.trimEnd()} ${text}` : text)));
  const voice = useReadAloud();
  const lastSpoken = React.useRef(messages.length);
  React.useEffect(() => {
    const last = messages[messages.length - 1];
    if (messages.length > lastSpoken.current && last?.from === "stakeholder") voice.speak(last.text);
    lastSpoken.current = messages.length;
  }, [messages, voice]);

  const send = () => {
    const text = draft.trim();
    if (!text || pending || ended) return;
    if (dictation.listening) dictation.stop();
    onSend(text);
    setDraft("");
  };

  return (
    <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-card bg-surface shadow-card">
      <div className="flex items-start gap-3 border-b border-border p-4">
        <Avatar name={stakeholder.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text">
            {stakeholder.name}
            {/* Always say who is speaking: a character played by AI, never a person. */}
            <Badge tone="neutral">{t("playedByAi")}</Badge>
          </p>
          <p className="text-xs text-secondary">{stakeholder.role}</p>
          <p className="mt-2 text-sm text-secondary">{stakeholder.context}</p>
        </div>
        {voice.supported ? (
          <Button variant="ghost" size="icon-sm" onClick={voice.toggle} aria-pressed={voice.enabled} aria-label={voice.enabled ? t("readAloudOff") : t("readAloudOn")} title={voice.enabled ? t("readAloudOff") : t("readAloudOn")}>
            {voice.enabled ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
          </Button>
        ) : null}
        <Button variant="secondary" size="sm" onClick={onEnd} disabled={ended}>
          {t("end")}
        </Button>
      </div>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label={t("conversationWith", { name: stakeholder.name })}
        className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
      >
        {messages.map((m) => {
          const mine = m.from === "candidate";
          return (
            <div key={m.id} className={cn("flex max-w-[85%] gap-2.5 animate-slide-up", mine ? "flex-row-reverse self-end" : "self-start")}>
              <Avatar name={mine ? candidateName : stakeholder.name} size="sm" className="mt-0.5" />
              <div
                dir="auto"
                className={cn(
                  "rounded-card px-3.5 py-2.5 text-sm leading-relaxed",
                  mine ? "bg-accent-subtle text-text" : "bg-surface-subtle text-text",
                )}
              >
                <span className="sr-only">{mine ? t("you") : stakeholder.name}: </span>
                {m.text}
              </div>
            </div>
          );
        })}
        {pending ? (
          <p className="self-start text-xs text-tertiary" role="status">
            {t("replying", { name: stakeholder.name })}
          </p>
        ) : null}
        {ended ? <p className="self-center text-xs text-tertiary">{t("ended")}</p> : null}
      </div>

      {dictation.listening || dictation.error ? (
        <p className="border-t border-border px-4 py-2 text-xs text-secondary" role="status" dir="auto">
          {dictation.error ? (
            dictation.error === "not-allowed" || dictation.error === "service-not-allowed" ? t("micBlocked") : t("dictationError")
          ) : dictation.interim ? (
            <span className="italic">{dictation.interim}</span>
          ) : (
            t("dictationEdit")
          )}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-4 pt-2.5 text-[11px] text-tertiary">
        <span>{t("disclosure", { name: stakeholder.name })}</span>
        {maxTurns && !ended ? (
          <span className="shrink-0 tabular">{t("turns", { n: Math.min(maxTurns, messages.filter((m) => m.from === "candidate").length + 1), max: maxTurns })}</span>
        ) : null}
      </div>
      <form
        className="flex items-end gap-2 p-3 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label htmlFor="roleplay-input" className="sr-only">
          {t("reply", { name: stakeholder.name })}
        </label>
        <textarea
          id="roleplay-input"
          dir="auto"
          rows={2}
          value={draft}
          disabled={ended}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={t("placeholder", { name: stakeholder.name })}
          className="max-h-40 min-h-11 flex-1 resize-none rounded-control border border-border-strong bg-surface px-3 py-2.5 text-base placeholder:text-tertiary focus-visible:border-accent focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-focus disabled:opacity-60 sm:text-sm"
        />
        {dictation.supported ? (
          <Button
            type="button"
            size="icon"
            variant={dictation.listening ? "primary" : "secondary"}
            disabled={ended}
            onClick={dictation.listening ? dictation.stop : dictation.start}
            aria-pressed={dictation.listening}
            aria-label={dictation.listening ? t("stopDictation") : t("startDictation")}
            title={t("dictationHint")}
          >
            {dictation.listening ? <MicOff aria-hidden /> : <Mic aria-hidden />}
          </Button>
        ) : null}
        <Button type="submit" size="icon" disabled={!draft.trim() || pending || ended} aria-label={t("send")}>
          <SendHorizontal className="flip-rtl" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
