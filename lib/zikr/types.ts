import type { AppLanguage } from '@/lib/i18n/types';

export type ZikrLang = AppLanguage;

export type ZikrCategoryId =
  | 'morning'
  | 'evening'
  | 'sleep'
  | 'waking'
  | 'protection'
  | 'after-prayer'
  | 'general'
  | 'distress'
  | 'travel'
  | 'eating'
  | 'mosque'
  | 'wudu';

export type ZikrLocalizedText = Partial<Record<AppLanguage, string>> & { en: string };

export type ZikrCategory = {
  id: ZikrCategoryId;
  icon:
    | 'sun-o'
    | 'moon-o'
    | 'bed'
    | 'bell-o'
    | 'shield'
    | 'check-circle'
    | 'repeat'
    | 'heart'
    | 'plane'
    | 'cutlery'
    | 'building'
    | 'tint';
  title: ZikrLocalizedText;
  description: ZikrLocalizedText;
};

export type ZikrItem = {
  id: string;
  categoryId: ZikrCategoryId;
  arabic: string;
  transliteration: string;
  translation: ZikrLocalizedText;
  reference?: string;
  repeat?: number;
  virtue?: Partial<Record<AppLanguage, string>> & { en: string };
};
