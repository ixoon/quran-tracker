import type { ZikrLocaleMap } from '@/lib/zikr/locales/types';
import { zikrDe } from '@/lib/zikr/locales/de';
import { zikrTr } from '@/lib/zikr/locales/tr';
import { zikrFr } from '@/lib/zikr/locales/fr';
import { zikrAr } from '@/lib/zikr/locales/ar';
import { zikrId } from '@/lib/zikr/locales/id';

export type ZikrOverlayLang = 'de' | 'tr' | 'fr' | 'ar' | 'id';

export const ZIKR_ITEM_OVERLAYS: Partial<Record<ZikrOverlayLang, ZikrLocaleMap>> = {
  de: zikrDe,
  tr: zikrTr,
  fr: zikrFr,
  ar: zikrAr,
  id: zikrId,
};
