import * as React from "react";
import { View } from "react-native";
import { ShieldCheck, Sparkles, UserCheck } from "lucide-react-native";
import type { StartInput, View as V } from "../api/types";
import { useLocale, useT } from "../i18n";
import { radius, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { Button } from "../ui/button";
import { Card, CheckRow, hairline, Notice, Segmented } from "../ui/primitives";
import { Press } from "../ui/press";
import { T } from "../ui/text";
import { AiSheet } from "./ai-sheet";
import { OrgHeader, Screen } from "./scaffold";

type Extra = "1" | "1.25" | "1.5";

/** The invitation: what to expect, how data is used, language, accommodations, consent. */
export function Landing({ v, onStart }: { v: V<"landing">; onStart: (o: StartInput) => Promise<void> }) {
  const t = useT("candidate.landing");
  const { locale, setLocale, chosen } = useLocale();
  const { c, largerText, setLargerText } = useTheme();
  const [extraTime, setExtraTime] = React.useState<Extra>("1");
  const [untimed, setUntimed] = React.useState(false);
  const [consent, setConsent] = React.useState(false);
  const [humanReview, setHumanReview] = React.useState(false);
  const [aiOpen, setAiOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const org = v.branding.orgName;

  // The invitation's language, unless the candidate already picked one.
  React.useEffect(() => {
    if (!chosen && v.defaultLocale !== locale) setLocale(v.defaultLocale, { persist: false });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const title = v.candidateName ? t("titleNamed", { name: v.candidateName.split(" ")[0]!, role: v.roleTitle }) : t("title", { role: v.roleTitle });
  const anyAcc = v.allowed.extraTime || v.allowed.untimed || v.allowed.largerText;

  const start = async () => {
    setPending(true);
    setError(null);
    try {
      await onStart({ locale, extraTime: Number(extraTime) as 1 | 1.25 | 1.5, untimed, largerText, consent: true, humanReview });
    } catch {
      setError(t("startError"));
      haptic.error();
      setPending(false);
    }
  };

  return (
    <Screen
      testID="screen-landing"
      header={<OrgHeader branding={v.branding} />}
      bar={
        <>
          {error ? <Notice tone="critical">{error}</Notice> : null}
          <Button testID="landing-continue" variant="primary" label={t("continue")} onPress={start} disabled={!consent} loading={pending} full />
          <T variant="caption" tone="tertiary" align="center">
            {t("minutesNote", { minutes: v.minutes })}
          </T>
        </>
      }
    >
      <View style={{ gap: 14 }}>
        <T variant="subhead" tone="secondary">
          {t("eyebrow", { org })}
        </T>
        <T variant="title" accessibilityRole="header" style={{ fontSize: locale === "ar" ? 32 : 30, lineHeight: locale === "ar" ? 46 : 36 }}>
          {title}
        </T>
        <T variant="body" tone="secondary">
          {t("intro", { minutes: v.minutes })}
        </T>
      </View>

      <View>
        {(["story", "adapts", "noTricks", "pause", "people"] as const).map((k, i) => (
          <View key={k} style={{ flexDirection: "row", gap: 16, paddingVertical: 16, borderTopWidth: hairline, borderColor: c.hairline }}>
            <T variant="index" latin style={{ width: 40, fontSize: 15, lineHeight: 22, color: c.tertiary }}>
              {String(i + 1).padStart(2, "0")}
            </T>
            <View style={{ flex: 1, gap: 3 }}>
              <T variant="headline">{t(`expect.${k}.title`)}</T>
              <T variant="subhead" tone="secondary">
                {t(`expect.${k}.body`)}
              </T>
            </View>
          </View>
        ))}
      </View>

      <Card tone="subtle" style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={18} color={c.text} strokeWidth={1.8} />
          <T variant="headline">{t("data.title")}</T>
        </View>
        {(["who", "how", "ai", "keep", "rights"] as const).map((k) => (
          <View key={k} style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c.tertiary, marginTop: locale === "ar" ? 13 : 10 }} />
            <T variant="subhead" tone="secondary" style={{ flex: 1 }}>
              {t(`data.${k}`, { org })}
            </T>
          </View>
        ))}
        <Press testID="ai-link" onPress={() => setAiOpen(true)} depth={0.98} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 }}>
          <Sparkles size={17} color={c.text} strokeWidth={1.8} />
          <T variant="subhead" style={{ color: c.text, textDecorationLine: "underline" }}>
            {t("aiLink")}
          </T>
        </Press>
      </Card>

      <Card style={{ gap: 18 }}>
        <View style={{ gap: 10 }}>
          <T variant="headline">{t("language")}</T>
          <Segmented
            label={t("language")}
            value={locale}
            onChange={(l) => setLocale(l)}
            options={[
              { value: "en", label: "English", lang: "en" },
              { value: "ar", label: "العربية", lang: "ar" },
            ]}
          />
        </View>
        {anyAcc ? (
          <View style={{ gap: 12, paddingTop: 16, borderTopWidth: hairline, borderColor: c.hairline }}>
            <T variant="headline">{t("accommodations")}</T>
            {v.allowed.extraTime ? (
              <View style={{ gap: 8 }}>
                <T variant="subhead" tone="secondary">
                  {t("extraTime")}
                </T>
                <Segmented<Extra>
                  label={t("extraTime")}
                  value={extraTime}
                  onChange={setExtraTime}
                  options={(["1", "1.25", "1.5"] as const).map((x) => ({ value: x, label: t(`extraTimeOption.${x.replace(".", "_")}`) }))}
                />
              </View>
            ) : null}
            {v.allowed.untimed ? <CheckRow checked={untimed} onChange={setUntimed} label={t("untimed")} /> : null}
            {v.allowed.largerText ? <CheckRow checked={largerText} onChange={setLargerText} label={t("largerText")} /> : null}
          </View>
        ) : null}
      </Card>

      <View style={{ gap: 12 }}>
        {humanReview ? (
          <View accessibilityLiveRegion="polite" style={{ flexDirection: "row", gap: 10, padding: 14, borderRadius: radius.control, backgroundColor: c.surfaceSunken }}>
            <UserCheck size={18} color={c.text} />
            <T variant="subhead" style={{ flex: 1 }}>
              {t("humanReviewOn")}
            </T>
          </View>
        ) : null}
        <CheckRow testID="consent" checked={consent} onChange={setConsent} label={t("consent", { org })} />
      </View>

      <AiSheet visible={aiOpen} onClose={() => setAiOpen(false)} org={org} humanReview={humanReview} onHumanReviewChange={setHumanReview} />
    </Screen>
  );
}
