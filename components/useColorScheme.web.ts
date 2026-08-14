import { useSettingsStore } from '@/stores/settingsStore';

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useColorScheme(): 'light' | 'dark' {
  const theme = useSettingsStore((s) => s.theme);

  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return systemPrefersDark() ? 'dark' : 'light';
}
