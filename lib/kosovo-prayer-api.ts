import { TZDate } from '@date-fns/tz';

import type { PrayerLocation } from '@/lib/prayer-locations';
import type { PrayerName, PrayerTimeEntry } from '@/lib/prayer';
import { formatPrayerTime } from '@/lib/prayer';
import { getCachedRaw, setCachedRaw } from '@/lib/quran-cache';

const KOSOVO_JSON_URL =
  'https://raw.githubusercontent.com/drilonjaha/kohet-e-namazit-kosove-json/main/kosovo-prayer-times.min.json';

const KOSOVO_CACHE_KEY = 'kosovo-prayer:official';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

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

type KosovoDayEntry = {
  day: number;
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

type KosovoPrayerData = {
  metadata: {
    year: number;
    timezone?: { name?: string };
    city_offsets_minutes?: Record<string, number>;
  };
  prayer_times: Record<string, KosovoDayEntry[]>;
};

let memoryCache: KosovoPrayerData | null = null;

function datePartsInTimeZone(date: Date, timeZone: string) {
  const ymd = date.toLocaleDateString('en-CA', { timeZone });
  const [year, month, day] = ymd.split('-').map(Number);
  return { year, month, day };
}

function applyMinuteOffset(time: string, offsetMinutes: number): string {
  if (offsetMinutes === 0) return time;

  const [hour, minute] = time.split(':').map((part) => parseInt(part, 10));
  let total = hour * 60 + minute + offsetMinutes;
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

function resolveCityOffset(location: PrayerLocation, data: KosovoPrayerData): number {
  if (location.bikOffsetKey && data.metadata.city_offsets_minutes) {
    const fromKey = data.metadata.city_offsets_minutes[location.bikOffsetKey];
    if (fromKey !== undefined) return fromKey;
  }
  return location.minuteOffset ?? 0;
}

async function loadKosovoData(): Promise<KosovoPrayerData> {
  if (memoryCache) return memoryCache;

  const cached = await getCachedRaw(KOSOVO_CACHE_KEY);
  if (cached) {
    memoryCache = JSON.parse(cached) as KosovoPrayerData;
    return memoryCache;
  }

  const res = await fetch(KOSOVO_JSON_URL);
  if (!res.ok) throw new Error('Failed to fetch official Kosovo prayer times');

  const data = (await res.json()) as KosovoPrayerData;
  await setCachedRaw(KOSOVO_CACHE_KEY, JSON.stringify(data));
  memoryCache = data;
  return data;
}

function parseKosovoDay(
  dayEntry: KosovoDayEntry,
  timeZone: string,
  offsetMinutes: number,
): PrayerTimeEntry[] {
  const [year, month, day] = dayEntry.date.split('-').map(Number);
  const rawTimes: Record<PrayerName, string> = {
    fajr: applyMinuteOffset(dayEntry.fajr, offsetMinutes),
    sunrise: applyMinuteOffset(dayEntry.sunrise, offsetMinutes),
    dhuhr: applyMinuteOffset(dayEntry.dhuhr, offsetMinutes),
    asr: applyMinuteOffset(dayEntry.asr, offsetMinutes),
    maghrib: applyMinuteOffset(dayEntry.maghrib, offsetMinutes),
    isha: applyMinuteOffset(dayEntry.isha, offsetMinutes),
  };

  return (Object.keys(rawTimes) as PrayerName[]).map((name) => {
    const [hour, minute] = rawTimes[name].split(':').map((part) => parseInt(part, 10));
    const tzDate = new TZDate(year, month - 1, day, hour, minute, 0, timeZone);
    const time = new Date(tzDate.getTime());

    return {
      name,
      label: PRAYER_LABELS[name],
      time,
      formatted: formatPrayerTime(time, timeZone),
      notify: PRAYER_NOTIFY[name],
    };
  });
}

export async function fetchKosovoPrayerSchedule(
  location: PrayerLocation,
  date = new Date(),
): Promise<PrayerTimeEntry[]> {
  const data = await loadKosovoData();
  const timeZone = data.metadata.timezone?.name ?? location.timeZone;
  const { year, month, day } = datePartsInTimeZone(date, timeZone);

  if (year !== data.metadata.year) {
    throw new Error(`Official Kosovo times are only available for ${data.metadata.year}`);
  }

  const monthName = MONTH_NAMES[month - 1];
  const monthDays = data.prayer_times[monthName];
  const dayEntry = monthDays?.find((entry) => entry.day === day);

  if (!dayEntry) throw new Error('Missing day in official Kosovo prayer data');

  const offset = resolveCityOffset(location, data);
  return parseKosovoDay(dayEntry, timeZone, offset);
}

export async function prefetchKosovoPrayerData() {
  await loadKosovoData();
}
