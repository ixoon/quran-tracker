import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type HurufState = {
  studiedLetterIds: string[];
  bestQuizScore: number;
  totalQuizCorrect: number;
  totalQuizAnswered: number;
  markStudied: (letterId: string) => void;
  recordQuizRound: (correct: number, total: number) => void;
};

export const useHurufStore = create<HurufState>()(
  persist(
    (set, get) => ({
      studiedLetterIds: [],
      bestQuizScore: 0,
      totalQuizCorrect: 0,
      totalQuizAnswered: 0,

      markStudied: (letterId) => {
        const current = get().studiedLetterIds;
        if (current.includes(letterId)) return;
        set({ studiedLetterIds: [...current, letterId] });
      },

      recordQuizRound: (correct, total) => {
        set((state) => ({
          bestQuizScore: Math.max(state.bestQuizScore, correct),
          totalQuizCorrect: state.totalQuizCorrect + correct,
          totalQuizAnswered: state.totalQuizAnswered + total,
        }));
      },
    }),
    {
      name: 'huruf-progress',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
