import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { PrayerCalculationMethodId } from '@/lib/prayer-methods';
import type { PrayerLocation } from '@/lib/prayer-locations';
import { fetchPrayerSchedule } from '@/lib/prayer-schedule';

const PRAYER_NOTIFICATION_PREFIX = 'prayer-';
/** Remind this many minutes before each prayer. */
const PRAYER_LEAD_MINUTES = 10;

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

export async function ensureNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function cancelPrayerNotifications() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const prayerIds = scheduled
    .filter((item) => item.identifier.startsWith(PRAYER_NOTIFICATION_PREFIX))
    .map((item) => item.identifier);

  await Promise.all(
    prayerIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}

type ScheduleOptions = {
  location: PrayerLocation;
  methodId?: PrayerCalculationMethodId | null;
  enabled: boolean;
};

export async function reschedulePrayerNotifications({
  location,
  methodId,
  enabled,
}: ScheduleOptions) {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  await cancelPrayerNotifications();
  if (!enabled) return;

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  const now = new Date();
  const today = await fetchPrayerSchedule(location, methodId, now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowSchedule = await fetchPrayerSchedule(location, methodId, tomorrow);

  const entries = [...today, ...tomorrowSchedule].filter(
    (entry, index, all) =>
      entry.notify &&
      entry.time > now &&
      all.findIndex((e) => e.name === entry.name && e.time.getTime() === entry.time.getTime()) ===
        index,
  );

  for (const entry of entries) {
    const triggerTime = new Date(entry.time.getTime() - PRAYER_LEAD_MINUTES * 60 * 1000);
    if (triggerTime <= now) continue;

    const identifier = `${PRAYER_NOTIFICATION_PREFIX}${entry.name}-${PRAYER_LEAD_MINUTES}-${entry.time.toISOString()}`;

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `${entry.label} · ${PRAYER_LEAD_MINUTES} min`,
        body: `${entry.label} prayer in ${PRAYER_LEAD_MINUTES} minutes (${location.name}).`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerTime,
      },
    });
  }
}
