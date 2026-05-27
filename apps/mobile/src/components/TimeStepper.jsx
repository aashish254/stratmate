import { View, Text, Pressable } from "react-native";
import { ChevronUp, ChevronDown } from "lucide-react-native";
import { tapLight } from "@/lib/haptics";

const parse = (v) => {
  const m = (v || "00:00").match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return { h: 0, m: 0 };
  return {
    h: Math.min(23, Math.max(0, parseInt(m[1], 10))),
    m: Math.min(59, Math.max(0, parseInt(m[2], 10))),
  };
};

const fmt = (h, m) =>
  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

const Stepper = ({ value, onUp, onDown, label }) => (
  <View style={{ alignItems: "center", flex: 1 }}>
    <Pressable
      onPress={() => {
        tapLight();
        onUp();
      }}
      hitSlop={8}
      style={({ pressed }) => ({
        backgroundColor: pressed ? "#DBEAFE" : "#EFF6FF",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 18,
      })}
    >
      <ChevronUp size={18} color="#2563EB" />
    </Pressable>
    <View
      style={{
        marginVertical: 8,
        paddingVertical: 12,
        paddingHorizontal: 22,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        minWidth: 76,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 28,
          color: "#111827",
          letterSpacing: -0.4,
        }}
      >
        {String(value).padStart(2, "0")}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          color: "#9CA3AF",
          letterSpacing: 0.5,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
    <Pressable
      onPress={() => {
        tapLight();
        onDown();
      }}
      hitSlop={8}
      style={({ pressed }) => ({
        backgroundColor: pressed ? "#DBEAFE" : "#EFF6FF",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 18,
      })}
    >
      <ChevronDown size={18} color="#2563EB" />
    </Pressable>
  </View>
);

export default function TimeStepper({ value, onChange }) {
  const { h, m } = parse(value);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <Stepper
        value={h}
        label="HOURS"
        onUp={() => onChange(fmt((h + 1) % 24, m))}
        onDown={() => onChange(fmt((h + 23) % 24, m))}
      />
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 32,
          color: "#9CA3AF",
          marginTop: 16,
        }}
      >
        :
      </Text>
      <Stepper
        value={m}
        label="MINS"
        onUp={() => onChange(fmt(h, (m + 5) % 60))}
        onDown={() => onChange(fmt(h, (m + 55) % 60))}
      />
    </View>
  );
}
