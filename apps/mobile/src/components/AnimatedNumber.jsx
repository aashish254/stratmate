import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";

export default function AnimatedNumber({ value, style }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(0.96, { duration: 90 }),
      withTiming(1, { duration: 160 }),
    );
    opacity.value = withSequence(
      withTiming(0.7, { duration: 90 }),
      withTiming(1, { duration: 160 }),
    );
  }, [value, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={style}>{value}</Text>
    </Animated.View>
  );
}
