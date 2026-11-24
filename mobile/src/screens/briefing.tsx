import * as React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Clock, Coffee, PauseCircle, Route, Wifi } from "lucide-react-native";
import type { View as V } from "../api/types";
import { useLocale, useT } from "../i18n";
import { fonts, radius, useTheme } from "../theme";
import { Button } from "../ui/button";
import { Card, hairline, HeroCard, IconCircle, NumberBadge, SignalRule } from "../ui/primitives";
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

/** Before you begin (a checklist card), then the world: the company, your role, the people, your week. */
export function Briefing({ v, onBegin }: { v: V<"briefing">; onBegin: () => Promise<void> }) {
  const [step, setStep] = React.useState<"before" | "story">("before");
  return step === "before" ? <Before v={v} onReady={() => setStep("story")} /> : <World v={v} onBegin={onBegin} />;
}

function Before({ v, onReady }: { v: V<"briefing">; onReady: () => void }) {
  const t = useT("candidate.briefing");
  return (
    <Screen testID="screen-before" header={<OrgHeader branding={v.branding} />} bar={<Button testID="ready" variant="primary" label={t("ready")} onPress={onReady} full />}>
      <View style={{ gap: 16, marginTop: 8 }}>
        <SignalRule />
        <T variant="display" accessibilityRole="header">
          {t("beforeTitle")}
        </T>
      </View>
      <Card style={{ gap: 20 }}>
        {BEFORE.map(({ icon, k }) => (
          <View key={k} style={{ flexDirection: "row", gap: 14 }}>
            <IconCircle icon={icon} size={42} />
            <View style={{ flex: 1, gap: 3, paddingTop: 1 }}>
              <T variant="headline">{t(`before.${k}.title`, { minutes: v.minutes })}</T>
              <T variant="subhead" tone="secondary">
                {t(`before.${k}.body`, { minutes: v.minutes })}
              </T>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

/** The world intro, paged like the scenes that follow; the company opens on the violet highlight card. */
function World({ v, onBegin }: { v: V<"briefing">; onBegin: () => Promise<void> }) {
  const t = useT("candidate.briefing");
  const tm = useT("mobile.briefing");
  const { dir, rtl } = useLocale();
  const { c, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const pager = React.useRef<PagerHandle>(null);
  const [index, setIndex] = React.useState(0);
  const [pending, setPending] = React.useState(false);
  const w = v.world;
  const pad = { paddingTop: insets.top + 64, paddingHorizontal: 20, paddingBottom: insets.bottom + 120, width: "100%" as const, maxWidth: 640, alignSelf: "center" as const };

  const pages: { key: string; node: React.ReactNode; footer?: React.ReactNode }[] = [
    {
      key: "company",
      node: (
        <View style={{ flexGrow: 1, justifyContent: "center" }}>
          <HeroCard>
            <View style={{ gap: 18 }}>
              <View style={{ alignItems: "flex-start" }}>
                <Narrowing width={84} rows={3} loop={false} onHero />
              </View>
              <T variant="label" tone="heroSecondary">
                {t("eyebrow")}
              </T>
              <T variant="display" tone="heroText" accessibilityRole="header">
                {t("title", { company: w.companyName })}
              </T>
              <T variant="body" tone="heroSecondary">
                {w.premise}
              </T>
              <View style={{ flexDirection: "row", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.14)" }}>
                <T variant="caption" tone="heroText">
                  {w.industry}
                </T>
              </View>
            </View>
          </HeroCard>
        </View>
      ),
    },
    {
      key: "role",
      node: (
        <View style={{ flexGrow: 1, justifyContent: "center", gap: 18 }}>
          <T variant="label" tone="accentText">
            {t("yourRole")}
          </T>
          <T variant="title" accessibilityRole="header">
            {w.yourRole}
          </T>
          <Card style={{ gap: 6 }}>
            <T variant="footnote" tone="tertiary">
              {tm("roleTeam")}
            </T>
            <T variant="body">{w.team}</T>
          </Card>
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
          <Card padded={false} style={{ paddingVertical: 6 }}>
            {w.cast.map((p, i) => (
              <View key={p.name} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, marginHorizontal: 18, borderTopWidth: i ? hairline : 0, borderColor: c.hairline }}>
                <Avatar name={p.name} size={42} />
                <View style={{ flex: 1 }}>
                  <T variant="headline">{p.name}</T>
                  <T variant="footnote" tone="secondary">
                    {p.role}
                  </T>
                </View>
              </View>
            ))}
          </Card>
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
          <Card>
            {w.chapters.map((ch, i) => (
              <View key={ch.title} style={{ flexDirection: "row", gap: 14 }}>
                <View style={{ alignItems: "center", width: 32 }}>
                  <NumberBadge n={i + 1} size={32} strong={i === 0} />
                  {i < w.chapters.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 18, borderRadius: 1, marginVertical: 4, backgroundColor: c.hairlineStrong }} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: i < w.chapters.length - 1 ? 18 : 0, gap: 2, paddingTop: rtl ? 0 : 5 }}>
                  <T variant="headline" tone={i === 0 ? "text" : "secondary"} style={i === 0 ? null : { fontFamily: rtl ? fonts.arabic[500] : fonts.sans[600] }}>
                    {ch.title}
                  </T>
                  <T variant="footnote" tone="tertiary">
                    {ch.summary}
                  </T>
                </View>
              </View>
            ))}
          </Card>
          <T variant="subhead" tone="secondary">
            {t("howItWorks")}
          </T>
        </View>
      ),
      footer: (
        <View style={{ position: "absolute", left: 20, right: 20, bottom: insets.bottom + 16, maxWidth: 600, alignSelf: "center" }}>
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

  return (
    <View style={{ flex: 1, direction: dir, backgroundColor: c.canvas }} testID="screen-world">
      <StatusBar style={dark ? "light" : "dark"} />
      <Pager ref={pager} onIndexChange={setIndex}>
        {pages.map((p, i) => (
          <View key={p.key} style={{ flex: 1, backgroundColor: c.canvas }}>
            <Slide inactive={i !== index} contentStyle={[pad, { paddingBottom: insets.bottom + (p.footer ? 110 : 8) }]} footer={p.footer}>
              <View style={{ flexGrow: 1 }}>{p.node}</View>
              {!p.footer ? <NextHint first={i === 0} label={tm("swipe")} onPress={() => pager.current?.goTo(i + 1)} /> : null}
            </Slide>
          </View>
        ))}
      </Pager>
      <View pointerEvents="none" style={{ position: "absolute", top: insets.top + 14, left: 20, right: 20 }}>
        <OrgHeader branding={v.branding} />
      </View>
    </View>
  );
}
