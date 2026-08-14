import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, Text, View } from 'react-native';

import { ArabicText } from '@/components/ArabicText';
import type { ArabicLetter } from '@/lib/huruf/types';

type LetterTileProps = {
  letter: ArabicLetter;
  selected: boolean;
  studied: boolean;
  onPress: () => void;
};

export function LetterTile({ letter, selected, studied, onPress }: LetterTileProps) {
  return (
    <Pressable
      className={`aspect-square items-center justify-center rounded-2xl border ${
        selected
          ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/40'
          : 'border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800'
      }`}
      onPress={onPress}>
      <ArabicText variant="surahList" className="text-ink-900 dark:text-ink-50">
        {letter.isolated}
      </ArabicText>
      <Text className="mt-1 text-xs font-medium text-ink-700 dark:text-ink-200">
        {letter.name}
      </Text>
      {studied ? (
        <View className="absolute right-1.5 top-1.5">
          <FontAwesome name="check-circle" size={12} color="#16a34a" />
        </View>
      ) : null}
    </Pressable>
  );
}
