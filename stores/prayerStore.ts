import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PrayerCalculationMethodId } from '@/lib/prayer-methods';
import { getPrayerLocationById, resolveLocationId } from '@/lib/prayer-locations';
import { prefetchPrayerData } from '@/lib/prayer-schedule';
import { reschedulePrayerNotifications } from '@/lib/prayerNotifications';

type PrayerState = {
  cityId: number | null;
  calculationMethod: PrayerCalculationMethodId | null;
  notificationsEnabled: boolean;
  setCityId: (cityId: number) => Promise<void>;
  setCalculationMethod: (method: PrayerCalculationMethodId) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

async function syncNotifications(get: () => PrayerState) {
  const state = get();
  const location = getPrayerLocationById(state.cityId);
  if (!location) return;

  await reschedulePrayerNotifications({
    location,
    methodId: state.calculationMethod,
    enabled: state.notificationsEnabled,
  });
}

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set, get) => ({
      cityId: 77,
      calculationMethod: null,
      notificationsEnabled: true,

      setCityId: async (cityId) => {
        set({ cityId });
        const location = getPrayerLocationById(cityId);
        if (location) {
          await prefetchPrayerData(location, get().calculationMethod);
        }
        await syncNotifications(get);
      },

      setCalculationMethod: async (method) => {
        set({ calculationMethod: method });
        const location = getPrayerLocationById(get().cityId);
        if (location) {
          await prefetchPrayerData(location, method);
        }
        await syncNotifications(get);
      },

      setNotificationsEnabled: async (enabled) => {
        set({ notificationsEnabled: enabled });
        await syncNotifications(get);
      },

      refreshNotifications: async () => {
        await syncNotifications(get);
      },
    }),
    {
      name: 'quran-prayer',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cityId: state.cityId,
        calculationMethod: state.calculationMethod,
        notificationsEnabled: state.notificationsEnabled,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PrayerState> | undefined;
        const rawCityId = saved?.cityId as string | number | null | undefined;
        return {
          ...current,
          ...saved,
          cityId: resolveLocationId(rawCityId ?? null) ?? 77,
          calculationMethod: saved?.calculationMethod ?? null,
        };
      },
    },
  ),
);
