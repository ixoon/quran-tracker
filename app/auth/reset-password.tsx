import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { createSessionFromUrl } from '@/lib/authSessionFromUrl';
import { PASSWORD_RESET_REDIRECT } from '@/lib/googleAuth';
import { useStrings } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const strings = useStrings();
  const { updatePassword, isLoading, error, clearError } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [linkReady, setLinkReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [updated, setUpdated] = useState(false);

  const canSubmit = password.length >= 6 && confirmPassword.length >= 6;

  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const handleUrl = async (url: string | null) => {
      if (!url || !url.startsWith(PASSWORD_RESET_REDIRECT)) return false;

      try {
        const session = await createSessionFromUrl(url);
        if (!active) return true;

        if (session) {
          setLinkReady(true);
          setLinkInvalid(false);
        } else {
          setLinkInvalid(true);
        }
      } catch {
        if (active) setLinkInvalid(true);
      }

      return true;
    };

    void Linking.getInitialURL().then(async (url) => {
      const handled = await handleUrl(url);
      if (!handled && active) {
        timeout = setTimeout(() => {
          if (active) setLinkInvalid(true);
        }, 5000);
      }
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });

    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
      subscription.remove();
    };
  }, []);

  const handleUpdate = async () => {
    if (!canSubmit) return;
    clearError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError(strings('auth.passwordsMismatch'));
      return;
    }

    try {
      await updatePassword(password);
      setUpdated(true);
    } catch {
      // Error stored in auth store
    }
  };

  if (updated) {
    return (
      <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900">
        <View className="flex-1 px-6 pb-8 pt-10">
          <View className="mb-6 h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/40">
            <FontAwesome name="check" size={24} color="#16a34a" />
          </View>
          <Text className="text-2xl font-bold text-ink-900 dark:text-ink-50">
            {strings('auth.passwordUpdatedTitle')}
          </Text>
          <Text className="mt-3 text-base leading-6 text-ink-700 dark:text-ink-200">
            {strings('auth.passwordUpdatedBody')}
          </Text>
          <View className="mt-8">
            <AuthButton label={strings('profile.signIn')} onPress={() => router.replace('/(tabs)')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (linkInvalid) {
    return (
      <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900">
        <View className="flex-1 px-6 pb-8 pt-10">
          <Text className="text-2xl font-bold text-ink-900 dark:text-ink-50">
            {strings('auth.resetPasswordTitle')}
          </Text>
          <Text className="mt-3 text-base leading-6 text-ink-700 dark:text-ink-200">
            {strings('auth.resetLinkInvalid')}
          </Text>
          <View className="mt-8 gap-3">
            <AuthButton
              label={strings('auth.forgotPassword')}
              onPress={() => router.replace('/auth/login')}
            />
            <AuthButton
              label={strings('common.back')}
              onPress={() => router.replace('/(tabs)')}
              variant="ghost"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!linkReady) {
    return (
      <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text className="text-3xl font-bold text-ink-900 dark:text-ink-50">
            {strings('auth.newPasswordTitle')}
          </Text>
          <Text className="mt-2 text-base text-ink-700 dark:text-ink-200">
            {strings('auth.newPasswordBody')}
          </Text>

          <View className="mt-8 gap-4">
            <AuthInput
              label={strings('auth.newPassword')}
              value={password}
              onChangeText={(text) => {
                clearError();
                setLocalError(null);
                setPassword(text);
              }}
              placeholder={strings('auth.passwordMinPlaceholder')}
              secureTextEntry
              autoComplete="password-new"
            />
            <AuthInput
              label={strings('auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={(text) => {
                clearError();
                setLocalError(null);
                setConfirmPassword(text);
              }}
              placeholder={strings('auth.confirmPasswordPlaceholder')}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          {(error || localError) && (
            <View className="mt-4 rounded-2xl bg-red-50 px-4 py-3 dark:bg-red-950/40">
              <Text className="text-sm text-red-700 dark:text-red-300">
                {localError ?? error}
              </Text>
            </View>
          )}

          <View className="mt-6">
            <AuthButton
              label={strings('auth.updatePassword')}
              onPress={handleUpdate}
              loading={isLoading}
              disabled={!canSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
