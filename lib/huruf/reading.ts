import type { ReadingCategory, ReadingItem } from '@/lib/huruf/types';

/** Letter + vowel syllables and short words for reading practice */
export const READING_ITEMS: ReadingItem[] = [
  // ─── Fatha (a) syllables ───────────────────────────────────
  { id: 's-ba', arabic: 'بَ', transliteration: 'ba', hint: 'Ba + fatha', category: 'syllable' },
  { id: 's-ta', arabic: 'تَ', transliteration: 'ta', hint: 'Ta + fatha', category: 'syllable' },
  { id: 's-ja', arabic: 'جَ', transliteration: 'ja', hint: 'Jim + fatha', category: 'syllable' },
  { id: 's-da', arabic: 'دَ', transliteration: 'da', hint: 'Dal + fatha', category: 'syllable' },
  { id: 's-ra', arabic: 'رَ', transliteration: 'ra', hint: 'Ra + fatha', category: 'syllable' },
  { id: 's-sa', arabic: 'سَ', transliteration: 'sa', hint: 'Sin + fatha', category: 'syllable' },
  { id: 's-la', arabic: 'لَ', transliteration: 'la', hint: 'Lam + fatha', category: 'syllable' },
  { id: 's-ma', arabic: 'مَ', transliteration: 'ma', hint: 'Mim + fatha', category: 'syllable' },
  { id: 's-na', arabic: 'نَ', transliteration: 'na', hint: 'Nun + fatha', category: 'syllable' },
  { id: 's-ha', arabic: 'حَ', transliteration: 'ḥa', hint: 'Ha + fatha', category: 'syllable' },

  // ─── Kasra (i) syllables ───────────────────────────────────
  { id: 's-bi', arabic: 'بِ', transliteration: 'bi', hint: 'Ba + kasra', category: 'syllable' },
  { id: 's-ti', arabic: 'تِ', transliteration: 'ti', hint: 'Ta + kasra', category: 'syllable' },
  { id: 's-ji', arabic: 'جِ', transliteration: 'ji', hint: 'Jim + kasra', category: 'syllable' },
  { id: 's-ri', arabic: 'رِ', transliteration: 'ri', hint: 'Ra + kasra', category: 'syllable' },
  { id: 's-si', arabic: 'سِ', transliteration: 'si', hint: 'Sin + kasra', category: 'syllable' },
  { id: 's-li', arabic: 'لِ', transliteration: 'li', hint: 'Lam + kasra', category: 'syllable' },
  { id: 's-mi', arabic: 'مِ', transliteration: 'mi', hint: 'Mim + kasra', category: 'syllable' },
  { id: 's-ni', arabic: 'نِ', transliteration: 'ni', hint: 'Nun + kasra', category: 'syllable' },

  // ─── Damma (u) syllables ───────────────────────────────────
  { id: 's-bu', arabic: 'بُ', transliteration: 'bu', hint: 'Ba + damma', category: 'syllable' },
  { id: 's-tu', arabic: 'تُ', transliteration: 'tu', hint: 'Ta + damma', category: 'syllable' },
  { id: 's-ju', arabic: 'جُ', transliteration: 'ju', hint: 'Jim + damma', category: 'syllable' },
  { id: 's-ru', arabic: 'رُ', transliteration: 'ru', hint: 'Ra + damma', category: 'syllable' },
  { id: 's-su', arabic: 'سُ', transliteration: 'su', hint: 'Sin + damma', category: 'syllable' },
  { id: 's-lu', arabic: 'لُ', transliteration: 'lu', hint: 'Lam + damma', category: 'syllable' },
  { id: 's-mu', arabic: 'مُ', transliteration: 'mu', hint: 'Mim + damma', category: 'syllable' },
  { id: 's-nu', arabic: 'نُ', transliteration: 'nu', hint: 'Nun + damma', category: 'syllable' },

  // ─── Two-letter combinations ───────────────────────────────
  { id: 's-baa', arabic: 'بَا', transliteration: 'baa', hint: 'Ba + long alif', category: 'syllable' },
  { id: 's-bee', arabic: 'بِي', transliteration: 'bee', hint: 'Ba + long ya', category: 'syllable' },
  { id: 's-boo', arabic: 'بُو', transliteration: 'boo', hint: 'Ba + long waw', category: 'syllable' },
  { id: 's-kal', arabic: 'كَل', transliteration: 'kal', hint: 'Kaf + lam', category: 'syllable' },
  { id: 's-qul', arabic: 'قُل', transliteration: 'qul', hint: 'Qaf + lam', category: 'syllable' },
  { id: 's-rab', arabic: 'رَب', transliteration: 'rab', hint: 'Ra + ba', category: 'syllable' },
  { id: 's-din', arabic: 'دِين', transliteration: 'deen', hint: 'Dal + ya + nun', category: 'syllable' },
  { id: 's-nur', arabic: 'نُور', transliteration: 'noor', hint: 'Nun + waw + ra', category: 'syllable' },

  // ─── Short words ───────────────────────────────────────────
  { id: 'w-baab', arabic: 'بَاب', transliteration: 'baab', hint: 'Door', category: 'word' },
  { id: 'w-kitaab', arabic: 'كِتَاب', transliteration: 'kitaab', hint: 'Book', category: 'word' },
  { id: 'w-salaam', arabic: 'سَلَام', transliteration: 'salaam', hint: 'Peace', category: 'word' },
  { id: 'w-rabb', arabic: 'رَب', transliteration: 'rabb', hint: 'Lord', category: 'word' },
  { id: 'w-qalb', arabic: 'قَلْب', transliteration: 'qalb', hint: 'Heart', category: 'word' },
  { id: 'w-nur', arabic: 'نُور', transliteration: 'noor', hint: 'Light', category: 'word' },
  { id: 'w-ilm', arabic: 'عِلْم', transliteration: 'ilm', hint: 'Knowledge', category: 'word' },
  { id: 'w-hamd', arabic: 'حَمْد', transliteration: 'hamd', hint: 'Praise', category: 'word' },
  { id: 'w-sabr', arabic: 'صَبْر', transliteration: 'sabr', hint: 'Patience', category: 'word' },
  { id: 'w-bism', arabic: 'بِسْم', transliteration: 'bism', hint: 'Start of Bismillah', category: 'word' },
  { id: 'w-allah', arabic: 'الله', transliteration: 'Allah', hint: 'Allah', category: 'word' },
  { id: 'w-quran', arabic: 'قُرْآن', transliteration: 'Quran', hint: 'The Quran', category: 'word' },
  { id: 'w-muslim', arabic: 'مُسْلِم', transliteration: 'muslim', hint: 'Muslim', category: 'word' },
  { id: 'w-shukr', arabic: 'شُكْر', transliteration: 'shukr', hint: 'Gratitude', category: 'word' },
  { id: 'w-dua', arabic: 'دُعَاء', transliteration: 'dua', hint: 'Supplication', category: 'word' },
];

export function getReadingByCategory(category: ReadingCategory): ReadingItem[] {
  return READING_ITEMS.filter((item) => item.category === category);
}
