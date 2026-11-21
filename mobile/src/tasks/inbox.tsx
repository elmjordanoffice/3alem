import * as React from "react";
import { View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useLocale, useT } from "../i18n";
import { radius, useTheme } from "../theme";
import { draftKey, useDraft } from "../state/drafts";
import { Chip, hairline, Notice } from "../ui/primitives";
import { Press } from "../ui/press";
import { T } from "../ui/text";
import { Avatar } from "../ui/avatar";
import { Editor, SummaryLine, TaskHeader } from "./parts";
import { RankList } from "./rank-list";
import { MIN_WRITTEN, type SlideSpec, type TaskContext, type TaskResult } from "./types";

type Triage = "reply" | "delegate" | "later" | "ignore";
const TRIAGE: Triage[] = ["reply", "delegate", "later", "ignore"];

/**
 * The inbox, message by message: read each one and decide what to do with it,
 * put them in order, then write the replies. One message hides a detail.
 */
export function useInboxTask(ctx: TaskContext): TaskResult {
  const t = useT("candidate.tasks.inbox");
  const ti = useT("candidate.item");
  const tm = useT("mobile.deck");
  const { c } = useTheme();
  const { rtl } = useLocale();
  const { content, item, locked, timeUp } = ctx;
  const inbox = content.task.inbox!;
  const [draft, setDraft] = useDraft(
    draftKey(item.id, "MAIN"),
    { order: inbox.messages.map((m) => m.id), triage: {} as Record<string, Triage>, replies: {} as Record<string, string>, open: inbox.messages[0]?.id ?? "" },
    ctx.onSaveState,
  );
  const byId = (id: string) => inbox.messages.find((m) => m.id === id)!;
  const replyIds = draft.order.filter((id) => draft.triage[id] === "reply");
  const triaged = inbox.messages.filter((m) => draft.triage[m.id]).length;
  const replies = replyIds.map((id) => ({ messageId: id, text: draft.replies[id] ?? "" })).filter((r) => r.text.trim().length > 0);
  const complete = triaged === inbox.messages.length && replies.length >= inbox.replyCount && replies.every((r) => r.text.trim().length >= MIN_WRITTEN);
  const value = complete || (timeUp && (triaged > 0 || replies.length > 0)) ? { kind: "inbox" as const, order: draft.order, triage: draft.triage, replies } : null;
  const progress = t("progress", { triaged, total: inbox.messages.length, replies: replyIds.length, needed: inbox.replyCount });

  const slides: SlideSpec[] = [
    {
      key: "inbox",
      node: (
        <View style={{ gap: 18 }}>
          <TaskHeader label={ti("yourTask")} prompt={content.task.prompt} showKind />
          {timeUp ? <Notice tone="info">{ti("timeUp")}</Notice> : null}
          <T variant="footnote" tone="secondary" accessibilityLiveRegion="polite">
            {progress}
          </T>
          <View accessibilityLabel={t("listLabel")} style={{ borderRadius: radius.card, backgroundColor: c.surface, borderWidth: hairline, borderColor: c.hairline, overflow: "hidden" }}>
            {inbox.messages.map((m, i) => (
              <Press key={m.id} depth={0.99} onPress={() => ctx.goToKey(`msg-${m.id}`)} accessibilityLabel={`${m.from.name}. ${m.subject}${draft.triage[m.id] ? `. ${t(`triage.${draft.triage[m.id]}`)}` : ""}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: i ? hairline : 0, borderColor: c.hairline }}>
                <Avatar name={m.from.name} size={34} />
                <View style={{ flex: 1, gap: 1 }}>
                  <View style={{ flexDirection: "row", gap: 8, alignItems: "baseline" }}>
                    <T variant="subhead" numberOfLines={1} style={{ flex: 1, color: c.text }}>
                      {m.from.name}
                    </T>
                    <T variant="caption" tone="tertiary">
                      {m.receivedAt}
                    </T>
                  </View>
                  <T variant="footnote" tone="secondary" numberOfLines={1}>
                    {m.subject}
                  </T>
                </View>
                {draft.triage[m.id] ? (
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: c.surfaceSunken }}>
                    <T variant="caption" tone="secondary">
                      {t(`triage.${draft.triage[m.id]}`)}
                    </T>
                  </View>
                ) : (
                  <ChevronRight size={16} color={c.muted} style={rtl ? { transform: [{ scaleX: -1 }] } : undefined} />
                )}
              </Press>
            ))}
          </View>
        </View>
      ),
    },
    ...inbox.messages.map((m, i) => ({
      key: `msg-${m.id}`,
      node: (
        <View style={{ gap: 18 }}>
          <TaskHeader label={tm("messageOf", { n: i + 1, total: inbox.messages.length })} tone="follow" meta={progress.split("·")[0]?.trim()} />
          <View style={{ borderRadius: radius.card, backgroundColor: c.surface, borderWidth: hairline, borderColor: c.hairline }}>
            <View style={{ padding: 16, gap: 12, borderBottomWidth: hairline, borderColor: c.hairline }}>
              <T variant="headline">{m.subject}</T>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Avatar name={m.from.name} size={32} />
                <View style={{ flex: 1 }}>
                  <T variant="subhead" style={{ color: c.text }}>
                    {m.from.name}
                  </T>
                  {m.from.role ? (
                    <T variant="caption" tone="secondary">
                      {m.from.role}
                    </T>
                  ) : null}
                </View>
                <T variant="caption" tone="tertiary">
                  {m.receivedAt}
                </T>
              </View>
            </View>
            <View style={{ padding: 16 }}>
              <T variant="body">{m.body}</T>
            </View>
            {m.footnote ? (
              <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: hairline, borderColor: c.hairline }}>
                <T variant="footnote" tone="secondary">
                  {m.footnote}
                </T>
              </View>
            ) : null}
          </View>
          <View style={{ gap: 10 }}>
            <T variant="headline">{t("decide")}</T>
            <View accessibilityRole="radiogroup" accessibilityLabel={t("decide")} style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {TRIAGE.map((k) => (
                <Chip
                  key={k}
                  testID={`triage-${i}-${k}`}
                  label={t(`triage.${k}`)}
                  selected={draft.triage[m.id] === k}
                  onPress={() => {
                    if (locked) return;
                    const first = !draft.triage[m.id];
                    setDraft((d) => ({ ...d, triage: { ...d.triage, [m.id]: k } }));
                    if (first) setTimeout(ctx.next, 320);
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      ),
    })),
    {
      key: "priority",
      node: (
        <View style={{ gap: 16 }}>
          <TaskHeader label={ti("yourTask")} prompt={tm("priorityTitle")} />
          <T variant="footnote" tone="tertiary">
            {tm("priorityHint")}
          </T>
          <RankList
            label={t("listLabel")}
            entries={inbox.messages.map((m) => ({ id: m.id, label: m.subject, detail: `${m.from.name}${draft.triage[m.id] ? ` · ${t(`triage.${draft.triage[m.id]}`)}` : ""}` }))}
            order={draft.order}
            disabled={locked}
            onChange={(order) => setDraft((d) => ({ ...d, order }))}
            onDragging={(on) => ctx.setPagingEnabled(!on)}
          />
        </View>
      ),
    },
    ...(replyIds.length
      ? replyIds.map((id, i) => {
          const m = byId(id);
          return {
            key: `reply-${id}`,
            node: (
              <View style={{ gap: 16 }}>
                <TaskHeader label={tm("repliesTitle", { n: i + 1, total: replyIds.length })} meta={replyIds.length < inbox.replyCount ? t("progress", { triaged, total: inbox.messages.length, replies: replyIds.length, needed: inbox.replyCount }).split("·")[1]?.trim() : undefined} />
                <View style={{ padding: 14, borderRadius: radius.control, backgroundColor: c.surfaceSubtle, borderWidth: hairline, borderColor: c.hairline, gap: 2 }}>
                  <T variant="caption" tone="tertiary">
                    {m.from.name}
                    {m.from.role ? ` · ${m.from.role}` : ""}
                  </T>
                  <T variant="subhead" style={{ color: c.text }} numberOfLines={2}>
                    {m.subject}
                  </T>
                </View>
                <Editor label={t("replyLabel", { name: m.from.name })} value={draft.replies[id] ?? ""} disabled={locked} minHeight={200} onChange={(s) => setDraft((d) => ({ ...d, replies: { ...d.replies, [id]: s } }))} />
              </View>
            ),
          };
        })
      : [
          {
            key: "reply-none",
            node: (
              <View style={{ gap: 16 }}>
                <TaskHeader label={ti("yourTask")} />
                <Notice tone="info">{tm("repliesNeeded", { needed: inbox.replyCount })}</Notice>
              </View>
            ),
          },
        ]),
  ];

  const summary = (
    <View style={{ gap: 12 }}>
      <SummaryLine value={progress} />
      {replies.map((r) => (
        <SummaryLine key={r.messageId} label={byId(r.messageId).subject} value={r.text} />
      ))}
    </View>
  );
  return { slides, value, summary };
}
