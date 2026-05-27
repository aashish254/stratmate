import { View, Text, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const StatCard = ({ label, value, accent, index }) => (
  <Animated.View entering={FadeInDown.duration(280).delay(index * 50)}>
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 10,
        minWidth: 96,
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          color: "#9CA3AF",
          letterSpacing: 0.5,
        }}
      >
        {label.toUpperCase()}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 22,
          color: accent || "#111827",
          letterSpacing: -0.4,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  </Animated.View>
);

export default function StatsStrip({ stats }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} index={i} />
      ))}
    </ScrollView>
  );
}
