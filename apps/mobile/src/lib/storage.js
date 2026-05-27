import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "cat:schedule";
const SETTINGS_KEY = "cat:settings";
const RECENT_KEY = "cat:recentAlliances";
const SNOOZE_KEY = "cat:snoozed";
const DONE_KEY = "cat:done";
const ONBOARDING_KEY = "cat:onboardingComplete";
const ALLIANCE_PREFIX = "cat:alliance:";

const slug = (name) =>
  (name || "unnamed")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const DEMO_SCHEDULE = {
  v: 1,
  name: "Northern Hawks",
  offset: "+08:00",
  isDemo: true,
  events: [
    {
      id: "e1",
      name: "Shield Drop",
      category: "Defense",
      anchor: "00:00",
      interval: 240,
      duration: 30,
      lead: 5,
    },
    {
      id: "e2",
      name: "Boss Wave",
      category: "Combat",
      anchor: "02:00",
      interval: 360,
      duration: 20,
      lead: 10,
    },
    {
      id: "e3",
      name: "Resource Reset",
      category: "Economy",
      anchor: "06:00",
      interval: 480,
      duration: 0,
      lead: 5,
    },
    {
      id: "e4",
      name: "Server War",
      category: "Combat",
      anchor: "20:00",
      interval: 1440,
      duration: 60,
      lead: 15,
    },
  ],
};

export const loadSchedule = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEMO_SCHEDULE;
    return JSON.parse(raw);
  } catch (e) {
    console.error("loadSchedule", e);
    return DEMO_SCHEDULE;
  }
};

export const saveSchedule = async (schedule) => {
  try {
    const clean = { ...schedule, isDemo: false };
    await AsyncStorage.setItem(KEY, JSON.stringify(clean));
    // Also save under per-alliance key for multi-alliance switching
    if (clean.name) {
      await AsyncStorage.setItem(
        `${ALLIANCE_PREFIX}${slug(clean.name)}`,
        JSON.stringify(clean),
      );
    }
    await addRecentAlliance(clean);
  } catch (e) {
    console.error("saveSchedule", e);
  }
};

export const clearSchedule = async () => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.error("clearSchedule", e);
  }
};

export const switchToAlliance = async (name) => {
  try {
    const raw = await AsyncStorage.getItem(`${ALLIANCE_PREFIX}${slug(name)}`);
    if (!raw) return null;
    const config = JSON.parse(raw);
    await AsyncStorage.setItem(KEY, JSON.stringify(config));
    await addRecentAlliance(config);
    return config;
  } catch (e) {
    console.error("switchToAlliance", e);
    return null;
  }
};

export const isDemoSchedule = (s) => Boolean(s && s.isDemo);

const defaultSettings = () => ({
  notificationsEnabled: true,
  sound: "default",
  quietStart: "23:00",
  quietEnd: "07:00",
});

export const loadSettings = async () => {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch (e) {
    return defaultSettings();
  }
};

export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("saveSettings", e);
  }
};

export const loadRecentAlliances = async () => {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const addRecentAlliance = async (schedule) => {
  try {
    if (!schedule || !schedule.name) return;
    const list = await loadRecentAlliances();
    const filtered = list.filter((s) => s.name !== schedule.name);
    const next = [
      {
        name: schedule.name,
        offset: schedule.offset,
        savedAt: Date.now(),
        eventCount: (schedule.events || []).length,
      },
      ...filtered,
    ].slice(0, 5);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch (e) {
    console.error("addRecentAlliance", e);
  }
};

export const loadSnoozedMap = async () => {
  try {
    const raw = await AsyncStorage.getItem(SNOOZE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
};

export const setSnoozed = async (eventId, untilMs) => {
  try {
    const map = await loadSnoozedMap();
    map[eventId] = untilMs;
    await AsyncStorage.setItem(SNOOZE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("setSnoozed", e);
  }
};

export const loadDoneMap = async () => {
  try {
    const raw = await AsyncStorage.getItem(DONE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
};

export const markDone = async (eventId, cycleStartMs) => {
  try {
    const map = await loadDoneMap();
    map[eventId] = cycleStartMs;
    await AsyncStorage.setItem(DONE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("markDone", e);
  }
};

export const isOnboardingComplete = async () => {
  try {
    const v = await AsyncStorage.getItem(ONBOARDING_KEY);
    return v === "true";
  } catch (e) {
    return false;
  }
};

export const setOnboardingComplete = async (val) => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, val ? "true" : "false");
  } catch (e) {
    console.error("setOnboardingComplete", e);
  }
};
