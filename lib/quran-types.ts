export type SurahMeta = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
};

export type Ayah = {
  number: number;
  numberInSurah: number;
  text: string;
  translation?: string;
  audio?: string;
  page: number;
  juz: number;
  sajda: boolean;
};

export type SurahContent = {
  meta: SurahMeta;
  ayahs: Ayah[];
};

export type PageAyah = Ayah & {
  surahNumber: number;
  surahName: string;
};

export type PageContent = {
  pageNumber: number;
  juz: number;
  ayahs: PageAyah[];
};

export type PageContentMode = 'arabic' | 'translation' | 'both';
export type ReaderLayout = 'ayah' | 'page';

export type EditionOption = {
  id: string;
  label: string;
};

export type ReciterOption = {
  id: string;
  label: string;
};

export type FavoriteAyah = {
  surah: number;
  ayah: number;
  surahName: string;
  arabicPreview: string;
  translationPreview: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};
