import { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import { Clock, Search, CalendarDays } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { loadSchedule } from "@/lib/storage";
import {
  getNextOccurrences,
  formatTimeRemaining,
  formatClock,
} from "@/lib/schedule";
import CategoryBadge from "@/components/CategoryBadge";
import EmptyState from "@/components/EmptyState";
import { tapLight } from "@/lib/haptics";

const CATEGORIES = ["All", "Defense", "Combat", "Economy", "Custom"];

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const [schedule, setSchedule] = useState(null);
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const s = await loadSchedule();
    setSchedule(s);
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

  const rows = useMemo(() => {
    if (!schedule) return [];
    const list = [];
    const now = new Date();
    const q = query.trim().toLowerCase();
    for (const ev of schedule.events) {
      if (filter !== "All" && ev.category !== filter) continue;
      if (q && !ev.name.toLowerCase().includes(q)) continue;
      const occurrences = getNextOccurrences(ev, schedule.offset, 5, now);
      for (const date of occurrences) {
        list.push({ event: ev, date });
      }
    }
    list.sort((a, b) => a.date.getTime() - b.date.getTime());
    return list.slice(0, 40);
  }, [schedule, filter, query, tick]);

  if (!schedule) {
    return <View style={{ flex: 1, backgroundColor: "#FAFAFA" }} />;
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "#FAFAFA", paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 30,
            color: "#111827",
            letterSpacing: -0.6,
          }}
        >
          Events
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: "#6B7280",
            marginTop: 4,
          }}
        >
          Every upcoming fire, sorted by time.
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Search size={16} color="#9CA3AF" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search events"
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1,
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: "#111827",
              padding: 0,
            }}
          />
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginTop: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {CATEGORIES.map((cat) => {
          const active = filter === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => {
                tapLight();
                setFilter(cat);
              }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? "#2563EB" : "#E5E7EB",
                backgroundColor: active ? "#2563EB" : "#FFFFFF",
              }}
            >
              <Text
                style={{
                  fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                  fontSize: 13,
                  color: active ? "#FFFFFF" : "#374151",
                }}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1, marginTop: 4 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={36} color="#2563EB" />}
            title="Nothing matches"
            description="Try a different category or clear your search."
          />
        ) : (
          rows.map((row, idx) => {
            const msUntil = row.date.getTime() - Date.now();
            return (
              <Animated.View
                key={`${row.event.id}-${idx}`}
                entering={FadeInDown.duration(280).delay(idx * 30)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginHorizontal: 20,
                    marginBottom: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                  }}
                >
                  <View style={{ width: 56 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 17,
                        color: "#111827",
                      }}
                    >
                      {formatClock(row.date)}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 10,
                        color: "#9CA3AF",
                        marginTop: 2,
                      }}
                    >
                      {row.date
                        .toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: "#111827",
                      }}
                    >
                      {row.event.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 6,
                        marginTop: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <CategoryBadge category={row.event.category} />
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Clock size={11} color="#6B7280" />
                        <Text
                          style={{
                            fontFamily: "Inter_500Medium",
                            fontSize: 11,
                            color: "#6B7280",
                          }}
                        >
                          every {row.event.interval}m
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      color: "#374151",
                    }}
                  >
                    in {formatTimeRemaining(msUntil)}
                  </Text>
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
