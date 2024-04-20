import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import TabBarBottom from "../../components/TabBarBottom";
import { useDispatch } from "react-redux";
import { setScrollToTopHomeScreen } from "../../Redux/homeScreenReducer";

export default function Home() {
  const dispatch = useDispatch();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "black",
        tabBarStyle: {},
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarBottom
              color={color}
              focused={focused}
              icon={<Feather name="home" color={color} size={24} />}
              onPress={() => {
                dispatch(setScrollToTopHomeScreen({ newState: true }));
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarShowLabel: false,

          tabBarIcon: ({ color, focused }) => (
            <TabBarBottom
              color={color}
              focused={focused}
              icon={<Feather name="settings" size={24} color={color} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}
