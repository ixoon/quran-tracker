import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, Text, View } from 'react-native';

import { ArabicText } from '@/components/ArabicText';
import type { Ayah } from '@/lib/quran-types';

type AyahBlockProps = {
  ayah: Ayah;
  surahNumber: number;
  isActive: boolean;
  isFavorite: boolean;
  showTranslation: boolean;
  onToggleFavorite: () => void;
  onPress?: () => void;
};

export function AyahBlock({
  ayah,
  surahNumber,
  isActive,
  isFavorite,
  showTranslation,
  onToggleFavorite,
  onPress,
}: AyahBlockProps) {
  return (
    <Pressable
      className={`mb-4 rounded-2xl border px-4 py-4 ${
        isActive
          ? 'border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-900/30'
          : 'border-transparent bg-white dark:bg-ink-800'
      }`}
      onPress={onPress}>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/50">
            <Text className="text-xs font-semibold text-brand-700 dark:text-brand-300">
              {surahNumber}:{ayah.numberInSurah}
            </Text>
          </View>
          <Text className="text-xs text-ink-700 dark:text-ink-200">Page {ayah.page}</Text>
          {ayah.sajda ? (
            <View className="rounded-full bg-amber-100 px-2 py-0.5 dark:bg-amber-900/40">
              <Text className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
                Sajda
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable
          className="h-9 w-9 items-center justify-center"
          hitSlop={8}
          onPress={onToggleFavorite}>
          <FontAwesome
            name={isFavorite ? 'star' : 'star-o'}
            size={18}
            color={isFavorite ? '#f59e0b' : '#94a3b8'}
          />
        </Pressable>
      </View>

      <ArabicText variant="ayah">{ayah.text}</ArabicText>

      {showTranslation && ayah.translation ? (
        <Text className="mt-3 text-base leading-7 text-ink-700 dark:text-ink-200">
          {ayah.translation}
        </Text>
      ) : null}
    </Pressable>
  );
}
