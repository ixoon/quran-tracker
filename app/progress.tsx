import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TOTAL_PAGES } from '@/lib/constants';
import { useStrings } from '@/lib/i18n';
import { useProgressStore } from '@/stores/progressStore';

function clampPage(value: number) {
  return Math.max(0, Math.min(value, TOTAL_PAGES));
}

export default function ProgressScreen() {
  const strings = useStrings();
  const router = useRouter();
  const currentPage = useProgressStore((s) => s.currentPage);
  const setCurrentPage = useProgressStore((s) => s.setCurrentPage);

  const [pageInput, setPageInput] = useState(String(currentPage));

  const parsedPage = clampPage(Number.parseInt(pageInput, 10) || 0);
  const progressPercent = Math.round((parsedPage / TOTAL_PAGES) * 100);

  const adjust = (delta: number) => {
    const next = clampPage(parsedPage + delta);
    setPageInput(String(next));
  };

  const handleSave = () => {
    setCurrentPage(parsedPage);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['bottom']}>
      <View className="flex-1 px-5 pt-4">
        <Text className="text-base text-ink-700 dark:text-ink-200">{strings('progress.intro')}</Text>

        <View className="mt-8 items-center rounded-3xl bg-white px-6 py-8 dark:bg-ink-800">
          <Text className="text-sm font-medium text-ink-700 dark:text-ink-200">
            {strings('progress.readUpTo')}
          </Text>

          <View className="mt-4 flex-row items-center gap-4">
            <Pressable
              className="h-12 w-12 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700"
              onPress={() => adjust(-10)}>
              <Text className="text-lg font-bold text-ink-900 dark:text-ink-50">−10</Text>
            </Pressable>
            <Pressable
              className="h-12 w-12 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700"
              onPress={() => adjust(-1)}>
              <Text className="text-xl font-bold text-ink-900 dark:text-ink-50">−</Text>
            </Pressable>

            <TextInput
              className="min-w-[88px] rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-center text-3xl font-bold text-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50"
              keyboardType="number-pad"
              maxLength={3}
              value={pageInput}
              onChangeText={setPageInput}
            />

            <Pressable
              className="h-12 w-12 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700"
              onPress={() => adjust(1)}>
              <Text className="text-xl font-bold text-ink-900 dark:text-ink-50">+</Text>
            </Pressable>
            <Pressable
              className="h-12 w-12 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700"
              onPress={() => adjust(10)}>
              <Text className="text-lg font-bold text-ink-900 dark:text-ink-50">+10</Text>
            </Pressable>
          </View>

          <Text className="mt-4 text-sm text-ink-700 dark:text-ink-200">
            {strings('progress.pagesOf', { total: TOTAL_PAGES, percent: progressPercent })}
          </Text>
        </View>

        <View className="mt-6 flex-row flex-wrap gap-2">
          {[0, 50, 100, 200, 300, 400, 500, 604].map((preset) => (
            <Pressable
              key={preset}
              className="rounded-xl bg-white px-4 py-2 dark:bg-ink-800"
              onPress={() => setPageInput(String(preset))}>
              <Text className="text-sm font-medium text-ink-700 dark:text-ink-200">
                {strings('progress.pagePreset', { page: preset })}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable className="mt-8 rounded-2xl bg-brand-600 py-4" onPress={handleSave}>
          <Text className="text-center text-base font-semibold text-white">{strings('progress.save')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
