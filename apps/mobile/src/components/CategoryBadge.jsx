import { View, Text } from "react-native";
import { Shield, Swords, Coins, Star } from "lucide-react-native";

const COLORS = {
  Defense: { bg: "#ECFDF5", text: "#047857", icon: "#10B981", Icon: Shield },
  Combat: { bg: "#FEF2F2", text: "#B91C1C", icon: "#EF4444", Icon: Swords },
  Economy: { bg: "#FEFCE8", text: "#A16207", icon: "#EAB308", Icon: Coins },
  Custom: { bg: "#EFF6FF", text: "#1D4ED8", icon: "#3B82F6", Icon: Star },
};

export default function CategoryBadge({ category, size = "sm" }) {
  const palette = COLORS[category] || COLORS.Custom;
  const Icon = palette.Icon;
  const padV = size === "lg" ? 6 : 4;
  const padH = size === "lg" ? 12 : 9;
  const fontSize = size === "lg" ? 13 : 11;
  const iconSize = size === "lg" ? 13 : 11;

  return (
    <View
      style={{
        backgroundColor: palette.bg,
        borderRadius: 999,
        paddingVertical: padV,
        paddingHorizontal: padH,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        alignSelf: "flex-start",
      }}
    >
      <Icon size={iconSize} color={palette.icon} strokeWidth={2.5} />
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize,
          color: palette.text,
          letterSpacing: 0.2,
        }}
      >
        {category}
      </Text>
    </View>
  );
}

export const getCategoryColors = (category) =>
  COLORS[category] || COLORS.Custom;
