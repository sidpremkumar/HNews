import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import TabBarBottom from "../../components/TabBarBottom";

export default function Home() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "black",
        tabBarStyle: { backgroundColor: "red" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" color={"black"} size={24} />
          ),
          // tabBarIcon: ({ color, focused }) => (
          //   <TabBarBottom
          //     color={color}
          //     focused={focused}
          //     icon={<Feather name="home" color={color} size={24} />}
          //   />
          // ),
        }}
      />
      <Tabs.Screen
        name="impact"
        options={{
          title: "Impact",
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" color={"black"} size={24} />
          ),
          // tabBarIcon: ({ color, focused }) => (
          //   <TabBarBottom
          //     color={color}
          //     focused={focused}
          //     icon={<Feather name="trending-up" size={24} color={color} />}
          //   />
          // ),
        }}
      />
      {/*
      <Tabs.Screen
        name="causes"
        options={{
          title: "Causes",
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarBottom
              color={color}
              focused={focused}
              icon={<Feather name="search" size={24} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarBottom
              color={color}
              focused={focused}
              icon={<Feather name="user" size={24} color={color} />}
            />
          ),
        }}
      /> */}
    </Tabs>
  );
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
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
