import type { PrayerName } from '@/lib/prayer';
import { t } from '@/lib/i18n/strings';
import type { AppLanguage, PrayerNameKey } from '@/lib/i18n/types';

const PRAYER_KEY: Record<PrayerName, PrayerNameKey> = {
  fajr: 'prayer.names.fajr',
  sunrise: 'prayer.names.sunrise',
  dhuhr: 'prayer.names.dhuhr',
  asr: 'prayer.names.asr',
  maghrib: 'prayer.names.maghrib',
  isha: 'prayer.names.isha',
};

export function prayerName(lang: AppLanguage, name: PrayerName): string {
  return t(lang, PRAYER_KEY[name]);
}

export function formatCountdownI18n(minutes: number, lang: AppLanguage): string {
  if (minutes <= 0) return t(lang, 'common.now');
  if (minutes < 60) return t(lang, 'common.min', { n: minutes });

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0
    ? t(lang, 'common.hoursMin', { h: hours, m: mins })
    : t(lang, 'common.hours', { n: hours });
}
