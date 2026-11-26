import * as React from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import type { FairnessAnswers, Recap, View as V } from "../api/types";
import { useLocale, useT } from "../i18n";
import { fonts, lift, radius, tiles, useTheme, type TileTone } from "../theme";
import { haptic } from "../lib/haptics";
import { Button } from "../ui/button";
import { MarkLive } from "../ui/brand";
import { Entrance, useCountUp } from "../ui/motion";
import { Card, Chip, HeroCard, NumberBadge, TextArea, Tile } from "../ui/primitives";
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

/** Done: on the violet highlight card the signature narrows into its dot; then the recap, what happens next, optional feedback and the voluntary fairness questions. */
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
      <HeroCard style={{ marginTop: 8 }}>
        <View style={{ gap: 20 }}>
          <View style={{ alignItems: "flex-start" }}>
            <MarkLive width={112} loop={false} burst onLand={haptic.success} onHero />
          </View>
          <Entrance delay={FINISH.title} y={22} style={{ gap: 12 }}>
            <T variant="display" tone="heroText" accessibilityRole="header">
              {t("title")}
            </T>
            <T variant="body" tone="heroSecondary">
              {t("body", { org, role: v.roleTitle })}
            </T>
          </Entrance>
        </View>
      </HeroCard>

      {v.recap ? <RecapCard recap={v.recap} org={org} /> : null}

      <Card style={{ gap: 16 }}>
        <T variant="headline">{t("nextTitle")}</T>
        {[t("next1", { org }), t("next2"), t("next3", { org })].map((line, i) => (
          <View key={i} style={{ flexDirection: "row", gap: 14 }}>
            <NumberBadge n={i + 1} size={28} />
            <T variant="subhead" tone="secondary" style={{ flex: 1, paddingTop: 3 }}>
              {line}
            </T>
          </View>
        ))}
      </Card>

      <Card style={{ gap: 16 }}>
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
                {[1, 2, 3, 4, 5].map((r) => {
                  const on = rating === r;
                  return (
                    <Press
                      key={r}
                      testID={`rating-${r}`}
                      depth={0.94}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on, selected: on }}
                      accessibilityLabel={tm("rating", { n: r })}
                      onPress={() => {
                        haptic.select();
                        setRating(r);
                      }}
                      style={[{ flex: 1, height: 52, borderRadius: radius.control, alignItems: "center", justifyContent: "center", backgroundColor: on ? c.accent : c.surfaceSunken }, on ? lift("glow", c) : null]}
                    >
                      <T variant="headline" latin align="center" style={{ color: on ? c.actionText : c.text }}>
                        {r}
                      </T>
                    </Press>
                  );
                })}
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

/** One tile per count, in the chart order: violet, blue, teal, coral. */
const TILE_TONES: TileTone[] = ["violet", "blue", "teal", "coral"];

/** What they got through and the habits their own words showed: closure, not a verdict. Counts of what they did, never a score. */
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
    <Card style={{ gap: 18 }}>
      <T variant="label" tone="tertiary" accessibilityRole="header">
        {t("title")}
      </T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {stats.map((s, i) => {
          const tone = TILE_TONES[i % TILE_TONES.length]!;
          return (
            <View key={s.k} accessible accessibilityLabel={`${n(s.v)} ${t(s.k, { n: s.v })}`} style={{ flexBasis: "45%", flexGrow: 1 }}>
              <Tile tone={tone} style={{ paddingHorizontal: 16, paddingVertical: 16, gap: 4, minHeight: 96, justifyContent: "flex-end" }}>
                <CountUp value={s.v} delay={FINISH.count} color={tiles[tone].text} />
                <T variant="footnote" style={{ color: tiles[tone].text }}>
                  {t(s.k, { n: s.v })}
                </T>
              </Tile>
            </View>
          );
        })}
      </View>
      {habits.length ? (
        <View style={{ gap: 12 }}>
          <T variant="headline">{t("habitsTitle")}</T>
          {habits.map((h, i) => (
            <Entrance key={h} delay={FINISH.habits + i * FINISH.habitStagger} y={8} style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.accentText, marginTop: 7 }} />
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
      <T variant="caption" tone="tertiary">
        {t("note", { org })}
      </T>
    </Card>
  );
}

/**
 * A recap number counting up from 0, eased, in tabular figures. The final
 * number, invisible, holds the width, so nothing beside it moves while it
 * counts. Screen readers get the final value from the cell's label.
 */
function CountUp({ value, delay, color }: { value: number; delay: number; color: string }) {
  const { n } = useLocale();
  const shown = useCountUp(value, { delay, duration: 900 });
  const style = { fontSize: 30, lineHeight: 34, fontFamily: fonts.sans[800], letterSpacing: -0.6, color, fontVariant: ["tabular-nums" as const] };
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
          <T variant="subhead">{t(`fields.${field}`)}</T>
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
