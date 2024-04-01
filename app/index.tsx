import { StyleSheet, Text, View, StatusBar, Dimensions } from "react-native";
// this provides some helpful reset styles to ensure a more consistent look
// only import this from your web app, not native
import "@tamagui/core/reset.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "../tamagui.config";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { useIsNavigationReady } from "../utils/isNavigationReady";
import RootLayout from "./_layout";
import { useFonts } from "expo-font";

export default function Index() {
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  if (loaded === false) {
    return <></>;
  }

  return (
    // <GestureHandlerRootView style={{ flex: 1 }}>
    <RootLayout />
    // </GestureHandlerRootView>
  );
}
