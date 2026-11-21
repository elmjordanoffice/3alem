import * as React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Clock, Coffee, PauseCircle, Route, Wifi } from "lucide-react-native";
import type { View as V } from "../api/types";
import { useLocale, useT } from "../i18n";
import { palette, radius, useTheme } from "../theme";
import { Button } from "../ui/button";
import { hairline, SignalRule } from "../ui/primitives";
import { T } from "../ui/text";
import { Avatar } from "../ui/avatar";
import { Narrowing } from "../ui/brand";
import { NextHint } from "../deck/chrome";
import { Pager } from "../deck/pager";
import type { PagerHandle } from "../deck/pager-context";
import { Slide } from "../deck/slide";
import { OrgHeader, Screen } from "./scaffold";

const BEFORE = [
  { icon: Coffee, k: "quiet" },
  { icon: Clock, k: "time" },
  { icon: PauseCircle, k: "pause" },
  { icon: Route, k: "noBack" },
  { icon: Wifi, k: "offline" },
] as const;

/** Before you begin (a numbered checklist), then the world: the company, your role, the people, your week. */
export function Briefing({ v, onBegin }: { v: V<"briefing">; onBegin: () => Promise<void> }) {
  const [step, setStep] = React.useState<"before" | "story">("before");
  return step === "before" ? <Before v={v} onReady={() => setStep("story")} /> : <World v={v} onBegin={onBegin} />;
}

function Before({ v, onReady }: { v: V<"briefing">; onReady: () => void }) {
  const t = useT("candidate.briefing");
  const { c } = useTheme();
  return (
    <Screen testID="screen-before" header={<OrgHeader branding={v.branding} />} bar={<Button testID="ready" variant="primary" label={t("ready")} onPress={onReady} full />}>
      <View style={{ gap: 18, marginTop: 8 }}>
        <SignalRule />
        <T variant="display" accessibilityRole="header">
          {t("beforeTitle")}
        </T>
      </View>
      <View>
        {BEFORE.map(({ icon: Icon, k }, i) => (
          <View key={k} style={{ flexDirection: "row", gap: 16, paddingVertical: 18, borderTopWidth: hairline, borderBottomWidth: i === BEFORE.length - 1 ? hairline : 0, borderColor: c.hairline }}>
            <T variant="index" latin style={{ width: 44 }}>
              {String(i + 1).padStart(2, "0")}
            </T>
            <View style={{ flex: 1, gap: 4 }}>
              <T variant="headline">{t(`before.${k}.title`, { minutes: v.minutes })}</T>
              <T variant="subhead" tone="secondary">
                {t(`before.${k}.body`, { minutes: v.minutes })}
              </T>
            </View>
            <Icon size={19} color={c.tertiary} strokeWidth={1.75} style={{ marginTop: 2 }} />
          </View>
        ))}
      </View>
    </Screen>
  );
}

/** The world intro, paged like the scenes that follow. */
function World({ v, onBegin }: { v: V<"briefing">; onBegin: () => Promise<void> }) {
  const t = useT("candidate.briefing");
  const tm = useT("mobile.briefing");
  const { dir } = useLocale();
  const { c, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const pager = React.useRef<PagerHandle>(null);
  const [index, setIndex] = React.useState(0);
  const [pending, setPending] = React.useState(false);
  const w = v.world;
  const pad = { paddingTop: insets.top + 64, paddingHorizontal: 22, paddingBottom: insets.bottom + 120, width: "100%" as const, maxWidth: 640, alignSelf: "center" as const };

  const pages: { key: string; ink?: boolean; node: React.ReactNode; footer?: React.ReactNode }[] = [
    {
      key: "company",
      ink: true,
      node: (
        <View style={{ flexGrow: 1, justifyContent: "center", gap: 22 }}>
          <View style={{ alignItems: "flex-start" }}>
            <Narrowing width={92} rows={3} loop={false} onInk />
          </View>
          <T variant="subhead" tone="inkSecondary">
            {t("eyebrow")}
          </T>
          <T variant="display" tone="inkForeground" accessibilityRole="header">
            {t("title", { company: w.companyName })}
          </T>
          <T variant="body" tone="inkSecondary">
            {w.premise}
          </T>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: hairline, borderColor: "rgba(242,240,235,0.25)" }}>
            <T variant="caption" tone="inkSecondary">
              {w.industry}
            </T>
          </View>
        </View>
      ),
    },
    {
      key: "role",
      node: (
        <View style={{ flexGrow: 1, justifyContent: "center", gap: 18 }}>
          <T variant="label" tone="secondary">
            {t("yourRole")}
          </T>
          <T variant="title" accessibilityRole="header">
            {w.yourRole}
          </T>
          <View style={{ padding: 18, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: hairline, borderColor: c.hairline, gap: 6 }}>
            <T variant="footnote" tone="tertiary">
              {tm("roleTeam")}
            </T>
            <T variant="body">{w.team}</T>
          </View>
        </View>
      ),
    },
    {
      key: "people",
      node: (
        <View style={{ flexGrow: 1, justifyContent: "center", gap: 18 }}>
          <T variant="title2" accessibilityRole="header">
            {t("people")}
          </T>
          <View style={{ borderRadius: radius.card, backgroundColor: c.surface, borderWidth: hairline, borderColor: c.hairline }}>
            {w.cast.map((p, i) => (
              <View key={p.name} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, paddingHorizontal: 16, borderTopWidth: i ? hairline : 0, borderColor: c.hairline }}>
                <Avatar name={p.name} size={40} />
                <View style={{ flex: 1 }}>
                  <T variant="headline">{p.name}</T>
                  <T variant="footnote" tone="secondary">
                    {p.role}
                  </T>
                </View>
              </View>
            ))}
          </View>
        </View>
      ),
    },
    {
      key: "week",
      node: (
        <View style={{ flexGrow: 1, justifyContent: "center", gap: 22 }}>
          <T variant="title2" accessibilityRole="header">
            {t("week")}
          </T>
          <View>
            {w.chapters.map((ch, i) => (
              <View key={ch.title} style={{ flexDirection: "row", gap: 14 }}>
                <View style={{ alignItems: "center", width: 32 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: i === 0 ? c.signal : c.surface, borderWidth: i === 0 ? 0 : hairline, borderColor: c.hairlineStrong }}>
                    <T variant="footnote" latin align="center" style={{ color: i === 0 ? palette.ink : c.secondary, fontFamily: "IBMPlexSans_600SemiBold" }}>
                      {i + 1}
                    </T>
                  </View>
                  {i < w.chapters.length - 1 ? <View style={{ width: hairline, flex: 1, minHeight: 18, backgroundColor: c.hairlineStrong }} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: 18, gap: 2 }}>
                  <T variant="headline" tone={i === 0 ? "text" : "secondary"}>
                    {ch.title}
                  </T>
                  <T variant="footnote" tone="tertiary">
                    {ch.summary}
                  </T>
                </View>
              </View>
            ))}
          </View>
          <T variant="subhead" tone="secondary">
            {t("howItWorks")}
          </T>
        </View>
      ),
      footer: (
        <View style={{ position: "absolute", left: 22, right: 22, bottom: insets.bottom + 16, maxWidth: 600, alignSelf: "center" }}>
          <Button
            testID="begin"
            variant="primary"
            label={t("start")}
            loading={pending}
            full
            onPress={async () => {
              setPending(true);
              try {
                await onBegin();
              } catch {
                setPending(false);
              }
            }}
          />
        </View>
      ),
    },
  ];

  const ink = pages[index]?.ink;
  return (
    <View style={{ flex: 1, direction: dir, backgroundColor: c.canvas }} testID="screen-world">
      <StatusBar style={ink || dark ? "light" : "dark"} />
      <Pager ref={pager} onIndexChange={setIndex}>
        {pages.map((p, i) => (
          <View key={p.key} style={{ flex: 1, backgroundColor: p.ink ? palette.ink : c.canvas }}>
            <Slide inactive={i !== index} contentStyle={[pad, { paddingBottom: insets.bottom + (p.footer ? 110 : 8) }]} footer={p.footer}>
              <View style={{ flexGrow: 1 }}>{p.node}</View>
              {!p.footer ? <NextHint first={i === 0} onInk={p.ink} label={tm("swipe")} onPress={() => pager.current?.goTo(i + 1)} /> : null}
            </Slide>
          </View>
        ))}
      </Pager>
      <View pointerEvents="none" style={{ position: "absolute", top: insets.top + 14, left: 22, right: 22 }}>
        <OrgHeader branding={v.branding} onInk={ink} />
      </View>
    </View>
  );
}
