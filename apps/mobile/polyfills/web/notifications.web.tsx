import type {
  NotificationRequest,
  PermissionResponse,
} from "expo-notifications/src/Notifications.types";
import type { NotificationHandler } from "expo-notifications/src/NotificationsHandler";
import { toast } from "sonner-native";
import * as Notifications from "expo-notifications";
const { PermissionStatus } = Notifications;

const scheduledNotifications = new Map<
  string,
  {
    timeoutId: number;
    request: NotificationRequest;
  }
>();

export const registerForPushNotificationsAsync = async (): Promise<void> => {
  //no-op
};

export const addNotificationResponseReceivedListener = (
  listener: (notification: Notification) => void,
): void => {
  //no-op
};

export const removeNotificationSubscription = (
  subscription: Notifications.Subscription,
): void => {
  //no-op
};

export const addNotificationReceivedListener = (
  listener: (notification: Notification) => void,
): void => {
  //no-op
};

export const removeNotificationReceivedListener = (
  listener: (notification: Notification) => void,
): void => {
  //no-op
};

export const setNotificationChannelAsync = (
  channelId: string,
  channel: Notifications.NotificationChannelInput,
) => {
  //no-op
};

export const setNotificationHandler = (
  handler: NotificationHandler | null,
): void => {
  //no-op
};

export const getExpoPushTokenAsync = async (): Promise<string> => {
  return "expo-push-token";
};

export const getPermissionsAsync = async (): Promise<PermissionResponse> => {
  return {
    status: PermissionStatus.GRANTED,
    expires: "never",
    granted: true,
    canAskAgain: true,
  };
};

export const requestPermissionsAsync =
  async (): Promise<PermissionResponse> => {
    return {
      status: PermissionStatus.GRANTED,
      expires: "never",
      granted: true,
      canAskAgain: true,
    };
  };

export const scheduleNotificationAsync = async (
  notificationRequest: NotificationRequest,
): Promise<string> => {
  const { content, trigger } = notificationRequest;
  const { title, body } = content;

  let message = "";
  if (title && body) {
    message = `${title}\n${body}`;
  } else if (title) {
    message = title;
  } else if (body) {
    message = `Expo Go\n${body}`;
  } else {
    return "";
  }

  const identifier = Math.random().toString(36).substr(2, 9);

  const timeoutId = setTimeout(() => {
    toast(message);
    scheduledNotifications.delete(identifier);
  }, 1000);

  scheduledNotifications.set(identifier, {
    timeoutId,
    request: notificationRequest,
  });

  return identifier;
};

export const cancelAllScheduledNotificationsAsync = async (): Promise<void> => {
  for (const { timeoutId } of scheduledNotifications.values()) {
    clearTimeout(timeoutId);
  }
  scheduledNotifications.clear();
};

export const cancelScheduledNotificationAsync = async (
  identifier: string,
): Promise<void> => {
  const scheduledNotification = scheduledNotifications.get(identifier);
  if (scheduledNotification) {
    clearTimeout(scheduledNotification.timeoutId);
    scheduledNotifications.delete(identifier);
  }
};

export const getAllScheduledNotificationsAsync = async (): Promise<
  NotificationRequest[]
> => {
  return Array.from(scheduledNotifications.values()).map(
    ({ request }) => request,
  );
};
