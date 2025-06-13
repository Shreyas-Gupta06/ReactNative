import React from "react";
import { Tabs } from "expo-router";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { StepCounterProvider } from "../../assets/StepCounterContext";

export default function TabLayout() {
  return (
    <StepCounterProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#23293a",
            borderTopWidth: 0,
          },
          tabBarInactiveTintColor: "#a1a1aa",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Track",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="run"
                size={28}
                color={focused ? "#00FFFF" : "#a1a1aa"}
              />
            ),
            tabBarActiveTintColor: "#00FFFF",
          }}
        />
        <Tabs.Screen
          name="stephistory"
          options={{
            title: "Step History",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="chart-line"
                size={28}
                color={focused ? "#a78bfa" : "#a1a1aa"}
              />
            ),
            tabBarActiveTintColor: "#a78bfa",
          }}
        />
      </Tabs>
    </StepCounterProvider>
  );
}
