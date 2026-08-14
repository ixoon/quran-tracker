import { ARABIC_EDITION, SURAH_LIST_CACHE_KEY } from '@/lib/constants';
import { getCached, getCachedPage, getCachedRaw, setCached, setCachedPage, setCachedRaw } from '@/lib/quran-cache';
import type { Ayah, PageAyah, PageContent, SurahContent, SurahMeta } from '@/lib/quran-types';

const BASE_URL = 'https://api.alquran.cloud/v1';

type ApiAyah = {
  number: number;
  numberInSurah: number;
  text: string;
  page: number;
  juz: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
  audio?: string;
};

type ApiSurahResponse = {
  code: number;
  data: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: 'Meccan' | 'Medinan';
    numberOfAyahs: number;
    ayahs: ApiAyah[];
  };
};

type ApiSurahListResponse = {
  code: number;
  data: SurahMeta[];
};

function isSajda(value: ApiAyah['sajda']): boolean {
  return value === true || (typeof value === 'object' && value !== null);
}

function mapAyah(ayah: ApiAyah, translationText?: string): Ayah {
  return {
    number: ayah.number,
    numberInSurah: ayah.numberInSurah,
    text: ayah.text.replace(/^\ufeff/, ''),
    translation: translationText,
    audio: ayah.audio,
    page: ayah.page,
    juz: ayah.juz,
    sajda: isSajda(ayah.sajda),
  };
}

type ApiPageResponse = {
  code: number;
  data: {
    number: number;
    ayahs: (ApiAyah & {
      surah: {
        number: number;
        name: string;
        englishName: string;
      };
    })[];
  };
};

async function fetchPageEdition(pageNumber: number, edition: string): Promise<ApiPageResponse['data']> {
  const cached = await getCachedPage<ApiPageResponse['data']>(edition, pageNumber);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}/page/${pageNumber}/${edition}`);
  if (!res.ok) throw new Error(`Failed to fetch page ${pageNumber} (${edition})`);

  const json = (await res.json()) as ApiPageResponse;
  if (json.code !== 200) throw new Error(`API error for page ${pageNumber}`);

  await setCachedPage(edition, pageNumber, json.data);
  return json.data;
}

async function fetchEdition(surahNumber: number, edition: string): Promise<ApiSurahResponse['data']> {
  const cached = await getCached<ApiSurahResponse['data']>(edition, surahNumber);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}/surah/${surahNumber}/${edition}`);
  if (!res.ok) throw new Error(`Failed to fetch surah ${surahNumber} (${edition})`);

  const json = (await res.json()) as ApiSurahResponse;
  if (json.code !== 200) throw new Error(`API error for surah ${surahNumber}`);

  await setCached(edition, surahNumber, json.data);
  return json.data;
}

export async function fetchSurahList(): Promise<SurahMeta[]> {
  const cachedRaw = await getCachedRaw(SURAH_LIST_CACHE_KEY);
  if (cachedRaw) return JSON.parse(cachedRaw) as SurahMeta[];

  const res = await fetch(`${BASE_URL}/surah`);
  if (!res.ok) throw new Error('Failed to fetch surah list');

  const json = (await res.json()) as ApiSurahListResponse;
  if (json.code !== 200) throw new Error('API error fetching surah list');

  await setCachedRaw(SURAH_LIST_CACHE_KEY, JSON.stringify(json.data));
  return json.data;
}

export async function fetchSurahContent(
  surahNumber: number,
  translationId: string,
): Promise<SurahContent> {
  const [arabic, translation] = await Promise.all([
    fetchEdition(surahNumber, ARABIC_EDITION),
    fetchEdition(surahNumber, translationId),
  ]);

  const translationByAyah = new Map(
    translation.ayahs.map((ayah) => [ayah.numberInSurah, ayah.text.replace(/^\ufeff/, '')]),
  );

  const meta: SurahMeta = {
    number: arabic.number,
    name: arabic.name,
    englishName: arabic.englishName,
    englishNameTranslation: arabic.englishNameTranslation,
    revelationType: arabic.revelationType,
    numberOfAyahs: arabic.numberOfAyahs,
  };

  const ayahs = arabic.ayahs.map((ayah) =>
    mapAyah(ayah, translationByAyah.get(ayah.numberInSurah)),
  );

  return { meta, ayahs };
}

export async function fetchSurahAudio(
  surahNumber: number,
  reciterId: string,
): Promise<Map<number, string>> {
  const data = await fetchEdition(surahNumber, reciterId);
  const audioMap = new Map<number, string>();

  for (const ayah of data.ayahs) {
    if (ayah.audio) {
      audioMap.set(ayah.numberInSurah, ayah.audio);
    }
  }

  return audioMap;
}

export async function fetchPageAudio(
  pageNumber: number,
  reciterId: string,
): Promise<Map<number, string>> {
  const data = await fetchPageEdition(pageNumber, reciterId);
  const audioMap = new Map<number, string>();

  for (const ayah of data.ayahs) {
    if (ayah.audio) {
      audioMap.set(ayah.number, ayah.audio);
    }
  }

  return audioMap;
}

export async function fetchPageContent(
  pageNumber: number,
  translationId: string,
): Promise<PageContent> {
  const [arabic, translation] = await Promise.all([
    fetchPageEdition(pageNumber, ARABIC_EDITION),
    fetchPageEdition(pageNumber, translationId),
  ]);

  const translationByAyah = new Map(
    translation.ayahs.map((ayah) => [ayah.number, ayah.text.replace(/^\ufeff/, '')]),
  );

  const ayahs: PageAyah[] = arabic.ayahs.map((ayah) => ({
    ...mapAyah(ayah, translationByAyah.get(ayah.number)),
    surahNumber: ayah.surah.number,
    surahName: ayah.surah.name,
  }));

  return {
    pageNumber: arabic.number,
    juz: ayahs[0]?.juz ?? 1,
    ayahs,
  };
}

export function groupAyahsByPage(ayahs: Ayah[]): { page: number; ayahs: Ayah[] }[] {
  const pages: { page: number; ayahs: Ayah[] }[] = [];
  let current: { page: number; ayahs: Ayah[] } | null = null;

  for (const ayah of ayahs) {
    if (!current || current.page !== ayah.page) {
      current = { page: ayah.page, ayahs: [ayah] };
      pages.push(current);
    } else {
      current.ayahs.push(ayah);
    }
  }

  return pages;
}
