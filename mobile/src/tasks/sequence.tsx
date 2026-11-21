import * as React from "react";
import { View } from "react-native";
import { useT } from "../i18n";
import { radius, useTheme } from "../theme";
import { draftKey, useDraft } from "../state/drafts";
import { hairline, TextArea } from "../ui/primitives";
import { T } from "../ui/text";
import { usePasteReporter } from "../state/integrity";
import { OptionCard, SummaryLine, TaskHeader } from "./parts";
import type { TaskContext, TaskResult } from "./types";

/**
 * Work-style pairs, one pair per page: "Which is more like you?" A tap picks
 * and pages on, like tapping through a story.
 */
export function useForcedChoiceTask(ctx: TaskContext): TaskResult {
  const t = useT("candidate");
  const tm = useT("mobile.deck");
  const { content, item, locked } = ctx;
  const pairs = content.task.forcedChoice?.pairs ?? [];
  const [picks, setPicks] = useDraft<Record<string, "a" | "b">>(draftKey(item.id, "MAIN"), {}, ctx.onSaveState);
  const done = pairs.filter((p) => picks[p.id]).length;
  const value = pairs.length > 0 && done === pairs.length ? { kind: "forced_choice" as const, picks } : null;

  const slides = pairs.map((p, i) => ({
    key: `pair-${p.id}`,
    gate: !picks[p.id],
    node: (
      <View style={{ gap: 22 }}>
        <TaskHeader label={t("item.yourTask")} meta={i === pairs.length - 1 || done === pairs.length ? undefined : tm("pairsLeft", { count: pairs.length - done })} showKind={i === 0} />
        {i === 0 ? (
          <T variant="callout" tone="secondary">
            {content.task.prompt}
          </T>
        ) : null}
        <T variant="title2">{t("tasks.forced.pair", { n: i + 1, total: pairs.length })}</T>
        <View accessibilityRole="radiogroup" style={{ gap: 12 }}>
          {(["a", "b"] as const).map((side) => (
            <OptionCard
              key={side}
              testID={`pair-${i}-${side}`}
              label={p[side].text}
              selected={picks[p.id] === side}
              disabled={locked}
              onPress={() => {
                const first = !picks[p.id];
                setPicks((x) => ({ ...x, [p.id]: side }));
                if (first && i < pairs.length - 1) setTimeout(ctx.next, 300);
              }}
            />
          ))}
        </View>
      </View>
    ),
  }));

  return { slides, value, summary: <SummaryLine value={`${done} / ${pairs.length}`} /> };
}

/** A consequence chain: one round per page; each decision shapes the next. */
export function useChainTask(ctx: TaskContext): TaskResult {
  const t = useT("candidate.tasks.chain");
  const ti = useT("candidate.item");
  const { c } = useTheme();
  const paste = usePasteReporter();
  const { content, item, locked } = ctx;
  const rounds = content.task.chain?.rounds ?? [];
  const [draft, setDraft] = useDraft(draftKey(item.id, "MAIN"), { round: 0, choices: [] as { roundId: string; optionId: string; reason: string }[] }, ctx.onSaveState);
  const value = rounds.length > 0 && draft.choices.length === rounds.length ? { kind: "chain" as const, choices: draft.choices } : null;

  const setChoice = (roundIdx: number, patch: Partial<{ optionId: string; reason: string }>) =>
    setDraft((d) => {
      const round = rounds[roundIdx]!;
      const existing = d.choices.find((x) => x.roundId === round.id) ?? { roundId: round.id, optionId: "", reason: "" };
      const next = { ...existing, ...patch };
      // Changing an earlier decision clears later rounds, which depended on it.
      const changed = patch.optionId !== undefined && patch.optionId !== existing.optionId;
      const kept = d.choices.filter((x) => {
        const idx = rounds.findIndex((r) => r.id === x.roundId);
        return idx < roundIdx || (!changed && idx > roundIdx);
      });
      const choices = next.optionId ? [...kept, next].sort((a, b) => rounds.findIndex((r) => r.id === a.roundId) - rounds.findIndex((r) => r.id === b.roundId)) : kept;
      return { ...d, round: roundIdx, choices };
    });

  const slides = rounds.map((round, i) => {
    const current = draft.choices.find((x) => x.roundId === round.id);
    const prev = i > 0 ? draft.choices.find((x) => x.roundId === rounds[i - 1]!.id) : null;
    const consequence = prev ? rounds[i - 1]!.consequences.find((x) => x.optionId === prev.optionId)?.text : null;
    return {
      key: `round-${round.id}`,
      gate: !current?.optionId,
      node: (
        <View style={{ gap: 18 }}>
          <TaskHeader label={ti("yourTask")} prompt={i === 0 ? content.task.prompt : undefined} meta={t("roundOf", { n: i + 1, total: rounds.length })} showKind={i === 0} />
          <View style={{ flexDirection: "row", gap: 4 }} accessibilityLabel={t("rounds")}>
            {rounds.map((r, k) => (
              <View key={r.id} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: k < i ? c.text : k === i ? c.signal : c.hairlineStrong }} />
            ))}
          </View>
          {consequence ? (
            <View style={{ padding: 16, borderRadius: radius.card, backgroundColor: c.surfaceSubtle, borderWidth: hairline, borderColor: c.hairline, gap: 6 }}>
              <T variant="footnote" tone="tertiary">
                {t("whatHappened")}
              </T>
              <T variant="body">{consequence}</T>
            </View>
          ) : null}
          <T variant="body">{round.situation}</T>
          <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
            {round.options.map((o, k) => (
              <OptionCard key={o.id} testID={`round-${i}-option-${k}`} label={o.label} detail={o.detail} selected={current?.optionId === o.id} disabled={locked} onPress={() => setChoice(i, { optionId: o.id })} />
            ))}
          </View>
          <TextArea label={t("reason")} value={current?.reason ?? ""} editable={!locked && Boolean(current)} minHeight={96} onChangeText={(s) => setChoice(i, { reason: s })} onBigInsert={paste} />
        </View>
      ),
    };
  });

  const summary = (
    <View style={{ gap: 10 }}>
      {draft.choices.map((ch, i) => {
        const r = rounds.find((x) => x.id === ch.roundId);
        return <SummaryLine key={ch.roundId} label={t("roundOf", { n: i + 1, total: rounds.length })} value={r?.options.find((o) => o.id === ch.optionId)?.label ?? "—"} />;
      })}
    </View>
  );
  return { slides, value, summary };
}
