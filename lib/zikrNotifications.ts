import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ZIKR_NOTIFICATION_PREFIX = 'zikr-';

export type ZikrNotificationSchedule = {
  morningEnabled: boolean;
  eveningEnabled: boolean;
  morningHour: number;
  morningMinute: number;
  eveningHour: number;
  eveningMinute: number;
};

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null | undefined;
let handlerConfigured = false;

function isNativePlatform() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

function canUseLocalNotifications() {
  return isNativePlatform() && !isExpoGo();
}

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (!canUseLocalNotifications()) return null;
  if (notificationsModule !== undefined) return notificationsModule;

  try {
    notificationsModule = await import('expo-notifications');

    if (!handlerConfigured) {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      handlerConfigured = true;
    }

    return notificationsModule;
  } catch {
    notificationsModule = null;
    return null;
  }
}

export function zikrNotificationsAvailable(): boolean {
  return canUseLocalNotifications();
}

export async function ensureZikrNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function cancelZikrNotifications() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const zikrIds = scheduled
    .filter((item) => item.identifier.startsWith(ZIKR_NOTIFICATION_PREFIX))
    .map((item) => item.identifier);

  await Promise.all(zikrIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

function formatTimeLabel(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m} ${period}`;
}

export function describeZikrSchedule(schedule: ZikrNotificationSchedule): {
  morning: string;
  evening: string;
} {
  return {
    morning: formatTimeLabel(schedule.morningHour, schedule.morningMinute),
    evening: formatTimeLabel(schedule.eveningHour, schedule.eveningMinute),
  };
}

export async function rescheduleZikrNotifications(schedule: ZikrNotificationSchedule) {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  await cancelZikrNotifications();

  if (!schedule.morningEnabled && !schedule.eveningEnabled) return;

  const granted = await ensureZikrNotificationPermissions();
  if (!granted) return;

  if (schedule.morningEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${ZIKR_NOTIFICATION_PREFIX}morning`,
      content: {
        title: 'Morning adhkar',
        body: 'Take a few minutes for your morning zikr from Hisn al-Muslim.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: schedule.morningHour,
        minute: schedule.morningMinute,
      },
    });
  }

  if (schedule.eveningEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${ZIKR_NOTIFICATION_PREFIX}evening`,
      content: {
        title: 'Evening adhkar',
        body: 'Time for your evening zikr — protection and remembrance before Maghrib.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: schedule.eveningHour,
        minute: schedule.eveningMinute,
      },
    });
  }
}
