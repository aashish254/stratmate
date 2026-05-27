import { useState, useCallback } from "react";
import { View, Text, ScrollView, Switch, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  Bell,
  Clock,
  LogOut,
  Info,
  Send,
  Volume2,
  History,
  BookOpen,
  ChevronRight,
} from "lucide-react-native";
import {
  loadSettings,
  saveSettings,
  loadSchedule,
  clearSchedule,
  isDemoSchedule,
  loadRecentAlliances,
  setOnboardingComplete,
  switchToAlliance,
} from "@/lib/storage";
import { getDeviceOffsetString } from "@/lib/schedule";
import {
  cancelAll,
  sendTestNotification,
  scheduleAll,
  requestPermissions,
} from "@/lib/notifications";
import { tapLight, tapMedium, success as hapSuccess } from "@/lib/haptics";

const SOUNDS = [
  { id: "default", label: "🔔 Sound on", hint: "Plays your device alert tone" },
  { id: "off", label: "🔕 Silent", hint: "No sound, just the banner" },
];

const Row = ({ icon, title, subtitle, right, onPress, danger }) => {
  const inner = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: danger ? "#FEF2F2" : "#EFF6FF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: danger ? "#B91C1C" : "#111827",
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: "#6B7280",
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          tapLight();
          onPress();
        }}
        style={({ pressed }) => ({
          backgroundColor: pressed ? "#F9FAFB" : "transparent",
          borderBottomWidth: 1,
          borderColor: "#F3F4F6",
        })}
      >
        {inner}
      </Pressable>
    );
  }
  return (
    <View style={{ borderBottomWidth: 1, borderColor: "#F3F4F6" }}>
      {inner}
    </View>
  );
};

const SectionTitle = ({ children }) => (
  <Text
    style={{
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
      color: "#6B7280",
      letterSpacing: 0.6,
      paddingHorizontal: 20,
      marginTop: 20,
      marginBottom: 8,
    }}
  >
    {children.toUpperCase()}
  </Text>
);

const Card = ({ children }) => (
  <View
    style={{
      marginHorizontal: 20,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      backgroundColor: "#FFFFFF",
      overflow: "hidden",
    }}
  >
    {children}
  </View>
);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    sound: "default",
  });
  const [schedule, setSchedule] = useState(null);
  const [recents, setRecents] = useState([]);

  const load = useCallback(async () => {
    const [s, sch, rec] = await Promise.all([
      loadSettings(),
      loadSchedule(),
      loadRecentAlliances(),
    ]);
    setSettings(s);
    setSchedule(sch);
    setRecents(rec);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggleNotifications = useCallback(
    async (val) => {
      tapMedium();
      const next = { ...settings, notificationsEnabled: val };
      setSettings(next);
      await saveSettings(next);
      if (!val) {
        await cancelAll();
      } else if (schedule) {
        await scheduleAll(schedule);
      }
    },
    [settings, schedule],
  );

  const handleSetSound = useCallback(
    async (sound) => {
      tapLight();
      const next = { ...settings, sound };
      setSettings(next);
      await saveSettings(next);
    },
    [settings],
  );

  const handleTest = useCallback(async () => {
    tapMedium();
    const ok = await sendTestNotification();
    if (ok) {
      hapSuccess();
      Alert.alert(
        "Test scheduled",
        "You should see a notification in about 5 seconds.",
      );
    } else {
      Alert.alert("Permission needed", "Allow notifications to test.");
    }
  }, []);

  const handleLeave = useCallback(() => {
    Alert.alert(
      "Leave alliance?",
      "This clears your imported schedule and cancels notifications.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            await cancelAll();
            await clearSchedule();
            await load();
          },
        },
      ],
    );
  }, [load]);

  const handleReshowIntro = useCallback(async () => {
    await setOnboardingComplete(false);
    router.replace("/onboarding");
  }, [router]);

  const handleSwitchAlliance = useCallback(
    async (allianceName) => {
      tapMedium();
      const config = await switchToAlliance(allianceName);
      if (config) {
        const granted = await requestPermissions();
        if (granted) await scheduleAll(config);
        hapSuccess();
        await load();
        Alert.alert("Switched", `Now showing "${config.name}".`);
      } else {
        Alert.alert("Could not switch", "We could not find that alliance.");
      }
    },
    [load],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
          paddingTop: insets.top + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 30,
              color: "#111827",
              letterSpacing: -0.6,
            }}
          >
            Settings
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: "#6B7280",
              marginTop: 4,
            }}
          >
            Notifications, sounds, and alliance.
          </Text>
        </View>

        {/* Current alliance */}
        {schedule && !isDemoSchedule(schedule) ? (
          <Animated.View entering={FadeInDown.duration(280)}>
            <View
              style={{
                marginHorizontal: 20,
                marginTop: 8,
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                  color: "#2563EB",
                  letterSpacing: 0.5,
                }}
              >
                CURRENT ALLIANCE
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 20,
                  color: "#111827",
                  marginTop: 4,
                  letterSpacing: -0.3,
                }}
              >
                {schedule.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginTop: 10,
                  flexWrap: "wrap",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: "#374151",
                    }}
                  >
                    Server {schedule.offset}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: "#374151",
                    }}
                  >
                    {schedule.events.length} events
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        ) : null}

        <SectionTitle>Notifications</SectionTitle>
        <Card>
          <Row
            icon={<Bell size={18} color="#2563EB" />}
            title="Push alerts"
            subtitle="Local notifications for upcoming events"
            right={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ true: "#2563EB", false: "#E5E7EB" }}
              />
            }
          />
          <Row
            icon={<Send size={18} color="#2563EB" />}
            title="Send test notification"
            subtitle="Fires in 5 seconds"
            onPress={handleTest}
          />
          <Row
            icon={<Clock size={18} color="#2563EB" />}
            title="Device timezone"
            subtitle={`Your device is at ${getDeviceOffsetString()}`}
          />
        </Card>

        <SectionTitle>Alert sound</SectionTitle>
        <Card>
          <View style={{ padding: 14 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {SOUNDS.map((s) => {
                const active = (settings.sound || "default") === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => handleSetSound(s.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: active ? "#2563EB" : "#E5E7EB",
                      backgroundColor: active ? "#EFF6FF" : "#FFFFFF",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 13,
                        color: active ? "#2563EB" : "#374151",
                      }}
                    >
                      {s.label}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 11,
                        color: active ? "#2563EB" : "#9CA3AF",
                        marginTop: 2,
                      }}
                    >
                      {s.hint}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 11,
                color: "#9CA3AF",
                marginTop: 10,
              }}
            >
              Tap "Send test notification" above to confirm your alert is
              working. Your device's ring/silent switch also affects sounds.
            </Text>
          </View>
        </Card>

        {/* Recent alliances — tappable */}
        {recents.length > 0 ? (
          <>
            <SectionTitle>Recent alliances</SectionTitle>
            <Card>
              {recents.map((r, i) => {
                const isCurrent =
                  schedule &&
                  schedule.name === r.name &&
                  !isDemoSchedule(schedule);
                return (
                  <Pressable
                    key={r.name + i}
                    onPress={() => !isCurrent && handleSwitchAlliance(r.name)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      gap: 12,
                      borderBottomWidth: i < recents.length - 1 ? 1 : 0,
                      borderColor: "#F3F4F6",
                      backgroundColor:
                        pressed && !isCurrent ? "#F9FAFB" : "transparent",
                      opacity: isCurrent ? 0.6 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: "#F9FAFB",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <History size={15} color="#6B7280" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 14,
                          color: "#111827",
                        }}
                      >
                        {r.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: "#6B7280",
                          marginTop: 1,
                        }}
                      >
                        Server {r.offset} · {r.eventCount} events
                      </Text>
                    </View>
                    {isCurrent ? (
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 11,
                          color: "#10B981",
                        }}
                      >
                        ACTIVE
                      </Text>
                    ) : (
                      <ChevronRight size={16} color="#9CA3AF" />
                    )}
                  </Pressable>
                );
              })}
            </Card>
          </>
        ) : null}

        <SectionTitle>Alliance</SectionTitle>
        <Card>
          <Row
            icon={<LogOut size={18} color="#EF4444" />}
            title="Leave alliance"
            subtitle="Clears schedule and cancels alerts"
            onPress={handleLeave}
            danger
          />
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card>
          <Row
            icon={<BookOpen size={18} color="#6B7280" />}
            title="Show intro again"
            subtitle="Re-watch the welcome guide"
            onPress={handleReshowIntro}
          />
          <Row
            icon={<Info size={18} color="#6B7280" />}
            title="How sync works"
            subtitle="No servers. Sync happens via copy-paste Team Codes."
          />
        </Card>

        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 13,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            What's inside
          </Text>
          {[
            "Local push notifications",
            "Cross-timezone math",
            "Copy-paste Team Codes",
            "Scannable QR codes",
            "Offline-first storage",
            "12 quick-start game templates",
            "Multi-alliance switching",
          ].map((item) => (
            <View
              key={item}
              style={{ flexDirection: "row", paddingVertical: 3 }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: "#9CA3AF",
                  width: 14,
                }}
              >
                -
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: "#6B7280",
                  flex: 1,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
