import { TZDate } from '@date-fns/tz';

import { getCachedRaw, setCachedRaw } from '@/lib/quran-cache';
import type { PrayerName, PrayerTimeEntry } from '@/lib/prayer';
import { formatPrayerTime } from '@/lib/prayer';
import type { VaktijaCity } from '@/lib/vaktija-cities';

const VAKTIJA_BASE = 'https://api.vaktija.ba/vaktija/v1';

const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

const PRAYER_ORDER: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_NOTIFY: Record<PrayerName, boolean> = {
  fajr: true,
  sunrise: false,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

type VaktijaMonthResponse = {
  id: number;
  lokacija: string;
  godina: number;
  mjesec: number;
  dan: { vakat: string[] }[];
};

type VaktijaDayResponse = {
  id: number;
  lokacija: string;
  vakat: string[];
};

function monthCacheKey(locationId: number, year: number, month: number) {
  return `vaktija:${locationId}:${year}:${month}`;
}

function datePartsInTimeZone(date: Date, timeZone: string) {
  const ymd = date.toLocaleDateString('en-CA', { timeZone });
  const [year, month, day] = ymd.split('-').map(Number);
  return { year, month, day };
}

function parseVakatTimes(vakat: string[], city: VaktijaCity, year: number, month: number, day: number): PrayerTimeEntry[] {
  return PRAYER_ORDER.map((name, index) => {
    const [hour, minute] = vakat[index].split(':').map((part) => parseInt(part, 10));
    const tzDate = new TZDate(year, month - 1, day, hour, minute, 0, city.timeZone);
    const time = new Date(tzDate.getTime());

    return {
      name,
      label: PRAYER_LABELS[name],
      time,
      formatted: formatPrayerTime(time, city.timeZone),
      notify: PRAYER_NOTIFY[name],
    };
  });
}

async function fetchMonthData(
  locationId: number,
  year: number,
  month: number,
): Promise<VaktijaMonthResponse> {
  const cacheKey = monthCacheKey(locationId, year, month);
  const cached = await getCachedRaw(cacheKey);
  if (cached) return JSON.parse(cached) as VaktijaMonthResponse;

  const res = await fetch(`${VAKTIJA_BASE}/${locationId}/${year}/${month}`);
  if (!res.ok) throw new Error('Failed to fetch prayer times from vaktija.ba');

  const data = (await res.json()) as VaktijaMonthResponse;
  await setCachedRaw(cacheKey, JSON.stringify(data));
  return data;
}

async function fetchTodayFallback(locationId: number): Promise<string[]> {
  const res = await fetch(`${VAKTIJA_BASE}/${locationId}`);
  if (!res.ok) throw new Error('Failed to fetch prayer times from vaktija.ba');

  const data = (await res.json()) as VaktijaDayResponse;
  return data.vakat;
}

export async function fetchVaktijaPrayerSchedule(
  city: VaktijaCity,
  date = new Date(),
): Promise<PrayerTimeEntry[]> {
  const { year, month, day } = datePartsInTimeZone(date, city.timeZone);

  try {
    const monthData = await fetchMonthData(city.id, year, month);
    const dayEntry = monthData.dan[day - 1];
    if (!dayEntry?.vakat) throw new Error('Missing day in vaktija month data');
    return parseVakatTimes(dayEntry.vakat, city, year, month, day);
  } catch {
    const vakat = await fetchTodayFallback(city.id);
    return parseVakatTimes(vakat, city, year, month, day);
  }
}

export async function prefetchVaktijaMonth(city: VaktijaCity, date = new Date()) {
  const { year, month } = datePartsInTimeZone(date, city.timeZone);
  await fetchMonthData(city.id, year, month);
}
