import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const COLORS = [
  "#2563EB",
  "#10B981",
  "#F97316",
  "#EAB308",
  "#EF4444",
  "#8B5CF6",
];

const Particle = ({ index, total, onDone }) => {
  const t = useSharedValue(0);
  const angle = (index / total) * Math.PI * 2;
  const distance = 80 + Math.random() * 60;
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance - 30;
  const color = COLORS[index % COLORS.length];

  useEffect(() => {
    t.value = withDelay(
      index * 12,
      withTiming(
        1,
        { duration: 700, easing: Easing.out(Easing.quad) },
        () => {},
      ),
    );
  }, [index, t]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: t.value * dx },
      { translateY: t.value * dy + t.value * t.value * 60 },
      { scale: 1 - t.value * 0.4 },
    ],
    opacity: 1 - t.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

export default function Confetti({ trigger, count = 20 }) {
  if (!trigger) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: "40%",
        left: "50%",
        zIndex: 100,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Particle key={`${trigger}-${i}`} index={i} total={count} />
      ))}
    </View>
  );
}
