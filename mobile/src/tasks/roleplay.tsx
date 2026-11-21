import * as React from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowUp } from "lucide-react-native";
import { useLocale, useT } from "../i18n";
import { radius, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { newClientId } from "../lib/ids";
import { SlideScrollContext } from "../deck/pager-context";
import { usePasteReporter } from "../state/integrity";
import { Button } from "../ui/button";
import { hairline, noOutline, Notice } from "../ui/primitives";
import { Press } from "../ui/press";
import { T, useTypeSpec } from "../ui/text";
import { Avatar } from "../ui/avatar";
import { SummaryLine, TaskHeader } from "./parts";
import type { TaskContext, TaskResult } from "./types";

type Msg = { id: string; from: "candidate" | "stakeholder"; text: string };

/** A conversation with a colleague played by AI, through the roleplay action. */
export function useRoleplayTask(ctx: TaskContext): TaskResult {
  const tr = useT("components.roleplay");
  const { content, item } = ctx;
  const rp = content.task.roleplay!;
  const [messages, setMessages] = React.useState<Msg[]>(() => (item.roleplay?.transcript ?? []).map((m, i) => ({ id: String(i), from: m.from, text: m.text })));
  const [pending, setPending] = React.useState(false);
  const [ended, setEnded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const turns = messages.filter((m) => m.from === "candidate").length;
  const value = turns > 0 && ended ? { kind: "roleplay" as const, transcript: messages.map((m) => ({ from: m.from, text: m.text })) } : null;

  const send = async (text: string) => {
    const clientId = newClientId();
    setMessages((m) => [...m, { id: clientId, from: "candidate", text }]);
    setPending(true);
    setError(false);
    try {
      const res = await ctx.sendTurn(text, clientId);
      if (!res.ok) throw new Error("turn failed");
      setMessages((m) => [...m, { id: `${clientId}-r`, from: "stakeholder", text: res.reply ?? "" }]);
      if (res.ended) setEnded(true);
    } catch {
      setError(true);
      haptic.error();
    } finally {
      setPending(false);
    }
  };

  const slides = [
    {
      key: "chat",
      node: <Chat stakeholder={rp.stakeholder} prompt={content.task.prompt} maxTurns={rp.maxTurns} messages={messages} pending={pending} ended={ended} error={error} locked={ctx.locked} onSend={send} onEnd={() => setEnded(true)} />,
    },
  ];
  return { slides, value, summary: <SummaryLine label={tr("conversationWith", { name: rp.stakeholder.name })} value={`${turns} × ${tr("you")}`} /> };
}

function Chat({
  stakeholder,
  prompt,
  maxTurns,
  messages,
  pending,
  ended,
  error,
  locked,
  onSend,
  onEnd,
}: {
  stakeholder: { name: string; role: string; context: string };
  prompt: string;
  maxTurns: number;
  messages: Msg[];
  pending: boolean;
  ended: boolean;
  error: boolean;
  locked: boolean;
  onSend: (t: string) => void;
  onEnd: () => void;
}) {
  const { c } = useTheme();
  const { rtl } = useLocale();
  const t = useT("components.roleplay");
  const ti = useT("candidate");
  const spec = useTypeSpec("callout");
  const paste = usePasteReporter();
  const scroll = React.useContext(SlideScrollContext);
  const [draft, setDraft] = React.useState("");
  const last = React.useRef(0);
  const turns = messages.filter((m) => m.from === "candidate").length;

  React.useEffect(() => {
    const id = setTimeout(scroll.scrollToEnd, 60);
    return () => clearTimeout(id);
  }, [messages.length, pending, scroll]);

  const send = () => {
    const text = draft.trim();
    if (!text || pending || ended || locked) return;
    haptic.select();
    onSend(text);
    setDraft("");
    last.current = 0;
  };

  return (
    <View style={{ gap: 16, flexGrow: 1 }}>
      <TaskHeader label={ti("item.yourTask")} prompt={prompt} />
      <View style={{ flexDirection: "row", gap: 12, padding: 14, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: hairline, borderColor: c.hairline }}>
        <Avatar name={stakeholder.name} size={44} />
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <T variant="headline">{stakeholder.name}</T>
            {/* Always say who is speaking: a character played by AI, never a person. */}
            <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, borderWidth: hairline, borderColor: c.hairlineStrong }}>
              <T variant="caption" tone="secondary">
                {t("playedByAi")}
              </T>
            </View>
          </View>
          <T variant="footnote" tone="secondary">
            {stakeholder.role}
          </T>
          <T variant="footnote" tone="secondary" style={{ marginTop: 4 }}>
            {stakeholder.context}
          </T>
        </View>
      </View>

      <View accessibilityRole="list" accessibilityLabel={t("conversationWith", { name: stakeholder.name })} style={{ gap: 10, flexGrow: 1 }}>
        {messages.map((m) => {
          const mine = m.from === "candidate";
          return (
            <Animated.View key={m.id} entering={FadeInDown.springify().damping(18)} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "86%" }}>
              <View accessible accessibilityLabel={`${mine ? t("you") : stakeholder.name}: ${m.text}`} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderBottomEndRadius: mine ? 6 : 20, borderBottomStartRadius: mine ? 20 : 6, backgroundColor: mine ? c.action : c.surface, borderWidth: mine ? 0 : hairline, borderColor: c.hairline }}>
                <T variant="callout" style={{ color: mine ? c.actionText : c.text }}>
                  {m.text}
                </T>
              </View>
            </Animated.View>
          );
        })}
        {pending ? (
          <View accessibilityLiveRegion="polite" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="small" color={c.tertiary} />
            <T variant="footnote" tone="tertiary">
              {t("replying", { name: stakeholder.name })}
            </T>
          </View>
        ) : null}
        {ended ? (
          <T variant="footnote" tone="tertiary" align="center">
            {t("ended")}
          </T>
        ) : null}
      </View>

      {error ? <Notice tone="warning">{ti("tasks.roleplay.error")}</Notice> : null}

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
          <T variant="caption" tone="tertiary" style={{ flex: 1 }}>
            {t("disclosure", { name: stakeholder.name })}
          </T>
          {!ended ? (
            <T variant="caption" tone="tertiary" latin>
              {t("turns", { n: Math.min(maxTurns, turns + 1), max: maxTurns })}
            </T>
          ) : null}
        </View>
        {!ended ? (
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
            <TextInput
              testID="roleplay-input"
              multiline
              scrollEnabled={false}
              value={draft}
              onChangeText={(s) => {
                if (s.length - last.current > 40) paste?.(s.length - last.current);
                last.current = s.length;
                setDraft(s);
              }}
              editable={!locked && !pending}
              placeholder={t("placeholder", { name: stakeholder.name })}
              placeholderTextColor={c.muted}
              accessibilityLabel={t("reply", { name: stakeholder.name })}
              selectionColor={c.signal}
              style={{ flex: 1, minHeight: 48, maxHeight: 160, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 24, borderWidth: hairline, borderColor: c.hairlineStrong, backgroundColor: c.surface, color: c.text, fontFamily: spec.family, fontSize: spec.size, lineHeight: spec.line, textAlign: "start", writingDirection: rtl ? "rtl" : "ltr", ...noOutline }}
            />
            <Press testID="roleplay-send" onPress={send} disabled={!draft.trim() || pending || locked} accessibilityLabel={t("send")} style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: draft.trim() && !pending ? c.action : c.surfaceSunken }}>
              <ArrowUp size={22} color={draft.trim() && !pending ? c.actionText : c.tertiary} strokeWidth={2.4} />
            </Press>
          </View>
        ) : null}
        {!ended ? <Button variant="secondary" size="md" label={t("end")} onPress={onEnd} disabled={turns === 0 || pending || locked} full /> : null}
        <T variant="caption" tone="tertiary">
          {ti("tasks.roleplay.hint")}
        </T>
      </View>
    </View>
  );
}
