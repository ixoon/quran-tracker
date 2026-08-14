import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AudioPlayerBar } from '@/components/quran/AudioPlayerBar';
import { MushafPageView } from '@/components/quran/MushafPageView';
import { ReaderSettingsModal } from '@/components/quran/ReaderSettingsModal';
import { useVerseAudio } from '@/hooks/useVerseAudio';
import { RECITERS, TOTAL_PAGES, TRANSLATIONS } from '@/lib/constants';
import { useStrings } from '@/lib/i18n';
import { fetchPageAudio, fetchPageContent } from '@/lib/quran-api';
import type { PageAyah, PageContent } from '@/lib/quran-types';
import { useProgressStore } from '@/stores/progressStore';
import { useSettingsStore } from '@/stores/settingsStore';

function clampPage(value: number) {
  return Math.max(1, Math.min(value, TOTAL_PAGES));
}

export default function PageReaderScreen() {
  const strings = useStrings();
  const router = useRouter();
  const { pageNumber: pageParam } = useLocalSearchParams<{ pageNumber: string }>();
  const initialPage = clampPage(Number(pageParam) || 1);

  const [pageNumber, setPageNumber] = useState(initialPage);
  const [content, setContent] = useState<PageContent | null>(null);
  const [audioMap, setAudioMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [jumpInput, setJumpInput] = useState('');

  const {
    translationId,
    reciterId,
    showTranslation,
    pageContentMode,
    setTranslationId,
    setReciterId,
    setShowTranslation,
    setPageContentMode,
  } = useSettingsStore();

  const currentPage = useProgressStore((s) => s.currentPage);
  const setCurrentPage = useProgressStore((s) => s.setCurrentPage);
  const setResumePosition = useProgressStore((s) => s.setResumePosition);

  const ayahNumbers = useMemo(() => content?.ayahs.map((a) => a.number) ?? [], [content]);

  const handleAyahChange = useCallback(
    (globalAyahNumber: number) => {
      const ayah = content?.ayahs.find((a) => a.number === globalAyahNumber);
      if (ayah) {
        setResumePosition(ayah.surahNumber, ayah.numberInSurah);
      }
    },
    [content, setResumePosition],
  );

  const { activeAyah, isPlaying, isLoading: audioLoading, playFromAyah, stop, togglePlayPause } =
    useVerseAudio({
      audioMap,
      onAyahChange: handleAyahChange,
    });

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [data, audio] = await Promise.all([
        fetchPageContent(pageNumber, translationId),
        fetchPageAudio(pageNumber, reciterId),
      ]);
      setContent(data);
      setAudioMap(audio);

      const first = data.ayahs[0];
      if (first) {
        setResumePosition(first.surahNumber, first.numberInSurah);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  }, [pageNumber, translationId, reciterId, setResumePosition]);

  useEffect(() => {
    loadPage();
    return () => {
      stop();
    };
  }, [loadPage, stop]);

  useEffect(() => {
    setPageNumber(initialPage);
  }, [initialPage]);

  const goToPage = (next: number) => {
    setPageNumber(clampPage(next));
  };

  const handleJump = () => {
    const parsed = Number.parseInt(jumpInput, 10);
    if (!Number.isNaN(parsed)) {
      goToPage(parsed);
      setJumpInput('');
    }
  };

  const reciterLabel = RECITERS.find((r) => r.id === reciterId)?.label ?? 'Reciter';

  const activeAyahInfo = useMemo(() => {
    if (!activeAyah || !content) return null;
    return content.ayahs.find((a) => a.number === activeAyah) ?? null;
  }, [activeAyah, content]);

  const handleTogglePlay = () => {
    const startAyah = activeAyah ?? content?.ayahs[0]?.number ?? 0;
    togglePlayPause(startAyah, ayahNumbers);
  };

  const handleAyahPress = (ayah: PageAyah) => {
    playFromAyah(ayah.number, ayahNumbers);
  };

  const audioSubtitle = activeAyahInfo
    ? `Surah ${activeAyahInfo.surahNumber}:${activeAyahInfo.numberInSurah} · ${reciterLabel}`
    : `Tap play or an ayah · ${reciterLabel}`;

  if (loading && !content) {
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
          {error ?? 'Page not found'}
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
          title: `Page ${pageNumber}`,
          headerBackTitle: 'Quran',
        }}
      />

      <View className="flex-1 bg-ink-50 dark:bg-ink-900">
        {pageNumber > currentPage ? (
          <Pressable
            className="mx-5 mt-2 flex-row items-center justify-between rounded-2xl bg-brand-100 px-4 py-3 dark:bg-brand-900/40"
            onPress={() => setCurrentPage(pageNumber)}>
            <Text className="flex-1 text-sm text-brand-800 dark:text-brand-200">
              {strings('reader.setProgressPage', { page: pageNumber })}
            </Text>
            <Text className="text-sm font-semibold text-brand-700 dark:text-brand-300">
              {strings('reader.update')}
            </Text>
          </Pressable>
        ) : null}

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-4 pt-2"
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <View className="py-8">
              <ActivityIndicator size="small" color="#16a34a" />
            </View>
          ) : (
            <MushafPageView
              pageNumber={content.pageNumber}
              juz={content.juz}
              ayahs={content.ayahs}
              contentMode={pageContentMode}
              isAyahActive={(ayah) => activeAyah === ayah.number}
              onAyahPress={handleAyahPress}
            />
          )}
        </ScrollView>

        <AudioPlayerBar
          surahName={`Page ${pageNumber}`}
          activeAyah={activeAyahInfo?.numberInSurah ?? null}
          isPlaying={isPlaying}
          isLoading={audioLoading}
          reciterLabel={reciterLabel}
          subtitle={audioSubtitle}
          onTogglePlay={handleTogglePlay}
          onStop={stop}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <SafeAreaView edges={['bottom']} className="border-t border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800">
          <View className="flex-row items-center justify-between px-4 py-3">
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-700"
              disabled={pageNumber <= 1}
              onPress={() => goToPage(pageNumber - 1)}>
              <FontAwesome
                name="chevron-left"
                size={14}
                color={pageNumber <= 1 ? '#cbd5e1' : '#16a34a'}
              />
            </Pressable>

            <View className="flex-1 flex-row items-center justify-center gap-2 px-3">
              <TextInput
                className="w-14 rounded-xl border border-ink-200 bg-ink-50 px-2 py-1.5 text-center text-sm font-semibold text-ink-900 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
                keyboardType="number-pad"
                maxLength={3}
                placeholder={String(pageNumber)}
                placeholderTextColor="#94a3b8"
                value={jumpInput}
                onChangeText={setJumpInput}
                onSubmitEditing={handleJump}
              />
              <Text className="text-sm text-ink-700 dark:text-ink-200">/ {TOTAL_PAGES}</Text>
            </View>

            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-700"
              disabled={pageNumber >= TOTAL_PAGES}
              onPress={() => goToPage(pageNumber + 1)}>
              <FontAwesome
                name="chevron-right"
                size={14}
                color={pageNumber >= TOTAL_PAGES ? '#cbd5e1' : '#16a34a'}
              />
            </Pressable>
          </View>
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
        onSelectPageContentMode={(mode) => setPageContentMode(mode)}
      />
    </>
  );
}
