import { ARABIC_EDITION } from '@/lib/constants';
import { fetchSurahList } from '@/lib/quran-api';
import type { SurahMeta } from '@/lib/quran-types';

const BASE_URL = 'https://api.alquran.cloud/v1';

export type AyahReference = {
  surah: number;
  ayah: number;
};

export type QuranSearchHit = {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  edition: 'translation' | 'arabic';
};

type ApiSearchMatch = {
  number: number;
  numberInSurah: number;
  text: string;
  surah: {
    number: number;
    englishName: string;
  };
};

type ApiSearchResponse = {
  code: number;
  data: {
    count: number;
    matches: ApiSearchMatch[];
  };
};

const AYAH_REF_PATTERN = /^\s*(\d{1,3})\s*[:\s-]\s*(\d{1,3})\s*$/;

export function parseAyahReference(query: string): AyahReference | null {
  const match = query.trim().match(AYAH_REF_PATTERN);
  if (!match) return null;

  const surah = Number.parseInt(match[1], 10);
  const ayah = Number.parseInt(match[2], 10);
  if (surah < 1 || surah > 114 || ayah < 1) return null;

  return { surah, ayah };
}

export function isValidAyahReference(ref: AyahReference, surahs: SurahMeta[]): boolean {
  const surah = surahs.find((s) => s.number === ref.surah);
  if (!surah) return false;
  return ref.ayah <= surah.numberOfAyahs;
}

export function filterSurahs(surahs: SurahMeta[], query: string): SurahMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return surahs.filter(
    (surah) =>
      surah.englishName.toLowerCase().includes(q) ||
      surah.englishNameTranslation.toLowerCase().includes(q) ||
      surah.name.includes(query.trim()) ||
      String(surah.number).includes(q),
  );
}

async function searchEdition(keyword: string, edition: string): Promise<QuranSearchHit[]> {
  const encoded = encodeURIComponent(keyword.trim());
  if (!encoded) return [];

  const res = await fetch(`${BASE_URL}/search/${encoded}/all/${edition}`);
  if (!res.ok) throw new Error('Search failed');

  const json = (await res.json()) as ApiSearchResponse;
  if (json.code !== 200) throw new Error('Search API error');

  const editionKind = edition === ARABIC_EDITION ? 'arabic' : 'translation';

  return json.data.matches.slice(0, 20).map((match) => ({
    surahNumber: match.surah.number,
    surahName: match.surah.englishName,
    ayahNumber: match.numberInSurah,
    text: match.text.replace(/^\ufeff/, '').replace(/\s+/g, ' ').trim(),
    edition: editionKind,
  }));
}

export async function searchQuran(
  query: string,
  translationId: string,
  surahList?: SurahMeta[],
): Promise<{ surahs: SurahMeta[]; ayahs: QuranSearchHit[]; reference: AyahReference | null }> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { surahs: [], ayahs: [], reference: null };
  }

  const reference = parseAyahReference(trimmed);
  const allSurahs = surahList ?? (await fetchSurahList());
  const surahs = filterSurahs(allSurahs, trimmed);

  if (reference) {
    return { surahs, ayahs: [], reference };
  }

  if (trimmed.length < 3) {
    return { surahs, ayahs: [], reference: null };
  }

  const [translationHits, arabicHits] = await Promise.all([
    searchEdition(trimmed, translationId),
    searchEdition(trimmed, ARABIC_EDITION),
  ]);

  const seen = new Set<string>();
  const ayahs: QuranSearchHit[] = [];

  for (const hit of [...translationHits, ...arabicHits]) {
    const key = `${hit.surahNumber}:${hit.ayahNumber}:${hit.edition}`;
    if (seen.has(key)) continue;
    seen.add(key);
    ayahs.push(hit);
    if (ayahs.length >= 25) break;
  }

  return { surahs, ayahs, reference: null };
}

export function snippet(text: string, maxLength = 120): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength)}…`;
}
