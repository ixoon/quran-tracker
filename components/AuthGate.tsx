import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

type AuthGateProps = {
  children: React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const segments = useSegments();
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const session = useAuthStore((s) => s.session);
  const hasChosenAuthMode = useAuthStore((s) => s.hasChosenAuthMode);
  const hasChosenLanguage = useSettingsStore((s) => s.hasChosenLanguage);

  const [authHydrated, setAuthHydrated] = useState(useAuthStore.persist.hasHydrated());
  const [settingsHydrated, setSettingsHydrated] = useState(useSettingsStore.persist.hasHydrated());

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setAuthHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true));
      const timeout = setTimeout(() => setAuthHydrated(true), 3000);
      return () => {
        unsub();
        clearTimeout(timeout);
      };
    }
  }, []);

  useEffect(() => {
    if (useSettingsStore.persist.hasHydrated()) {
      setSettingsHydrated(true);
    } else {
      const unsub = useSettingsStore.persist.onFinishHydration(() => setSettingsHydrated(true));
      const timeout = setTimeout(() => setSettingsHydrated(true), 3000);
      return () => {
        unsub();
        clearTimeout(timeout);
      };
    }
  }, []);

  const hydrated = authHydrated && settingsHydrated;

  useEffect(() => {
    if (!isInitialized || !hydrated) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inAuthGroup = segments[0] === 'auth';
    const needsLanguage = !hasChosenLanguage;
    const needsWelcome = !session && !hasChosenAuthMode;

    if (needsLanguage && !inOnboarding) {
      router.replace('/onboarding/language');
      return;
    }

    if (!needsLanguage && needsWelcome && !inAuthGroup && !inOnboarding) {
      router.replace('/auth/welcome');
    }
  }, [isInitialized, hydrated, hasChosenLanguage, session, hasChosenAuthMode, segments, router]);

  if (!isInitialized || !hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-ink-50 dark:bg-ink-900">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return children;
}
