import * as React from "react";
import { Platform, View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
// Night's faces, one file per weight (the package index would bundle every weight and italic).
import { PlusJakartaSans_400Regular } from "@expo-google-fonts/plus-jakarta-sans/400Regular";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold";
import { ReadexPro_400Regular } from "@expo-google-fonts/readex-pro/400Regular";
import { ReadexPro_500Medium } from "@expo-google-fonts/readex-pro/500Medium";
import { ReadexPro_600SemiBold } from "@expo-google-fonts/readex-pro/600SemiBold";
import { ReadexPro_700Bold } from "@expo-google-fonts/readex-pro/700Bold";
import { LocaleProvider, useLocale } from "../i18n";
import { loadScheme, ThemeProvider, useTheme } from "../theme";
import { SessionProvider } from "../state/session";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 300, fade: true });

function Shell() {
  const { c } = useTheme();
  const { dir } = useLocale();
  // react-native-web resolves logical styles (start/end, marginStart, borderEndWidth,
  // textAlign "start") from a `dir` attribute on an ancestor, not from the
  // `direction` style each screen sets; native (Yoga) follows `direction`.
  const webDir = (Platform.OS === "web" ? { dir } : {}) as object;
  React.useEffect(() => {
    void SystemUI.setBackgroundColorAsync(c.canvas).catch(() => undefined);
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.body.style.backgroundColor = c.canvas;
      document.documentElement.style.colorScheme = c.scheme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", c.canvas);
    }
  }, [c.canvas, c.scheme]);
  return (
    <View {...webDir} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: c.canvas } }} />
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    ReadexPro_400Regular,
    ReadexPro_500Medium,
    ReadexPro_600SemiBold,
    ReadexPro_700Bold,
  });
  // The saved theme choice, read before the first frame so a light pick never flashes dark.
  const [schemeReady, setSchemeReady] = React.useState(false);
  React.useEffect(() => {
    void loadScheme().finally(() => setSchemeReady(true));
  }, []);
  const ready = (loaded || Boolean(error)) && schemeReady;

  React.useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LocaleProvider>
            <SessionProvider>
              <Shell />
            </SessionProvider>
          </LocaleProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
