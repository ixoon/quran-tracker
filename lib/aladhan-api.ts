import { TZDate } from '@date-fns/tz';

import type { PrayerCalculationMethodId } from '@/lib/prayer-methods';
import type { PrayerLocation } from '@/lib/prayer-locations';
import type { PrayerName, PrayerTimeEntry } from '@/lib/prayer';
import { formatPrayerTime } from '@/lib/prayer';
import { getCachedRaw, setCachedRaw } from '@/lib/quran-cache';

const ALADHAN_BASE = 'https://api.aladhan.com/v1';

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

const ALADHAN_KEYS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

type AladhanTimingsResponse = {
  code: number;
  data: {
    timings: Record<string, string>;
    meta?: { timezone?: string };
  };
};

type AladhanCalendarResponse = {
  code: number;
  data: AladhanTimingsResponse['data'][];
};

function datePartsInTimeZone(date: Date, timeZone: string) {
  const ymd = date.toLocaleDateString('en-CA', { timeZone });
  const [year, month, day] = ymd.split('-').map(Number);
  return { year, month, day };
}

function formatAladhanDate(year: number, month: number, day: number) {
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  return `${dd}-${mm}-${year}`;
}

function aladhanDayCacheKey(
  location: PrayerLocation,
  methodId: PrayerCalculationMethodId,
  year: number,
  month: number,
  day: number,
) {
  return `aladhan:${location.latitude}:${location.longitude}:${methodId}:${year}-${month}-${day}`;
}

function aladhanMonthCacheKey(
  location: PrayerLocation,
  methodId: PrayerCalculationMethodId,
  year: number,
  month: number,
) {
  return `aladhan-month:${location.latitude}:${location.longitude}:${methodId}:${year}-${month}`;
}

function buildAladhanParams(methodId: PrayerCalculationMethodId, minuteOffset = 0) {
  const tuneBase = [0, 0, 0, 0, 0, 0, 0, 0];
  if (minuteOffset !== 0) {
    for (let i = 0; i < tuneBase.length; i += 1) tuneBase[i] = minuteOffset;
  }

  switch (methodId) {
    case 'bikKosovo':
      tuneBase[1] = 6 + minuteOffset;
      tuneBase[6] = 6 + minuteOffset;
      if (minuteOffset !== 0) {
        tuneBase[2] = minuteOffset;
        tuneBase[3] = minuteOffset;
        tuneBase[4] = minuteOffset;
        tuneBase[5] = minuteOffset;
      }
      return { method: 99, methodSettings: '18,null,17', tune: tuneBase.join(',') };
    case 'turkey':
      return { method: 13, tune: tuneBase.join(',') };
    case 'karachi':
      return { method: 1, tune: tuneBase.join(',') };
    case 'egyptian':
      return { method: 5, tune: tuneBase.join(',') };
    case 'moonsightingCommittee':
      return { method: 15, tune: tuneBase.join(',') };
    case 'muslimWorldLeague':
    default:
      return { method: 3, tune: tuneBase.join(',') };
  }
}

function stripTimezoneSuffix(time: string): string {
  return time.split(' ')[0].trim();
}

function parseTimings(
  timings: Record<string, string>,
  timeZone: string,
  year: number,
  month: number,
  day: number,
): PrayerTimeEntry[] {
  const order: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  return order.map((name) => {
    const raw = stripTimezoneSuffix(timings[ALADHAN_KEYS[name]] ?? '0:00');
    const [hour, minute] = raw.split(':').map((part) => parseInt(part, 10));
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

function buildTimingsUrl(
  location: PrayerLocation,
  methodId: PrayerCalculationMethodId,
  year: number,
  month: number,
  day: number,
) {
  const params = buildAladhanParams(methodId, location.minuteOffset ?? 0);
  const query = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    method: String(params.method),
    school: '1',
    timezonestring: location.timeZone,
  });

  if (params.methodSettings) query.set('methodSettings', params.methodSettings);
  if (params.tune && params.tune !== '0,0,0,0,0,0,0,0') query.set('tune', params.tune);

  return `${ALADHAN_BASE}/timings/${formatAladhanDate(year, month, day)}?${query}`;
}

function buildCalendarUrl(
  location: PrayerLocation,
  methodId: PrayerCalculationMethodId,
  year: number,
  month: number,
) {
  const params = buildAladhanParams(methodId, location.minuteOffset ?? 0);
  const query = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    method: String(params.method),
    school: '1',
    timezonestring: location.timeZone,
  });

  if (params.methodSettings) query.set('methodSettings', params.methodSettings);
  if (params.tune && params.tune !== '0,0,0,0,0,0,0,0') query.set('tune', params.tune);

  return `${ALADHAN_BASE}/calendar/${year}/${month}?${query}`;
}

export async function fetchAladhanPrayerSchedule(
  location: PrayerLocation,
  methodId: PrayerCalculationMethodId,
  date = new Date(),
): Promise<PrayerTimeEntry[]> {
  const { year, month, day } = datePartsInTimeZone(date, location.timeZone);
  const dayKey = aladhanDayCacheKey(location, methodId, year, month, day);

  const cached = await getCachedRaw(dayKey);
  if (cached) {
    const data = JSON.parse(cached) as AladhanTimingsResponse['data'];
    return parseTimings(data.timings, location.timeZone, year, month, day);
  }

  const monthKey = aladhanMonthCacheKey(location, methodId, year, month);
  const cachedMonth = await getCachedRaw(monthKey);

  if (cachedMonth) {
    const calendar = JSON.parse(cachedMonth) as AladhanCalendarResponse;
    const dayEntry = calendar.data[day - 1];
    if (dayEntry?.timings) {
      await setCachedRaw(dayKey, JSON.stringify(dayEntry));
      return parseTimings(dayEntry.timings, location.timeZone, year, month, day);
    }
  }

  const res = await fetch(buildTimingsUrl(location, methodId, year, month, day));
  if (!res.ok) throw new Error('Failed to fetch prayer times from Aladhan');

  const json = (await res.json()) as AladhanTimingsResponse;
  if (json.code !== 200 || !json.data?.timings) {
    throw new Error('Invalid prayer times response from Aladhan');
  }

  await setCachedRaw(dayKey, JSON.stringify(json.data));
  return parseTimings(json.data.timings, location.timeZone, year, month, day);
}

export async function prefetchAladhanMonth(
  location: PrayerLocation,
  methodId: PrayerCalculationMethodId,
  date = new Date(),
) {
  const { year, month } = datePartsInTimeZone(date, location.timeZone);
  const monthKey = aladhanMonthCacheKey(location, methodId, year, month);

  const cached = await getCachedRaw(monthKey);
  if (cached) return;

  const res = await fetch(buildCalendarUrl(location, methodId, year, month));
  if (!res.ok) return;

  const json = (await res.json()) as AladhanCalendarResponse;
  if (json.code !== 200 || !json.data?.length) return;

  await setCachedRaw(monthKey, JSON.stringify(json));
}
