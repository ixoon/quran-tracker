import type { AppLanguage } from '@/lib/i18n/types';

export type LanguageOption = {
  id: AppLanguage;
  label: string;
  nativeLabel: string;
};

export const APP_LANGUAGES: LanguageOption[] = [
  { id: 'en', label: 'English', nativeLabel: 'English' },
  { id: 'bs', label: 'Bosnian', nativeLabel: 'Bosanski' },
  { id: 'tr', label: 'Turkish', nativeLabel: 'Türkçe' },
  { id: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { id: 'fr', label: 'French', nativeLabel: 'Français' },
  { id: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { id: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia' },
];

const TRANSLATION_BY_LANG: Record<AppLanguage, string> = {
  en: 'en.sahih',
  bs: 'bs.korkut',
  tr: 'tr.yazir',
  de: 'de.aburida',
  fr: 'fr.hamidullah',
  ar: 'en.sahih',
  id: 'id.indonesian',
};

const LOCALE_BY_LANG: Record<AppLanguage, string> = {
  en: 'en-US',
  bs: 'bs-BA',
  tr: 'tr-TR',
  de: 'de-DE',
  fr: 'fr-FR',
  ar: 'ar-SA',
  id: 'id-ID',
};

export function languageLabel(lang: AppLanguage): string {
  return APP_LANGUAGES.find((l) => l.id === lang)?.nativeLabel ?? lang;
}

export function translationIdForLanguage(lang: AppLanguage): string {
  return TRANSLATION_BY_LANG[lang] ?? 'en.sahih';
}

export function localeForLanguage(lang: AppLanguage): string {
  return LOCALE_BY_LANG[lang] ?? 'en-US';
}

export function isRtlLanguage(lang: AppLanguage): boolean {
  return lang === 'ar';
}
