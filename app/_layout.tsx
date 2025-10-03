import { StatusBar, StyleSheet } from "react-native";
// this provides some helpful reset styles to ensure a more consistent look
// only import this from your web app, not native
import "@tamagui/core/reset.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { PortalProvider } from "@tamagui/portal";
import dayjs from "dayjs";
import { SplashScreen, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { TamaguiProvider } from "tamagui";
import { setUserLoggedIn, setUserName } from "../Redux/authUserReducer";
import { loadGeminiApiKeyFromStorage } from "../Redux/settingsReducer";
import store from "../Redux/store";
import tamaguiConfig from "../tamagui.config";
import { setupAutoCleanup } from "../utils/cacheCleanup";
import HackerNewsClient from "../utils/HackerNewsClient/HackerNewsClient";
import { useIsNavigationReady } from "../utils/isNavigationReady";
// Expo Updates disabled - removed to prevent crashes

/**
 * Prevent the splash screen from auto-hiding before asset loading is complete.
 */
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  /**
   * @see https://day.js.org/docs/en/plugin/relative-time
   */
  var relativeTime = require("dayjs/plugin/relativeTime");
  dayjs.extend(relativeTime);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.resolve().then(async () => {
      // Expo Updates disabled - simplified initialization
      setReady(true);
      await SplashScreen.hideAsync();

      // Setup AI summary cache auto-cleanup
      setupAutoCleanup();
    });
  });

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
  const dispatch = useDispatch();

  // Don't navigate automatically, let the user navigate naturally
  // useEffect(() => {
  //   if (isNavigationReady === false) return;
  //   console.log(`Routing to home`);
  //   router.replace("/home");
  // }, [isNavigationReady]);

  useEffect(() => {
    /**
     * Always check if the user is logged in when loading the app
     */
    Promise.resolve().then(async () => {
      const isLoggedIn = await HackerNewsClient.isLoggedIn();
      if (isLoggedIn !== false) {
        dispatch(setUserLoggedIn({ newState: true }));
        dispatch(setUserName({ newState: isLoggedIn.username }));
      }
    });
  }, []);

  useEffect(() => {
    /**
     * Load Gemini API key from secure storage when app starts
     */
    Promise.resolve().then(async () => {
      const apiKey = await HackerNewsClient.getGeminiApiKey();
      dispatch(loadGeminiApiKeyFromStorage({ apiKey }));
    });
  }, []);

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <PortalProvider>
        <StatusBar barStyle="dark-content" />
        <Stack
          screenOptions={{
            gestureDirection: "horizontal",
            gestureEnabled: true,
          }}
        >
          {/* Index screen (redirects to home) */}
          <Stack.Screen name="index" options={{ headerShown: false }} />

          {/* Home screen with tabs */}
          <Stack.Screen name="home" options={{ headerShown: false }} />

          {/* Post screen */}
          <Stack.Screen name="post" options={{ headerShown: false }} />

          {/* UserId screen */}
          <Stack.Screen name="user" options={{ headerShown: false }} />
        </Stack>
      </PortalProvider>
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
