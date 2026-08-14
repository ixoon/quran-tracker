import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressRing } from '@/components/ProgressRing';
import { DailyHadithCard } from '@/components/DailyHadithCard';
import { TabScrollView } from '@/components/TabScrollView';
import { formatCountdownI18n, useAppLanguage, useStrings } from '@/lib/i18n';
import { TOTAL_PAGES } from '@/lib/constants';
import { useDailyHadith } from '@/hooks/useDailyHadith';
import { useGoalStore } from '@/stores/goalStore';
import { usePrayerSchedule } from '@/hooks/usePrayerSchedule';
import { useProgressStore } from '@/stores/progressStore';

export default function HomeScreen() {
  const strings = useStrings();
  const lang = useAppLanguage();
  const { currentPage, streakCount, markTodayAsRead, isMarkedToday } = useProgressStore();
  const { goalDays, getDailyTarget, getDaysRemaining } = useGoalStore();
  const { next: nextPrayer, city: prayerCity } = usePrayerSchedule();
  const { hadith, loading: hadithLoading } = useDailyHadith(lang);

  const progressPercent = Math.round((currentPage / TOTAL_PAGES) * 100);
  const markedToday = isMarkedToday();
  const dailyTarget = getDailyTarget(currentPage);
  const daysRemaining = getDaysRemaining();

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['top']}>
      <TabScrollView className="flex-1">
        <View className="mb-6">
          <Text className="text-sm font-medium text-brand-700 dark:text-brand-400">
            {strings('home.greeting')}
          </Text>
          <Text className="mt-1 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
            {strings('home.title')}
          </Text>
        </View>

        <DailyHadithCard hadith={hadith} loading={hadithLoading} title={strings('home.hadithOfDay')} />

        <View className="items-center rounded-3xl bg-white px-6 py-8 dark:bg-ink-800">
          <View className="relative items-center justify-center">
            <ProgressRing progress={progressPercent} />
            <View className="absolute items-center">
              <Text className="text-4xl font-bold text-ink-900 dark:text-ink-50">
                {currentPage}
              </Text>
              <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
                {strings('home.pagesOf', { total: TOTAL_PAGES })}
              </Text>
              <Text className="mt-2 text-lg font-semibold text-brand-600 dark:text-brand-400">
                {progressPercent}%
              </Text>
            </View>
          </View>

          <Link href="/progress" asChild>
            <Pressable className="mt-6 w-full rounded-2xl border border-ink-200 bg-ink-50 py-3 dark:border-ink-700 dark:bg-ink-900">
              <Text className="text-center text-sm font-medium text-ink-700 dark:text-ink-200">
                {strings('home.updateProgress')}
              </Text>
            </Pressable>
          </Link>
          <Text className="mt-2 text-center text-xs text-ink-700 dark:text-ink-200">
            {strings('home.manualProgressNote')}
          </Text>
        </View>

        <View className="mt-5 flex-row gap-4">
          <View className="flex-1 rounded-2xl bg-white p-5 dark:bg-ink-800">
            <View className="mb-3 flex-row items-center gap-2">
              <FontAwesome name="fire" size={18} color="#f97316" />
              <Text className="text-sm font-medium text-ink-700 dark:text-ink-200">{strings('home.streak')}</Text>
            </View>
            <Text className="text-3xl font-bold text-ink-900 dark:text-ink-50">
              {streakCount}
            </Text>
            <Text className="mt-1 text-xs text-ink-700 dark:text-ink-200">
              {streakCount === 1 ? strings('home.streakDay') : strings('home.streakDays')}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl bg-white p-5 dark:bg-ink-800">
            <View className="mb-3 flex-row items-center gap-2">
              <FontAwesome name="flag" size={16} color="#16a34a" />
              <Text className="text-sm font-medium text-ink-700 dark:text-ink-200">
                {strings('home.todaysGoal')}
              </Text>
            </View>
            {dailyTarget !== null ? (
              <>
                <Text className="text-3xl font-bold text-ink-900 dark:text-ink-50">
                  {dailyTarget}
                </Text>
                <Text className="mt-1 text-xs text-ink-700 dark:text-ink-200">
                  {strings('home.pagesDaysLeft', { days: daysRemaining ?? 0 })}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
                  {strings('home.noPlanYet')}
                </Text>
                <Link href="/goal" asChild>
                  <Pressable className="mt-2">
                    <Text className="text-xs font-medium text-brand-600 dark:text-brand-400">
                      {strings('home.setKhatmaGoal')}
                    </Text>
                  </Pressable>
                </Link>
              </>
            )}
          </View>
        </View>

        <Pressable
          className={`mt-5 rounded-2xl py-4 ${
            markedToday ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-brand-600'
          }`}
          disabled={markedToday}
          onPress={markTodayAsRead}>
          <Text
            className={`text-center text-base font-semibold ${
              markedToday ? 'text-brand-700 dark:text-brand-300' : 'text-white'
            }`}>
            {markedToday ? strings('home.markedToday') : strings('home.markTodayRead')}
          </Text>
        </Pressable>

        <Link href="/(tabs)/prayer" asChild>
          <Pressable className="mt-5 flex-row items-center justify-between rounded-2xl bg-white p-5 dark:bg-ink-800">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
                <FontAwesome name="clock-o" size={18} color="#16a34a" />
              </View>
              <View>
                <Text className="text-sm text-ink-700 dark:text-ink-200">{strings('home.nextPrayer')}</Text>
                {nextPrayer && prayerCity ? (
                  <>
                    <Text className="text-lg font-semibold text-ink-900 dark:text-ink-50">
                      {nextPrayer.label} · {nextPrayer.formatted}
                    </Text>
                    <Text className="text-xs text-ink-700 dark:text-ink-200">
                      {prayerCity.name} · {strings('home.inCountdown', { time: formatCountdownI18n(nextPrayer.minutesUntil, lang) })}
                    </Text>
                  </>
                ) : (
                  <Text className="text-lg font-semibold text-ink-900 dark:text-ink-50">
                    {strings('home.setCity')}
                  </Text>
                )}
              </View>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#94a3b8" />
          </Pressable>
        </Link>

        {goalDays !== null && (
          <Text className="mt-4 text-center text-xs text-ink-700 dark:text-ink-200">
            {strings('home.khatmaPlan', { days: goalDays })}
          </Text>
        )}
      </TabScrollView>
    </SafeAreaView>
  );
}
