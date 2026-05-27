import { View, Text } from "react-native";

export const OutlinePill = ({ children, dotColor, leftIcon }) => {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
      }}
    >
      {dotColor ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: dotColor,
          }}
        />
      ) : null}
      {leftIcon}
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 12,
          color: "#374151",
        }}
      >
        {children}
      </Text>
    </View>
  );
};

export const SoftActionPill = ({ children, leftIcon }) => {
  return (
    <View
      style={{
        backgroundColor: "#EFF6FF",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
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
        {children}
      </Text>
    </View>
  );
};
