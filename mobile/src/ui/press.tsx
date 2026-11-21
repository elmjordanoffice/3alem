import * as React from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { spring, useTheme } from "../theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressProps extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle>;
  /** How far it sinks when pressed. 0 disables the effect. */
  depth?: number;
  children?: React.ReactNode;
}

/**
 * A pressable that answers the finger the way iOS controls do: a quick spring
 * down on touch, back up on release. Under reduced motion it dims instead.
 */
export function Press({ style, depth = 0.97, disabled, onPressIn, onPressOut, children, ...rest }: PressProps) {
  const { reduceMotion } = useTheme();
  const p = useSharedValue(0);
  const animated = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 1 - p.value * 0.25 };
    return { transform: [{ scale: 1 - p.value * (1 - depth) }] };
  });
  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      disabled={disabled}
      accessibilityState={{ disabled: Boolean(disabled), ...rest.accessibilityState }}
      onPressIn={(e) => {
        if (depth) p.value = withSpring(1, spring.pop);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        p.value = withSpring(0, spring.pop);
        onPressOut?.(e);
      }}
      style={[style, depth ? animated : null]}
    >
      {children}
    </AnimatedPressable>
  );
}
