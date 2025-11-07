import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.tint,
        tabBarInactiveTintColor: palette.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: Platform.select({ ios: 6, default: 8 }),
          fontWeight: "600",
        },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 18,
          backgroundColor: colorScheme === "dark" ? "#1F1B3A" : "#FFFFFF",
          borderRadius: 26,
          height: 72,
          paddingHorizontal: 16,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: "#1B1464",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
        },
        sceneStyle: {
          backgroundColor: palette.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="hexagon-multiple-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favoriteList"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="heart-circle-outline" size={26} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="maps"
        options={{
          title: "Maps",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="map-marker-radius-outline" size={26} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="camera-iris" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gemini"
        options={{
          title: "Ask AI",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chat-processing-outline" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
