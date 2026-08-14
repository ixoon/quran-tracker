import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getAuthErrorMessage } from '@/lib/authErrors';
import { PASSWORD_RESET_REDIRECT, performGoogleOAuth } from '@/lib/googleAuth';
import { getSupabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  hasChosenAuthMode: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  clearError: () => void;
  initialize: () => Promise<void>;
  continueAsGuest: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signUpWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

let authListenerRegistered = false;

function canInitializeAuth() {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined';
  }
  return true;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isGuest: false,
      hasChosenAuthMode: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      clearError: () => set({ error: null }),

      initialize: async () => {
        if (authListenerRegistered) {
          if (!get().isInitialized) {
            set({ isLoading: false, isInitialized: true });
          }
          return;
        }

        if (!canInitializeAuth()) return;

        set({ isLoading: true });

        try {
          const supabase = getSupabase();
          const sessionResult = await Promise.race([
            supabase.auth.getSession(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Auth session timeout')), 8000),
            ),
          ]);

          const session = sessionResult.data.session;

          if (session) {
            set({
              session,
              user: session.user,
              isGuest: false,
              hasChosenAuthMode: true,
              isLoading: false,
              isInitialized: true,
            });
          } else {
            set({
              session: null,
              user: null,
              isLoading: false,
              isInitialized: true,
            });
          }

          supabase.auth.onAuthStateChange((event, nextSession) => {
            if (event === 'SIGNED_OUT') {
              set({
                session: null,
                user: null,
                isGuest: true,
                hasChosenAuthMode: true,
              });
              return;
            }

            set({
              session: nextSession,
              user: nextSession?.user ?? null,
              isGuest: nextSession ? false : get().isGuest,
              hasChosenAuthMode: nextSession ? true : get().hasChosenAuthMode,
            });
          });

          authListenerRegistered = true;
        } catch {
          set({
            session: null,
            user: null,
            isLoading: false,
            isInitialized: true,
          });
          authListenerRegistered = true;
        }
      },

      continueAsGuest: () => {
        set({
          isGuest: true,
          hasChosenAuthMode: true,
          session: null,
          user: null,
          error: null,
        });
      },

      signInWithEmail: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await getSupabase().auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (error) throw error;

          set({
            session: data.session,
            user: data.user,
            isGuest: false,
            hasChosenAuthMode: true,
            isLoading: false,
          });

          return { needsEmailConfirmation: false };
        } catch (error) {
          set({ error: getAuthErrorMessage(error), isLoading: false });
          throw error;
        }
      },

      signUpWithEmail: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await getSupabase().auth.signUp({
            email: email.trim().toLowerCase(),
            password,
          });

          if (error) throw error;

          const needsEmailConfirmation = !data.session;

          if (data.session) {
            set({
              session: data.session,
              user: data.user,
              isGuest: false,
              hasChosenAuthMode: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }

          return { needsEmailConfirmation };
        } catch (error) {
          set({ error: getAuthErrorMessage(error), isLoading: false });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });

        try {
          const session = await performGoogleOAuth();

          if (!session) {
            set({ isLoading: false });
            return;
          }

          set({
            session,
            user: session.user,
            isGuest: false,
            hasChosenAuthMode: true,
            isLoading: false,
          });
        } catch (error) {
          set({ error: getAuthErrorMessage(error), isLoading: false });
          throw error;
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await getSupabase().auth.resetPasswordForEmail(
            email.trim().toLowerCase(),
            { redirectTo: PASSWORD_RESET_REDIRECT },
          );
          if (error) throw error;
          set({ isLoading: false });
        } catch (error) {
          set({ error: getAuthErrorMessage(error), isLoading: false });
          throw error;
        }
      },

      updatePassword: async (password) => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await getSupabase().auth.updateUser({ password });
          if (error) throw error;
          set({ isLoading: false });
        } catch (error) {
          set({ error: getAuthErrorMessage(error), isLoading: false });
          throw error;
        }
      },

      deleteAccount: async (password) => {
        set({ isLoading: true, error: null });

        try {
          const user = get().user;
          if (!user) throw new Error('Not signed in');

          const hasEmailIdentity =
            user.identities?.some((identity) => identity.provider === 'email') ?? false;

          if (hasEmailIdentity) {
            if (!password?.trim()) throw new Error('Password is required to delete your account.');
            const email = user.email;
            if (!email) throw new Error('No email on account');

            const { error: verifyError } = await getSupabase().auth.signInWithPassword({
              email,
              password,
            });
            if (verifyError) throw verifyError;
          }

          const { error } = await getSupabase().rpc('delete_own_account');
          if (error) throw error;

          await getSupabase().auth.signOut({ scope: 'local' });
          set({
            session: null,
            user: null,
            isGuest: true,
            hasChosenAuthMode: true,
            isLoading: false,
          });
        } catch (error) {
          set({ error: getAuthErrorMessage(error), isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await getSupabase().auth.signOut();
          if (error) {
            await getSupabase().auth.signOut({ scope: 'local' });
          }
        } catch {
          await getSupabase().auth.signOut({ scope: 'local' });
        } finally {
          set({
            session: null,
            user: null,
            isGuest: true,
            hasChosenAuthMode: true,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'quran-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isGuest: state.isGuest,
        hasChosenAuthMode: state.hasChosenAuthMode,
      }),
    },
  ),
);

export function isAuthenticated(state: Pick<AuthState, 'session' | 'isGuest'>) {
  return !!state.session && !state.isGuest;
}
