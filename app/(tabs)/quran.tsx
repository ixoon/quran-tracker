import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SurahListItem } from '@/components/quran/SurahListItem';
import { QuranSearchPanel } from '@/components/quran/QuranSearchPanel';
import { useTabScreenPadding } from '@/hooks/useTabScreenPadding';
import { useStrings } from '@/lib/i18n';
import { TOTAL_PAGES } from '@/lib/constants';
import { fetchSurahList } from '@/lib/quran-api';
import type { SurahMeta } from '@/lib/quran-types';
import { useProgressStore } from '@/stores/progressStore';

type BrowseMode = 'surahs' | 'pages' | 'search';

function clampPage(value: number) {
  return Math.max(1, Math.min(value, TOTAL_PAGES));
}

export default function QuranScreen() {
  const strings = useStrings();
  const router = useRouter();
  const bottomPad = useTabScreenPadding();
  const { lastSurah, lastAyah, currentPage } = useProgressStore();

  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [browseMode, setBrowseMode] = useState<BrowseMode>('surahs');
  const [pageInput, setPageInput] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchSurahList()
      .then((data) => {
        if (!cancelled) setSurahs(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load surahs');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSurahs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;

    return surahs.filter(
      (surah) =>
        surah.englishName.toLowerCase().includes(q) ||
        surah.englishNameTranslation.toLowerCase().includes(q) ||
        String(surah.number).includes(q),
    );
  }, [query, surahs]);

  const continueSurah = lastSurah ? surahs.find((s) => s.number === lastSurah) : null;

  const openSurah = useCallback(
    (surahNumber: number) => {
      router.push({
        pathname: '/reader/[surahId]',
        params: { surahId: String(surahNumber) },
      });
    },
    [router],
  );

  const openPage = useCallback(
    (page: number) => {
      router.push({
        pathname: '/reader/page/[pageNumber]',
        params: { pageNumber: String(clampPage(page)) },
      });
    },
    [router],
  );

  const nextPage = clampPage(currentPage > 0 ? currentPage + 1 : 1);
  const parsedPageInput = clampPage(Number.parseInt(pageInput, 10) || nextPage);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ink-50 dark:bg-ink-900">
        <ActivityIndicator size="large" color="#16a34a" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ink-50 px-6 dark:bg-ink-900">
        <Text className="text-center text-base text-red-600 dark:text-red-400">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['top']}>
      <FlatList
        data={browseMode === 'surahs' ? filteredSurahs : []}
        keyExtractor={(item) => String(item.number)}
        contentContainerClassName="px-5 pt-2"
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-3xl font-bold text-ink-900 dark:text-ink-50">{strings('quran.title')}</Text>
            <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">{strings('quran.subtitle')}</Text>

            <View className="mt-5 flex-row rounded-2xl bg-white p-1 dark:bg-ink-800">
              <Pressable
                className={`flex-1 rounded-xl py-2.5 ${
                  browseMode === 'surahs' ? 'bg-brand-600' : ''
                }`}
                onPress={() => setBrowseMode('surahs')}>
                <Text
                  className={`text-center text-sm font-semibold ${
                    browseMode === 'surahs' ? 'text-white' : 'text-ink-700 dark:text-ink-200'
                  }`}>
                  {strings('quran.surahs')}
                </Text>
              </Pressable>
              <Pressable
                className={`flex-1 rounded-xl py-2.5 ${
                  browseMode === 'pages' ? 'bg-brand-600' : ''
                }`}
                onPress={() => setBrowseMode('pages')}>
                <Text
                  className={`text-center text-sm font-semibold ${
                    browseMode === 'pages' ? 'text-white' : 'text-ink-700 dark:text-ink-200'
                  }`}>
                  {strings('quran.pages')}
                </Text>
              </Pressable>
              <Pressable
                className={`flex-1 rounded-xl py-2.5 ${
                  browseMode === 'search' ? 'bg-brand-600' : ''
                }`}
                onPress={() => setBrowseMode('search')}>
                <Text
                  className={`text-center text-sm font-semibold ${
                    browseMode === 'search' ? 'text-white' : 'text-ink-700 dark:text-ink-200'
                  }`}>
                  {strings('quran.search')}
                </Text>
              </Pressable>
            </View>

            {browseMode === 'search' ? (
              <View className="mt-5">
                <QuranSearchPanel surahs={surahs} />
              </View>
            ) : null}

            {browseMode === 'pages' ? (
              <View className="mt-5">
                <Pressable
                  className="flex-row items-center gap-3 rounded-2xl bg-brand-600 px-4 py-4"
                  onPress={() => openPage(nextPage)}>
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <FontAwesome name="book" size={16} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-medium uppercase tracking-wide text-brand-100">
                      {strings('quran.openMushaf')}
                    </Text>
                    <Text className="text-base font-semibold text-white">
                      {currentPage > 0
                        ? strings('quran.continueFromPage', { page: nextPage })
                        : strings('quran.startPage1')}
                    </Text>
                  </View>
                  <FontAwesome name="chevron-right" size={12} color="#ffffff" />
                </Pressable>

                <View className="mt-4 rounded-2xl bg-white p-4 dark:bg-ink-800">
                  <Text className="text-sm font-medium text-ink-700 dark:text-ink-200">
                    {strings('quran.jumpToPage')}
                  </Text>
                  <View className="mt-3 flex-row items-center gap-3">
                    <TextInput
                      className="flex-1 rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50"
                      keyboardType="number-pad"
                      maxLength={3}
                      placeholder={`1–${TOTAL_PAGES}`}
                      placeholderTextColor="#94a3b8"
                      value={pageInput}
                      onChangeText={setPageInput}
                    />
                    <Pressable
                      className="rounded-xl bg-brand-600 px-5 py-3"
                      onPress={() => openPage(parsedPageInput)}>
                      <Text className="font-semibold text-white">{strings('quran.open')}</Text>
                    </Pressable>
                  </View>
                  <Text className="mt-3 text-xs text-ink-500 dark:text-ink-400">
                    {strings('quran.mushafHint')}
                  </Text>
                </View>
              </View>
            ) : null}

            {browseMode === 'surahs' && continueSurah && lastAyah ? (
              <Pressable
                className="mt-5 flex-row items-center gap-3 rounded-2xl bg-brand-600 px-4 py-4"
                onPress={() => openSurah(continueSurah.number)}>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <FontAwesome name="bookmark" size={16} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium uppercase tracking-wide text-brand-100">
                    {strings('quran.continueReading')}
                  </Text>
                  <Text className="text-base font-semibold text-white">
                    {continueSurah.englishName} · {strings('quran.ayah', { n: lastAyah })}
                  </Text>
                </View>
                <FontAwesome name="chevron-right" size={12} color="#ffffff" />
              </Pressable>
            ) : null}

            {browseMode === 'surahs' ? (
              <View className="mt-5 flex-row items-center rounded-2xl border border-ink-200 bg-white px-4 dark:border-ink-700 dark:bg-ink-800">
                <FontAwesome name="search" size={16} color="#94a3b8" />
                <TextInput
                  className="ml-3 flex-1 py-3 text-base text-ink-900 dark:text-ink-50"
                  placeholder={strings('quran.searchPlaceholder')}
                  placeholderTextColor="#94a3b8"
                  value={query}
                  onChangeText={setQuery}
                />
              </View>
            ) : null}
          </View>
        }
        ItemSeparatorComponent={() => (browseMode === 'surahs' ? <View className="h-2" /> : null)}
        renderItem={({ item }) => (
          <SurahListItem surah={item} onPress={() => openSurah(item.number)} />
        )}
        ListEmptyComponent={
          browseMode === 'pages' ? (
            <Text className="text-center text-sm text-ink-500 dark:text-ink-400">
              {strings('quran.useButtonAbove')}
            </Text>
          ) : browseMode === 'search' ? null : null
        }
      />
    </SafeAreaView>
  );
}
