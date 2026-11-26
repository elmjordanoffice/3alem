import * as React from "react";
import { Platform, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ClipboardPaste, KeyRound, Moon, Server, Sun } from "lucide-react-native";
import { parseInvitation } from "../api/client";
import { useLocale, useT } from "../i18n";
import { fonts, radius, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { useSession } from "../state/session";
import { Button, RoundButton } from "../ui/button";
import { MarkLive } from "../ui/brand";
import { Card, HeroCard, IconCircle, noOutline, Notice, Segmented, useFieldStyle } from "../ui/primitives";
import { Press } from "../ui/press";
import { Sheet } from "../ui/sheet";
import { T, useTypeSpec } from "../ui/text";
import { OrgHeader, Screen } from "./scaffold";

/** The way in: paste an invitation link or code, or continue the one on this device. */
export function Welcome() {
  const t = useT("mobile.welcome");
  const tp = useT("preferences");
  const { locale, setLocale } = useLocale();
  const { c, dark, setScheme } = useTheme();
  const { token, setToken, clearToken, apiBase, setApiBase } = useSession();
  const spec = useTypeSpec("body");
  const [input, setInput] = React.useState("");
  const [invalid, setInvalid] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [serverFocused, setServerFocused] = React.useState(false);
  const [serverOpen, setServerOpen] = React.useState(false);
  const [server, setServer] = React.useState(apiBase);
  const [saved, setSaved] = React.useState(false);
  const field = useFieldStyle(focused, invalid);
  const serverField = useFieldStyle(serverFocused);

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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <OrgHeader />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <RoundButton
              testID="theme-toggle"
              icon={dark ? Moon : Sun}
              size={42}
              accessibilityLabel={`${tp("theme")}: ${dark ? tp("themeDark") : tp("themeLight")}`}
              onPress={() => {
                haptic.select();
                setScheme(dark ? "light" : "dark");
              }}
            />
            <View style={{ width: 124 }}>
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
      <HeroCard style={{ marginTop: 6 }}>
        <View style={{ gap: 18 }}>
          <View style={{ alignItems: "flex-start" }}>
            <MarkLive width={64} loop={false} onHero />
          </View>
          <Animated.View entering={FadeInDown.delay(500).springify().damping(20)} style={{ gap: 12 }}>
            <T variant="label" tone="heroSecondary">
              {t("eyebrow")}
            </T>
            <T variant="display" tone="heroText" accessibilityRole="header">
              {t("title")}
            </T>
            <T variant="body" tone="heroSecondary">
              {token ? t("resumeBody") : t("body")}
            </T>
          </Animated.View>
        </View>
      </HeroCard>

      {token ? (
        <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <IconCircle icon={KeyRound} size={44} />
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingStart: 16 - (field.borderWidth - 1), paddingEnd: 7 - (field.borderWidth - 1), minHeight: 60, borderRadius: radius.field, ...field }}>
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
              placeholderTextColor={c.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={Platform.OS === "ios" ? "url" : "default"}
              keyboardAppearance={dark ? "dark" : "light"}
              returnKeyType="go"
              accessibilityLabel={t("inputLabel")}
              selectionColor={c.accent}
              cursorColor={c.accentText}
              style={{ flex: 1, minWidth: 0, minHeight: 54, fontFamily: spec.family, fontSize: 16, color: c.text, textAlign: "start", ...noOutline }}
            />
            <Press onPress={paste} accessibilityLabel={t("paste")} depth={0.95} style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 44, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: c.accentSubtle }}>
              <ClipboardPaste size={16} color={c.accentText} strokeWidth={2.2} />
              <T variant="subhead" tone="accentText" style={{ fontFamily: locale === "ar" ? fonts.arabic[600] : fonts.sans[700] }}>
                {t("paste")}
              </T>
            </Press>
          </View>
          {invalid ? <Notice tone="critical">{t("invalidLink")}</Notice> : null}
        </View>
      )}

      <Press onPress={() => setServerOpen(true)} depth={0.97} accessibilityLabel={`${t("server")}: ${apiBase}`} style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", minHeight: 36, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: c.surfaceSunken }}>
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
          onFocus={() => setServerFocused(true)}
          onBlur={() => setServerFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={Platform.OS === "ios" ? "url" : "default"}
          keyboardAppearance={dark ? "dark" : "light"}
          accessibilityLabel={t("server")}
          selectionColor={c.accent}
          style={{ minHeight: 54, paddingHorizontal: 16 - (serverField.borderWidth - 1), borderRadius: radius.field, ...serverField, color: c.text, fontFamily: fonts.sans[400], fontSize: 16, textAlign: "left", direction: "ltr", ...noOutline }}
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
