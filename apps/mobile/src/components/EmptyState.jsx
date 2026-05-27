import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function EmptyState({ icon, title, description, action }) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingVertical: 48,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: "#EFF6FF",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 20,
          color: "#111827",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          color: "#6B7280",
          textAlign: "center",
          lineHeight: 21,
          marginBottom: action ? 20 : 0,
        }}
      >
        {description}
      </Text>
      {action}
    </Animated.View>
  );
}
