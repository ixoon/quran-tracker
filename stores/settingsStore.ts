import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_RECITER_ID, DEFAULT_TRANSLATION_ID } from '@/lib/constants';
import { translationIdForLanguage } from '@/lib/i18n/languages';
import type { AppLanguage, AppTheme } from '@/lib/i18n/types';
import type { PageContentMode, ReaderLayout } from '@/lib/quran-types';
import { rescheduleZikrNotifications } from '@/lib/zikrNotifications';

type SettingsState = {
  appLanguage: AppLanguage;
  hasChosenLanguage: boolean;
  theme: AppTheme;
  translationId: string;
  reciterId: string;
  showTranslation: boolean;
  readerLayout: ReaderLayout;
  pageContentMode: PageContentMode;
  showZikrTransliteration: boolean;
  morningZikrNotifications: boolean;
  eveningZikrNotifications: boolean;
  morningZikrHour: number;
  morningZikrMinute: number;
  eveningZikrHour: number;
  eveningZikrMinute: number;
  setAppLanguage: (lang: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  setTranslationId: (id: string) => void;
  setReciterId: (id: string) => void;
  setShowTranslation: (show: boolean) => void;
  setReaderLayout: (layout: ReaderLayout) => void;
  setPageContentMode: (mode: PageContentMode) => void;
  setShowZikrTransliteration: (show: boolean) => void;
  setMorningZikrNotifications: (enabled: boolean) => Promise<void>;
  setEveningZikrNotifications: (enabled: boolean) => Promise<void>;
  refreshZikrNotifications: () => Promise<void>;
};

async function syncZikrNotifications(state: SettingsState) {
  await rescheduleZikrNotifications({
    morningEnabled: state.morningZikrNotifications,
    eveningEnabled: state.eveningZikrNotifications,
    morningHour: state.morningZikrHour,
    morningMinute: state.morningZikrMinute,
    eveningHour: state.eveningZikrHour,
    eveningMinute: state.eveningZikrMinute,
  });
}

type PersistedSettings = Partial<SettingsState> & {
  translationId?: string;
  appLanguage?: AppLanguage;
  hasChosenLanguage?: boolean;
  theme?: AppTheme;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      appLanguage: 'en',
      hasChosenLanguage: false,
      theme: 'dark',
      translationId: DEFAULT_TRANSLATION_ID,
      reciterId: DEFAULT_RECITER_ID,
      showTranslation: true,
      readerLayout: 'ayah',
      pageContentMode: 'arabic',
      showZikrTransliteration: true,
      morningZikrNotifications: false,
      eveningZikrNotifications: false,
      morningZikrHour: 6,
      morningZikrMinute: 30,
      eveningZikrHour: 17,
      eveningZikrMinute: 30,

      setAppLanguage: (lang) =>
        set({
          appLanguage: lang,
          hasChosenLanguage: true,
          translationId: translationIdForLanguage(lang),
        }),

      setTheme: (theme) => set({ theme }),

      setTranslationId: (id) => set({ translationId: id }),
      setReciterId: (id) => set({ reciterId: id }),
      setShowTranslation: (show) => set({ showTranslation: show }),
      setReaderLayout: (layout) => set({ readerLayout: layout }),
      setPageContentMode: (mode) => set({ pageContentMode: mode }),
      setShowZikrTransliteration: (show) => set({ showZikrTransliteration: show }),

      setMorningZikrNotifications: async (enabled) => {
        set({ morningZikrNotifications: enabled });
        await syncZikrNotifications(get());
      },

      setEveningZikrNotifications: async (enabled) => {
        set({ eveningZikrNotifications: enabled });
        await syncZikrNotifications(get());
      },

      refreshZikrNotifications: async () => {
        await syncZikrNotifications(get());
      },
    }),
    {
      name: 'quran-settings',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted) => {
        const state = persisted as PersistedSettings;
        const hasPriorSettings =
          state.translationId !== undefined ||
          state.reciterId !== undefined ||
          state.morningZikrNotifications !== undefined;

        if (state.hasChosenLanguage === undefined) {
          state.hasChosenLanguage = hasPriorSettings;
        }

        if (!state.appLanguage) {
          const tid = state.translationId ?? '';
          if (tid.startsWith('bs')) state.appLanguage = 'bs';
          else if (tid.startsWith('tr')) state.appLanguage = 'tr';
          else if (tid.startsWith('de')) state.appLanguage = 'de';
          else if (tid.startsWith('fr')) state.appLanguage = 'fr';
          else if (tid.startsWith('id')) state.appLanguage = 'id';
          else state.appLanguage = 'en';
        }

        if (!state.theme) {
          state.theme = 'dark';
        }

        return state as SettingsState;
      },
    },
  ),
);
