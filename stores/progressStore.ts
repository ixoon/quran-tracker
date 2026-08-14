import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isSameDay, parseISO, subDays } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { TOTAL_PAGES } from '@/lib/constants';

type ProgressState = {
  currentPage: number;
  streakCount: number;
  lastMarkedDate: string | null;
  lastSurah: number | null;
  lastAyah: number | null;
  markTodayAsRead: () => void;
  setCurrentPage: (page: number) => void;
  setResumePosition: (surah: number, ayah: number) => void;
  isMarkedToday: () => boolean;
};

function todayKey() {
  return format(new Date(), 'yyyy-MM-dd');
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      currentPage: 0,
      streakCount: 0,
      lastMarkedDate: null,
      lastSurah: null,
      lastAyah: null,

      isMarkedToday: () => {
        const { lastMarkedDate } = get();
        if (!lastMarkedDate) return false;
        return isSameDay(parseISO(lastMarkedDate), new Date());
      },

      markTodayAsRead: () => {
        const { lastMarkedDate, streakCount, isMarkedToday } = get();
        if (isMarkedToday()) return;

        const today = todayKey();
        let nextStreak = 1;

        if (lastMarkedDate) {
          const last = parseISO(lastMarkedDate);
          const yesterday = subDays(new Date(), 1);
          if (isSameDay(last, yesterday)) {
            nextStreak = streakCount + 1;
          }
        }

        set({ lastMarkedDate: today, streakCount: nextStreak });
      },

      setCurrentPage: (page) => {
        set({ currentPage: Math.max(0, Math.min(page, TOTAL_PAGES)) });
      },

      /** Bookmark only — does not change mushaf page progress. */
      setResumePosition: (surah, ayah) => {
        set({ lastSurah: surah, lastAyah: ayah });
      },
    }),
    {
      name: 'quran-progress',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
