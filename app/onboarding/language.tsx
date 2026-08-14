import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/AuthButton';
import { APP_LANGUAGES } from '@/lib/i18n';
import type { AppLanguage } from '@/lib/i18n/types';
import { t } from '@/lib/i18n/strings';
import { useSettingsStore } from '@/stores/settingsStore';

export default function LanguageOnboardingScreen() {
  const router = useRouter();
  const setAppLanguage = useSettingsStore((s) => s.setAppLanguage);
  const [selected, setSelected] = useState<AppLanguage>('en');

  const preview = (key: Parameters<typeof t>[1]) => t(selected, key);

  const handleContinue = () => {
    setAppLanguage(selected);
    router.replace('/auth/welcome');
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900">
      <View className="flex-1 px-6 pt-6">
        <View className="mb-5 items-center">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-3xl bg-brand-100 dark:bg-brand-900/40">
            <FontAwesome name="globe" size={24} color="#16a34a" />
          </View>
          <Text className="text-center text-2xl font-bold text-ink-900 dark:text-ink-50">
            {preview('onboarding.languageTitle')}
          </Text>
          <Text className="mt-2 text-center text-sm text-ink-700 dark:text-ink-200">
            {preview('onboarding.languageSubtitle')}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-2.5 pb-2"
          showsVerticalScrollIndicator={false}>
          {APP_LANGUAGES.map((lang) => {
            const active = lang.id === selected;
            return (
              <Pressable
                key={lang.id}
                className={`flex-row items-center justify-between rounded-2xl px-4 py-3.5 ${
                  active
                    ? 'border-2 border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                    : 'border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800'
                }`}
                onPress={() => setSelected(lang.id)}>
                <View className="flex-1 pr-3">
                  <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
                    {lang.nativeLabel}
                  </Text>
                  <Text className="mt-0.5 text-sm text-ink-700 dark:text-ink-200">{lang.label}</Text>
                </View>
                {active ? <FontAwesome name="check-circle" size={20} color="#16a34a" /> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="pb-6 pt-4">
          <AuthButton label={preview('onboarding.continue')} onPress={handleContinue} />
        </View>
      </View>
    </SafeAreaView>
  );
}
