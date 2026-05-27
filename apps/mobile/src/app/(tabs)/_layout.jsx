import { Tabs } from "expo-router";
import {
  Home,
  CalendarClock,
  Hammer,
  Settings as SettingsIcon,
  HelpCircle,
} from "lucide-react-native";
import FontsGate from "@/components/FontsGate";
import { selection } from "@/lib/haptics";

const tabListeners = () => ({
  tabPress: () => {
    selection();
  },
});

export default function TabLayout() {
  return (
    <FontsGate>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderColor: "#E5E7EB",
            paddingTop: 6,
          },
          tabBarActiveTintColor: "#2563EB",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarLabelStyle: {
            fontFamily: "Inter_600SemiBold",
            fontSize: 10,
            letterSpacing: 0.3,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          listeners={tabListeners}
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Home color={color} size={22} strokeWidth={2.2} />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          listeners={tabListeners}
          options={{
            title: "Events",
            tabBarIcon: ({ color }) => (
              <CalendarClock color={color} size={22} strokeWidth={2.2} />
            ),
          }}
        />
        <Tabs.Screen
          name="leader"
          listeners={tabListeners}
          options={{
            title: "Build",
            tabBarIcon: ({ color }) => (
              <Hammer color={color} size={22} strokeWidth={2.2} />
            ),
          }}
        />
        <Tabs.Screen
          name="help"
          listeners={tabListeners}
          options={{
            title: "Help",
            tabBarIcon: ({ color }) => (
              <HelpCircle color={color} size={22} strokeWidth={2.2} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          listeners={tabListeners}
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <SettingsIcon color={color} size={22} strokeWidth={2.2} />
            ),
          }}
        />
      </Tabs>
    </FontsGate>
  );
}
