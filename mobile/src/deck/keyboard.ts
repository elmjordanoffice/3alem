import { Platform } from "react-native";
import { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";

/**
 * Lifts a bottom bar above the iOS keyboard, frame by frame. Android resizes
 * the window instead (softwareKeyboardLayoutMode: "resize"), so it needs none.
 */
export function useKeyboardLift(bottomInset: number) {
  const keyboard = useAnimatedKeyboard();
  return useAnimatedStyle(() => (Platform.OS === "ios" ? { transform: [{ translateY: -Math.max(0, keyboard.height.value - bottomInset) }] } : {}));
}
