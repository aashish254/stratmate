import { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("cat:onboardingComplete")
      .then((val) => {
        setDone(val === "true");
        setReady(true);
      })
      .catch(() => {
        setReady(true);
      });
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />;
  }

  return <Redirect href={done ? "/(tabs)/dashboard" : "/onboarding"} />;
}
