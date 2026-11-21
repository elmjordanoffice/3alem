import * as React from "react";
import { Platform, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ClipboardPaste, KeyRound, Server } from "lucide-react-native";
import { parseInvitation } from "../api/client";
import { useLocale, useT } from "../i18n";
import { radius, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { useSession } from "../state/session";
import { Button } from "../ui/button";
import { Narrowing } from "../ui/brand";
import { Card, hairline, noOutline, Notice, Segmented } from "../ui/primitives";
import { Press } from "../ui/press";
import { Sheet } from "../ui/sheet";
import { T, useTypeSpec } from "../ui/text";
import { OrgHeader, Screen } from "./scaffold";

/** The way in: paste an invitation link or code, or continue the one on this device. */
export function Welcome() {
  const t = useT("mobile.welcome");
  const { locale, setLocale } = useLocale();
  const { c } = useTheme();
  const { token, setToken, clearToken, apiBase, setApiBase } = useSession();
  const spec = useTypeSpec("body");
  const [input, setInput] = React.useState("");
  const [invalid, setInvalid] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [serverOpen, setServerOpen] = React.useState(false);
  const [server, setServer] = React.useState(apiBase);
  const [saved, setSaved] = React.useState(false);

  const open = async (raw = input) => {
    const tok = parseInvitation(raw);
    if (!tok) {
      setInvalid(true);
      haptic.error();
      return;
    }
    haptic.select();
    await setToken(tok);
    router.push("/assessment");
  };

  const paste = async () => {
    try {
      const s = await Clipboard.getStringAsync();
      if (s) {
        setInput(s.trim());
        setInvalid(false);
        if (parseInvitation(s)) void open(s);
      }
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Screen
      testID="screen-welcome"
      header={
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <OrgHeader />
          <View style={{ width: 132 }}>
            <Segmented
              label="Language"
              value={locale}
              onChange={(l) => setLocale(l)}
              options={[
                { value: "en", label: "EN", lang: "en" },
                { value: "ar", label: "عربي", lang: "ar" },
              ]}
            />
          </View>
        </View>
      }
      bar={
        token ? (
          <>
            <Button testID="resume-invite" variant="primary" label={t("resume")} onPress={() => router.push("/assessment")} full />
            <Button variant="ghost" size="md" label={t("forget")} onPress={() => void clearToken()} full />
          </>
        ) : (
          <>
            <Button testID="open-invite" variant="primary" label={t("open")} onPress={() => void open()} disabled={!input.trim()} full />
            <T variant="caption" tone="tertiary" align="center">
              {t("privacy")}
            </T>
          </>
        )
      }
    >
      <View style={{ gap: 20, marginTop: 10 }}>
        <View style={{ alignItems: "flex-start" }}>
          <Narrowing width={84} rows={3} loop={false} />
        </View>
        <Animated.View entering={FadeInDown.delay(500).springify().damping(20)} style={{ gap: 14 }}>
          <T variant="label" tone="secondary">
            {t("eyebrow")}
          </T>
          <T variant="display" accessibilityRole="header">
            {t("title")}
          </T>
          <T variant="body" tone="secondary">
            {token ? t("resumeBody") : t("body")}
          </T>
        </Animated.View>
      </View>

      {token ? (
        <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.surfaceSunken, alignItems: "center", justifyContent: "center" }}>
            <KeyRound size={18} color={c.text} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="headline">{t("resumeTitle")}</T>
            <T variant="footnote" tone="tertiary" latin numberOfLines={1}>
              {`${token.slice(0, 6)}••••${token.slice(-4)}`}
            </T>
          </View>
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          <T variant="headline">{t("inputLabel")}</T>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingStart: 16, paddingEnd: 6, minHeight: 56, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: focused ? hairline * 1.25 : hairline, borderColor: invalid ? c.critical : focused ? c.text : c.hairlineStrong }}>
            <TextInput
              testID="invite-input"
              value={input}
              onChangeText={(s) => {
                setInput(s);
                setInvalid(false);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onSubmitEditing={() => void open()}
              placeholder={t("placeholder")}
              placeholderTextColor={c.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={Platform.OS === "ios" ? "url" : "default"}
              returnKeyType="go"
              accessibilityLabel={t("inputLabel")}
              selectionColor={c.signal}
              style={{ flex: 1, minWidth: 0, minHeight: 54, fontFamily: spec.family, fontSize: 16, color: c.text, textAlign: "start", ...noOutline }}
            />
            <Press onPress={paste} accessibilityLabel={t("paste")} depth={0.95} style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 44, paddingHorizontal: 12, borderRadius: radius.control, backgroundColor: c.surfaceSunken }}>
              <ClipboardPaste size={16} color={c.text} />
              <T variant="subhead" style={{ color: c.text }}>
                {t("paste")}
              </T>
            </Press>
          </View>
          {invalid ? <Notice tone="critical">{t("invalidLink")}</Notice> : null}
        </View>
      )}

      <Press onPress={() => setServerOpen(true)} depth={0.98} accessibilityLabel={`${t("server")}: ${apiBase}`} style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", minHeight: 44 }}>
        <Server size={14} color={c.tertiary} />
        <T variant="caption" tone="tertiary" latin>
          {apiBase.replace(/^https?:\/\//, "")}
        </T>
      </Press>

      <Sheet visible={serverOpen} onClose={() => setServerOpen(false)} title={t("server")} subtitle={t("serverHint")}>
        <TextInput
          value={server}
          onChangeText={(s) => {
            setServer(s);
            setSaved(false);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={Platform.OS === "ios" ? "url" : "default"}
          accessibilityLabel={t("server")}
          style={{ minHeight: 52, paddingHorizontal: 14, borderRadius: radius.control, borderWidth: hairline, borderColor: c.hairlineStrong, backgroundColor: c.surface, color: c.text, fontFamily: "IBMPlexSans_400Regular", fontSize: 16, textAlign: "left", direction: "ltr", ...noOutline }}
        />
        <Button
          variant="action"
          label={saved ? t("serverSaved") : t("serverSave")}
          onPress={async () => {
            await setApiBase(server);
            setSaved(true);
            haptic.success();
          }}
          full
        />
      </Sheet>
    </Screen>
  );
}
