import { StyleSheet, StatusBar } from "react-native";
// this provides some helpful reset styles to ensure a more consistent look
// only import this from your web app, not native
import "@tamagui/core/reset.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config"; // Optional if you want to use default theme

import { PortalProvider, TamaguiProvider } from "tamagui";
import tamaguiConfig from "../tamagui.config";
import { SplashScreen, Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useIsNavigationReady } from "../utils/isNavigationReady";
import { Provider, useDispatch } from "react-redux";
import store from "../Redux/store";
import dayjs from "dayjs";
import { NODE_ENV } from "../utils/consts";
import * as Updates from "expo-updates";
import HackerNewsClient from "../utils/HackerNewsClient/HackerNewsClient";
import { setUserLoggedIn, setUserName } from "../Redux/authUserReducer";

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
      await Promise.all([
        Promise.resolve().then(async () => {
          if (NODE_ENV === "development") {
            /**
             * No updates to check
             */
            return false;
          }
          return Updates.checkForUpdateAsync().catch((err) => {
            console.error(`Error checking for update async`, err);
            return false;
          });
        }),
      ]).then(async ([update]) => {
        try {
          if (update !== false && update !== true && update.isAvailable) {
            console.log(`OTA update available, installing`);
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        } catch (error) {
          // You can also add an alert() to see the error message in case of an error when fetching updates.
          console.error(`Error fetching latest Expo update: ${error}`);
        }

        /**
         * Dont let expo ruin everything
         */
        setReady(true);

        /**
         * Wait a sec to load, then the splash screen
         */
        await SplashScreen.hideAsync();
      });
    });
  });

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider config={config}>
          <_RootLayout />
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

function _RootLayout() {
  const isNavigationReady = useIsNavigationReady();
  const dispatch = useDispatch();
  useEffect(() => {
    if (isNavigationReady === false) return;

    console.log(`Routing to home`);
    router.replace("/home");
  }, [isNavigationReady]);

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
