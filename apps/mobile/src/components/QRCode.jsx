import { View, Text } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { encodeQR } from "@/lib/qr";

export default function QRCode({
  value,
  size = 220,
  background = "#FFFFFF",
  color = "#0F172A",
}) {
  const encoded = encodeQR(value);

  if (!encoded) {
    return (
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: "#F9FAFB",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 12,
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          Code too long to fit in a QR. Use the text tab to share instead.
        </Text>
      </View>
    );
  }

  const { matrix, size: gridSize } = encoded;
  const padding = 8; // quiet zone modules
  const totalModules = gridSize + padding * 2;
  const moduleSize = size / totalModules;

  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: background,
        borderRadius: 12,
        padding: 0,
      }}
    >
      <Svg width={size} height={size}>
        <Rect x={0} y={0} width={size} height={size} fill={background} />
        {matrix.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <Rect
                key={`${y}-${x}`}
                x={(x + padding) * moduleSize}
                y={(y + padding) * moduleSize}
                width={moduleSize + 0.3}
                height={moduleSize + 0.3}
                fill={color}
              />
            ) : null,
          ),
        )}
      </Svg>
    </View>
  );
}
