import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import {
  Users,
  Clock,
  RefreshCw,
  Sparkles,
  BellOff,
  CheckCircle2,
  Inbox,
  Zap,
  Share2,
} from "lucide-react-native";
import {
  loadSchedule,
  isDemoSchedule,
  loadSnoozedMap,
  setSnoozed,
  loadDoneMap,
  markDone,
} from "@/lib/storage";
import {
  getCycleProgress,
  formatTimeRemaining,
  formatClock,
  getDeviceOffsetString,
} from "@/lib/schedule";
import ProgressRing from "@/components/ProgressRing";
import CategoryBadge from "@/components/CategoryBadge";
import EmptyState from "@/components/EmptyState";
import AnimatedNumber from "@/components/AnimatedNumber";
import LiveDot from "@/components/LiveDot";
import StatsStrip from "@/components/StatsStrip";
import { AdBanner, showInterstitial } from "@/components/AdPlaceholders";
import { scheduleAll, requestPermissions } from "@/lib/notifications";
import { tapLight, tapMedium, success as hapSuccess } from "@/lib/haptics";
import { encode } from "@/lib/shareCode";
import { getTeamId } from "@/lib/teamId";

const EventRow = ({
  event,
  schedule,
  snoozed,
  done,
  onSnooze,
  onMarkDone,
  index,
}) => {
  const { msUntil, percentElapsed, next } = getCycleProgress(
    event,
    schedule.offset,
  );
  const isNear = msUntil < 60_000 && msUntil > 0;
  const isSnoozed = snoozed && snoozed > Date.now();
  const isDone = done;

  return (
    <Animated.View entering={FadeInDown.duration(320).delay(60 * index)}>
      <Pressable
        onPress={() => {
          tapLight();
          Alert.alert(
            event.name,
            `Next at ${formatClock(next)}\nFires every ${event.interval}m\nAlert ${event.lead || 0} min before`,
            [
              { text: "Mark as done", onPress: () => onMarkDone(event) },
              { text: "Snooze 1 cycle", onPress: () => onSnooze(event) },
              { text: "Close", style: "cancel" },
            ],
          );
        }}
        onLongPress={() => {
          tapMedium();
          onSnooze(event);
        }}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderColor: "#F3F4F6",
          gap: 14,
          backgroundColor: pressed ? "#F9FAFB" : "transparent",
          opacity: isSnoozed ? 0.5 : 1,
        })}
      >
        <ProgressRing
          percent={percentElapsed}
          size={46}
          stroke={3}
          label={`${Math.round(percentElapsed)}%`}
          pulse={isNear && !isSnoozed && !isDone}
          done={isDone}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
              color: "#111827",
            }}
          >
            {event.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
              flexWrap: "wrap",
            }}
          >
            <CategoryBadge category={event.category} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 12,
                color: "#6B7280",
              }}
            >
              at {formatClock(next)}
            </Text>
            {isSnoozed ? <BellOff size={12} color="#9CA3AF" /> : null}
            {isDone ? <CheckCircle2 size={12} color="#10B981" /> : null}
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
              color: isNear ? "#F97316" : "#111827",
            }}
          >
            {formatTimeRemaining(msUntil)}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 10,
              color: "#9CA3AF",
              marginTop: 2,
              letterSpacing: 0.4,
            }}
          >
            UNTIL FIRE
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [schedule, setSchedule] = useState(null);
  const [tick, setTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [snoozedMap, setSnoozedMap] = useState({});
  const [doneMap, setDoneMap] = useState({});

  const load = useCallback(async () => {
    const [s, sn, dm] = await Promise.all([
      loadSchedule(),
      loadSnoozedMap(),
      loadDoneMap(),
    ]);
    setSchedule(s);
    setSnoozedMap(sn);
    setDoneMap(dm);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    tapMedium();
    showInterstitial(async () => {
      try {
        const granted = await requestPermissions();
        if (granted && schedule) {
          await scheduleAll(schedule);
        }
        hapSuccess();
        setTick((t) => t + 1);
      } catch (e) {
        console.error(e);
      } finally {
        setRefreshing(false);
      }
    });
  }, [schedule]);

  const handleSnooze = useCallback(async (event) => {
    const interval = parseInt(event.interval, 10) || 60;
    const until = Date.now() + interval * 60000;
    await setSnoozed(event.id, until);
    setSnoozedMap((prev) => ({ ...prev, [event.id]: until }));
    hapSuccess();
  }, []);

  const handleMarkDone = useCallback(async (event) => {
    const cycleStart = Date.now();
    await markDone(event.id, cycleStart);
    setDoneMap((prev) => ({ ...prev, [event.id]: cycleStart }));
    hapSuccess();
  }, []);

  const handleShareCurrent = useCallback(async () => {
    if (!schedule || isDemoSchedule(schedule)) return;
    tapLight();
    try {
      const code = encode(schedule);
      const id = getTeamId(schedule);
      await Share.share({
        message: `Join ${schedule.name} (Team ID ${id}). Paste in the app:\n\n${code}`,
      });
    } catch (e) {
      console.error(e);
    }
  }, [schedule]);

  // Hero countdown: nearest non-snoozed event
  const hero = useMemo(() => {
    if (!schedule) return null;
    let best = null;
    for (const ev of schedule.events) {
      if (snoozedMap[ev.id] && snoozedMap[ev.id] > Date.now()) continue;
      const { msUntil, next } = getCycleProgress(ev, schedule.offset);
      if (!best || msUntil < best.msUntil) {
        best = { event: ev, msUntil, next };
      }
    }
    return best;
  }, [schedule, snoozedMap, tick]);

  // Stats for the strip
  const stats = useMemo(() => {
    if (!schedule) return [];
    const totalEvents = schedule.events.length;
    const doneCount = schedule.events.filter((e) => doneMap[e.id]).length;
    const snoozedCount = schedule.events.filter(
      (e) => snoozedMap[e.id] && snoozedMap[e.id] > Date.now(),
    ).length;
    const now = new Date();
    const next24 = schedule.events.reduce((acc, e) => {
      const { msUntil } = getCycleProgress(e, schedule.offset, now);
      return acc + (msUntil < 86400000 ? 1 : 0);
    }, 0);
    return [
      { label: "Events", value: String(totalEvents) },
      { label: "Next 24h", value: String(next24), accent: "#2563EB" },
      { label: "Done", value: String(doneCount), accent: "#10B981" },
      { label: "Snoozed", value: String(snoozedCount), accent: "#9CA3AF" },
    ];
  }, [schedule, doneMap, snoozedMap, tick]);

  if (!schedule) {
    return <View style={{ flex: 1, backgroundColor: "#FAFAFA" }} />;
  }

  const demo = isDemoSchedule(schedule);
  const upcoming = schedule.events.slice(0, 10);
  const hasEvents = upcoming.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563EB"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient hero */}
        <LinearGradient
          colors={["#EFF6FF", "#FAFAFA"]}
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                  color: "#2563EB",
                  letterSpacing: 0.6,
                }}
              >
                ALLIANCE
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 30,
                  color: "#111827",
                  letterSpacing: -0.6,
                  marginTop: 2,
                }}
              >
                {schedule.name}
              </Text>
            </View>
            {!demo ? (
              <Pressable
                onPress={handleShareCurrent}
                hitSlop={10}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: pressed ? "#DBEAFE" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 4,
                })}
              >
                <Share2 size={18} color="#2563EB" />
              </Pressable>
            ) : null}
          </View>

          {/* Hero countdown */}
          {hero ? (
            <Animated.View
              entering={FadeIn.duration(400)}
              style={{
                marginTop: 22,
                padding: 18,
                borderRadius: 18,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                shadowColor: "#0F172A",
                shadowOpacity: 0.04,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 1,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <LiveDot />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 11,
                    color: "#6B7280",
                    letterSpacing: 0.6,
                  }}
                >
                  NEXT EVENT
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 17,
                  color: "#111827",
                  marginTop: 6,
                }}
              >
                {hero.event.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "baseline",
                  marginTop: 10,
                  gap: 8,
                }}
              >
                <AnimatedNumber
                  value={formatTimeRemaining(hero.msUntil)}
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 48,
                    color: "#111827",
                    letterSpacing: -1.5,
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                    color: "#9CA3AF",
                  }}
                >
                  · at {formatClock(hero.next)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginTop: 12,
                  flexWrap: "wrap",
                }}
              >
                <CategoryBadge category={hero.event.category} />
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Clock size={12} color="#6B7280" />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: "#6B7280",
                    }}
                  >
                    every {hero.event.interval}m
                  </Text>
                </View>
              </View>
            </Animated.View>
          ) : null}

          {/* Status pills */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Clock size={11} color="#6B7280" />
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
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Users size={11} color="#6B7280" />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: "#374151",
                }}
              >
                Device {getDeviceOffsetString()}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#ECFDF5",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#10B981",
                }}
              />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                  color: "#047857",
                }}
              >
                In sync
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats strip */}
        <View style={{ marginTop: 4, marginBottom: 4 }}>
          <StatsStrip stats={stats} />
        </View>

        {/* Demo banner */}
        {demo ? (
          <Animated.View entering={FadeIn.duration(400)}>
            <Pressable
              onPress={() => router.push("/(tabs)/leader")}
              style={{
                marginHorizontal: 20,
                marginTop: 12,
                padding: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                backgroundColor: "#FFFFFF",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#EFF6FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color: "#111827",
                  }}
                >
                  This is a demo
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: "#6B7280",
                    marginTop: 2,
                  }}
                >
                  Tap to import a Team Code or build your own.
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                  color: "#2563EB",
                }}
              >
                Open →
              </Text>
            </Pressable>
          </Animated.View>
        ) : null}

        {/* Upcoming list */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 14,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderColor: "#F3F4F6",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: "#111827",
                }}
              >
                Upcoming events
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: "#6B7280",
                  marginTop: 2,
                }}
              >
                Tap to snooze or mark done · long-press to snooze fast
              </Text>
            </View>
            <Pressable onPress={handleRefresh} hitSlop={12}>
              <RefreshCw size={16} color="#2563EB" />
            </Pressable>
          </View>
          {hasEvents ? (
            upcoming.map((ev, i) => (
              <EventRow
                key={ev.id}
                event={ev}
                schedule={schedule}
                snoozed={snoozedMap[ev.id]}
                done={Boolean(doneMap[ev.id])}
                onSnooze={handleSnooze}
                onMarkDone={handleMarkDone}
                index={i}
              />
            ))
          ) : (
            <EmptyState
              icon={<Inbox size={36} color="#2563EB" />}
              title="No events yet"
              description="Open the Build tab to make a schedule, or paste a Team Code from your leader."
              action={
                <Pressable
                  onPress={() => router.push("/(tabs)/leader")}
                  style={{
                    backgroundColor: "#2563EB",
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 18,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Zap size={14} color="#FFFFFF" />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: "#FFFFFF",
                    }}
                  >
                    Open Build
                  </Text>
                </Pressable>
              }
            />
          )}
        </View>

        {/* Ad */}
        <View style={{ marginHorizontal: 20, marginTop: 16 }}>
          <AdBanner />
        </View>
      </ScrollView>
    </View>
  );
}
