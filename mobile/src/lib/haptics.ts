import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/** Haptics with one vocabulary. Silent on web, never throws. */
const on = Platform.OS === "ios" || Platform.OS === "android";

export const haptic = {
  /** A choice was made: an option, a pair, a triage button. */
  select() {
    if (on) void Haptics.selectionAsync().catch(() => undefined);
  },
  /** A page came to rest. */
  settle() {
    if (on) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  },
  /** A ranking row crossed a slot while dragging. */
  tick() {
    if (on) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => undefined);
  },
  /** A row was lifted to drag. */
  lift() {
    if (on) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  },
  /** An answer reached the server. */
  success() {
    if (on) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  },
  /** A boundary: the sealed past, a gate that needs an answer first. */
  boundary() {
    if (on) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  },
  error() {
    if (on) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
  },
};
