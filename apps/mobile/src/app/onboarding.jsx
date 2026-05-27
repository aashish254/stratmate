import { useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeOut,
  FadeInRight,
} from "react-native-reanimated";
import { Clock, Users, Share2, ChevronRight, Zap } from "lucide-react-native";
import { PrimaryButton } from "@/components/Button";
import { setOnboardingComplete } from "@/lib/storage";
import { tapMedium, success as hapSuccess } from "@/lib/haptics";

const { width } = Dimensions.get("window");

const STEPS = [
  {
    icon: Clock,
    accent: "#2563EB",
    title: "Never miss an event",
    body: "Track shield drops, boss waves, and resource rotations across your alliance — with push alerts in your local time.",
    bullets: ["Live countdowns", "Auto timezone math", "Local notifications"],
  },
  {
    icon: Share2,
    accent: "#10B981",
    title: "Sync with one code",
    body: "No accounts. No servers. Your leader generates a short code and shares it in Discord. Everyone pastes it in and stays in sync.",
    bullets: ["Copy-paste sync", "Works offline", "Free forever"],
  },
  {
    icon: Zap,
    accent: "#F97316",
    title: "Pick a role to start",
    body: "Members import a code from their leader. Leaders use a quick template to set things up in 30 seconds.",
    bullets: [],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    tapMedium();
    if (isLast) return;
    setStep(step + 1);
  };

  const finish = async (route) => {
    hapSuccess();
    await setOnboardingComplete(true);
    router.replace(route);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={["#EFF6FF", "#FFFFFF"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 360 }}
      />

      <View
        style={{ flex: 1, paddingTop: insets.top + 24, paddingHorizontal: 24 }}
      >
        {/* Skip */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          {!isLast ? (
            <Pressable onPress={() => finish("/(tabs)/dashboard")}>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: "#6B7280",
                }}
              >
                Skip
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Icon */}
        <View style={{ alignItems: "center", marginTop: 32 }}>
          <Animated.View
            key={`icon-${step}`}
            entering={FadeIn.duration(500)}
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: `${current.accent}15`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={44} color={current.accent} strokeWidth={2} />
          </Animated.View>
        </View>

        {/* Content */}
        <Animated.View
          key={`content-${step}`}
          entering={FadeInRight.duration(360)}
          exiting={FadeOut.duration(160)}
          style={{ marginTop: 36, alignItems: "center" }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 28,
              color: "#111827",
              textAlign: "center",
              letterSpacing: -0.6,
              lineHeight: 34,
            }}
          >
            {current.title}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 22,
              marginTop: 14,
              paddingHorizontal: 8,
            }}
          >
            {current.body}
          </Text>

          {current.bullets.length > 0 ? (
            <View
              style={{
                marginTop: 24,
                alignSelf: "stretch",
                paddingHorizontal: 16,
              }}
            >
              {current.bullets.map((b, i) => (
                <Animated.View
                  key={b}
                  entering={FadeInRight.duration(300).delay(120 + i * 80)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 6,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: current.accent,
                      marginRight: 12,
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: "#374151",
                    }}
                  >
                    {b}
                  </Text>
                </Animated.View>
              ))}
            </View>
          ) : null}
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* Dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
            marginBottom: 24,
          }}
        >
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === step ? 22 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === step ? current.accent : "#E5E7EB",
              }}
            />
          ))}
        </View>

        {/* Action area */}
        {isLast ? (
          <View style={{ paddingBottom: insets.bottom + 20, gap: 10 }}>
            <PrimaryButton
              title="I'm a Member — import a code"
              onPress={() => finish("/(tabs)/dashboard")}
              leftIcon={<Users size={16} color="#FFFFFF" />}
            />
            <Pressable
              onPress={() => finish("/(tabs)/leader")}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#F9FAFB" : "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              })}
            >
              <Zap size={16} color="#111827" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: "#111827",
                }}
              >
                I'm a Leader — start a schedule
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingBottom: insets.bottom + 20 }}>
            <PrimaryButton
              title="Continue"
              onPress={handleNext}
              leftIcon={<ChevronRight size={16} color="#FFFFFF" />}
            />
          </View>
        )}
      </View>
    </View>
  );
}
