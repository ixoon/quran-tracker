import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AudioPlayerBar } from '@/components/quran/AudioPlayerBar';
import { AyahBlock } from '@/components/quran/AyahBlock';
import { MushafPageView } from '@/components/quran/MushafPageView';
import { ReaderSettingsModal } from '@/components/quran/ReaderSettingsModal';
import { useVerseAudio } from '@/hooks/useVerseAudio';
import { RECITERS, TRANSLATIONS } from '@/lib/constants';
import { fetchSurahAudio, fetchSurahContent, groupAyahsByPage } from '@/lib/quran-api';
import type { Ayah, SurahContent } from '@/lib/quran-types';
import { ArabicText } from '@/components/ArabicText';
import { useStrings } from '@/lib/i18n';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSettingsStore } from '@/stores/settingsStore';

export default function ReaderScreen() {
  const strings = useStrings();
  const router = useRouter();
  const { surahId, ayah } = useLocalSearchParams<{ surahId: string; ayah?: string }>();
  const surahNumber = Number(surahId);
  const targetAyah = ayah ? Number.parseInt(ayah, 10) : null;

  const listRef = useRef<FlatList<Ayah>>(null);
  const [content, setContent] = useState<SurahContent | null>(null);
  const [audioMap, setAudioMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visibleAyah, setVisibleAyah] = useState<number | null>(null);
  const [visiblePage, setVisiblePage] = useState<number | null>(null);

  const {
    translationId,
    reciterId,
    showTranslation,
    readerLayout,
    pageContentMode,
    setTranslationId,
    setReciterId,
    setShowTranslation,
    setReaderLayout,
    setPageContentMode,
  } = useSettingsStore();

  const setResumePosition = useProgressStore((s) => s.setResumePosition);
  const setCurrentPage = useProgressStore((s) => s.setCurrentPage);
  const currentPage = useProgressStore((s) => s.currentPage);
  const lastSurah = useProgressStore((s) => s.lastSurah);
  const lastAyah = useProgressStore((s) => s.lastAyah);

  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const ayahNumbers = useMemo(
    () => content?.ayahs.map((a) => a.numberInSurah) ?? [],
    [content],
  );

  const pageGroups = useMemo(
    () => (content ? groupAyahsByPage(content.ayahs) : []),
    [content],
  );

  const scrollToAyah = useCallback((ayahNumberInSurah: number) => {
    if (!content) return;
    const index = content.ayahs.findIndex((a) => a.numberInSurah === ayahNumberInSurah);
    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
    }
  }, [content]);

  const { activeAyah, isPlaying, isLoading: audioLoading, playFromAyah, stop, togglePlayPause } =
    useVerseAudio({
      audioMap,
      onAyahChange: scrollToAyah,
    });

  const loadSurah = useCallback(async () => {
    if (!surahNumber || Number.isNaN(surahNumber)) return;

    setLoading(true);
    setError(null);

    try {
      const [surahContent, surahAudio] = await Promise.all([
        fetchSurahContent(surahNumber, translationId),
        fetchSurahAudio(surahNumber, reciterId),
      ]);
      setContent(surahContent);
      setAudioMap(surahAudio);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load surah');
    } finally {
      setLoading(false);
    }
  }, [surahNumber, translationId, reciterId]);

  useEffect(() => {
    loadSurah();
    return () => {
      stop();
    };
  }, [loadSurah, stop]);

  useEffect(() => {
    if (!content || loading) return;

    const scrollAyah =
      targetAyah &&
      !Number.isNaN(targetAyah) &&
      targetAyah >= 1 &&
      targetAyah <= content.meta.numberOfAyahs
        ? targetAyah
        : lastSurah === surahNumber && lastAyah
          ? lastAyah
          : content.ayahs[0]?.numberInSurah;

    if (scrollAyah) {
      const index = content.ayahs.findIndex((a) => a.numberInSurah === scrollAyah);
      if (index >= 0) {
        setTimeout(() => {
          listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.15 });
        }, 100);
      }
    }
  }, [content, loading, lastSurah, lastAyah, surahNumber, targetAyah]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems.find((item) => item.isViewable)?.item as
      | Ayah
      | { page: number; ayahs: Ayah[] }
      | undefined;

    if (!first) return;

    const ayah = 'numberInSurah' in first ? first : first.ayahs[0];
    if (ayah) {
      setVisibleAyah(ayah.numberInSurah);
      setVisiblePage(ayah.page);
      setResumePosition(surahNumber, ayah.numberInSurah);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const reciterLabel =
    RECITERS.find((r) => r.id === reciterId)?.label ?? 'Reciter';

  const handleTogglePlay = () => {
    const startAyah = activeAyah ?? visibleAyah ?? content?.ayahs[0]?.numberInSurah ?? 1;
    togglePlayPause(startAyah, ayahNumbers);
  };

  const handleAyahPress = (ayahNumberInSurah: number) => {
    playFromAyah(ayahNumberInSurah, ayahNumbers);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ink-50 dark:bg-ink-900">
        <ActivityIndicator size="large" color="#16a34a" />
      </SafeAreaView>
    );
  }

  if (error || !content) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ink-50 px-6 dark:bg-ink-900">
        <Text className="text-center text-base text-red-600 dark:text-red-400">
          {error ?? strings('reader.surahNotFound')}
        </Text>
        <Pressable className="mt-4" onPress={() => router.back()}>
          <Text className="text-brand-600 dark:text-brand-400">{strings('reader.goBack')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: content.meta.englishName,
          headerBackTitle: 'Quran',
        }}
      />

      <View className="flex-1 bg-ink-50 dark:bg-ink-900">
        {visiblePage !== null && visiblePage > currentPage ? (
          <Pressable
            className="mx-5 mt-2 flex-row items-center justify-between rounded-2xl bg-brand-100 px-4 py-3 dark:bg-brand-900/40"
            onPress={() => setCurrentPage(visiblePage)}>
            <Text className="flex-1 text-sm text-brand-800 dark:text-brand-200">
              {strings('reader.setProgressPage', { page: visiblePage })}
            </Text>
            <Text className="text-sm font-semibold text-brand-700 dark:text-brand-300">
              {strings('reader.update')}
            </Text>
          </Pressable>
        ) : null}

        <FlatList
          ref={listRef}
          data={readerLayout === 'page' ? pageGroups : content.ayahs}
          key={readerLayout}
          keyExtractor={(item) =>
            readerLayout === 'page'
              ? `page-${(item as { page: number }).page}`
              : String((item as Ayah).numberInSurah)
          }
          contentContainerClassName="px-5 pb-4 pt-2"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.2,
              });
            }, 100);
          }}
          ListHeaderComponent={
            readerLayout === 'ayah' ? (
              <View className="mb-4 rounded-2xl bg-white p-5 dark:bg-ink-800">
                <ArabicText variant="surahTitle">{content.meta.name}</ArabicText>
                <Text className="mt-2 text-lg font-semibold text-ink-900 dark:text-ink-50">
                  {content.meta.englishName}
                </Text>
                <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
                  {content.meta.englishNameTranslation} · {content.meta.numberOfAyahs} ayahs ·{' '}
                  {content.meta.revelationType}
                </Text>
              </View>
            ) : (
              <View className="mb-4">
                <Text className="text-lg font-semibold text-ink-900 dark:text-ink-50">
                  {content.meta.englishName}
                </Text>
                <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
                  Mushaf page view · {content.meta.numberOfAyahs} ayahs
                </Text>
              </View>
            )
          }
          renderItem={({ item }) =>
            readerLayout === 'page' ? (
              <View className="mb-4">
                <MushafPageView
                  pageNumber={(item as { page: number; ayahs: Ayah[] }).page}
                  juz={(item as { page: number; ayahs: Ayah[] }).ayahs[0]?.juz ?? 1}
                  ayahs={(item as { page: number; ayahs: Ayah[] }).ayahs.map((ayah) => ({
                    ...ayah,
                    surahNumber: ayah.numberInSurah === 1 ? surahNumber : undefined,
                    surahName: ayah.numberInSurah === 1 ? content.meta.name : undefined,
                  }))}
                  contentMode={pageContentMode}
                  compact
                  isAyahActive={(ayah) => activeAyah === ayah.numberInSurah}
                  onAyahPress={(ayah) => handleAyahPress(ayah.numberInSurah)}
                />
                <Pressable
                  className="mt-2 self-end"
                  onPress={() =>
                    router.push({
                      pathname: '/reader/page/[pageNumber]',
                      params: {
                        pageNumber: String((item as { page: number }).page),
                      },
                    })
                  }>
                  <Text className="text-sm font-medium text-brand-600 dark:text-brand-400">
                    Open full page →
                  </Text>
                </Pressable>
              </View>
            ) : (
              <AyahBlock
                ayah={item as Ayah}
                surahNumber={surahNumber}
                isActive={activeAyah === (item as Ayah).numberInSurah}
                isFavorite={isFavorite(surahNumber, (item as Ayah).numberInSurah)}
                showTranslation={showTranslation}
                onPress={() => handleAyahPress((item as Ayah).numberInSurah)}
                onToggleFavorite={() =>
                  toggleFavorite({
                    surah: surahNumber,
                    ayah: (item as Ayah).numberInSurah,
                    surahName: content.meta.englishName,
                    arabicPreview: (item as Ayah).text.slice(0, 80),
                    translationPreview: ((item as Ayah).translation ?? '').slice(0, 120),
                  })
                }
              />
            )
          }
        />

        <SafeAreaView edges={['bottom']} className="bg-white dark:bg-ink-800">
          <AudioPlayerBar
            surahName={content.meta.englishName}
            activeAyah={activeAyah}
            isPlaying={isPlaying}
            isLoading={audioLoading}
            reciterLabel={reciterLabel}
            onTogglePlay={handleTogglePlay}
            onStop={stop}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </SafeAreaView>
      </View>

      <ReaderSettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        translations={TRANSLATIONS}
        reciters={RECITERS}
        translationId={translationId}
        reciterId={reciterId}
        showTranslation={showTranslation}
        readerLayout={readerLayout}
        pageContentMode={pageContentMode}
        onSelectTranslation={(id) => {
          setTranslationId(id);
          setSettingsOpen(false);
        }}
        onSelectReciter={(id) => {
          setReciterId(id);
          stop();
          setSettingsOpen(false);
        }}
        onToggleTranslation={() => setShowTranslation(!showTranslation)}
        onSelectReaderLayout={(layout) => setReaderLayout(layout)}
        onSelectPageContentMode={(mode) => setPageContentMode(mode)}
      />
    </>
  );
}
