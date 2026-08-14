import { Coordinates, PrayerTimes } from 'adhan';

import type { PrayerCalculationMethodId } from '@/lib/prayer-methods';
import { buildCalculationParameters } from '@/lib/prayer-methods';
import type { PrayerLocation } from '@/lib/prayer-locations';
import type { PrayerName, PrayerTimeEntry } from '@/lib/prayer';
import { formatPrayerTime } from '@/lib/prayer';

const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

const PRAYER_NOTIFY: Record<PrayerName, boolean> = {
  fajr: true,
  sunrise: false,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

function datePartsInTimeZone(date: Date, timeZone: string) {
  const ymd = date.toLocaleDateString('en-CA', { timeZone });
  const [year, month, day] = ymd.split('-').map(Number);
  return { year, month, day };
}

export function computePrayerSchedule(
  location: PrayerLocation,
  methodId: PrayerCalculationMethodId,
  date = new Date(),
): PrayerTimeEntry[] {
  const { year, month, day } = datePartsInTimeZone(date, location.timeZone);
  const localDate = new Date(year, month - 1, day);

  const params = buildCalculationParameters(
    methodId,
    location.latitude,
    location.longitude,
    location.minuteOffset ?? 0,
  );

  const times = new PrayerTimes(
    new Coordinates(location.latitude, location.longitude),
    localDate,
    params,
  );

  const entries: { name: PrayerName; time: Date }[] = [
    { name: 'fajr', time: times.fajr },
    { name: 'sunrise', time: times.sunrise },
    { name: 'dhuhr', time: times.dhuhr },
    { name: 'asr', time: times.asr },
    { name: 'maghrib', time: times.maghrib },
    { name: 'isha', time: times.isha },
  ];

  return entries.map(({ name, time }) => ({
    name,
    label: PRAYER_LABELS[name],
    time,
    formatted: formatPrayerTime(time, location.timeZone),
    notify: PRAYER_NOTIFY[name],
  }));
}
