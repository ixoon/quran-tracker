import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Modal, Pressable, Text, View } from 'react-native';

import { useStrings } from '@/lib/i18n';
import type { AppTheme } from '@/lib/i18n/types';
import { useSettingsStore } from '@/stores/settingsStore';

type ThemePickerModalProps = {
  visible: boolean;
  onClose: () => void;
};

const THEMES: AppTheme[] = ['system', 'light', 'dark'];

export function ThemePickerModal({ visible, onClose }: ThemePickerModalProps) {
  const strings = useStrings();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const labelFor = (value: AppTheme) => {
    if (value === 'system') return strings('profile.themeSystem');
    if (value === 'light') return strings('profile.themeLight');
    return strings('profile.themeDark');
  };

  const iconFor = (value: AppTheme): React.ComponentProps<typeof FontAwesome>['name'] => {
    if (value === 'system') return 'mobile';
    if (value === 'light') return 'sun-o';
    return 'moon-o';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="rounded-t-3xl bg-white px-5 pb-8 pt-5 dark:bg-ink-800" onPress={() => {}}>
          <Text className="text-lg font-semibold text-ink-900 dark:text-ink-50">
            {strings('profile.theme')}
          </Text>

          <View className="mt-4 gap-2">
            {THEMES.map((value) => {
              const selected = value === theme;
              return (
                <Pressable
                  key={value}
                  className={`flex-row items-center justify-between rounded-2xl px-4 py-4 ${
                    selected ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-ink-50 dark:bg-ink-900'
                  }`}
                  onPress={() => {
                    setTheme(value);
                    onClose();
                  }}>
                  <View className="flex-row items-center gap-3">
                    <FontAwesome name={iconFor(value)} size={18} color="#16a34a" />
                    <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
                      {labelFor(value)}
                    </Text>
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
