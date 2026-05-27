import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
} from "lucide-react-native";
import { tapLight } from "@/lib/haptics";

const FAQS = [
  {
    q: "What's a Team Code?",
    a: "A Team Code is a small piece of text (starting with TEAM1-) that contains your entire alliance schedule. Leaders generate one in the Build tab, share it with their alliance, and members paste it in to instantly sync.",
  },
  {
    q: "Do you store our data?",
    a: "No. There are no servers and no accounts. Everything lives on your device. Team Codes are how schedules travel — copy-paste only, no cloud.",
  },
  {
    q: "How do notifications work?",
    a: "We schedule local push notifications on your device for every upcoming event. You don't need to keep the app open. Make sure notifications are enabled in iOS Settings.",
  },
  {
    q: 'What does the "Server offset" mean?',
    a: "It is the time zone your game server runs in (like +08:00 for an Asia server). The app uses this to convert server-time events into your local clock automatically.",
  },
  {
    q: "How does the QR code work?",
    a: "Tap Share Code in Build tab. Open the QR tab and let teammates scan it with their phone's camera. The link opens the app and imports the schedule.",
  },
  {
    q: "Why is my time off by a few minutes?",
    a: "Local notifications fire when iOS chooses, which can shift by a minute or two on a sleeping device. Use the lead time setting to add a buffer (e.g. alert 5 min before).",
  },
  {
    q: "Can I be in multiple alliances?",
    a: "Yes. Switch in Settings → Recent alliances. Your past schedules stay saved so you can hop between them.",
  },
  {
    q: "My code does not work, what now?",
    a: "Codes must start with TEAM1- (or older CAT1:). Copy the entire string — including the prefix. If you typed it manually, try the QR code instead.",
  },
];

const Item = ({ q, a, open, onToggle, index }) => (
  <Animated.View entering={FadeInDown.duration(240).delay(index * 40)}>
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => ({
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: pressed ? "#F9FAFB" : "#FFFFFF",
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text
          style={{
            flex: 1,
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: "#111827",
          }}
        >
          {q}
        </Text>
        {open ? (
          <ChevronUp size={16} color="#6B7280" />
        ) : (
          <ChevronDown size={16} color="#6B7280" />
        )}
      </View>
      {open ? (
        <Animated.View entering={FadeIn.duration(200)}>
          <Text
            style={{
              marginTop: 8,
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              color: "#6B7280",
              lineHeight: 20,
            }}
          >
            {a}
          </Text>
        </Animated.View>
      ) : null}
    </Pressable>
  </Animated.View>
);

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#EFF6FF", "#FAFAFA"]}
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <BookOpen size={14} color="#2563EB" />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                color: "#2563EB",
                letterSpacing: 0.6,
              }}
            >
              HELP & FAQ
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 30,
              color: "#111827",
              marginTop: 4,
              letterSpacing: -0.6,
            }}
          >
            How can we help?
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: "#6B7280",
              marginTop: 4,
            }}
          >
            Quick answers to common questions.
          </Text>
        </LinearGradient>

        <View
          style={{
            marginHorizontal: 20,
            marginTop: 12,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            overflow: "hidden",
          }}
        >
          {FAQS.map((faq, i) => (
            <View
              key={faq.q}
              style={{
                borderBottomWidth: i < FAQS.length - 1 ? 1 : 0,
                borderColor: "#F3F4F6",
              }}
            >
              <Item
                {...faq}
                index={i}
                open={openIdx === i}
                onToggle={() => {
                  tapLight();
                  setOpenIdx(openIdx === i ? -1 : i);
                }}
              />
            </View>
          ))}
        </View>

        <View
          style={{
            marginHorizontal: 20,
            marginTop: 16,
            padding: 16,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#EFF6FF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={18} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: "#111827",
              }}
            >
              Still stuck?
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: "#6B7280",
                marginTop: 2,
              }}
            >
              The app works fully offline. Ask your leader to send a fresh Team
              Code.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
