import { Text, View } from 'react-native';

import type { PrayerName, PrayerTimeEntry } from '@/lib/prayer';

type PrayerScheduleListProps = {
  schedule: PrayerTimeEntry[];
  currentPrayer: PrayerName | 'none';
};

export function PrayerScheduleList({ schedule, currentPrayer }: PrayerScheduleListProps) {
  return (
    <View className="overflow-hidden rounded-3xl bg-white dark:bg-ink-800">
      {schedule.map((entry, index) => {
        const isCurrent = currentPrayer === entry.name;
        const isLast = index === schedule.length - 1;

        return (
          <View
            key={entry.name}
            className={`flex-row items-center justify-between px-5 py-4 ${
              !isLast ? 'border-b border-ink-100 dark:border-ink-700' : ''
            } ${isCurrent ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}>
            <View className="flex-row items-center gap-3">
              {isCurrent ? (
                <View className="h-2 w-2 rounded-full bg-brand-600" />
              ) : (
                <View className="h-2 w-2" />
              )}
              <Text
                className={`text-base font-medium ${
                  isCurrent
                    ? 'text-brand-700 dark:text-brand-300'
                    : 'text-ink-900 dark:text-ink-50'
                }`}>
                {entry.label}
              </Text>
            </View>
            <Text
              className={`text-base ${
                isCurrent
                  ? 'font-semibold text-brand-700 dark:text-brand-300'
                  : 'text-ink-700 dark:text-ink-200'
              }`}>
              {entry.formatted}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
