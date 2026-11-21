import * as React from "react";
import { View } from "react-native";
import { useT } from "../i18n";
import { draftKey, useDraft } from "../state/drafts";
import { Editor, letterFor, OptionCard, SummaryLine, TaskHeader } from "./parts";
import { MIN_REASON, type TaskContext, type TaskResult } from "./types";

/** Choose one of 3–4 defensible options, then say why. */
export function useChoiceTask(ctx: TaskContext): TaskResult {
  const t = useT("candidate");
  const { content, item, locked } = ctx;
  const options = content.task.options ?? [];
  const needsWhy = Boolean(content.task.requireJustification);
  const [draft, setDraft] = useDraft(draftKey(item.id, "MAIN"), { optionId: "", justification: "" }, ctx.onSaveState);

  const ok = Boolean(draft.optionId) && (!needsWhy || draft.justification.trim().length >= MIN_REASON);
  const value = ok ? { kind: "choice" as const, optionId: draft.optionId, justification: draft.justification } : null;
  const chosen = options.findIndex((o) => o.id === draft.optionId);

  const slides = [
    {
      key: "choice",
      gate: needsWhy && !draft.optionId,
      node: (
        <View style={{ gap: 22 }}>
          <TaskHeader label={t("item.yourTask")} prompt={content.task.prompt} />
          <View accessibilityRole="radiogroup" accessibilityLabel={content.task.prompt} style={{ gap: 10 }}>
            {options.map((o, i) => (
              <OptionCard
                key={o.id}
                testID={`option-${i}`}
                letter={letterFor(i)}
                label={o.label}
                detail={o.detail}
                selected={draft.optionId === o.id}
                disabled={locked}
                onPress={() => {
                  const first = !draft.optionId;
                  setDraft((d) => ({ ...d, optionId: o.id }));
                  // The first pick carries you on to "why?"; changing it later doesn't.
                  if (needsWhy && first) setTimeout(ctx.next, 320);
                }}
              />
            ))}
          </View>
        </View>
      ),
    },
    ...(needsWhy
      ? [
          {
            key: "why",
            node: (
              <View style={{ gap: 18 }}>
                <TaskHeader label={t("item.yourTask")} context={chosen >= 0 ? `${letterFor(chosen)}. ${options[chosen]!.label}` : undefined} />
                <Editor label={t("tasks.justificationLabel")} hint={t("tasks.justificationHint")} value={draft.justification} disabled={locked} minHeight={180} onChange={(s) => setDraft((d) => ({ ...d, justification: s }))} />
              </View>
            ),
          },
        ]
      : []),
  ];

  const summary = (
    <View style={{ gap: 12 }}>
      <SummaryLine value={chosen >= 0 ? `${letterFor(chosen)}. ${options[chosen]!.label}` : "—"} />
      {draft.justification ? <SummaryLine label={t("tasks.justificationLabel")} value={draft.justification} /> : null}
    </View>
  );

  return { slides, value, summary };
}
