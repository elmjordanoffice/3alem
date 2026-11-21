import * as React from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Clock, Link2Off, PauseCircle, WifiOff, type LucideIcon } from "lucide-react-native";
import type { Branding, View as V } from "../api/types";
import { useT } from "../i18n";
import { palette, useTheme } from "../theme";
import { Button } from "../ui/button";
import { Narrowing } from "../ui/brand";
import { T } from "../ui/text";
import { OrgHeader, Screen } from "./scaffold";

/** A chapter break: what happened, your decisions so far, then pause or go on. */
export function Transition({ v, onContinue, onPause }: { v: V<"transition">; onContinue: () => Promise<void>; onPause: () => Promise<void> }) {
  const t = useT("candidate.transition");
  const ch = v.world.chapters[v.chapterIndex];
  const [pending, setPending] = React.useState<"go" | "pause" | null>(null);
  const run = (k: "go" | "pause", fn: () => Promise<void>) => async () => {
    setPending(k);
    try {
      await fn();
    } catch {
      setPending(null);
    }
  };
  return (
    <Screen
      ink
      testID="screen-transition"
      header={<OrgHeader branding={v.branding} onInk />}
      bar={
        <>
          <Button testID="chapter-continue" variant="primary" label={t("start", { n: v.chapterIndex + 1 })} loading={pending === "go"} disabled={pending === "pause"} onPress={run("go", onContinue)} full />
          <Button testID="chapter-pause" variant="onInk" icon={PauseCircle} label={t("pause")} loading={pending === "pause"} disabled={pending === "go"} onPress={run("pause", onPause)} full />
        </>
      }
      contentStyle={{ justifyContent: "flex-start" }}
    >
      <View style={{ gap: 18, marginTop: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <T variant="subhead" tone="inkSecondary">
            {t("eyebrow")}
          </T>
          <View style={{ flexDirection: "row", gap: 4 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {v.world.chapters.map((_, i) => (
              <View key={i} style={{ width: 22, height: 4, borderRadius: 2, backgroundColor: i < v.chapterIndex ? palette.signal : i === v.chapterIndex ? palette.bone : "rgba(242,240,235,0.16)" }} />
            ))}
          </View>
        </View>
        <Animated.View entering={FadeInDown.springify().damping(20)} style={{ gap: 14 }}>
          <T variant="display" tone="inkForeground" accessibilityRole="header">
            {ch?.title}
          </T>
          <T variant="body" tone="inkSecondary">
            {ch?.summary}
          </T>
        </Animated.View>
      </View>
      {v.recap.length ? (
        <View style={{ gap: 12, paddingTop: 22, borderTopWidth: 1, borderColor: "rgba(242,240,235,0.14)" }}>
          <T variant="headline" tone="inkForeground">
            {t("soFar")}
          </T>
          {v.recap.map((r) => (
            <View key={r} style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: palette.signal, marginTop: 9 }} />
              <T variant="callout" tone="inkSecondary" style={{ flex: 1 }}>
                {r}
              </T>
            </View>
          ))}
          <T variant="footnote" tone="inkSecondary" style={{ opacity: 0.8 }}>
            {t("carryForward")}
          </T>
        </View>
      ) : null}
    </Screen>
  );
}

export function Paused({ v, onResume }: { v: V<"paused">; onResume: () => Promise<void> }) {
  const t = useT("candidate.paused");
  const { c } = useTheme();
  const [pending, setPending] = React.useState(false);
  return (
    <Screen
      testID="screen-paused"
      header={<OrgHeader branding={v.branding} />}
      contentStyle={{ justifyContent: "center" }}
      bar={
        <Button
          testID="resume"
          variant="primary"
          label={t("resume", { n: v.chapterIndex + 1 })}
          loading={pending}
          full
          onPress={async () => {
            setPending(true);
            try {
              await onResume();
            } catch {
              setPending(false);
            }
          }}
        />
      }
    >
      <View style={{ flexGrow: 1, justifyContent: "center", gap: 18 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.surface, borderWidth: 1, borderColor: c.hairline, alignItems: "center", justifyContent: "center" }}>
          <PauseCircle size={30} color={c.text} strokeWidth={1.5} />
        </View>
        <T variant="display" accessibilityRole="header">
          {t("title")}
        </T>
        <T variant="body" tone="secondary">
          {t("body", { minutes: v.minutesLeft })}
        </T>
      </View>
    </Screen>
  );
}

/** Invalid, expired, revoked, or unreachable: say what happened and what to do. */
export function StateScreen({ branding, kind, onBack, onRetry, message }: { branding?: Branding; kind: "invalid" | "expired" | "revoked" | "offline"; onBack: () => void; onRetry?: () => void; message?: string }) {
  const t = useT("candidate");
  const tm = useT("mobile");
  const { c } = useTheme();
  const Icon: LucideIcon = kind === "expired" ? Clock : kind === "offline" ? WifiOff : Link2Off;
  const org = branding?.orgName ?? "";
  const title = kind === "offline" ? tm("errors.connectTitle") : t(`${kind}.title`);
  const body = message ?? (kind === "offline" ? tm("errors.connectBody") : t(`${kind}.body`, { org }));
  return (
    <Screen
      testID={`screen-${kind}`}
      header={<OrgHeader branding={branding} />}
      bar={
        <>
          {onRetry ? <Button variant="primary" label={tm("errors.retry")} onPress={onRetry} full /> : null}
          <Button variant={onRetry ? "ghost" : "action"} label={tm(kind === "offline" ? "errors.back" : "welcome.forget")} onPress={onBack} full />
        </>
      }
    >
      <View style={{ flexGrow: 1, justifyContent: "center", gap: 16 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surfaceSunken, alignItems: "center", justifyContent: "center" }}>
          <Icon size={24} color={c.secondary} strokeWidth={1.6} />
        </View>
        <T variant="title" accessibilityRole="header">
          {title}
        </T>
        <T variant="body" tone="secondary">
          {body}
        </T>
      </View>
    </Screen>
  );
}

/** While the first scene is written: the bands narrow, over and over, into the dot. */
export function Preparing({ branding }: { branding?: Branding }) {
  const t = useT("candidate");
  return (
    <Screen testID="screen-preparing" header={<OrgHeader branding={branding} />} scroll={false}>
      <View accessibilityRole="progressbar" accessibilityLabel={t("preparing")} style={{ flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 28, paddingBottom: 60 }}>
        <Narrowing width={132} rows={3} loop />
        <T variant="callout" tone="secondary" align="center">
          {t("preparing")}
        </T>
      </View>
    </Screen>
  );
}
