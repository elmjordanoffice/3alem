import * as React from "react";
import { Platform, View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { IBMPlexSans_400Regular, IBMPlexSans_500Medium, IBMPlexSans_600SemiBold, IBMPlexSans_700Bold } from "@expo-google-fonts/ibm-plex-sans";
import { IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_600SemiBold, IBMPlexSansArabic_700Bold } from "@expo-google-fonts/ibm-plex-sans-arabic";
import { Beiruti_700Bold, Beiruti_900Black } from "@expo-google-fonts/beiruti";
import { LocaleProvider } from "../i18n";
import { ThemeProvider, useTheme } from "../theme";
import { SessionProvider } from "../state/session";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 300, fade: true });

function Shell() {
  const { c } = useTheme();
  React.useEffect(() => {
    void SystemUI.setBackgroundColorAsync(c.canvas).catch(() => undefined);
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.body.style.backgroundColor = c.canvas;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", c.canvas);
    }
  }, [c.canvas]);
  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: c.canvas } }} />
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
    Beiruti_700Bold,
    Beiruti_900Black,
    // Archivo at 125% width, weight 800 (brand/fonts): the wide display face.
    "ArchivoExpanded-800": require("../../assets/fonts/archivo-expanded-800.ttf"),
  });

  React.useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, error]);

  if (!loaded && !error) return null;
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
