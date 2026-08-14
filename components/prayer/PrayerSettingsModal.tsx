import { Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { useStrings } from '@/lib/i18n';
import {
  PRAYER_METHOD_OPTIONS,
  type PrayerCalculationMethodId,
} from '@/lib/prayer-methods';
import type { PrayerLocation } from '@/lib/prayer-locations';
import { getLocationSourceLabel } from '@/lib/prayer-schedule';

type PrayerSettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  location: PrayerLocation | null;
  calculationMethod: PrayerCalculationMethodId | null;
  notificationsEnabled: boolean;
  onSelectMethod: (method: PrayerCalculationMethodId) => void;
  onToggleNotifications: (enabled: boolean) => void;
};

export function PrayerSettingsModal({
  visible,
  onClose,
  location,
  calculationMethod,
  notificationsEnabled,
  onSelectMethod,
  onToggleNotifications,
}: PrayerSettingsModalProps) {
  const strings = useStrings();
  const activeMethod = calculationMethod ?? location?.preferredMethod ?? 'muslimWorldLeague';

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
              {strings('prayer.settings')}
            </Text>

            {location ? (
              <View className="mt-5 rounded-2xl bg-white px-4 py-4 dark:bg-ink-800">
                <Text className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {location.name}
                </Text>
                <Text className="mt-2 text-sm leading-6 text-ink-700 dark:text-ink-200">
                  {getLocationSourceLabel(location)}
                </Text>
              </View>
            ) : null}

            {location?.source === 'vaktija' ? (
              <View className="mt-5 rounded-2xl bg-white px-4 py-4 dark:bg-ink-800">
                <Text className="text-sm leading-6 text-ink-700 dark:text-ink-200">
                  {strings('prayer.vaktijaNote')}
                </Text>
              </View>
            ) : location?.source === 'kosovo-official' ? (
              <View className="mt-5 rounded-2xl bg-white px-4 py-4 dark:bg-ink-800">
                <Text className="text-sm leading-6 text-ink-700 dark:text-ink-200">
                  {strings('prayer.kosovoNote')}
                </Text>
              </View>
            ) : (
              <View className="mt-5">
                <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
                  {strings('prayer.calculationMethod')}
                </Text>
                {PRAYER_METHOD_OPTIONS.map((option) => {
                  const selected = activeMethod === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      className={`mb-2 rounded-2xl px-4 py-4 ${
                        selected
                          ? 'bg-brand-100 dark:bg-brand-900/40'
                          : 'bg-white dark:bg-ink-800'
                      }`}
                      onPress={() => onSelectMethod(option.id)}>
                      <Text
                        className={`text-base font-semibold ${
                          selected
                            ? 'text-brand-700 dark:text-brand-300'
                            : 'text-ink-900 dark:text-ink-50'
                        }`}>
                        {option.label}
                      </Text>
                      <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
                        {option.description}
                      </Text>
                    </Pressable>
                  );
                })}
                <Text className="mt-2 px-1 text-xs text-ink-700 dark:text-ink-200">
                  {strings('prayer.hanafiNote')}
                </Text>
              </View>
            )}

            <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-white px-4 py-4 dark:bg-ink-800">
              <View className="flex-1 pr-4">
                <Text className="text-base font-medium text-ink-900 dark:text-ink-50">
                  {strings('prayer.reminders')}
                </Text>
                <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
                  {strings('prayer.remindersDesc')}
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={onToggleNotifications}
                trackColor={{ false: '#cbd5e1', true: '#86efac' }}
                thumbColor={notificationsEnabled ? '#16a34a' : '#f8fafc'}
              />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
