import { useState } from "react";
import { View, Text, Pressable, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  Copy,
  Share2,
  QrCode as QrIcon,
  Check,
  Type,
} from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { success as hapSuccess, tapLight } from "@/lib/haptics";
import QRCode from "./QRCode";

const TabButton = ({ active, label, icon, onPress }) => (
  <Pressable
    onPress={onPress}
    style={{
      flex: 1,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderBottomWidth: 2,
      borderColor: active ? "#2563EB" : "transparent",
    }}
  >
    {icon}
    <Text
      style={{
        fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
        fontSize: 13,
        color: active ? "#111827" : "#6B7280",
      }}
    >
      {label}
    </Text>
  </Pressable>
);

export default function ShareCodeCard({ code, teamId }) {
  const [tab, setTab] = useState("qr");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    tapLight();
    await Clipboard.setStringAsync(code);
    hapSuccess();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    tapLight();
    try {
      await Share.share({
        message: `Join my alliance schedule (Team ID: ${teamId}). Paste this in the app:\n\n${code}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(360)}
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        shadowColor: "#0F172A",
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
      }}
    >
      <LinearGradient
        colors={["#EFF6FF", "#FFFFFF"]}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 18,
          borderBottomWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 11,
            color: "#2563EB",
            letterSpacing: 0.6,
          }}
        >
          YOUR TEAM CODE
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            gap: 10,
            marginTop: 2,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 22,
              color: "#111827",
              letterSpacing: -0.5,
            }}
          >
            {teamId}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              color: "#9CA3AF",
            }}
          >
            · Team ID
          </Text>
        </View>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            color: "#6B7280",
            marginTop: 4,
          }}
        >
          Share the QR or text below with your alliance
        </Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={{ flexDirection: "row" }}>
        <TabButton
          active={tab === "qr"}
          label="QR Code"
          icon={
            <QrIcon size={14} color={tab === "qr" ? "#111827" : "#6B7280"} />
          }
          onPress={() => {
            tapLight();
            setTab("qr");
          }}
        />
        <TabButton
          active={tab === "code"}
          label="Text"
          icon={
            <Type size={14} color={tab === "code" ? "#111827" : "#6B7280"} />
          }
          onPress={() => {
            tapLight();
            setTab("code");
          }}
        />
      </View>

      {/* Body */}
      <View style={{ padding: 18 }}>
        {tab === "qr" ? (
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                padding: 16,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <QRCode value={code} size={220} />
            </View>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: "#6B7280",
                textAlign: "center",
                marginTop: 12,
              }}
            >
              Teammates open the app and scan this with their camera.
            </Text>
          </View>
        ) : (
          <View
            style={{
              borderRadius: 12,
              backgroundColor: "#F9FAFB",
              padding: 14,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text
              selectable
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                color: "#374151",
                lineHeight: 19,
              }}
            >
              {code}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
          <Pressable
            onPress={handleCopy}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: copied ? "#10B981" : "#E5E7EB",
              backgroundColor: copied ? "#ECFDF5" : "#FFFFFF",
              borderRadius: 12,
              paddingVertical: 13,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {copied ? (
              <Check size={16} color="#047857" />
            ) : (
              <Copy size={16} color="#111827" />
            )}
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: copied ? "#047857" : "#111827",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleShare}
            style={{
              flex: 1,
              backgroundColor: "#2563EB",
              borderRadius: 12,
              paddingVertical: 13,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Share2 size={16} color="#FFFFFF" />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: "#FFFFFF",
              }}
            >
              Share
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
