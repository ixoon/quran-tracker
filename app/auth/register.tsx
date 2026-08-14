import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useStrings } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const strings = useStrings();
  const { signUpWithEmail, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const canSubmit =
    email.trim().length > 0 && password.length >= 6 && confirmPassword.length >= 6;

  const handleSignUp = async () => {
    if (!canSubmit) return;
    clearError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError(strings('auth.passwordsMismatch'));
      return;
    }

    try {
      const { needsEmailConfirmation } = await signUpWithEmail(email, password);

      if (needsEmailConfirmation) {
        setConfirmationSent(true);
        return;
      }

      router.replace('/(tabs)');
    } catch {
      // Error is stored in auth store
    }
  };

  if (confirmationSent) {
    return (
      <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900">
        <View className="flex-1 px-6 pb-8 pt-10">
          <View className="mb-6 h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/40">
            <FontAwesome name="envelope-o" size={24} color="#16a34a" />
          </View>
          <Text className="text-2xl font-bold text-ink-900 dark:text-ink-50">
            {strings('auth.checkEmail')}
          </Text>
          <Text className="mt-3 text-base leading-6 text-ink-700 dark:text-ink-200">
            {strings('auth.confirmationSent', { email: email.trim() })}
          </Text>

          <View className="mt-8">
            <AuthButton
              label={strings('auth.goToSignIn')}
              onPress={() => router.replace('/auth/login')}
            />
          </View>
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
          <Pressable
            className="mb-6 flex-row items-center gap-2 self-start"
            onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={16} color="#64748b" />
            <Text className="text-sm font-medium text-ink-700 dark:text-ink-200">
              {strings('common.back')}
            </Text>
          </Pressable>

          <Text className="text-3xl font-bold text-ink-900 dark:text-ink-50">
            {strings('profile.createAccount')}
          </Text>
          <Text className="mt-2 text-base text-ink-700 dark:text-ink-200">
            {strings('auth.syncAfterSignIn')}
          </Text>

          <View className="mt-8 gap-4">
            <AuthInput
              label={strings('common.email')}
              value={email}
              onChangeText={(text) => {
                clearError();
                setLocalError(null);
                setEmail(text);
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoComplete="email"
            />
            <AuthInput
              label={strings('common.password')}
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
              label={strings('profile.createAccount')}
              onPress={handleSignUp}
              loading={isLoading}
              disabled={!canSubmit}
            />
          </View>

          <View className="my-6 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
            <Text className="text-xs text-ink-700 dark:text-ink-200">{strings('common.or')}</Text>
            <View className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
          </View>

          <GoogleSignInButton loading={isLoading} onSuccess={() => router.replace('/(tabs)')} />

          <View className="mt-8 flex-row justify-center gap-1">
            <Text className="text-sm text-ink-700 dark:text-ink-200">
              {strings('auth.alreadyHaveAccount')}
            </Text>
            <Link href="/auth/login" asChild>
              <Pressable>
                <Text className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {strings('profile.signIn')}
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
