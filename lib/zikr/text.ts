import type { AppLanguage } from '@/lib/i18n/types';

import { ZIKR_ITEM_OVERLAYS, type ZikrOverlayLang } from '@/lib/zikr/locales';

export type ZikrLang = AppLanguage;

export type ZikrLocalizedText = Partial<Record<AppLanguage, string>> & { en: string };

const FALLBACK_ORDER: AppLanguage[] = ['bs', 'en'];

export function zikrLangFromAppLanguage(lang: AppLanguage): AppLanguage {
  return lang;
}

function isOverlayLang(lang: AppLanguage): lang is ZikrOverlayLang {
  return lang === 'de' || lang === 'tr' || lang === 'fr' || lang === 'ar' || lang === 'id';
}

export function getZikrLocalizedText(
  itemId: string,
  field: 'translation' | 'virtue',
  base: Partial<Record<AppLanguage, string>> | undefined,
  lang: AppLanguage,
): string {
  if (isOverlayLang(lang)) {
    const overlay = ZIKR_ITEM_OVERLAYS[lang]?.[itemId]?.[field];
    if (overlay) return overlay;
  }

  if (base?.[lang]) return base[lang]!;

  for (const fallback of FALLBACK_ORDER) {
    if (isOverlayLang(fallback)) {
      const overlay = ZIKR_ITEM_OVERLAYS[fallback]?.[itemId]?.[field];
      if (overlay) return overlay;
    }
    if (base?.[fallback]) return base[fallback]!;
  }

  return base?.en ?? '';
}

export function getZikrCategoryText(texts: ZikrLocalizedText, lang: AppLanguage): string {
  if (texts[lang]) return texts[lang]!;
  for (const fallback of FALLBACK_ORDER) {
    if (texts[fallback]) return texts[fallback]!;
  }
  return texts.en;
}
