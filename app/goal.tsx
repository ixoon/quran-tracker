import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStrings } from '@/lib/i18n';
import { useGoalStore } from '@/stores/goalStore';

const PRESETS = [30, 60, 90, 120];

export default function GoalScreen() {
  const router = useRouter();
  const strings = useStrings();
  const { setGoal } = useGoalStore();

  const handleSelect = (days: number) => {
    setGoal(days);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['bottom']}>
      <View className="px-5 pt-4">
        <Text className="text-base text-ink-700 dark:text-ink-200">{strings('goal.intro')}</Text>

        <View className="mt-6 gap-3">
          {PRESETS.map((days) => (
            <Pressable
              key={days}
              className="rounded-2xl bg-white px-5 py-4 dark:bg-ink-800"
              onPress={() => handleSelect(days)}>
              <Text className="text-lg font-semibold text-ink-900 dark:text-ink-50">
                {strings('goal.daysPreset', { days })}
              </Text>
              <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
                {strings('goal.pagesPerDay', { pages: Math.ceil(604 / days) })}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
