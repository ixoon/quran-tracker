import { useEffect } from 'react';
import { Appearance, Platform, useColorScheme as useSystemColorScheme } from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';

function resolveTheme(
  preference: 'system' | 'light' | 'dark',
  system: 'light' | 'dark' | null | undefined,
): 'light' | 'dark' {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return system === 'dark' ? 'dark' : 'light';
}

export function ThemeSync() {
  const theme = useSettingsStore((s) => s.theme);
  const systemScheme = useSystemColorScheme();

  useEffect(() => {
    const resolved = resolveTheme(theme, systemScheme);

    if (Platform.OS === 'web') {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', resolved === 'dark');
      }
      return;
    }

    // Android crashes if null is passed — always set the resolved scheme.
    Appearance.setColorScheme(resolved);
  }, [theme, systemScheme]);

  return null;
}
