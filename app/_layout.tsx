import '../global.css';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthGate } from '@/components/AuthGate';
import { ThemeSync } from '@/components/ThemeSync';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/stores/authStore';
import { usePrayerStore } from '@/stores/prayerStore';
import { useSettingsStore } from '@/stores/settingsStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    UthmanicHafs: require('../assets/fonts/UthmanicHafs.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const initializeAuth = useAuthStore((s) => s.initialize);
  const refreshNotifications = usePrayerStore((s) => s.refreshNotifications);
  const refreshZikrNotifications = useSettingsStore((s) => s.refreshZikrNotifications);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    void refreshNotifications();
    void refreshZikrNotifications();
  }, [refreshNotifications, refreshZikrNotifications]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemeSync />
      <AuthGate>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="reader/[surahId]" options={{ title: 'Reader' }} />
          <Stack.Screen name="reader/page/[pageNumber]" options={{ title: 'Mushaf' }} />
          <Stack.Screen name="goal" options={{ title: 'Khatma goal', presentation: 'modal' }} />
          <Stack.Screen name="progress" options={{ title: 'Reading progress', presentation: 'modal' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </AuthGate>
    </ThemeProvider>
  );
}
