import { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

export default function ProgressRing({
  percent = 0,
  size = 44,
  stroke = 3,
  label,
  pulse = false,
  done = false,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.max(0, Math.min(100, percent));
  const offset = circumference - (safePercent / 100) * circumference;

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (pulse) {
      pulseScale.value = withRepeat(
        withTiming(1.08, { duration: 600 }),
        -1,
        true,
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1, { duration: 200 });
    }
    return () => cancelAnimation(pulseScale);
  }, [pulse, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const progressColor = done ? "#10B981" : "#F97316";
  const gradientId = `ring-${size}-${done ? "g" : "o"}`;

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
        animatedStyle,
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={progressColor} stopOpacity="1" />
            <Stop
              offset="1"
              stopColor={done ? "#34D399" : "#FB923C"}
              stopOpacity="1"
            />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F3F4F6"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference}, ${circumference}`}
          strokeDashoffset={done ? 0 : offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {label ? (
        <View
          style={{
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 10,
              color: "#111827",
            }}
          >
            {label}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}
