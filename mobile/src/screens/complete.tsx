import * as React from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import type { FairnessAnswers, Recap, View as V } from "../api/types";
import { useLocale, useT } from "../i18n";
import { radius, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { Button } from "../ui/button";
import { Narrowing } from "../ui/brand";
import { Entrance, useCountUp } from "../ui/motion";
import { Card, Chip, hairline, TextArea } from "../ui/primitives";
import { Press } from "../ui/press";
import { T } from "../ui/text";
import { OrgHeader, Screen } from "./scaffold";

const FAIRNESS: Record<keyof FairnessAnswers, string[]> = {
  gender: ["woman", "man", "another", "prefer_not"],
  ageBand: ["under25", "25_34", "35_44", "45_54", "55plus", "prefer_not"],
  disability: ["yes", "no", "prefer_not"],
  firstLanguage: ["arabic", "english", "other", "prefer_not"],
};

// The finish, in order: the bands narrow and the dot pops (~1.7 s, a success
// haptic), the title rises, the recap counts up, the habits fade in.
const FINISH = { title: 900, count: 1000, habits: 1500, habitStagger: 160 };

/** Done: the signature narrows into its dot; then optional feedback and the voluntary fairness questions. */
export function Complete({ v, onFeedback, onFairness }: { v: V<"complete">; onFeedback: (f: { rating: number; comment: string }) => Promise<void>; onFairness: (a: FairnessAnswers) => Promise<void> }) {
  const t = useT("candidate.complete");
  const tm = useT("mobile.complete");
  const { c } = useTheme();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const org = v.branding.orgName;

  return (
    <Screen testID="screen-complete" header={<OrgHeader branding={v.branding} />}>
      <View style={{ gap: 22, marginTop: 12 }}>
        <View style={{ alignItems: "flex-start" }}>
          <Narrowing width={150} rows={5} loop={false} burst onLand={haptic.success} />
        </View>
        <Entrance delay={FINISH.title} y={22} style={{ gap: 12 }}>
          <T variant="display" accessibilityRole="header">
            {t("title")}
          </T>
          <T variant="body" tone="secondary">
            {t("body", { org, role: v.roleTitle })}
          </T>
        </Entrance>
      </View>

      {v.recap ? <RecapCard recap={v.recap} org={org} /> : null}

      <View style={{ gap: 10 }}>
        <T variant="headline">{t("nextTitle")}</T>
        {[t("next1", { org }), t("next2"), t("next3", { org })].map((line, i) => (
          <View key={i} style={{ flexDirection: "row", gap: 14, paddingVertical: 10, borderTopWidth: hairline, borderColor: c.hairline }}>
            <T variant="index" latin style={{ width: 34, fontSize: 14, lineHeight: 22, color: c.tertiary }}>
              {String(i + 1).padStart(2, "0")}
            </T>
            <T variant="subhead" tone="secondary" style={{ flex: 1 }}>
              {line}
            </T>
          </View>
        ))}
      </View>

      <Card style={{ gap: 14 }}>
        {sent ? (
          <Animated.View entering={FadeIn}>
            <T variant="callout" tone="secondary" accessibilityLiveRegion="polite">
              {t("thanks")}
            </T>
          </Animated.View>
        ) : (
          <>
            <View style={{ gap: 4 }}>
              <T variant="headline">{t("feedbackTitle")}</T>
              <T variant="subhead" tone="secondary">
                {t("feedbackHint")}
              </T>
            </View>
            {/* A 1–5 scale reads left to right in both languages. */}
            <View style={{ direction: "ltr", gap: 6 }}>
              <View accessibilityRole="radiogroup" accessibilityLabel={t("feedbackTitle")} style={{ flexDirection: "row", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((r) => (
                  <Press
                    key={r}
                    testID={`rating-${r}`}
                    depth={0.94}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: rating === r, selected: rating === r }}
                    accessibilityLabel={tm("rating", { n: r })}
                    onPress={() => {
                      haptic.select();
                      setRating(r);
                    }}
                    style={{ flex: 1, height: 52, borderRadius: radius.control, alignItems: "center", justifyContent: "center", backgroundColor: rating === r ? c.action : c.surface, borderWidth: hairline, borderColor: rating === r ? c.action : c.hairlineStrong }}
                  >
                    <T variant="headline" latin align="center" style={{ color: rating === r ? c.actionText : c.text }}>
                      {r}
                    </T>
                  </Press>
                ))}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <T variant="caption" tone="tertiary">
                  {t("low")}
                </T>
                <T variant="caption" tone="tertiary">
                  {t("high")}
                </T>
              </View>
            </View>
            <TextArea label={t("comment")} value={comment} onChangeText={setComment} minHeight={96} />
            <Button
              testID="feedback-send"
              variant="action"
              label={t("send")}
              disabled={rating === 0}
              loading={sending}
              onPress={async () => {
                setSending(true);
                try {
                  await onFeedback({ rating, comment });
                  haptic.success();
                  setSent(true);
                } finally {
                  setSending(false);
                }
              }}
            />
          </>
        )}
      </Card>

      <Card style={{ gap: 14 }}>
        <Fairness onSubmit={onFairness} />
      </Card>
    </Screen>
  );
}

const KNOWN_HABITS = new Set<string>(["reasons", "ownership", "checking", "tradeoffs", "perspective", "specifics", "contingency", "options", "calibration", "learning", "people"]);

/** What they got through and the habits their own words showed: closure, not a verdict. */
function RecapCard({ recap, org }: { recap: Recap; org: string }) {
  const t = useT("candidate.complete.recap");
  const { c } = useTheme();
  const { n } = useLocale();
  const stats = [
    { k: "scenes", v: recap.scenes },
    { k: "followUps", v: recap.followUps },
    { k: "words", v: recap.words },
    { k: "minutes", v: recap.minutes },
  ] as const;
  // Only habits this build has words for (a newer server may name more).
  const habits = recap.habits.filter((h) => KNOWN_HABITS.has(h)).slice(0, 3);
  return (
    <Card padded={false} style={{ overflow: "hidden" }}>
      <T variant="label" tone="tertiary" style={{ paddingHorizontal: 18, paddingTop: 18 }} accessibilityRole="header">
        {t("title")}
      </T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 14, borderTopWidth: hairline, borderColor: c.hairline }}>
        {stats.map((s, i) => (
          <View key={s.k} accessible accessibilityLabel={`${n(s.v)} ${t(s.k, { n: s.v })}`} style={{ width: "50%", paddingHorizontal: 18, paddingVertical: 14, gap: 2, borderColor: c.hairline, borderBottomWidth: i < 2 ? hairline : 0, borderEndWidth: i % 2 === 0 ? hairline : 0 }}>
            <CountUp value={s.v} delay={FINISH.count} />
            <T variant="footnote" tone="secondary">
              {t(s.k, { n: s.v })}
            </T>
          </View>
        ))}
      </View>
      {habits.length ? (
        <View style={{ paddingHorizontal: 18, paddingVertical: 18, gap: 12, borderTopWidth: hairline, borderColor: c.hairline }}>
          <T variant="headline">{t("habitsTitle")}</T>
          {habits.map((h, i) => (
            <Entrance key={h} delay={FINISH.habits + i * FINISH.habitStagger} y={8} style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.signal, marginTop: 9 }} />
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="subhead" style={{ color: c.text }}>
                  {t(`habits.${h}.title`)}
                </T>
                <T variant="footnote" tone="secondary">
                  {t(`habits.${h}.body`)}
                </T>
              </View>
            </Entrance>
          ))}
        </View>
      ) : null}
      <View style={{ paddingHorizontal: 18, paddingVertical: 12, borderTopWidth: hairline, borderColor: c.hairline }}>
        <T variant="caption" tone="tertiary">
          {t("note", { org })}
        </T>
      </View>
    </Card>
  );
}

/**
 * A recap number counting up from 0, eased, in tabular figures. The final
 * number, invisible, holds the width, so nothing beside it moves while it
 * counts. Screen readers get the final value from the cell's label.
 */
function CountUp({ value, delay }: { value: number; delay: number }) {
  const { n } = useLocale();
  const shown = useCountUp(value, { delay, duration: 900 });
  const style = { fontSize: 28, lineHeight: 32, fontVariant: ["tabular-nums" as const] };
  return (
    <View>
      <T variant="index" latin style={[style, { opacity: 0 }]} accessibilityElementsHidden importantForAccessibility="no">
        {n(value)}
      </T>
      <T variant="index" latin style={[style, { position: "absolute", top: 0, start: 0 }]} accessibilityElementsHidden importantForAccessibility="no">
        {n(shown)}
      </T>
    </View>
  );
}

/** Voluntary, stored apart from the assessment, skippable as a whole. */
function Fairness({ onSubmit }: { onSubmit: (a: FairnessAnswers) => Promise<void> }) {
  const t = useT("candidate.fairness");
  const [answers, setAnswers] = React.useState<FairnessAnswers>({});
  const [state, setState] = React.useState<"open" | "sent" | "skipped">("open");
  const [sending, setSending] = React.useState(false);
  if (state !== "open")
    return (
      <T variant="callout" tone="secondary" accessibilityLiveRegion="polite">
        {state === "sent" ? t("thanks") : t("skipped")}
      </T>
    );
  return (
    <View style={{ gap: 18 }}>
      <View style={{ gap: 6 }}>
        <T variant="headline">{t("title")}</T>
        <T variant="subhead" tone="secondary">
          {t("body")}
        </T>
      </View>
      {(Object.keys(FAIRNESS) as (keyof FairnessAnswers)[]).map((field) => (
        <View key={field} style={{ gap: 10 }}>
          <T variant="subhead">
            {t(`fields.${field}`)}
          </T>
          <View accessibilityRole="radiogroup" accessibilityLabel={t(`fields.${field}`)} style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {FAIRNESS[field].map((o) => (
              <Chip key={o} label={t(`values.${field}.${o}`)} selected={answers[field] === o} onPress={() => setAnswers((a) => ({ ...a, [field]: a[field] === o ? undefined : o }))} />
            ))}
          </View>
        </View>
      ))}
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <Button
          variant="secondary"
          size="md"
          label={t("send")}
          loading={sending}
          disabled={Object.values(answers).every((x) => !x)}
          onPress={async () => {
            setSending(true);
            try {
              await onSubmit(Object.fromEntries(Object.entries(answers).filter(([, x]) => x)) as FairnessAnswers);
              setState("sent");
            } finally {
              setSending(false);
            }
          }}
        />
        <Button variant="ghost" size="md" label={t("skip")} onPress={() => setState("skipped")} />
      </View>
    </View>
  );
}
