import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favoriteList"
        options={{
          title: "Favorite List",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="favorite-outline" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: "Maps",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="map" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="photo-camera" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gemini"
        options={{
          title: "Ask AI",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="question-answer" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
