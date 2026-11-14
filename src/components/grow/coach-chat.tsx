"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { SendHorizontal } from "lucide-react";
import { coachAction } from "@/app/actions/grow";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function CoachChat({ initial, name }: { initial: Msg[]; name: string }) {
  const t = useTranslations("grow.coach");
  const [messages, setMessages] = React.useState<Msg[]>(initial);
  const [draft, setDraft] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  const send = async (text: string) => {
    if (!text.trim() || pending) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", content: text }]);
    setDraft("");
    setPending(true);
    try {
      const r = await coachAction(text);
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "assistant", content: r.reply }]);
    } catch {
      setMessages((m) => [...m, { id: `e${Date.now()}`, role: "assistant", content: t("error") }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex h-[min(40rem,75dvh)] flex-col overflow-hidden rounded-card border border-border bg-surface">
      <div ref={listRef} role="log" aria-live="polite" aria-label={t("title")} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-3 py-6">
            <p className="text-sm text-secondary">{t("empty")}</p>
            <div className="flex flex-wrap gap-2">
              {(["s1", "s2", "s3"] as const).map((k) => (
                <button key={k} type="button" onClick={() => send(t(`suggest.${k}`))} className="rounded-full border border-border-strong px-3 py-1.5 text-sm text-secondary hover:bg-surface-subtle hover:text-text">
                  {t(`suggest.${k}`)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex max-w-[85%] gap-2.5", m.role === "user" ? "flex-row-reverse self-end" : "self-start")}>
            <Avatar name={m.role === "user" ? name : "Coach"} size="sm" className="mt-0.5" />
            <div dir="auto" className={cn("whitespace-pre-line rounded-card px-3.5 py-2.5 text-sm leading-relaxed text-text", m.role === "user" ? "bg-accent-subtle" : "bg-surface-subtle")}>
              {m.content}
            </div>
          </div>
        ))}
        {pending ? <p className="self-start text-xs text-tertiary">{t("thinking")}</p> : null}
      </div>
      <form className="flex items-end gap-2 border-t border-border p-3" onSubmit={(e) => (e.preventDefault(), send(draft))}>
        <label htmlFor="coach-input" className="sr-only">{t("placeholder")}</label>
        <textarea
          id="coach-input"
          dir="auto"
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send(draft);
            }
          }}
          placeholder={t("placeholder")}
          className="max-h-40 min-h-11 flex-1 resize-none rounded-control border border-border-strong bg-surface px-3 py-2.5 text-base placeholder:text-tertiary focus-visible:border-accent focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-focus sm:text-sm"
        />
        <Button type="submit" size="icon" disabled={!draft.trim() || pending} aria-label={t("send")}>
          <SendHorizontal className="flip-rtl" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
