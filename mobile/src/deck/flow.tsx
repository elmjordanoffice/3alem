import * as React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { spring, useTheme } from "../theme";

type Role = "idle" | "enter" | "leave";

function Layer({ role, children, onLeft }: { role: Role; children: React.ReactNode; onLeft: () => void }) {
  const { height } = useWindowDimensions();
  const { reduceMotion, c } = useTheme();
  const y = useSharedValue(role === "enter" && !reduceMotion ? height : 0);
  const o = useSharedValue(role === "enter" && reduceMotion ? 0 : 1);

  React.useEffect(() => {
    if (role === "enter") {
      if (reduceMotion) o.value = withTiming(1, { duration: 220 });
      else y.value = withSpring(0, spring.scene);
    } else if (role === "leave") {
      const done = (fin?: boolean) => {
        "worklet";
        if (fin) scheduleOnRN(onLeft);
      };
      if (reduceMotion) o.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) }, done);
      // The old scene slides away upward, like the last video on TikTok.
      else y.value = withSpring(-height, spring.scene, done);
    }
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: o.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.canvas }, style]} pointerEvents={role === "leave" ? "none" : "auto"} accessibilityElementsHidden={role === "leave"} importantForAccessibility={role === "leave" ? "no-hide-descendants" : "auto"}>
      {children}
    </Animated.View>
  );
}

/**
 * Screens that follow one another the way short videos do: when `flowKey`
 * changes, the current screen slides up and away while the next rises from
 * below on the same spring. Same key: the screen just re-renders in place.
 */
export function Flow({ flowKey, children }: { flowKey: string; children: React.ReactNode }) {
  const seq = React.useRef(0);
  const nodes = React.useRef(new Map<string, React.ReactNode>());
  const [layers, setLayers] = React.useState<{ id: string; key: string; role: Role }[]>(() => [{ id: `${flowKey}#0`, key: flowKey, role: "idle" }]);

  const live = layers.find((l) => l.role !== "leave");
  if (live && live.key === flowKey) nodes.current.set(live.id, children);

  React.useLayoutEffect(() => {
    setLayers((ls) => {
      const cur = ls.find((l) => l.role !== "leave");
      if (cur && cur.key === flowKey) return ls;
      const id = `${flowKey}#${++seq.current}`;
      nodes.current.set(id, children);
      return [...ls.map((l) => (l.role === "leave" ? l : { ...l, role: "leave" as const })), { id, key: flowKey, role: "enter" as const }];
    });
  }, [flowKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={{ flex: 1 }}>
      {layers.map((l) => (
        <Layer
          key={l.id}
          role={l.role}
          onLeft={() => {
            nodes.current.delete(l.id);
            setLayers((ls) => ls.filter((x) => x.id !== l.id));
          }}
        >
          {nodes.current.get(l.id)}
        </Layer>
      ))}
    </View>
  );
}
