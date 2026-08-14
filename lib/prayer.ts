import { differenceInMinutes } from 'date-fns';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerTimeEntry = {
  name: PrayerName;
  label: string;
  time: Date;
  formatted: string;
  notify: boolean;
};

export function formatPrayerTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(date);
}

export function formatTodayDate(timeZone: string, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone,
  }).format(new Date());
}

export function getCurrentPrayerName(
  schedule: PrayerTimeEntry[],
  now = new Date(),
): PrayerName | 'none' {
  let current: PrayerName | 'none' = 'none';

  for (const entry of schedule) {
    if (entry.time <= now) {
      current = entry.name;
    } else {
      break;
    }
  }

  return current;
}

export type NextPrayerInfo = {
  name: PrayerName;
  label: string;
  time: Date;
  formatted: string;
  minutesUntil: number;
};

export function getNextPrayerFromSchedule(
  schedule: PrayerTimeEntry[],
  now = new Date(),
): NextPrayerInfo | null {
  const upcoming = schedule.find((entry) => entry.notify && entry.time > now);
  if (!upcoming) return null;

  return {
    name: upcoming.name,
    label: upcoming.label,
    time: upcoming.time,
    formatted: upcoming.formatted,
    minutesUntil: Math.max(0, differenceInMinutes(upcoming.time, now)),
  };
}

export function formatCountdown(minutes: number): string {
  if (minutes <= 0) return 'Now';
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
