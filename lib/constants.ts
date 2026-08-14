import type { EditionOption, ReciterOption } from '@/lib/quran-types';

export const TOTAL_PAGES = 604;

export const ARABIC_EDITION = 'quran-uthmani';

export const TRANSLATIONS: EditionOption[] = [
  { id: 'en.sahih', label: 'Saheeh International' },
  { id: 'en.pickthall', label: 'Pickthall' },
  { id: 'en.yusufali', label: 'Yusuf Ali' },
  { id: 'en.asad', label: 'Muhammad Asad' },
  { id: 'bs.korkut', label: 'Besim Korkut (Bosnian)' },
];

export const DEFAULT_TRANSLATION_ID = 'en.sahih';

export const RECITERS: ReciterOption[] = [
  { id: 'ar.alafasy', label: 'Mishary Alafasy' },
  { id: 'ar.husary', label: 'Mahmoud Khalil Al-Husary' },
  { id: 'ar.mahermuaiqly', label: 'Maher Al Muaiqly' },
  { id: 'ar.abdulbasitmurattal', label: 'Abdul Basit (Murattal)' },
  { id: 'ar.shaatree', label: 'Abu Bakr Ash-Shaatree' },
];

export const DEFAULT_RECITER_ID = 'ar.alafasy';

export const SURAH_LIST_CACHE_KEY = 'quran_cache:surah-list';

/** Public privacy policy (GitHub Pages). Enable: repo Settings → Pages → main → /docs */
export const PRIVACY_POLICY_URL = 'https://ixoon.github.io/quran-tracker/privacy-policy';
