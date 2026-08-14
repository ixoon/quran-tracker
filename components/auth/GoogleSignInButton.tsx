import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { useStrings } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';

type GoogleSignInButtonProps = {
  onSuccess?: () => void;
  loading?: boolean;
};

export function GoogleSignInButton({ onSuccess, loading: externalLoading }: GoogleSignInButtonProps) {
  const router = useRouter();
  const strings = useStrings();
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const storeLoading = useAuthStore((s) => s.isLoading);
  const loading = externalLoading ?? storeLoading;

  useEffect(() => {
    if (Platform.OS === 'web') return;

    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const handlePress = async () => {
    useAuthStore.getState().clearError();

    try {
      await signInWithGoogle();
      const session = useAuthStore.getState().session;
      if (!session) return;

      if (onSuccess) {
        onSuccess();
        return;
      }

      router.replace('/(tabs)');
    } catch {
      // Error is stored in auth store.
    }
  };

  return (
    <Pressable
      className={`flex-row items-center justify-center gap-3 rounded-2xl border border-ink-200 bg-white py-4 dark:border-ink-700 dark:bg-ink-800 ${
        loading ? 'opacity-60' : ''
      }`}
      disabled={loading}
      onPress={handlePress}>
      <FontAwesome name="google" size={18} color="#4285F4" />
      <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
        {strings('auth.continueWithGoogle')}
      </Text>
    </Pressable>
  );
}
