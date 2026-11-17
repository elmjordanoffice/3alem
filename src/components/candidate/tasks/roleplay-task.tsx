"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { RoleplayChat, type ChatMessage } from "@/components/assessment/roleplay-chat";
import { Alert } from "@/components/ui/alert";
import { newClientId } from "../hooks";
import type { TaskProps } from "./types";

export function RoleplayTask({
  content,
  onChange,
  transcript: initial,
  candidateName,
  sendTurn,
  onEnded,
}: Omit<TaskProps, "itemId" | "onSaveState"> & {
  transcript: { from: "candidate" | "stakeholder"; text: string }[];
  candidateName: string;
  sendTurn: (text: string, clientId: string) => Promise<{ ok: boolean; reply?: string; ended?: boolean }>;
  onEnded: () => void;
}) {
  const t = useTranslations("candidate.tasks.roleplay");
  const rp = content.task.roleplay!;
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => initial.map((m, i) => ({ id: String(i), from: m.from, text: m.text })));
  const [pending, setPending] = React.useState(false);
  const [ended, setEnded] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const candidateTurns = messages.filter((m) => m.from === "candidate").length;
    onChange(candidateTurns > 0 && ended ? { kind: "roleplay", transcript: messages.map((m) => ({ from: m.from, text: m.text })) } : null);
  }, [messages, ended, onChange]);

  const send = async (text: string) => {
    const clientId = newClientId();
    setMessages((m) => [...m, { id: clientId, from: "candidate", text }]);
    setPending(true);
    setError(false);
    try {
      const res = await sendTurn(text, clientId);
      if (!res.ok) throw new Error("turn failed");
      setMessages((m) => [...m, { id: `${clientId}-r`, from: "stakeholder", text: res.reply ?? "" }]);
      if (res.ended) {
        setEnded(true);
        onEnded();
      }
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error ? <Alert tone="warning">{t("error")}</Alert> : null}
      <div className="h-[min(36rem,70dvh)]">
        <RoleplayChat
          stakeholder={rp.stakeholder}
          messages={messages}
          onSend={send}
          onEnd={() => {
            setEnded(true);
            onEnded();
          }}
          pending={pending}
          ended={ended}
          candidateName={candidateName}
          maxTurns={rp.maxTurns}
        />
      </div>
      <p className="text-xs text-tertiary">{t("hint")}</p>
    </div>
  );
}
