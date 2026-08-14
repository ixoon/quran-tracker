/** King Fahd Complex Uthmanic script — Madinah mushaf style */
export const ARABIC_FONT_FAMILY = 'UthmanicHafs';

export const arabicTypography = {
  /** Main ayah text in reader */
  ayah: {
    fontSize: 26,
    lineHeight: 48,
  },
  /** Surah title in reader header */
  surahTitle: {
    fontSize: 30,
    lineHeight: 52,
  },
  /** Surah name in list row */
  surahList: {
    fontSize: 22,
    lineHeight: 36,
  },
  /** Favorite preview snippet */
  preview: {
    fontSize: 22,
    lineHeight: 40,
  },
  /** Full mushaf page — continuous flowing text */
  mushafPage: {
    fontSize: 24,
    lineHeight: 44,
  },
  /** Adhkar / zikr text */
  zikr: {
    fontSize: 24,
    lineHeight: 42,
  },
  /** Large isolated letter display */
  letter: {
    fontSize: 56,
    lineHeight: 72,
  },
} as const;

export type ArabicTextVariant = keyof typeof arabicTypography;
