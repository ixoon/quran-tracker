import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { TOTAL_PAGES } from '@/lib/constants';

type GoalState = {
  goalDays: number | null;
  goalStartedAt: string | null;
  setGoal: (days: number) => void;
  clearGoal: () => void;
  getDailyTarget: (currentPage: number) => number | null;
  getDaysRemaining: () => number | null;
};

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goalDays: null,
      goalStartedAt: null,

      setGoal: (days) => {
        set({
          goalDays: days,
          goalStartedAt: new Date().toISOString(),
        });
      },

      clearGoal: () => {
        set({ goalDays: null, goalStartedAt: null });
      },

      getDaysRemaining: () => {
        const { goalDays, goalStartedAt } = get();
        if (!goalDays || !goalStartedAt) return null;

        const elapsed = differenceInCalendarDays(new Date(), parseISO(goalStartedAt));
        return Math.max(1, goalDays - elapsed);
      },

      getDailyTarget: (currentPage) => {
        const daysRemaining = get().getDaysRemaining();
        if (daysRemaining === null) return null;

        const remainingPages = Math.max(0, TOTAL_PAGES - currentPage);
        if (remainingPages === 0) return 0;

        return Math.ceil(remainingPages / daysRemaining);
      },
    }),
    {
      name: 'quran-goal',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
