import * as React from "react";
import { View } from "react-native";
import { useT } from "../i18n";
import { useTheme } from "../theme";
import { draftKey, readDraft, useDraft } from "../state/drafts";
import { T } from "../ui/text";
import { Editor, SummaryLine, TaskHeader } from "./parts";
import { MIN_WRITTEN, type TaskContext, type TaskResult } from "./types";

/** Write it as you would at work: an email, memo, message or plan. */
export function useWrittenTask(ctx: TaskContext): TaskResult {
  const t = useT("candidate");
  const { content, item, locked } = ctx;
  // Shares the web's draft shape ({ text, doc }) so a draft started in a browser isn't lost.
  const [draft, setDraft] = useDraft<{ text: string; doc?: unknown } | null>(draftKey(item.id, "MAIN"), null, ctx.onSaveState);
  const text = draft?.text ?? "";
  const value = text.trim().length >= MIN_WRITTEN ? { kind: "written" as const, text } : null;
  const format = content.task.written?.format ?? "free";
  const slides = [
    {
      key: "write",
      node: (
        <View style={{ gap: 18 }}>
          <TaskHeader label={t("item.yourTask")} prompt={content.task.prompt} showKind />
          <Editor label={t(`tasks.writtenLabel.${format}`)} hint={t("tasks.writtenHint")} placeholder={content.task.written?.placeholder} value={text} disabled={locked} minHeight={260} onChange={(s) => setDraft({ text: s })} />
        </View>
      ),
    },
  ];
  return { slides, value, summary: <SummaryLine value={text || "—"} /> };
}

/** A structured answer: one page per section. */
export function useDesignTask(ctx: TaskContext): TaskResult {
  const t = useT("candidate");
  const tm = useT("mobile.deck");
  const { content, item, locked } = ctx;
  const sections = content.task.design?.sections ?? [];
  const [draft, setDraft] = useDraft<Record<string, string>>(draftKey(item.id, "MAIN"), {}, ctx.onSaveState);
  const ok = sections.every((s) => (draft[s.id] ?? "").trim().length >= 10);
  const value = ok ? { kind: "design" as const, sections: draft } : null;
  const slides = sections.map((s, i) => ({
    key: `section-${s.id}`,
    node: (
      <View style={{ gap: 18 }}>
        <TaskHeader label={t("item.yourTask")} prompt={i === 0 ? content.task.prompt : undefined} meta={tm("sectionOf", { n: i + 1, total: sections.length })} showKind={i === 0} />
        <Editor label={`${i + 1}. ${s.label}`} hint={s.hint} value={draft[s.id] ?? ""} disabled={locked} minHeight={200} onChange={(v) => setDraft((d) => ({ ...d, [s.id]: v }))} />
      </View>
    ),
  }));
  const summary = (
    <View style={{ gap: 12 }}>
      {sections.map((s) => (
        <SummaryLine key={s.id} label={s.label} value={draft[s.id] || "—"} />
      ))}
    </View>
  );
  return { slides, value, summary };
}

/** Probe and twist: a short written answer, arriving as a new page below. */
export function useFollowUp(ctx: TaskContext, stage: "PROBE" | "TWIST"): TaskResult {
  const t = useT("candidate");
  const tm = useT("mobile.deck");
  const { c } = useTheme();
  const { content, item } = ctx;
  const live = ctx.stage === stage;
  const locked = ctx.locked || !live;
  const [draft, setDraft] = useDraft<string>(draftKey(item.id, stage), readDraft<string>(draftKey(item.id, stage)) ?? "", live ? ctx.onSaveState : undefined);
  const follow = stage === "PROBE" ? content.probe : content.twist;
  const value = draft.trim().length >= MIN_WRITTEN ? { kind: "written" as const, text: draft } : null;
  if (!follow) return { slides: [], value: null, summary: null };
  const slides = [
    {
      key: `follow-${stage}`,
      node: (
        <View style={{ gap: 18 }}>
          <TaskHeader label={stage === "PROBE" ? t("item.followUp") : t("item.changed")} tone={stage === "PROBE" ? "follow" : "change"} />
          {stage === "TWIST" && follow.change ? (
            <View style={{ padding: 18, borderRadius: 20, backgroundColor: c.warningSubtle }}>
              <T variant="body">{follow.change}</T>
            </View>
          ) : null}
          <T variant="title2">{follow.prompt}</T>
          <Editor label={tm("yourAnswer")} hint={t("tasks.followUpHint")} value={draft} disabled={locked} minHeight={180} onChange={setDraft} />
        </View>
      ),
    },
  ];
  return { slides, value, summary: <SummaryLine label={follow.prompt} value={draft || "—"} /> };
}
