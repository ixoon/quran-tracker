import { fetchAladhanPrayerSchedule, prefetchAladhanMonth } from '@/lib/aladhan-api';
import { fetchKosovoPrayerSchedule, prefetchKosovoPrayerData } from '@/lib/kosovo-prayer-api';
import type { PrayerCalculationMethodId } from '@/lib/prayer-methods';
import { resolveMethodForLocation } from '@/lib/prayer-methods';
import type { PrayerLocation } from '@/lib/prayer-locations';
import type { PrayerTimeEntry } from '@/lib/prayer';
import { fetchVaktijaPrayerSchedule, prefetchVaktijaMonth } from '@/lib/vaktija-api';
import { getVaktijaCityById } from '@/lib/vaktija-cities';

export function resolveScheduleMethod(
  location: PrayerLocation,
  userMethod?: PrayerCalculationMethodId | null,
): PrayerCalculationMethodId | null {
  if (location.source === 'vaktija' || location.source === 'kosovo-official') return null;
  return userMethod ?? resolveMethodForLocation(location.region, location.preferredMethod);
}

export async function fetchPrayerSchedule(
  location: PrayerLocation,
  methodId?: PrayerCalculationMethodId | null,
  date = new Date(),
): Promise<PrayerTimeEntry[]> {
  if (location.source === 'vaktija' && location.vaktijaId !== undefined) {
    const vaktijaCity = getVaktijaCityById(location.vaktijaId);
    if (!vaktijaCity) throw new Error('Unknown vaktija location');
    return fetchVaktijaPrayerSchedule(vaktijaCity, date);
  }

  if (location.source === 'kosovo-official') {
    return fetchKosovoPrayerSchedule(location, date);
  }

  const method = methodId ?? resolveMethodForLocation(location.region, location.preferredMethod);
  return fetchAladhanPrayerSchedule(location, method, date);
}

export async function prefetchPrayerData(
  location: PrayerLocation,
  methodId?: PrayerCalculationMethodId | null,
  date = new Date(),
): Promise<void> {
  if (location.source === 'vaktija' && location.vaktijaId !== undefined) {
    const vaktijaCity = getVaktijaCityById(location.vaktijaId);
    if (vaktijaCity) await prefetchVaktijaMonth(vaktijaCity, date);
    return;
  }

  if (location.source === 'kosovo-official') {
    await prefetchKosovoPrayerData();
    return;
  }

  const method = methodId ?? resolveMethodForLocation(location.region, location.preferredMethod);
  await prefetchAladhanMonth(location, method, date);
}

export function getLocationSourceLabel(location: PrayerLocation): string {
  if (location.source === 'vaktija') {
    return 'Official IZ BiH · vaktija.ba';
  }
  if (location.source === 'kosovo-official') {
    return 'Official BIK Kosovo takvim';
  }
  return 'Aladhan API · Hanafi Asr';
}
