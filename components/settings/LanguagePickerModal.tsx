import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Modal, Pressable, Text, View } from 'react-native';

import { APP_LANGUAGES, useStrings } from '@/lib/i18n';
import type { AppLanguage } from '@/lib/i18n/types';
import { useSettingsStore } from '@/stores/settingsStore';

type LanguagePickerModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function LanguagePickerModal({ visible, onClose }: LanguagePickerModalProps) {
  const strings = useStrings();
  const appLanguage = useSettingsStore((s) => s.appLanguage);
  const setAppLanguage = useSettingsStore((s) => s.setAppLanguage);

  const select = (lang: AppLanguage) => {
    setAppLanguage(lang);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="rounded-t-3xl bg-white px-5 pb-8 pt-5 dark:bg-ink-800" onPress={() => {}}>
          <Text className="text-lg font-semibold text-ink-900 dark:text-ink-50">
            {strings('profile.language')}
          </Text>

          <View className="mt-4 gap-2">
            {APP_LANGUAGES.map((lang) => {
              const selected = lang.id === appLanguage;
              return (
                <Pressable
                  key={lang.id}
                  className={`flex-row items-center justify-between rounded-2xl px-4 py-4 ${
                    selected ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-ink-50 dark:bg-ink-900'
                  }`}
                  onPress={() => select(lang.id)}>
                  <View>
                    <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
                      {lang.nativeLabel}
                    </Text>
                    <Text className="mt-0.5 text-sm text-ink-700 dark:text-ink-200">{lang.label}</Text>
                  </View>
                  {selected ? <FontAwesome name="check" size={16} color="#16a34a" /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
