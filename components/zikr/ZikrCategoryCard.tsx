import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, Text, View } from 'react-native';

import { useStrings } from '@/lib/i18n';
import { getZikrByCategory } from '@/lib/zikr/items';
import { getZikrCategoryText } from '@/lib/zikr/text';
import type { ZikrCategory, ZikrLang } from '@/lib/zikr/types';

type ZikrCategoryCardProps = {
  category: ZikrCategory;
  lang: ZikrLang;
  onPress: () => void;
};

export function ZikrCategoryCard({ category, lang, onPress }: ZikrCategoryCardProps) {
  const strings = useStrings();
  const count = getZikrByCategory(category.id).length;

  return (
    <Pressable
      className="mb-3 flex-row items-center gap-4 rounded-2xl bg-white px-4 py-4 active:opacity-80 dark:bg-ink-800"
      onPress={onPress}>
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/40">
        <FontAwesome name={category.icon} size={20} color="#16a34a" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
          {getZikrCategoryText(category.title, lang)}
        </Text>
        <Text className="mt-0.5 text-sm text-ink-700 dark:text-ink-200">
          {getZikrCategoryText(category.description, lang)}
        </Text>
        <Text className="mt-1 text-xs text-ink-700 dark:text-ink-200">
          {strings('zikr.adhkarCount', { count })}
        </Text>
      </View>
      <FontAwesome name="chevron-right" size={12} color="#94a3b8" />
    </Pressable>
  );
}
