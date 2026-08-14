import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';

export function useColorScheme(): 'light' | 'dark' {
  const theme = useSettingsStore((s) => s.theme);
  const systemScheme = useSystemColorScheme();

  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return systemScheme === 'dark' ? 'dark' : 'light';
}
