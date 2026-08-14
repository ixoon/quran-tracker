import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { useStrings } from '@/lib/i18n';
import type { EditionOption, PageContentMode, ReaderLayout, ReciterOption } from '@/lib/quran-types';

type ReaderSettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  translations: EditionOption[];
  reciters: ReciterOption[];
  translationId: string;
  reciterId: string;
  showTranslation: boolean;
  readerLayout?: ReaderLayout;
  pageContentMode?: PageContentMode;
  onSelectTranslation: (id: string) => void;
  onSelectReciter: (id: string) => void;
  onToggleTranslation: () => void;
  onSelectReaderLayout?: (layout: ReaderLayout) => void;
  onSelectPageContentMode?: (mode: PageContentMode) => void;
};

export function ReaderSettingsModal({
  visible,
  onClose,
  translations,
  reciters,
  translationId,
  reciterId,
  showTranslation,
  readerLayout,
  pageContentMode,
  onSelectTranslation,
  onSelectReciter,
  onToggleTranslation,
  onSelectReaderLayout,
  onSelectPageContentMode,
}: ReaderSettingsModalProps) {
  const strings = useStrings();

  const readerLayouts: { id: ReaderLayout; label: string }[] = [
    { id: 'ayah', label: strings('reader.layoutAyah') },
    { id: 'page', label: strings('reader.layoutPage') },
  ];

  const pageContentModes: { id: PageContentMode; label: string }[] = [
    { id: 'arabic', label: strings('reader.pageArabicOnly') },
    { id: 'translation', label: strings('reader.pageTranslationOnly') },
    { id: 'both', label: strings('reader.pageBoth') },
  ];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="max-h-[80%] rounded-t-3xl bg-ink-50 dark:bg-ink-900"
          onPress={(e) => e.stopPropagation()}>
          <View className="items-center py-3">
            <View className="h-1 w-10 rounded-full bg-ink-200 dark:bg-ink-700" />
          </View>

          <ScrollView className="px-5 pb-8" showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-bold text-ink-900 dark:text-ink-50">
              {strings('reader.settings')}
            </Text>

            {onSelectReaderLayout && readerLayout ? (
              <>
                <Text className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
                  {strings('reader.layout')}
                </Text>
                <View className="gap-2">
                  {readerLayouts.map((item) => {
                    const selected = item.id === readerLayout;
                    return (
                      <Pressable
                        key={item.id}
                        className={`rounded-2xl px-4 py-3 ${
                          selected ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-white dark:bg-ink-800'
                        }`}
                        onPress={() => onSelectReaderLayout(item.id)}>
                        <Text
                          className={`text-sm font-medium ${
                            selected
                              ? 'text-brand-700 dark:text-brand-300'
                              : 'text-ink-900 dark:text-ink-50'
                          }`}>
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            <Pressable
              className="mt-5 flex-row items-center justify-between rounded-2xl bg-white px-4 py-4 dark:bg-ink-800"
              onPress={onToggleTranslation}>
              <Text className="text-base font-medium text-ink-900 dark:text-ink-50">
                {strings('reader.showTranslation')}
              </Text>
              <Text className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                {showTranslation ? strings('common.on') : strings('common.off')}
              </Text>
            </Pressable>

            {onSelectPageContentMode && pageContentMode ? (
              <>
                <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
                  {strings('reader.pageDisplay')}
                </Text>
                <View className="gap-2">
                  {pageContentModes.map((item) => {
                    const selected = item.id === pageContentMode;
                    return (
                      <Pressable
                        key={item.id}
                        className={`rounded-2xl px-4 py-3 ${
                          selected ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-white dark:bg-ink-800'
                        }`}
                        onPress={() => onSelectPageContentMode(item.id)}>
                        <Text
                          className={`text-sm font-medium ${
                            selected
                              ? 'text-brand-700 dark:text-brand-300'
                              : 'text-ink-900 dark:text-ink-50'
                          }`}>
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
              {strings('reader.translation')}
            </Text>
            <View className="gap-2">
              {translations.map((item) => {
                const selected = item.id === translationId;
                return (
                  <Pressable
                    key={item.id}
                    className={`rounded-2xl px-4 py-3 ${
                      selected ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-white dark:bg-ink-800'
                    }`}
                    onPress={() => onSelectTranslation(item.id)}>
                    <Text
                      className={`text-sm font-medium ${
                        selected
                          ? 'text-brand-700 dark:text-brand-300'
                          : 'text-ink-900 dark:text-ink-50'
                      }`}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
              {strings('reader.reciter')}
            </Text>
            <View className="gap-2">
              {reciters.map((item) => {
                const selected = item.id === reciterId;
                return (
                  <Pressable
                    key={item.id}
                    className={`rounded-2xl px-4 py-3 ${
                      selected ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-white dark:bg-ink-800'
                    }`}
                    onPress={() => onSelectReciter(item.id)}>
                    <Text
                      className={`text-sm font-medium ${
                        selected
                          ? 'text-brand-700 dark:text-brand-300'
                          : 'text-ink-900 dark:text-ink-50'
                      }`}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
