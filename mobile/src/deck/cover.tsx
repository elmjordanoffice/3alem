import * as React from "react";
import { useWindowDimensions, View } from "react-native";
import { castIn } from "../../../src/lib/brand/scene-art";
import type { StoryNote } from "../api/types";
import { useT } from "../i18n";
import { palette, radius } from "../theme";
import { Avatar } from "../ui/avatar";
import { Paragraphs, T } from "../ui/text";
import { SceneArt } from "./art";
import { MATERIAL_ICONS } from "./materials";
import { CARD_INSET, CARD_MAX_W, CARD_PAD, useCardGeometry } from "./pager-context";
import { ColleagueNote } from "./story";

const ON_INK = { text: palette.inkForeground, reading: "rgba(242,240,235,0.88)", soft: palette.inkSecondary, line: "rgba(242,240,235,0.22)" } as const;
/** Stone tints for the people in the face pile, so overlapping discs stay apart. */
const DISCS = ["#F2F0EB", "#D9D4CA", "#B9B4AA"] as const;

/**
 * The situation: an ink card. The scene's art across the top (about 28% of the
 * screen, at most 240pt; a little less when a colleague's note comes in under
 * it), then the chapter and the scene's moment in the week, the title in the
 * wide display face, the situation itself, the materials that follow, and the
 * people it names. Memoised: it renders once per scene, never on a page change.
 */
export const Cover = React.memo(function Cover({ title, scenario, kinds, chapter, cast, moment, note }: { title: string; scenario: string; kinds: string; chapter: string; cast: { name: string; role: string }[]; moment?: string; note?: StoryNote | null }) {
  const tm = useT("mobile");
  const geo = useCardGeometry();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const artW = geo?.width ?? Math.min(screenW - CARD_INSET * 2, CARD_MAX_W);
  const artH = Math.round(note ? Math.min(200, screenH * 0.22) : Math.min(240, screenH * 0.28));
  const people = React.useMemo(() => castIn(scenario, cast, 3), [scenario, cast]);
  const materials = kinds ? kinds.split(",") : [];
  // "Day 1: The brief · Monday 09:10", the moment kept on one line.
  const eyebrow = [chapter, moment?.replace(/ /g, "\u00a0")].filter(Boolean).join(" · ");
  return (
    <View style={{ flexGrow: 1 }}>
      <SceneArt seed={title} width={artW} height={artH} />
      {note ? <ColleagueNote note={note} travel={artW} /> : null}
      <View style={{ paddingHorizontal: CARD_PAD, paddingTop: note ? 24 : 20, gap: 14 }}>
        {eyebrow ? (
          <T testID="cover-eyebrow" variant="label" numberOfLines={2} style={{ color: ON_INK.soft }}>
            {eyebrow}
          </T>
        ) : null}
        <T variant="displayMd" accessibilityRole="header" style={{ color: ON_INK.text }}>
          {title}
        </T>
        <Paragraphs text={scenario} variant="body" style={{ color: ON_INK.reading }} />
        {materials.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
            {materials.map((k, i) => {
              const Icon = MATERIAL_ICONS[k as keyof typeof MATERIAL_ICONS];
              return (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, height: 30, borderRadius: radius.pill, borderWidth: 1, borderColor: ON_INK.line }}>
                  {Icon ? <Icon size={14} color={ON_INK.soft} strokeWidth={1.8} /> : null}
                  <T variant="caption" style={{ color: ON_INK.soft }}>
                    {tm(`materials.${k}`)}
                  </T>
                </View>
              );
            })}
          </View>
        ) : null}
        {people.length ? <FacePile people={people} /> : null}
      </View>
    </View>
  );
});

/** Initials of the people the situation names, overlapping from the reading start, and who they are. */
function FacePile({ people }: { people: { name: string; role: string }[] }) {
  const tm = useT("mobile.deck");
  const [a = "", b = "", c = ""] = people.map((p) => p.name);
  const label = people.length === 1 ? tm("withOne", { a }) : people.length === 2 ? tm("withTwo", { a, b }) : tm("withThree", { a, b, c });
  return (
    <View accessible accessibilityLabel={label} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 }}>
      <View style={{ flexDirection: "row" }}>
        {people.map((p, i) => (
          <View key={p.name} style={{ marginStart: i ? -9 : 0, borderRadius: 18, borderWidth: 2, borderColor: palette.ink }}>
            <Avatar name={p.name} size={32} colors={{ bg: DISCS[i % DISCS.length]!, fg: palette.ink }} />
          </View>
        ))}
      </View>
      <T variant="footnote" style={{ color: ON_INK.soft, flex: 1 }}>
        {label}
      </T>
    </View>
  );
}
