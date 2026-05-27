import { useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import {
  Plus,
  Download,
  FileCode,
  ChevronRight,
  Layers,
  Edit3,
  Search,
  Send,
  Sparkles,
} from "lucide-react-native";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import CategoryBadge from "@/components/CategoryBadge";
import EventBottomSheet from "@/components/EventBottomSheet";
import ShareCodeCard from "@/components/ShareCodeCard";
import InfoTooltip from "@/components/InfoTooltip";
import Confetti from "@/components/Confetti";
import { encode, decode } from "@/lib/shareCode";
import { getTeamId } from "@/lib/teamId";
import { loadSchedule, saveSchedule, isDemoSchedule } from "@/lib/storage";
import { scheduleAll, requestPermissions } from "@/lib/notifications";
import { getDeviceOffsetString } from "@/lib/schedule";
import { TEMPLATES } from "@/lib/templates";
import {
  tapLight,
  tapMedium,
  success as hapSuccess,
  error as hapError,
} from "@/lib/haptics";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const maskOffset = (raw) => {
  if (!raw) return "";
  let s = raw.replace(/[^0-9+\-:]/g, "");
  if (!s.startsWith("+") && !s.startsWith("-"))
    s = `+${s.replace(/[+\-]/g, "")}`;
  const sign = s[0];
  const rest = s
    .slice(1)
    .replace(/[^0-9]/g, "")
    .slice(0, 4);
  if (rest.length <= 2) return `${sign}${rest}`;
  return `${sign}${rest.slice(0, 2)}:${rest.slice(2)}`;
};

const TemplateCard = ({ template, onPick, index }) => (
  <Animated.View entering={FadeInDown.duration(280).delay(index * 40)}>
    <Pressable
      onPress={() => {
        tapMedium();
        onPick(template);
      }}
      style={({ pressed }) => ({
        backgroundColor: pressed ? "#F9FAFB" : "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        padding: 14,
        marginRight: 10,
        width: 168,
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: `${template.accent}15`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 20 }}>{template.emoji}</Text>
      </View>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 14,
          color: "#111827",
        }}
      >
        {template.label}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 11,
          color: "#6B7280",
          marginTop: 3,
        }}
      >
        {template.description}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 10,
          gap: 4,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 11,
            color: template.accent,
          }}
        >
          Use
        </Text>
        <ChevronRight size={12} color={template.accent} />
      </View>
    </Pressable>
  </Animated.View>
);

const EventCard = ({ event, onEdit, index }) => (
  <Animated.View entering={FadeInDown.duration(260).delay(index * 40)}>
    <Pressable
      onPress={() => {
        tapLight();
        onEdit(event);
      }}
      style={({ pressed }) => ({
        backgroundColor: pressed ? "#F9FAFB" : "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
            color: "#111827",
          }}
        >
          {event.name || "Untitled event"}
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 6,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <CategoryBadge category={event.category} />
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              color: "#6B7280",
            }}
          >
            {event.anchor} · every {event.interval}m
          </Text>
        </View>
      </View>
      <Edit3 size={16} color="#9CA3AF" />
    </Pressable>
  </Animated.View>
);

export default function LeaderScreen() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef(null);

  const [name, setName] = useState("");
  const [offset, setOffset] = useState("+00:00");
  const [events, setEvents] = useState([]);
  const [importCode, setImportCode] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [shareCode, setShareCode] = useState("");
  const [teamId, setTeamIdState] = useState("");
  const [templateQuery, setTemplateQuery] = useState("");
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const load = useCallback(async () => {
    const s = await loadSchedule();
    if (s && !isDemoSchedule(s)) {
      setName(s.name || "");
      setOffset(s.offset || "+00:00");
      setEvents(s.events || []);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filteredTemplates = useMemo(() => {
    const q = templateQuery.trim().toLowerCase();
    if (!q) return TEMPLATES;
    return TEMPLATES.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    );
  }, [templateQuery]);

  const handlePickTemplate = (template) => {
    setName(template.schedule.name);
    setOffset(
      template.schedule.offset === "+00:00"
        ? getDeviceOffsetString()
        : template.schedule.offset,
    );
    setEvents(
      template.schedule.events.map((e) => ({
        ...e,
        id: `e_${Math.random().toString(36).slice(2, 8)}`,
      })),
    );
    setShareCode("");
    hapSuccess();
  };

  const handleAddEvent = () => {
    tapMedium();
    sheetRef.current?.open(null, { isNew: true });
  };
  const handleEditEvent = (event) =>
    sheetRef.current?.open(event, { isNew: false });

  const handleSaveEvent = (event) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === event.id);
      if (idx === -1) return [...prev, event];
      const next = [...prev];
      next[idx] = event;
      return next;
    });
    hapSuccess();
  };

  const handleDeleteEvent = (eventId) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    hapSuccess();
  };

  const handleUseDeviceOffset = () => {
    tapLight();
    setOffset(getDeviceOffsetString());
  };

  const handleGenerate = useCallback(async () => {
    if (!name.trim()) {
      hapError();
      Alert.alert("Missing alliance name", "Give your alliance a name first.");
      return;
    }
    if (events.length === 0) {
      hapError();
      Alert.alert(
        "Add an event",
        "You need at least one event before sharing.",
      );
      return;
    }
    const config = {
      name: name.trim(),
      offset,
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        anchor: e.anchor,
        interval: parseInt(e.interval, 10) || 60,
        duration: parseInt(e.duration, 10) || 0,
        lead: parseInt(e.lead, 10) || 0,
      })),
    };
    const code = encode(config);
    const id = getTeamId(config);
    setShareCode(code);
    setTeamIdState(id);
    await saveSchedule(config);
    const granted = await requestPermissions();
    if (granted) {
      await scheduleAll(config);
    }
    hapSuccess();
    setConfettiTrigger((t) => t + 1);
  }, [name, offset, events]);

  const handlePreviewImport = useCallback(() => {
    const result = decode(importCode);
    if (!result.ok) {
      hapError();
      Alert.alert("Could not import", result.error);
      setImportPreview(null);
      return;
    }
    setImportPreview(result.config);
    hapSuccess();
  }, [importCode]);

  const handleConfirmImport = useCallback(async () => {
    if (!importPreview) return;
    await saveSchedule(importPreview);
    const granted = await requestPermissions();
    if (granted) {
      await scheduleAll(importPreview);
    }
    setImportPreview(null);
    setImportCode("");
    await load();
    hapSuccess();
    setConfettiTrigger((t) => t + 1);
    Alert.alert(
      "Imported",
      `Schedule for "${importPreview.name}" is now active.`,
    );
  }, [importPreview, load]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient
            colors={["#EFF6FF", "#FAFAFA"]}
            style={{
              paddingTop: insets.top + 16,
              paddingHorizontal: 20,
              paddingBottom: 20,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                color: "#2563EB",
                letterSpacing: 0.6,
              }}
            >
              BUILD
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
              Make a schedule
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: "#6B7280",
                marginTop: 4,
              }}
            >
              Pick your game · share a Team Code in 30 seconds.
            </Text>
          </LinearGradient>

          {/* Template search */}
          <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
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
                value={templateQuery}
                onChangeText={setTemplateQuery}
                placeholder="Search games (Rise of Kingdoms, Lords...)"
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

          {/* Templates */}
          <View style={{ marginTop: 14 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 20,
                marginBottom: 10,
              }}
            >
              <Layers size={14} color="#6B7280" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: "#111827",
                }}
              >
                {filteredTemplates.length} game
                {filteredTemplates.length === 1 ? "" : "s"}
              </Text>
            </View>
            {filteredTemplates.length === 0 ? (
              <Text
                style={{
                  paddingHorizontal: 20,
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: "#9CA3AF",
                }}
              >
                No matches. Try "blank" to start fresh.
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {filteredTemplates.map((t, i) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onPick={handlePickTemplate}
                    index={i}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Import */}
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 18,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              backgroundColor: "#FFFFFF",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: "#111827",
                }}
              >
                Member? Paste a Team Code
              </Text>
              <InfoTooltip
                title="What's a Team Code?"
                message="It's a code your leader generated. Paste it here to instantly sync the alliance schedule."
              />
            </View>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: "#6B7280",
                marginTop: 2,
                marginBottom: 10,
              }}
            >
              Starts with TEAM1- (or older CAT1:)
            </Text>
            <TextInput
              value={importCode}
              onChangeText={setImportCode}
              placeholder="TEAM1-..."
              placeholderTextColor="#9CA3AF"
              multiline
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: "#111827",
                minHeight: 56,
              }}
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <SecondaryButton
                title="Preview"
                onPress={handlePreviewImport}
                leftIcon={<FileCode size={14} color="#111827" />}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Import"
                onPress={handleConfirmImport}
                disabled={!importPreview}
                leftIcon={<Download size={14} color="#FFFFFF" />}
                style={{ flex: 1 }}
              />
            </View>
            {importPreview ? (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: "#F9FAFB",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: "#111827",
                  }}
                >
                  {importPreview.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: "#6B7280",
                    marginTop: 2,
                  }}
                >
                  Server {importPreview.offset} · {importPreview.events.length}{" "}
                  events
                </Text>
                <View style={{ marginTop: 8 }}>
                  {importPreview.events.slice(0, 6).map((e) => (
                    <View
                      key={e.id}
                      style={{ flexDirection: "row", paddingVertical: 2 }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: "#9CA3AF",
                          width: 14,
                        }}
                      >
                        -
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: "#6B7280",
                          flex: 1,
                        }}
                      >
                        {e.name} · every {e.interval}m
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}
          </View>

          {/* Builder */}
          <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: "#111827",
                marginBottom: 12,
                letterSpacing: -0.3,
              }}
            >
              Your schedule
            </Text>

            <View style={{ marginBottom: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 11,
                    color: "#6B7280",
                    letterSpacing: 0.5,
                  }}
                >
                  ALLIANCE NAME
                </Text>
                <InfoTooltip
                  title="Alliance name"
                  message="Whatever you and your teammates call your group. Members will see this on the dashboard."
                />
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Northern Hawks"
                placeholderTextColor="#9CA3AF"
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                  color: "#111827",
                  backgroundColor: "#FFFFFF",
                }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 11,
                      color: "#6B7280",
                      letterSpacing: 0.5,
                    }}
                  >
                    SERVER UTC OFFSET
                  </Text>
                  <InfoTooltip
                    title="Server offset"
                    message="Your game server's timezone offset from UTC. Most Asia servers run at +08:00. US East is -05:00."
                  />
                </View>
                <Pressable onPress={handleUseDeviceOffset} hitSlop={6}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 11,
                      color: "#2563EB",
                    }}
                  >
                    Use device ({getDeviceOffsetString()})
                  </Text>
                </Pressable>
              </View>
              <TextInput
                value={offset}
                onChangeText={(v) => setOffset(maskOffset(v))}
                placeholder="+08:00"
                placeholderTextColor="#9CA3AF"
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                  color: "#111827",
                  backgroundColor: "#FFFFFF",
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: "#111827",
                }}
              >
                Events ({events.length})
              </Text>
            </View>

            {events.length === 0 ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderStyle: "dashed",
                  borderRadius: 14,
                  paddingVertical: 28,
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Sparkles size={22} color="#9CA3AF" />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: "#374151",
                    marginTop: 8,
                  }}
                >
                  No events yet
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: "#9CA3AF",
                    marginTop: 4,
                  }}
                >
                  Pick a template above or tap the + button
                </Text>
              </View>
            ) : (
              events.map((ev, i) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onEdit={handleEditEvent}
                  index={i}
                />
              ))
            )}

            <PrimaryButton
              title="Generate Team Code"
              onPress={handleGenerate}
              leftIcon={<Send size={16} color="#FFFFFF" />}
              style={{ marginTop: 18 }}
            />

            {shareCode ? (
              <View style={{ marginTop: 18 }}>
                <ShareCodeCard code={shareCode} teamId={teamId} />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingAnimatedView>

      {/* FAB */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          bottom: insets.bottom + 16,
          right: 20,
        }}
      >
        <Pressable
          onPress={handleAddEvent}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#1D4ED8" : "#2563EB",
            borderRadius: 999,
            paddingVertical: 14,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            shadowColor: "#1D4ED8",
            shadowOpacity: 0.3,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          })}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              color: "#FFFFFF",
            }}
          >
            Add event
          </Text>
        </Pressable>
      </View>

      <Confetti trigger={confettiTrigger} count={24} />
      <EventBottomSheet
        ref={sheetRef}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </View>
  );
}
