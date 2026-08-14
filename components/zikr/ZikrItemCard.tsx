import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ArabicText } from '@/components/ArabicText';
import { useStrings } from '@/lib/i18n';
import type { ZikrItem, ZikrLang } from '@/lib/zikr/types';
import { getZikrLocalizedText } from '@/lib/zikr/text';

type ZikrItemCardProps = {
  item: ZikrItem;
  lang: ZikrLang;
  showTransliteration: boolean;
};

export function ZikrItemCard({ item, lang, showTransliteration }: ZikrItemCardProps) {
  const strings = useStrings();
  const [count, setCount] = useState(0);
  const target = item.repeat ?? 1;
  const complete = count >= target;

  const translation = getZikrLocalizedText(item.id, 'translation', item.translation, lang);
  const virtue = item.virtue
    ? getZikrLocalizedText(item.id, 'virtue', item.virtue, lang)
    : undefined;

  return (
    <View className="mb-4 rounded-2xl bg-white p-5 dark:bg-ink-800">
      {item.reference ? (
        <Text className="mb-3 text-xs font-medium text-brand-700 dark:text-brand-400">
          {item.reference}
          {target > 1 ? ` · ×${target}` : ''}
        </Text>
      ) : null}

      <ArabicText variant="zikr">{item.arabic}</ArabicText>

      {showTransliteration ? (
        <Text className="mt-3 text-base italic leading-7 text-ink-700 dark:text-ink-200">
          {item.transliteration}
        </Text>
      ) : null}

      <Text className="mt-3 text-base leading-7 text-ink-700 dark:text-ink-200">{translation}</Text>

      {virtue ? (
        <View className="mt-3 rounded-xl bg-brand-50 px-3 py-2 dark:bg-brand-900/30">
          <Text className="text-sm leading-6 text-brand-800 dark:text-brand-400">{virtue}</Text>
        </View>
      ) : null}

      {target > 1 ? (
        <View className="mt-4 flex-row items-center justify-between">
          <Pressable
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 ${
              complete ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-brand-600'
            }`}
            onPress={() => setCount((c) => Math.min(c + 1, target))}>
            <FontAwesome name="plus" size={12} color={complete ? '#16a34a' : '#ffffff'} />
            <Text
              className={`font-semibold ${complete ? 'text-brand-700 dark:text-brand-400' : 'text-white'}`}>
              {complete ? strings('zikr.completed') : strings('zikr.count')}
            </Text>
          </Pressable>

          <View className="ml-3 min-w-[72px] items-center rounded-xl bg-ink-100 px-4 py-3 dark:bg-ink-700">
            <Text className="text-lg font-bold text-ink-900 dark:text-ink-50">
              {count}/{target}
            </Text>
          </View>

          {count > 0 ? (
            <Pressable
              className="ml-2 h-11 w-11 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-700"
              onPress={() => setCount(0)}>
              <FontAwesome name="undo" size={14} color="#64748b" />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
