import { View, Text } from "react-native";

// Placeholder for AdMob banner. Wire in via platform ads integration later.
export const AdBanner = () => {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          color: "#9CA3AF",
          letterSpacing: 0.5,
        }}
      >
        AD SPACE — BANNER
      </Text>
    </View>
  );
};

// Placeholder gate for interstitial. Calls onComplete after a brief "ad" delay.
export const showInterstitial = (onComplete) => {
  setTimeout(() => {
    onComplete && onComplete();
  }, 600);
};
