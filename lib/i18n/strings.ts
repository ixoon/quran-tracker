import { en } from '@/lib/i18n/locales/en';
import { bs } from '@/lib/i18n/locales/bs';
import type { AppLanguage, StringKey } from '@/lib/i18n/types';

import { ar } from './locales/ar';
import { de } from './locales/de';
import { fr } from './locales/fr';
import { id } from './locales/id';
import { tr } from './locales/tr';

export type TranslateParams = Record<string, string | number>;

const STRINGS: Record<AppLanguage, Record<StringKey, string>> = {
  en,
  bs,
  tr,
  de,
  fr,
  ar,
  id,
};

export function t(lang: AppLanguage, key: StringKey, params?: TranslateParams): string {
  let text = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
    }
  }
  return text;
}
