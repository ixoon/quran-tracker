import AsyncStorage from '@react-native-async-storage/async-storage';

function cacheKey(edition: string, surah: number) {
  return `quran_cache:${edition}:${surah}`;
}

function pageCacheKey(edition: string, page: number) {
  return `quran_cache:${edition}:page:${page}`;
}

export async function getCached<T>(edition: string, surah: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(edition, surah));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCached<T>(edition: string, surah: number, data: T): Promise<void> {
  await AsyncStorage.setItem(cacheKey(edition, surah), JSON.stringify(data));
}

export async function getCachedRaw(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function setCachedRaw(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function getCachedPage<T>(edition: string, page: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(pageCacheKey(edition, page));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCachedPage<T>(edition: string, page: number, data: T): Promise<void> {
  await AsyncStorage.setItem(pageCacheKey(edition, page), JSON.stringify(data));
}
