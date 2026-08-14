import { useEffect, useMemo, useState } from 'react';

import { formatCountdownI18n, localeForLanguage, prayerName, useAppLanguage } from '@/lib/i18n';
import type { AppLanguage } from '@/lib/i18n/types';
import {
  formatTodayDate,
  getCurrentPrayerName,
  getNextPrayerFromSchedule,
  type PrayerTimeEntry,
} from '@/lib/prayer';
import { getPrayerLocationById } from '@/lib/prayer-locations';
import { fetchPrayerSchedule, getLocationSourceLabel } from '@/lib/prayer-schedule';
import { usePrayerStore } from '@/stores/prayerStore';

function localizeSchedule(entries: PrayerTimeEntry[], lang: AppLanguage) {
  return entries.map((entry) => ({
    ...entry,
    label: prayerName(lang, entry.name),
  }));
}

export function usePrayerSchedule() {
  const lang = useAppLanguage();
  const cityId = usePrayerStore((s) => s.cityId);
  const calculationMethod = usePrayerStore((s) => s.calculationMethod);
  const [now, setNow] = useState(() => new Date());
  const [schedule, setSchedule] = useState<PrayerTimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = getPrayerLocationById(cityId);

  const dateKey = location
    ? now.toLocaleDateString('en-CA', { timeZone: location.timeZone })
    : '';

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!location) {
      setSchedule([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPrayerSchedule(location, calculationMethod, new Date())
      .then((entries) => {
        if (!cancelled) setSchedule(entries);
      })
      .catch(() => {
        if (!cancelled) {
          setError('load');
          setSchedule([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location, calculationMethod, dateKey]);

  return useMemo(() => {
    if (!location) {
      return {
        location: null,
        city: null,
        schedule: [],
        next: null,
        current: 'none' as const,
        todayLabel: '',
        sourceLabel: '',
        loading: false,
        error: null,
      };
    }

    const localizedSchedule = localizeSchedule(schedule, lang);
    const next = getNextPrayerFromSchedule(localizedSchedule, now);

    return {
      location,
      city: location,
      schedule: localizedSchedule,
      next: next
        ? {
            ...next,
            label: prayerName(lang, next.name),
          }
        : null,
      current: getCurrentPrayerName(localizedSchedule, now),
      todayLabel: formatTodayDate(location.timeZone, localeForLanguage(lang)),
      sourceLabel: getLocationSourceLabel(location),
      loading,
      error,
    };
  }, [location, schedule, now, loading, error, lang]);
}
