import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FavoriteAyah } from '@/lib/quran-types';

type FavoritesState = {
  favorites: FavoriteAyah[];
  isFavorite: (surah: number, ayah: number) => boolean;
  toggleFavorite: (item: Omit<FavoriteAyah, 'createdAt' | 'updatedAt' | 'note'> & { note?: string | null }) => void;
  updateNote: (surah: number, ayah: number, note: string | null) => void;
  removeFavorite: (surah: number, ayah: number) => void;
};

function favoriteKey(surah: number, ayah: number) {
  return `${surah}:${ayah}`;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      isFavorite: (surah, ayah) =>
        get().favorites.some((f) => f.surah === surah && f.ayah === ayah),

      toggleFavorite: (item) => {
        const { favorites, isFavorite } = get();
        if (isFavorite(item.surah, item.ayah)) {
          set({
            favorites: favorites.filter(
              (f) => !(f.surah === item.surah && f.ayah === item.ayah),
            ),
          });
          return;
        }

        const now = new Date().toISOString();
        const entry: FavoriteAyah = {
          surah: item.surah,
          ayah: item.ayah,
          surahName: item.surahName,
          arabicPreview: item.arabicPreview,
          translationPreview: item.translationPreview,
          note: item.note ?? null,
          createdAt: now,
          updatedAt: now,
        };

        set({ favorites: [entry, ...favorites] });
      },

      updateNote: (surah, ayah, note) => {
        set({
          favorites: get().favorites.map((f) =>
            f.surah === surah && f.ayah === ayah
              ? { ...f, note, updatedAt: new Date().toISOString() }
              : f,
          ),
        });
      },

      removeFavorite: (surah, ayah) => {
        set({
          favorites: get().favorites.filter((f) => !(f.surah === surah && f.ayah === ayah)),
        });
      },
    }),
    {
      name: 'quran-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export { favoriteKey };
