import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { TabScrollView } from '@/components/TabScrollView';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CityPickerModal } from '@/components/prayer/CityPickerModal';
import { PrayerScheduleList } from '@/components/prayer/PrayerScheduleList';
import { PrayerSettingsModal } from '@/components/prayer/PrayerSettingsModal';
import { QiblaCompass } from '@/components/qibla/QiblaCompass';
import { usePrayerSchedule } from '@/hooks/usePrayerSchedule';
import { formatCountdownI18n, useAppLanguage, useStrings } from '@/lib/i18n';
import { usePrayerStore } from '@/stores/prayerStore';

export default function PrayerScreen() {
  const strings = useStrings();
  const lang = useAppLanguage();
  const { location, schedule, next, current, todayLabel, sourceLabel, loading, error } =
    usePrayerSchedule();
  const {
    cityId,
    calculationMethod,
    notificationsEnabled,
    setCityId,
    setCalculationMethod,
    setNotificationsEnabled,
    refreshNotifications,
  } = usePrayerStore();

  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['top']}>
      <TabScrollView className="flex-1">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-ink-900 dark:text-ink-50">{strings('prayer.title')}</Text>
            <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
              {sourceLabel || strings('prayer.selectCity')}
            </Text>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-ink-800"
            onPress={() => setSettingsOpen(true)}>
            <FontAwesome name="cog" size={18} color="#64748b" />
          </Pressable>
        </View>

        <Pressable
          className="mt-5 flex-row items-center justify-between rounded-2xl bg-white px-4 py-4 dark:bg-ink-800"
          onPress={() => setCityPickerOpen(true)}>
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
              <FontAwesome name="map-marker" size={18} color="#16a34a" />
            </View>
            <View>
              <Text className="text-xs font-medium uppercase tracking-wide text-ink-700 dark:text-ink-200">
                {strings('prayer.city')}
              </Text>
              <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
                {location ? `${location.name}, ${location.country}` : strings('prayer.selectCityBtn')}
              </Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={12} color="#94a3b8" />
        </Pressable>

        {loading && location ? (
          <View className="mt-5 items-center rounded-3xl bg-white py-10 dark:bg-ink-800">
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        ) : null}

        {error ? (
          <View className="mt-5 rounded-3xl bg-white px-5 py-5 dark:bg-ink-800">
            <Text className="text-sm text-red-600 dark:text-red-400">{strings('prayer.loadError')}</Text>
          </View>
        ) : null}

        {location && next && !loading ? (
          <View className="mt-5 rounded-3xl bg-brand-600 px-5 py-6">
            <Text className="text-sm font-medium uppercase tracking-wide text-brand-100">
              {strings('prayer.nextPrayer')}
            </Text>
            <Text className="mt-2 text-3xl font-bold text-white">{next.label}</Text>
            <View className="mt-3 flex-row items-end justify-between">
              <Text className="text-2xl font-semibold text-white">{next.formatted}</Text>
              <Text className="text-sm font-medium text-brand-100">
                {strings('home.inCountdown', { time: formatCountdownI18n(next.minutesUntil, lang) })}
              </Text>
            </View>
            <Text className="mt-3 text-xs text-brand-100">{todayLabel}</Text>
          </View>
        ) : null}

        {!location && !loading ? (
          <View className="mt-5 rounded-3xl bg-white px-5 py-6 dark:bg-ink-800">
            <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
              {strings('prayer.chooseCityTitle')}
            </Text>
            <Text className="mt-2 text-sm text-ink-700 dark:text-ink-200">
              {strings('prayer.chooseCityBody')}
            </Text>
            <Pressable
              className="mt-4 self-start rounded-2xl bg-brand-600 px-4 py-3"
              onPress={() => setCityPickerOpen(true)}>
              <Text className="font-semibold text-white">{strings('prayer.selectCityBtn')}</Text>
            </Pressable>
          </View>
        ) : null}

        {location && schedule.length > 0 && !loading ? (
          <View className="mt-5">
            <Text className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
              {strings('prayer.todaysSchedule')}
            </Text>
            <PrayerScheduleList schedule={schedule} currentPrayer={current} />
          </View>
        ) : null}

        <View className="mt-5">
          <QiblaCompass />
        </View>
      </TabScrollView>

      <CityPickerModal
        visible={cityPickerOpen}
        selectedCityId={cityId}
        onClose={() => setCityPickerOpen(false)}
        onSelect={(selected) => void setCityId(selected.id)}
      />

      <PrayerSettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        location={location}
        calculationMethod={calculationMethod}
        notificationsEnabled={notificationsEnabled}
        onSelectMethod={(method) => void setCalculationMethod(method)}
        onToggleNotifications={(enabled) => void setNotificationsEnabled(enabled)}
      />
    </SafeAreaView>
  );
}
