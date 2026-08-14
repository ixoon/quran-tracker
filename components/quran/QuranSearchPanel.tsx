import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { ArabicText } from '@/components/ArabicText';
import {
  isValidAyahReference,
  parseAyahReference,
  searchQuran,
  snippet,
  type QuranSearchHit,
} from '@/lib/quran-search';
import type { SurahMeta } from '@/lib/quran-types';
import { useAppLanguage, useStrings } from '@/lib/i18n';
import { t } from '@/lib/i18n/strings';
import { useSettingsStore } from '@/stores/settingsStore';

type QuranSearchPanelProps = {
  surahs: SurahMeta[];
};

export function QuranSearchPanel({ surahs }: QuranSearchPanelProps) {
  const router = useRouter();
  const strings = useStrings();
  const lang = useAppLanguage();
  const translationId = useSettingsStore((s) => s.translationId);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surahHits, setSurahHits] = useState<SurahMeta[]>([]);
  const [ayahHits, setAyahHits] = useState<QuranSearchHit[]>([]);
  const [reference, setReference] = useState<{ surah: number; ayah: number } | null>(null);

  const openAyah = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      router.push({
        pathname: '/reader/[surahId]',
        params: { surahId: String(surahNumber), ayah: String(ayahNumber) },
      });
    },
    [router],
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSurahHits([]);
      setAyahHits([]);
      setReference(null);
      setError(null);
      setLoading(false);
      return;
    }

    const ref = parseAyahReference(trimmed);
    if (ref) {
      if (!isValidAyahReference(ref, surahs)) {
        setReference(null);
        setSurahHits([]);
        setAyahHits([]);
        setError(t(lang, 'quran.invalidAyahReference', { ref: `${ref.surah}:${ref.ayah}` }));
        setLoading(false);
        return;
      }

      setReference(ref);
      setSurahHits([]);
      setAyahHits([]);
      setError(null);
      setLoading(false);
      return;
    }

    setReference(null);
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      searchQuran(trimmed, translationId, surahs)
        .then((result) => {
          setSurahHits(result.surahs);
          setAyahHits(result.ayahs);
        })
        .catch((err) => {
          setSurahHits([]);
          setAyahHits([]);
          setError(err instanceof Error ? err.message : t(lang, 'quran.searchFailed'));
        })
        .finally(() => {
          setLoading(false);
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [query, translationId, surahs, lang]);

  const hasResults = reference || surahHits.length > 0 || ayahHits.length > 0;
  const showEmpty = query.trim().length >= 2 && !loading && !error && !hasResults;

  return (
    <View>
      <View className="flex-row items-center rounded-2xl border border-ink-200 bg-white px-4 dark:border-ink-700 dark:bg-ink-800">
        <FontAwesome name="search" size={16} color="#94a3b8" />
        <TextInput
          className="ml-3 flex-1 py-3 text-base text-ink-900 dark:text-ink-50"
          placeholder={strings('quran.searchPlaceholder')}
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')}>
            <FontAwesome name="times-circle" size={16} color="#94a3b8" />
          </Pressable>
        ) : null}
      </View>

      <Text className="mt-2 text-xs text-ink-700 dark:text-ink-200">{strings('quran.searchHint')}</Text>

      {loading ? (
        <View className="mt-6 items-center">
          <ActivityIndicator color="#16a34a" />
        </View>
      ) : null}

      {error ? (
        <Text className="mt-4 text-center text-sm text-red-600 dark:text-red-400">{error}</Text>
      ) : null}

      {reference ? (
        <Pressable
          className="mt-4 flex-row items-center gap-3 rounded-2xl bg-brand-600 px-4 py-4"
          onPress={() => openAyah(reference.surah, reference.ayah)}>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <FontAwesome name="book" size={16} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-medium uppercase tracking-wide text-brand-100">
              {strings('quran.ayahReference')}
            </Text>
            <Text className="text-base font-semibold text-white">
              {strings('quran.surahAyah', { surah: reference.surah, ayah: reference.ayah })}
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={12} color="#ffffff" />
        </Pressable>
      ) : null}

      {surahHits.length > 0 ? (
        <View className="mt-5">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
            {strings('quran.surahs')}
          </Text>
          {surahHits.map((surah) => (
            <Pressable
              key={surah.number}
              className="mb-2 flex-row items-center gap-3 rounded-2xl bg-white px-4 py-4 dark:bg-ink-800"
              onPress={() => openAyah(surah.number, 1)}>
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40">
                <Text className="text-sm font-bold text-brand-700 dark:text-brand-400">
                  {surah.number}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
                  {surah.englishName}
                </Text>
                <Text className="text-sm text-ink-700 dark:text-ink-200">
                  {surah.englishNameTranslation}
                </Text>
              </View>
              <ArabicText variant="surahList">{surah.name}</ArabicText>
            </Pressable>
          ))}
        </View>
      ) : null}

      {ayahHits.length > 0 ? (
        <View className="mt-5">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
            {strings('quran.ayahs')}
          </Text>
          {ayahHits.map((hit) => (
            <Pressable
              key={`${hit.surahNumber}-${hit.ayahNumber}-${hit.edition}`}
              className="mb-2 rounded-2xl bg-white px-4 py-4 dark:bg-ink-800"
              onPress={() => openAyah(hit.surahNumber, hit.ayahNumber)}>
              <Text className="text-xs font-semibold text-brand-700 dark:text-brand-400">
                {hit.surahName} · {hit.surahNumber}:{hit.ayahNumber}
                {hit.edition === 'arabic' ? ' · Arabic' : ''}
              </Text>
              {hit.edition === 'arabic' ? (
                <ArabicText variant="preview" className="mt-2 text-left">
                  {snippet(hit.text, 160)}
                </ArabicText>
              ) : (
                <Text className="mt-2 text-sm leading-6 text-ink-700 dark:text-ink-200">
                  {snippet(hit.text)}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      ) : null}

      {showEmpty ? (
        <Text className="mt-6 text-center text-sm text-ink-700 dark:text-ink-200">
          {strings('quran.noResults')}
        </Text>
      ) : null}
    </View>
  );
}
