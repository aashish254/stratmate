import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { View } from "react-native";

export default function FontsGate({ children }) {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!loaded && !error) {
    return <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />;
  }
  return children;
}
