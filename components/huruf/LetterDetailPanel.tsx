import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ArabicText } from '@/components/ArabicText';
import type { ArabicLetter } from '@/lib/huruf/types';
import { useStrings } from '@/lib/i18n';

type LetterDetailPanelProps = {
  letter: ArabicLetter;
  studied: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
  onMarkStudied: () => void;
};

export function LetterDetailPanel({
  letter,
  studied,
  isPlaying,
  isLoading,
  onPlay,
  onMarkStudied,
}: LetterDetailPanelProps) {
  const strings = useStrings();

  const playLabel = isLoading
    ? strings('common.loading')
    : isPlaying
      ? strings('letters.playing')
      : strings('letters.listenPronunciation');

  return (
    <View className="rounded-2xl bg-white p-5 dark:bg-ink-800">
      <View className="items-center">
        <ArabicText variant="letter">{letter.isolated}</ArabicText>
        <Text className="mt-2 text-xl font-bold text-ink-900 dark:text-ink-50">{letter.name}</Text>
        <Text className="mt-1 text-base text-ink-700 dark:text-ink-200">
          {letter.transliteration}
        </Text>
      </View>

      <Pressable
        className="mt-5 flex-row items-center justify-center gap-3 rounded-xl bg-brand-600 py-4 active:opacity-90"
        onPress={onPlay}>
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <FontAwesome name={isPlaying ? 'volume-up' : 'play'} size={18} color="#ffffff" />
        )}
        <Text className="text-base font-semibold text-white">{playLabel}</Text>
      </Pressable>

      <View className="mt-4 rounded-xl bg-ink-100 px-4 py-3 dark:bg-ink-700">
        <Text className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
          {strings('letters.howToPronounce')}
        </Text>
        <Text className="mt-1 text-sm leading-6 text-ink-700 dark:text-ink-200">{letter.makhraj}</Text>
      </View>

      {letter.example ? (
        <Text className="mt-3 text-sm text-ink-700 dark:text-ink-200">
          {strings('letters.example')}:{' '}
          <Text className="font-medium text-ink-900 dark:text-ink-50">{letter.example}</Text>
        </Text>
      ) : null}

      {!studied ? (
        <Pressable
          className="mt-4 flex-row items-center justify-center gap-2 rounded-xl border border-brand-600 py-3 dark:border-brand-400"
          onPress={onMarkStudied}>
          <FontAwesome name="check" size={14} color="#16a34a" />
          <Text className="font-semibold text-brand-700 dark:text-brand-400">
            {strings('letters.markLearned')}
          </Text>
        </Pressable>
      ) : (
        <View className="mt-4 flex-row items-center justify-center gap-2 py-3">
          <FontAwesome name="check-circle" size={16} color="#16a34a" />
          <Text className="font-medium text-brand-700 dark:text-brand-400">
            {strings('letters.learned')}
          </Text>
        </View>
      )}
    </View>
  );
}
