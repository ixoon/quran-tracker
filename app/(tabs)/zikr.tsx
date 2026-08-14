import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import { TabScrollView } from '@/components/TabScrollView';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ZikrCategoryCard } from '@/components/zikr/ZikrCategoryCard';
import { ZikrItemCard } from '@/components/zikr/ZikrItemCard';
import { useStrings } from '@/lib/i18n';
import { ZIKR_CATEGORIES, getZikrByCategory } from '@/lib/zikr';
import { getZikrCategoryText, zikrLangFromAppLanguage } from '@/lib/zikr/text';
import type { ZikrCategoryId } from '@/lib/zikr/types';
import { useSettingsStore } from '@/stores/settingsStore';

export default function ZikrScreen() {
  const strings = useStrings();
  const appLanguage = useSettingsStore((s) => s.appLanguage);
  const zikrLang = zikrLangFromAppLanguage(appLanguage);
  const showTransliteration = useSettingsStore((s) => s.showZikrTransliteration);
  const setShowZikrTransliteration = useSettingsStore((s) => s.setShowZikrTransliteration);

  const [selectedCategory, setSelectedCategory] = useState<ZikrCategoryId | null>(null);

  const category = useMemo(
    () => ZIKR_CATEGORIES.find((c) => c.id === selectedCategory) ?? null,
    [selectedCategory],
  );

  const items = useMemo(
    () => (selectedCategory ? getZikrByCategory(selectedCategory) : []),
    [selectedCategory],
  );

  if (category) {
    return (
      <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['top']}>
        <TabScrollView className="flex-1">
          <Pressable
            className="mb-4 flex-row items-center gap-2"
            onPress={() => setSelectedCategory(null)}>
            <FontAwesome name="chevron-left" size={14} color="#16a34a" />
            <Text className="text-sm font-medium text-brand-600 dark:text-brand-400">
              {strings('zikr.allCategories')}
            </Text>
          </Pressable>

          <View className="mb-5 flex-row items-start gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/40">
              <FontAwesome name={category.icon} size={20} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-ink-900 dark:text-ink-50">
                {getZikrCategoryText(category.title, zikrLang)}
              </Text>
              <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
                {getZikrCategoryText(category.description, zikrLang)}
              </Text>
            </View>
          </View>

          {items.map((item) => (
            <ZikrItemCard
              key={item.id}
              item={item}
              lang={zikrLang}
              showTransliteration={showTransliteration}
            />
          ))}
        </TabScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['top']}>
      <TabScrollView className="flex-1">
        <View className="mb-5 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-ink-900 dark:text-ink-50">
              {strings('tabs.zikr')}
            </Text>
            <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">{strings('zikr.subtitle')}</Text>
          </View>
        </View>

        <Pressable
          className="mb-5 flex-row items-center justify-between rounded-2xl bg-white px-4 py-4 dark:bg-ink-800"
          onPress={() => setShowZikrTransliteration(!showTransliteration)}>
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
              <FontAwesome name="font" size={16} color="#16a34a" />
            </View>
            <View>
              <Text className="text-base font-medium text-ink-900 dark:text-ink-50">
                {strings('zikr.transliteration')}
              </Text>
            </View>
          </View>
          <Text className="text-sm font-semibold text-brand-600 dark:text-brand-400">
            {showTransliteration ? strings('zikr.on') : strings('zikr.off')}
          </Text>
        </Pressable>

        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
          {strings('zikr.chooseCategory')}
        </Text>

        {ZIKR_CATEGORIES.map((cat) => (
          <ZikrCategoryCard
            key={cat.id}
            category={cat}
            lang={zikrLang}
            onPress={() => setSelectedCategory(cat.id)}
          />
        ))}
      </TabScrollView>
    </SafeAreaView>
  );
}
