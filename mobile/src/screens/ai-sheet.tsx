import * as React from "react";
import { View } from "react-native";
import { Check, X } from "lucide-react-native";
import { useT } from "../i18n";
import { useTheme } from "../theme";
import { Button } from "../ui/button";
import { Card, CheckRow } from "../ui/primitives";
import { Sheet } from "../ui/sheet";
import { T } from "../ui/text";

/**
 * "How AI is used in this assessment": what AI does, what it never does, who
 * decides, and the candidate's choice to ask for a person to review every score.
 */
export function AiSheet({ visible, onClose, org, humanReview, onHumanReviewChange }: { visible: boolean; onClose: () => void; org: string; humanReview?: boolean; onHumanReviewChange?: (v: boolean) => void }) {
  const t = useT("candidate.ai");
  const { c } = useTheme();
  return (
    <Sheet visible={visible} onClose={onClose} title={t("title")} subtitle={t("intro")} footer={<Button variant="action" label={t("done")} onPress={onClose} full />}>
      <View style={{ gap: 12 }}>
        <T variant="headline">{t("doesTitle")}</T>
        {(["world", "roleplay", "scoring", "report"] as const).map((k) => (
          <View key={k} style={{ flexDirection: "row", gap: 12 }}>
            <Check size={18} color={c.text} strokeWidth={2.4} style={{ marginTop: 3 }} />
            <T variant="callout" tone="secondary" style={{ flex: 1 }}>
              {t(`does.${k}`)}
            </T>
          </View>
        ))}
      </View>
      <View style={{ gap: 12 }}>
        <T variant="headline">{t("neverTitle")}</T>
        {(["decide", "face", "style", "integrity"] as const).map((k) => (
          <View key={k} style={{ flexDirection: "row", gap: 12 }}>
            <X size={18} color={c.tertiary} strokeWidth={2.2} style={{ marginTop: 3 }} />
            <T variant="callout" tone="secondary" style={{ flex: 1 }}>
              {t(`never.${k}`)}
            </T>
          </View>
        ))}
      </View>
      <View style={{ gap: 8 }}>
        <T variant="headline">{t("decideTitle")}</T>
        <T variant="callout" tone="secondary">
          {t("decide", { org })}
        </T>
      </View>
      {onHumanReviewChange ? (
        <Card tone="subtle" style={{ gap: 10 }}>
          <T variant="headline">{t("choiceTitle")}</T>
          <T variant="subhead" tone="secondary">
            {t("choice", { org })}
          </T>
          <CheckRow testID="human-review" checked={Boolean(humanReview)} onChange={onHumanReviewChange} label={t("choiceLabel")} />
        </Card>
      ) : null}
    </Sheet>
  );
}
