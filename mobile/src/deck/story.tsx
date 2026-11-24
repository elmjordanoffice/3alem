import * as React from "react";
import { Platform, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import type { StoryClock, StoryNote } from "../api/types";
import { useLocale, type Locale } from "../i18n";
import { fonts, palette, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { Avatar } from "../ui/avatar";
import { ARRIVE, FADE, Swap, useOnce } from "../ui/motion";
import { hairline } from "../ui/primitives";
import { T } from "../ui/text";
import { CARD_PAD } from "./pager-context";

/**
 * The week, alive: every scene happens at a moment of the in-story week (the
 * server's `story.clock`), and a new scene can open with a short note from a
 * colleague about the last one (`story.note`). None of it says anything about
 * how an answer went: the note's text comes from the server as it is, and
 * nothing here changes with the answers.
 */

const DAY_MS = 86_400_000;
/** Day 1 is the first working day: a Monday in English, a Sunday in Arabic (a Sunday–Thursday week). */
const DAY_ONE: Record<Locale, number> = { en: Date.UTC(2024, 0, 1), ar: Date.UTC(2023, 11, 31) };

const weekdayFormats = new Map<string, Intl.DateTimeFormat | null>();
function weekdayName(locale: Locale, day: number, style: "short" | "long"): string | null {
  const key = `${locale}:${style}`;
  let f = weekdayFormats.get(key);
  if (f === undefined) {
    try {
      f = new Intl.DateTimeFormat(locale, { weekday: style, timeZone: "UTC" });
    } catch {
      f = null;
    }
    weekdayFormats.set(key, f);
  }
  if (!f) return null;
  try {
    return f.format(new Date(DAY_ONE[locale] + (Math.max(1, Math.round(day)) - 1) * DAY_MS));
  } catch {
    return null;
  }
}

/** The in-story weekday ("Mon", "Monday"; "الأحد") and 24-hour time ("09:10", in the app's numerals). */
export function useStoryTime() {
  const { locale, n, t } = useLocale();
  return React.useMemo(() => {
    const two = (x: number) => n(x, { minimumIntegerDigits: 2, useGrouping: false });
    const weekday = (day: number, style: "short" | "long") => weekdayName(locale, day, style) ?? t("mobile.story.day", { n: day });
    const time = (minutes: number) => {
      const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
      return `${two(Math.floor(m / 60))}:${two(m % 60)}`;
    };
    const at = (clock: StoryClock, style: "short" | "long") => t("candidate.story.at", { weekday: weekday(clock.day, style), time: time(clock.minutes) });
    return { weekday, time, at };
  }, [locale, n, t]);
}

// ── The clock in the bar ─────────────────────────────────────────────────────

/** The moment the bar last showed, so the next scene's bar can tick over from it. */
let lastShown: StoryClock | null = null;
/** A new scene's clock ticks over once the scene has risen into place. */
const TICK_AFTER = ARRIVE + 160;
/**
 * Within a scene, the moment must hold this long before it ticks: a pager
 * jumping to a page can report the page it leaves for a frame or two (the web
 * pager's smooth scroll does), and the clock shouldn't stutter back and forth.
 */
const HOLD = 120;
/** Digits roll from the last one back, a beat apart, like an odometer carrying. */
const DIGIT_STAGGER = 45;
const ROLL = { mass: 1, stiffness: 320, damping: 30 } as const;
const before = (a: StoryClock, b: StoryClock) => a.day < b.day || (a.day === b.day && a.minutes < b.minutes);
const webLtr = (Platform.OS === "web" ? { dir: "ltr" } : {}) as object;

/**
 * The scene's moment in the deck's top bar: "Mon 09:10". When it changes (a
 * follow-up arrives, you swipe back to an earlier page, a new scene rises)
 * the changed characters tick over: the old ones slide up and fade, the new
 * ones rise (the other way when the moment goes back). The time is always
 * left to right; the weekday sits where the copy puts it.
 */
export function BarClock({ day, minutes }: StoryClock) {
  const { t, rtl } = useLocale();
  const { c } = useTheme();
  const fmt = useStoryTime();
  const [shown, setShown] = React.useState<{ clock: StoryClock; back: boolean }>(() => ({ clock: lastShown ?? { day, minutes }, back: false }));
  const mounted = React.useRef(false);
  React.useEffect(() => {
    lastShown = { day, minutes };
    const wait = mounted.current ? HOLD : TICK_AFTER;
    mounted.current = true;
    const id = setTimeout(() => setShown((s) => (s.clock.day === day && s.clock.minutes === minutes ? s : { clock: { day, minutes }, back: before({ day, minutes }, s.clock) })), wait);
    return () => clearTimeout(id);
  }, [day, minutes]);

  // The copy decides the order ("{weekday} {time}"); each part is laid out on its own so it can move.
  const parts = React.useMemo(() => t("candidate.story.at", { weekday: "\u0001", time: "\u0002" }).split(/(\u0001|\u0002)/).filter(Boolean), [t]);
  const time = fmt.time(shown.clock.minutes);
  const text = (s: string, latin?: boolean) => (
    // No numberOfLines: it would cut short a word on its way out that is wider than the one coming in (Swap makes room for both).
    <T variant="footnote" latin={latin} style={{ color: c.text, fontFamily: latin || !rtl ? fonts.sans[500] : fonts.arabic[500], fontVariant: ["tabular-nums"] }}>
      {s}
    </T>
  );
  return (
    <View testID="story-clock" accessible accessibilityLabel={fmt.at({ day, minutes }, "long")} style={{ flexDirection: "row", alignItems: "center" }}>
      {parts.map((p, i) =>
        p === "\u0001" ? (
          <Swap key={i} value={fmt.weekday(shown.clock.day, "short")} back={shown.back} travel={11} config={ROLL} render={(w) => text(w)} />
        ) : p === "\u0002" ? (
          <View key={i} {...webLtr} style={{ flexDirection: "row", direction: "ltr" }}>
            {time.split("").map((ch, j) =>
              /\d/.test(ch) ? (
                <Swap key={j} value={ch} back={shown.back} travel={11} config={ROLL} delay={(time.length - 1 - j) * DIGIT_STAGGER} render={(d) => text(d, true)} />
              ) : (
                <View key={j} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  {text(ch, true)}
                </View>
              ),
            )}
          </View>
        ) : (
          <View key={i} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {text(p.replace(/ /g, "\u00a0"))}
          </View>
        ),
      )}
    </View>
  );
}

// ── The colleague's note on the cover ────────────────────────────────────────

/** White laid over the violet card at `a`, as a solid colour, so the bubble and its tail can overlap without a seam. */
function onHero(a: number) {
  const violet = [0x58, 0x47, 0xd6];
  return `#${violet.map((v) => Math.round(v + (255 - v) * a).toString(16).padStart(2, "0")).join("")}`;
}
const BUBBLE = onHero(0.12);
const BUBBLE_EDGE = onHero(0.26);
const SOFT = palette.heroSecondary;
const AVATAR = 32;
const TAIL_W = 7;
const TAIL_H = 10;
/** The tail reaches this far into the bubble, over its edge, so the two read as one shape. */
const TAIL_IN = 2;

/** The cover has risen and settled (about half a second on the scene spring); the note arrives half a second after that. */
export const NOTE_DELAY = 1000;
/** A message coming in from the side: unhurried, with the smallest give as it stops. */
const NOTE_SPRING = { mass: 1, stiffness: 170, damping: 22 } as const;

/** The bubble's tail at its top start corner, drawn for the left and mirrored in Arabic. */
function Tail({ rtl }: { rtl: boolean }) {
  const w = TAIL_W + TAIL_IN;
  const h = hairline / 2;
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, start: 0, width: w, height: TAIL_H, transform: [{ scaleX: rtl ? -1 : 1 }] }}>
      <Svg width={w} height={TAIL_H} viewBox={`0 0 ${w} ${TAIL_H}`}>
        <Path d={`M${w} 0 H1.4 Q0 0 0.9 1.1 L${TAIL_W} ${TAIL_H} H${w} Z`} fill={BUBBLE} />
        <Path d={`M${w} ${h} H1.5 Q${h} ${h} 1 1.3 L${TAIL_W + h} ${TAIL_H}`} stroke={BUBBLE_EDGE} strokeWidth={hairline} strokeLinejoin="round" fill="none" />
      </Svg>
    </View>
  );
}

/**
 * A short note from a colleague about the last scene, between the cover's art
 * and its title: who it's from (initials, name, role) and when, under a "New
 * message" eyebrow, then the text in a chat bubble on the violet card. About half
 * a second after the cover settles it slides in from the reading start (from
 * the right in Arabic) with a light haptic, as if it had just arrived; under
 * reduced motion it fades in. Its space is kept from the start, so nothing on
 * the card moves when it lands.
 */
export function ColleagueNote({ note, travel }: { note: StoryNote; travel: number }) {
  const { t, rtl } = useLocale();
  const { reduceMotion } = useTheme();
  const fmt = useStoryTime();
  const time = fmt.time(note.minutes);
  const from = t("candidate.story.from", { name: note.from.name, time });
  const p = useSharedValue(0);
  React.useEffect(() => {
    p.value = withDelay(NOTE_DELAY, reduceMotion ? withTiming(1, FADE) : withSpring(1, NOTE_SPRING));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useOnce(() => {
    "worklet";
    return p.value >= 0.6;
  }, haptic.settle);
  const dx = (rtl ? 1 : -1) * travel;
  const style = useAnimatedStyle(() =>
    reduceMotion ? { opacity: p.value } : { opacity: interpolate(p.value, [0, 0.4], [0, 1], Extrapolation.CLAMP), transform: [{ translateX: dx * (1 - p.value) }] },
  );
  return (
    <Animated.View
      testID="story-note"
      accessible
      accessibilityLabel={`${t("candidate.story.message")}. ${from}, ${note.from.role}. ${note.text}`}
      style={[{ paddingHorizontal: CARD_PAD, paddingTop: 18, gap: 10 }, style]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: palette.coral }} />
        <T variant="label" style={{ color: SOFT }}>
          {t("candidate.story.message")}
        </T>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Avatar name={note.from.name} size={AVATAR} colors={{ bg: palette.white, fg: palette.night }} />
        <View style={{ flex: 1 }}>
          <T variant="footnote" numberOfLines={1} style={{ color: palette.heroText, fontFamily: rtl ? fonts.arabic[600] : fonts.sans[700] }}>
            {from}
          </T>
          <T variant="caption" numberOfLines={1} style={{ color: SOFT }}>
            {note.from.role}
          </T>
        </View>
      </View>
      <View style={{ marginStart: AVATAR + 10 - TAIL_W }}>
        <View style={{ marginStart: TAIL_W, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: BUBBLE, borderWidth: hairline, borderColor: BUBBLE_EDGE, borderRadius: 18, borderTopStartRadius: 0 }}>
          <T variant="callout" style={{ color: palette.heroText }}>
            {note.text}
          </T>
        </View>
        {/* After the bubble, so it draws over the bubble's edge (a child would sit under the border on iOS). */}
        <Tail rtl={rtl} />
      </View>
    </Animated.View>
  );
}
