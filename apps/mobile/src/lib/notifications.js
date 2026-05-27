import * as Notifications from "expo-notifications";
import { getNextOccurrences } from "./schedule";
import { loadSettings } from "./storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async () => {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (e) {
    console.error("requestPermissions", e);
    return false;
  }
};

export const cancelAll = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error("cancelAll", e);
  }
};

// Resolve sound value: 'off' = no sound, everything else = default system sound
const resolveSound = (soundSetting) => {
  if (soundSetting === "off") return false;
  return true; // iOS plays the default system alert sound
};

export const scheduleAll = async (schedule) => {
  if (!schedule || !Array.isArray(schedule.events)) return 0;
  await cancelAll();
  const settings = await loadSettings();
  if (!settings.notificationsEnabled) return 0;

  const sound = resolveSound(settings.sound);
  const now = new Date();
  let count = 0;
  const perEvent = 8;

  for (const ev of schedule.events) {
    const occurrences = getNextOccurrences(ev, schedule.offset, perEvent, now);
    for (const date of occurrences) {
      const lead = Math.max(0, parseInt(ev.lead, 10) || 0);
      const fireAt = new Date(date.getTime() - lead * 60000);
      if (fireAt.getTime() <= now.getTime() + 5000) continue;
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${schedule.name}: ${ev.name}`,
            body:
              lead > 0 ? `Fires in ${lead} min — get ready.` : "Happening now.",
            sound,
          },
          trigger: fireAt,
        });
        count += 1;
        if (count >= 60) return count;
      } catch (e) {
        console.error("scheduleNotificationAsync", e);
      }
    }
  }
  return count;
};

export const sendTestNotification = async () => {
  const granted = await requestPermissions();
  if (!granted) return false;
  const settings = await loadSettings();
  const sound = resolveSound(settings.sound);
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test alert 🔔",
        body: sound
          ? "If you heard a sound and saw this — notifications are working perfectly."
          : "Notifications are working (silent mode is on).",
        sound,
      },
      trigger: { seconds: 5 },
    });
    return true;
  } catch (e) {
    console.error("sendTestNotification", e);
    return false;
  }
};
