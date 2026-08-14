import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, Text, View } from 'react-native';

import type { DailyHadith } from '@/lib/hadith-api';

type DailyHadithCardProps = {
  hadith: DailyHadith | null;
  loading: boolean;
  title: string;
};

export function DailyHadithCard({ hadith, loading, title }: DailyHadithCardProps) {
  if (loading) {
    return (
      <View className="mb-6 items-center justify-center rounded-3xl bg-white px-5 py-8 dark:bg-ink-800">
        <ActivityIndicator size="small" color="#16a34a" />
      </View>
    );
  }

  if (!hadith) return null;

  return (
    <View className="mb-6 rounded-3xl bg-white px-5 py-5 dark:bg-ink-800">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
          <FontAwesome name="book" size={14} color="#16a34a" />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            {title}
          </Text>
          <Text className="text-xs text-ink-500 dark:text-ink-400">
            {hadith.collectionLabel} · {hadith.hadithNumber}
          </Text>
        </View>
      </View>

      <Text className="text-base leading-7 text-ink-800 dark:text-ink-100">{hadith.text}</Text>
    </View>
  );
}
