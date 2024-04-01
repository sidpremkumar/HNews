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
import { Provider } from "react-redux";
import store from "../Redux/store";
import dayjs from "dayjs";

export default function RootLayout() {
  /**
   * @see https://day.js.org/docs/en/plugin/relative-time
   */
  var relativeTime = require("dayjs/plugin/relativeTime");
  dayjs.extend(relativeTime);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <_RootLayout />
      </GestureHandlerRootView>
    </Provider>
  );
}

function _RootLayout() {
  const isNavigationReady = useIsNavigationReady();
  useEffect(() => {
    if (isNavigationReady === false) return;

    console.log(`Routing to home`);
    router.replace("/home");
  }, [isNavigationReady]);

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <StatusBar barStyle="dark-content" />
      <Stack
        screenOptions={{
          gestureDirection: "horizontal",
          gestureEnabled: true,
        }}
      >
        {/* Main screen with our bottom tabs */}
        <Stack.Screen name="home" options={{ headerShown: false }} />

        {/* Post screen */}
        <Stack.Screen name="post" options={{ headerShown: false }} />

        {/* UserId screen */}
        <Stack.Screen name="user" options={{ headerShown: false }} />
      </Stack>
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
