import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Trash2, Check } from "lucide-react-native";
import { PrimaryButton } from "./Button";
import TimeStepper from "./TimeStepper";
import InfoTooltip from "./InfoTooltip";
import { tapLight } from "@/lib/haptics";

const CATEGORIES = ["Combat", "Defense", "Economy", "Custom"];

const FieldLabel = ({ children, valid, tooltip }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
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
      {children}
    </Text>
    {valid ? <Check size={12} color="#10B981" /> : null}
    {tooltip ? <InfoTooltip {...tooltip} /> : null}
  </View>
);

const EventBottomSheet = forwardRef(({ onSave, onDelete }, ref) => {
  const sheetRef = useRef(null);
  const [event, setEvent] = useState(null);
  const [isNew, setIsNew] = useState(false);

  useImperativeHandle(ref, () => ({
    open: (ev, opts = {}) => {
      setEvent({
        id: ev?.id || `e_${Math.random().toString(36).slice(2, 8)}`,
        name: ev?.name || "",
        category: ev?.category || "Combat",
        anchor: ev?.anchor || "00:00",
        interval: String(ev?.interval || 60),
        duration: String(ev?.duration || 0),
        lead: String(ev?.lead != null ? ev.lead : 5),
      });
      setIsNew(Boolean(opts.isNew));
      sheetRef.current?.present();
    },
    close: () => sheetRef.current?.dismiss(),
  }));

  const snapPoints = useMemo(() => ["92%"], []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    [],
  );

  const handleSave = () => {
    if (!event) return;
    const intervalNum = parseInt(event.interval, 10) || 60;
    onSave({
      id: event.id,
      name: event.name.trim() || "Untitled event",
      category: event.category,
      anchor: event.anchor,
      interval: intervalNum,
      duration: parseInt(event.duration, 10) || 0,
      lead: parseInt(event.lead, 10) || 0,
    });
    sheetRef.current?.dismiss();
  };

  const handleDelete = () => {
    if (event?.id) onDelete(event.id);
    sheetRef.current?.dismiss();
  };

  if (!event) {
    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView style={{ padding: 20 }} />
      </BottomSheetModal>
    );
  }

  const nameValid = (event.name || "").trim().length > 0;
  const intervalValid = parseInt(event.interval, 10) > 0;

  const INTERVAL_PRESETS = [
    { label: "30m", m: 30 },
    { label: "1h", m: 60 },
    { label: "4h", m: 240 },
    { label: "8h", m: 480 },
    { label: "12h", m: 720 },
    { label: "1d", m: 1440 },
  ];

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 36 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 22,
              color: "#111827",
              letterSpacing: -0.5,
            }}
          >
            {isNew ? "Add event" : "Edit event"}
          </Text>
          {!isNew ? (
            <Pressable onPress={handleDelete} hitSlop={10}>
              <Trash2 size={18} color="#EF4444" />
            </Pressable>
          ) : null}
        </View>

        {/* Name */}
        <View style={{ marginBottom: 18 }}>
          <FieldLabel valid={nameValid}>EVENT NAME</FieldLabel>
          <TextInput
            value={event.name}
            onChangeText={(v) => setEvent({ ...event, name: v })}
            placeholder="e.g. Shield Drop"
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

        {/* Category */}
        <View style={{ marginBottom: 18 }}>
          <FieldLabel>CATEGORY</FieldLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((cat) => {
              const active = event.category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => {
                    tapLight();
                    setEvent({ ...event, category: cat });
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? "#2563EB" : "#E5E7EB",
                    backgroundColor: active ? "#EFF6FF" : "#FFFFFF",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 13,
                      color: active ? "#2563EB" : "#374151",
                    }}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Time stepper */}
        <View style={{ marginBottom: 18 }}>
          <FieldLabel
            tooltip={{
              title: "First time today",
              message:
                "The first occurrence of the event in your game server time. The app repeats it from here.",
            }}
          >
            FIRST AT (SERVER TIME)
          </FieldLabel>
          <TimeStepper
            value={event.anchor}
            onChange={(v) => setEvent({ ...event, anchor: v })}
          />
        </View>

        {/* Interval presets */}
        <View style={{ marginBottom: 18 }}>
          <FieldLabel
            valid={intervalValid}
            tooltip={{
              title: "Repeats",
              message:
                "How often the event happens. Pick a preset or type minutes.",
            }}
          >
            REPEATS EVERY
          </FieldLabel>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 10,
            }}
          >
            {INTERVAL_PRESETS.map((p) => {
              const active = parseInt(event.interval, 10) === p.m;
              return (
                <Pressable
                  key={p.label}
                  onPress={() => {
                    tapLight();
                    setEvent({ ...event, interval: String(p.m) });
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: active ? "#2563EB" : "#E5E7EB",
                    backgroundColor: active ? "#EFF6FF" : "#FFFFFF",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 13,
                      color: active ? "#2563EB" : "#374151",
                    }}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={String(event.interval)}
            onChangeText={(v) =>
              setEvent({ ...event, interval: v.replace(/[^0-9]/g, "") })
            }
            placeholder="60"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            style={{
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              color: "#111827",
            }}
          />
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 11,
              color: "#9CA3AF",
              marginTop: 4,
            }}
          >
            Minutes between fires
          </Text>
        </View>

        {/* Lead time */}
        <View style={{ marginBottom: 22 }}>
          <FieldLabel
            tooltip={{
              title: "Alert me before",
              message:
                'How early you want the heads-up. Pick "Off" to fire exactly at event time.',
            }}
          >
            ALERT ME BEFORE
          </FieldLabel>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["0", "5", "10", "15", "30"].map((v) => {
              const active = String(event.lead) === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => {
                    tapLight();
                    setEvent({ ...event, lead: v });
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: active ? "#2563EB" : "#E5E7EB",
                    backgroundColor: active ? "#EFF6FF" : "#FFFFFF",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 13,
                      color: active ? "#2563EB" : "#374151",
                    }}
                  >
                    {v === "0" ? "Off" : `${v}m`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <PrimaryButton title="Save event" onPress={handleSave} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

EventBottomSheet.displayName = "EventBottomSheet";
export default EventBottomSheet;
