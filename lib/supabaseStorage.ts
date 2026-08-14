import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedStorage } from '@supabase/supabase-js';

function isClient() {
  return typeof window !== 'undefined';
}

/** Avoids AsyncStorage/window access during Expo web SSR in Node. */
export const supabaseStorage: SupportedStorage = {
  getItem: async (key) => {
    if (!isClient()) return null;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (!isClient()) return;
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (!isClient()) return;
    await AsyncStorage.removeItem(key);
  },
};
