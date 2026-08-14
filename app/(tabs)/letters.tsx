import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import { TabScrollView } from '@/components/TabScrollView';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LetterDetailPanel } from '@/components/huruf/LetterDetailPanel';
import { HurufProgressSummary, LetterQuiz } from '@/components/huruf/LetterQuiz';
import { LetterTile } from '@/components/huruf/LetterTile';
import { ReadingGuide } from '@/components/huruf/ReadingGuide';
import { ReadingQuiz } from '@/components/huruf/ReadingQuiz';
import { useLetterAudio } from '@/hooks/useLetterAudio';
import { ARABIC_LETTERS } from '@/lib/huruf';
import type { QuizMode } from '@/lib/huruf/types';
import { useStrings } from '@/lib/i18n';
import { useHurufStore } from '@/stores/hurufStore';

type TabMode = 'learn' | 'practice';

export default function LettersScreen() {
  const strings = useStrings();
  const [tab, setTab] = useState<TabMode>('learn');
  const [selectedId, setSelectedId] = useState<string>(ARABIC_LETTERS[0].id);
  const [quizMode, setQuizMode] = useState<QuizMode>('listen');

  const studiedLetterIds = useHurufStore((s) => s.studiedLetterIds);
  const markStudied = useHurufStore((s) => s.markStudied);
  const { playingId, isLoading, playLetter } = useLetterAudio();

  const practiceModes = useMemo(
    () =>
      [
        { id: 'listen' as const, label: strings('letters.listen'), description: strings('letters.listenDesc') },
        {
          id: 'recognize' as const,
          label: strings('letters.recognize'),
          description: strings('letters.recognizeDesc'),
        },
        {
          id: 'reading' as const,
          label: strings('letters.reading'),
          description: strings('letters.readingDesc'),
        },
      ],
    [strings],
  );

  const selectedLetter = useMemo(
    () => ARABIC_LETTERS.find((letter) => letter.id === selectedId) ?? ARABIC_LETTERS[0],
    [selectedId],
  );

  const isStudied = studiedLetterIds.includes(selectedLetter.id);
  const isPlaying = playingId === selectedLetter.id;

  const tabLabels: Record<TabMode, string> = {
    learn: strings('letters.learn'),
    practice: strings('letters.practice'),
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['top']}>
      <TabScrollView className="flex-1">
        <View className="mb-5">
          <Text className="text-3xl font-bold text-ink-900 dark:text-ink-50">
            {strings('letters.title')}
          </Text>
          <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
            {strings('letters.subtitle')}
          </Text>
        </View>

        <HurufProgressSummary />

        <View className="mb-5 mt-5 flex-row rounded-2xl bg-white p-1 dark:bg-ink-800">
          {(['learn', 'practice'] as TabMode[]).map((mode) => (
            <Pressable
              key={mode}
              className={`flex-1 items-center rounded-xl py-3 ${
                tab === mode ? 'bg-brand-600' : ''
              }`}
              onPress={() => setTab(mode)}>
              <Text
                className={`text-sm font-semibold ${
                  tab === mode ? 'text-white' : 'text-ink-700 dark:text-ink-200'
                }`}>
                {tabLabels[mode]}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'learn' ? (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
              {strings('letters.all28')}
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {ARABIC_LETTERS.map((letter) => (
                <View key={letter.id} className="w-[22.5%]">
                  <LetterTile
                    letter={letter}
                    selected={letter.id === selectedId}
                    studied={studiedLetterIds.includes(letter.id)}
                    onPress={() => setSelectedId(letter.id)}
                  />
                </View>
              ))}
            </View>

            <View className="mt-5">
              <LetterDetailPanel
                letter={selectedLetter}
                studied={isStudied}
                isPlaying={isPlaying}
                isLoading={isLoading && playingId === selectedLetter.id}
                onPlay={() => void playLetter(selectedLetter.id, selectedLetter.audioSlug)}
                onMarkStudied={() => markStudied(selectedLetter.id)}
              />
            </View>

            <ReadingGuide />
          </>
        ) : (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
              {strings('letters.practiceMode')}
            </Text>

            <View className="mb-4 gap-2">
              {practiceModes.map((mode) => (
                <Pressable
                  key={mode.id}
                  className={`rounded-2xl border px-4 py-4 ${
                    quizMode === mode.id
                      ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/30'
                      : 'border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800'
                  }`}
                  onPress={() => setQuizMode(mode.id)}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
                        {mode.label}
                      </Text>
                      <Text className="mt-0.5 text-sm text-ink-700 dark:text-ink-200">
                        {mode.description}
                      </Text>
                    </View>
                    {quizMode === mode.id ? (
                      <FontAwesome name="check-circle" size={18} color="#16a34a" />
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </View>

            {quizMode === 'reading' ? (
              <ReadingQuiz key="reading" />
            ) : (
              <LetterQuiz key={quizMode} mode={quizMode} />
            )}
          </>
        )}
      </TabScrollView>
    </SafeAreaView>
  );
}
