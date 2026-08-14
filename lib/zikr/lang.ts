import type { AppLanguage } from '@/lib/i18n/types';

export {
  getZikrCategoryText,
  getZikrLocalizedText,
  zikrLangFromAppLanguage,
} from '@/lib/zikr/text';

/** @deprecated use zikrLangFromAppLanguage */
export function zikrLangFromTranslationId(translationId: string): AppLanguage {
  const lang = translationId.split('.')[0]?.toLowerCase();
  return lang === 'bs' ? 'bs' : 'en';
}
