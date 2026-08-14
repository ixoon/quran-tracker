import type { AppLanguage } from '@/lib/i18n/types';

const HADITH_CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

export type SahihCollection = 'bukhari' | 'muslim';

export type DailyHadith = {
  text: string;
  collection: SahihCollection;
  collectionLabel: string;
  hadithNumber: number;
  date: string;
};

type HadithApiResponse = {
  hadiths: { hadithnumber: number; text: string }[];
};

const SAHIH_SOURCES: { id: SahihCollection; label: string; maxHadith: number }[] = [
  { id: 'bukhari', label: 'Sahih al-Bukhari', maxHadith: 7563 },
  { id: 'muslim', label: 'Sahih Muslim', maxHadith: 7453 },
];

function hadithLangFromAppLanguage(lang: AppLanguage): string {
  const supported: Record<AppLanguage, string> = {
    en: 'eng',
    bs: 'eng',
    tr: 'tur',
    de: 'eng',
    fr: 'fra',
    ar: 'ara',
    id: 'ind',
  };

  return supported[lang] ?? 'eng';
}

function dateSeed(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pickDailyHadithRef(date = new Date()): {
  collection: SahihCollection;
  number: number;
  dateKey: string;
} {
  const dateKey = formatDateKey(date);
  const seed = dateSeed(dateKey);
  const source = SAHIH_SOURCES[seed % SAHIH_SOURCES.length];
  const number = (seed % source.maxHadith) + 1;

  return {
    collection: source.id,
    number,
    dateKey,
  };
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function fetchHadithEdition(
  langPrefix: string,
  collection: SahihCollection,
  number: number,
): Promise<HadithApiResponse> {
  const url = `${HADITH_CDN}/${langPrefix}-${collection}/${number}.min.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Hadith fetch failed (${res.status})`);
  return (await res.json()) as HadithApiResponse;
}

export async function fetchDailyHadith(appLanguage: AppLanguage, date = new Date()): Promise<DailyHadith> {
  const { collection, number, dateKey } = pickDailyHadithRef(date);
  const langPrefix = hadithLangFromAppLanguage(appLanguage);
  const source = SAHIH_SOURCES.find((item) => item.id === collection)!;

  let lastError: unknown;

  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = ((number + offset - 1) % source.maxHadith) + 1;

    try {
      let data = await fetchHadithEdition(langPrefix, collection, candidate);

      if (!data.hadiths[0]?.text && langPrefix !== 'eng') {
        data = await fetchHadithEdition('eng', collection, candidate);
      }

      const text = data.hadiths[0]?.text?.trim();
      if (!text) throw new Error('Empty hadith text');

      return {
        text,
        collection,
        collectionLabel: source.label,
        hadithNumber: candidate,
        date: dateKey,
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to load daily hadith');
}
