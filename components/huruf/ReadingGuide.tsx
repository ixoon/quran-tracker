import { Text, View } from 'react-native';

import { ArabicText } from '@/components/ArabicText';
import { getReadingByCategory } from '@/lib/huruf';
import { useStrings } from '@/lib/i18n';

export function ReadingGuide() {
  const strings = useStrings();
  const syllables = getReadingByCategory('syllable').slice(0, 12);
  const words = getReadingByCategory('word').slice(0, 8);

  return (
    <View className="mt-5 rounded-2xl bg-white p-5 dark:bg-ink-800">
      <Text className="text-lg font-bold text-ink-900 dark:text-ink-50">
        {strings('letters.readingBasics')}
      </Text>
      <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
        {strings('letters.readingBasicsDesc')}
      </Text>

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 items-center rounded-xl bg-ink-100 py-3 dark:bg-ink-700">
          <ArabicText variant="surahTitle">بَ</ArabicText>
          <Text className="mt-1 text-xs text-ink-700 dark:text-ink-200">{strings('letters.fatha')}</Text>
        </View>
        <View className="flex-1 items-center rounded-xl bg-ink-100 py-3 dark:bg-ink-700">
          <ArabicText variant="surahTitle">بِ</ArabicText>
          <Text className="mt-1 text-xs text-ink-700 dark:text-ink-200">{strings('letters.kasra')}</Text>
        </View>
        <View className="flex-1 items-center rounded-xl bg-ink-100 py-3 dark:bg-ink-700">
          <ArabicText variant="surahTitle">بُ</ArabicText>
          <Text className="mt-1 text-xs text-ink-700 dark:text-ink-200">{strings('letters.damma')}</Text>
        </View>
      </View>

      <Text className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
        {strings('letters.syllables')}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {syllables.map((item) => (
          <View
            key={item.id}
            className="min-w-[28%] flex-1 items-center rounded-xl border border-ink-200 bg-ink-50 px-2 py-3 dark:border-ink-600 dark:bg-ink-700">
            <ArabicText variant="surahList">{item.arabic}</ArabicText>
            <Text className="mt-1 text-xs font-medium text-brand-700 dark:text-brand-400">
              {item.transliteration}
            </Text>
          </View>
        ))}
      </View>

      <Text className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
        {strings('letters.shortWords')}
      </Text>
      <View className="gap-2">
        {words.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center justify-between rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 dark:border-ink-600 dark:bg-ink-700">
            <ArabicText variant="surahList">{item.arabic}</ArabicText>
            <View className="items-end">
              <Text className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                {item.transliteration}
              </Text>
              {item.hint ? (
                <Text className="text-xs text-ink-700 dark:text-ink-200">{item.hint}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
