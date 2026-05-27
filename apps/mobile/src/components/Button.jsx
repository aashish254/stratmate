import { Pressable, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { tapLight } from "@/lib/haptics";

const useScaleOnPress = () => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPressIn = () => {
    scale.value = withTiming(0.97, { duration: 80 });
  };
  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 120 });
  };
  return { animatedStyle, onPressIn, onPressOut };
};

export const PrimaryButton = ({
  title,
  onPress,
  disabled,
  loading,
  leftIcon,
  style,
}) => {
  const { animatedStyle, onPressIn, onPressOut } = useScaleOnPress();
  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={() => {
          tapLight();
          onPress && onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={disabled ? ["#93C5FD", "#93C5FD"] : ["#3B82F6", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            leftIcon
          )}
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
              color: "#FFFFFF",
            }}
          >
            {title}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

export const SecondaryButton = ({ title, onPress, leftIcon, style }) => {
  const { animatedStyle, onPressIn, onPressOut } = useScaleOnPress();
  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={() => {
          tapLight();
          onPress && onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 12,
          paddingVertical: 13,
          paddingHorizontal: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {leftIcon}
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
            color: "#111827",
          }}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export const SoftButton = ({ title, onPress, leftIcon, style }) => {
  const { animatedStyle, onPressIn, onPressOut } = useScaleOnPress();
  return (
    <Animated.View style={[{ alignSelf: "flex-start" }, animatedStyle, style]}>
      <Pressable
        onPress={() => {
          tapLight();
          onPress && onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{
          backgroundColor: "#EFF6FF",
          borderRadius: 999,
          paddingVertical: 9,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {leftIcon}
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 13,
            color: "#2563EB",
          }}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};
