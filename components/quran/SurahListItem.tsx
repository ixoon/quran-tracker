import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, Text, View } from 'react-native';

import { ArabicText } from '@/components/ArabicText';
import type { SurahMeta } from '@/lib/quran-types';

type SurahListItemProps = {
  surah: SurahMeta;
  onPress: () => void;
};

export function SurahListItem({ surah, onPress }: SurahListItemProps) {
  return (
    <Pressable
      className="flex-row items-center gap-4 rounded-2xl bg-white px-4 py-4 dark:bg-ink-800"
      onPress={onPress}>
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40">
        <Text className="text-sm font-bold text-brand-700 dark:text-brand-300">{surah.number}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
          {surah.englishName}
        </Text>
        <Text className="mt-0.5 text-sm text-ink-700 dark:text-ink-200">
          {surah.englishNameTranslation} · {surah.numberOfAyahs} ayahs · {surah.revelationType}
        </Text>
      </View>

      <ArabicText variant="surahList" className="max-w-[120px]" numberOfLines={1}>
        {surah.name}
      </ArabicText>

      <FontAwesome name="chevron-right" size={12} color="#94a3b8" />
    </Pressable>
  );
}
