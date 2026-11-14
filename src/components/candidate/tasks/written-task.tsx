"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { AnswerEditor, type AnswerValue } from "@/components/assessment/answer-editor";
import { Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useDraft } from "../hooks";
import { MIN_WRITTEN, type TaskProps } from "./types";

export function WrittenTask({ itemId, content, onChange, onSaveState, disabled }: TaskProps) {
  const t = useTranslations("candidate.tasks");
  const [draft, setDraft] = useDraft<AnswerValue | null>(`aalim:draft:${itemId}:MAIN`, null, onSaveState);
  React.useEffect(() => {
    onChange(draft && draft.text.trim().length >= MIN_WRITTEN ? { kind: "written", text: draft.text, doc: draft.doc } : null);
  }, [draft, onChange]);
  const format = content.task.written?.format ?? "free";
  return (
    <Field label={t(`writtenLabel.${format}`)} hint={t("writtenHint")}>
      {({ id, describedBy }) => (
        <AnswerEditor
          id={id}
          label={t(`writtenLabel.${format}`)}
          describedBy={describedBy}
          placeholder={content.task.written?.placeholder}
          initialValue={draft}
          onChange={setDraft}
          disabled={disabled}
          className="[&_.ProseMirror]:min-h-64"
        />
      )}
    </Field>
  );
}

export function DesignTask({ itemId, content, onChange, onSaveState, disabled }: TaskProps) {
  const sections = React.useMemo(() => content.task.design?.sections ?? [], [content.task.design]);
  const [draft, setDraft] = useDraft<Record<string, string>>(`aalim:draft:${itemId}:MAIN`, {}, onSaveState);
  React.useEffect(() => {
    const ok = sections.every((s) => (draft[s.id] ?? "").trim().length >= 10);
    onChange(ok ? { kind: "design", sections: draft } : null);
  }, [draft, sections, onChange]);
  return (
    <div className="flex flex-col gap-5">
      {sections.map((s, i) => (
        <Field key={s.id} label={`${i + 1}. ${s.label}`} hint={s.hint}>
          {({ id, describedBy }) => (
            <Textarea id={id} aria-describedby={describedBy} value={draft[s.id] ?? ""} disabled={disabled} onChange={(e) => setDraft((d) => ({ ...d, [s.id]: e.target.value }))} className="min-h-28" />
          )}
        </Field>
      ))}
    </div>
  );
}

/** Probe and twist: a short written answer. */
export function FollowUpTask({ itemId, stage, onChange, onSaveState, disabled, label }: Omit<TaskProps, "content"> & { stage: "PROBE" | "TWIST"; label: string }) {
  const t = useTranslations("candidate.tasks");
  const [draft, setDraft] = useDraft(`aalim:draft:${itemId}:${stage}`, "", onSaveState);
  React.useEffect(() => {
    onChange(draft.trim().length >= MIN_WRITTEN ? { kind: "written", text: draft } : null);
  }, [draft, onChange]);
  return (
    <Field label={label} hint={t("followUpHint")}>
      {({ id, describedBy }) => (
        <Textarea id={id} aria-describedby={describedBy} value={draft} disabled={disabled} onChange={(e) => setDraft(e.target.value)} className="min-h-40" autoFocus />
      )}
    </Field>
  );
}
