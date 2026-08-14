import { t } from '@/lib/i18n/strings';
import type { AppLanguage, StringKey } from '@/lib/i18n/types';
import { useSettingsStore } from '@/stores/settingsStore';

export {
  APP_LANGUAGES,
  isRtlLanguage,
  languageLabel,
  localeForLanguage,
  translationIdForLanguage,
} from '@/lib/i18n/languages';
export { getGuestCapabilities, getGuestLimitations } from '@/lib/i18n/guest';
export type { AppLanguage, AppTheme, StringKey } from '@/lib/i18n/types';
export { formatCountdownI18n, prayerName } from '@/lib/i18n/format';

export function useAppLanguage(): AppLanguage {
  return useSettingsStore((s) => s.appLanguage);
}

export function useStrings() {
  const lang = useAppLanguage();
  return (key: StringKey, params?: Record<string, string | number>) => t(lang, key, params);
}
