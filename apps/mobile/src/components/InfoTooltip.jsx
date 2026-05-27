import { Pressable, Alert } from "react-native";
import { HelpCircle } from "lucide-react-native";
import { tapLight } from "@/lib/haptics";

export default function InfoTooltip({
  title,
  message,
  size = 14,
  color = "#9CA3AF",
}) {
  return (
    <Pressable
      onPress={() => {
        tapLight();
        Alert.alert(title, message);
      }}
      hitSlop={10}
    >
      <HelpCircle size={size} color={color} />
    </Pressable>
  );
}
