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

export default function RootLayout() {
  return (
    // <GestureHandlerRootView style={{ flex: 1 }}>
    <_RootLayout />
    // </GestureHandlerRootView>
  );
}

function _RootLayout() {
  // const windowHeight = Dimensions.get("window").height;
  // const windowWidth = Dimensions.get("window").width;
  const isNavigationReady = useIsNavigationReady();
  useEffect(() => {
    if (isNavigationReady === false) return;

    console.log(`Routing to home`);
    router.replace("/home");
  }, [isNavigationReady]);

  return (
    <TamaguiProvider config={tamaguiConfig}>
      {/* <TapToPayProvider> */}
      <StatusBar barStyle="dark-content" />
      <Stack
        screenOptions={{
          gestureDirection: "horizontal",
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="home" options={{ headerShown: false }} />
      </Stack>
      {/* </TapToPayProvider> */}
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
