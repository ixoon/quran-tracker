import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useStrings } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const strings = useStrings();
  const { signInWithEmail, resetPassword, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 6;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    clearError();

    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)');
    } catch {
      // Error is stored in auth store
    }
  };

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
            {strings('auth.welcomeBack')}
          </Text>
          <Text className="mt-2 text-base text-ink-700 dark:text-ink-200">
            {strings('auth.signInSubtitle')}
          </Text>

          <View className="mt-8 gap-4">
            <AuthInput
              label={strings('common.email')}
              value={email}
              onChangeText={(text) => {
                clearError();
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
                setPassword(text);
              }}
              placeholder={strings('auth.passwordPlaceholder')}
              secureTextEntry
              autoComplete="password"
            />
            <Pressable className="self-end" onPress={() => {
              clearError();
              setForgotOpen(true);
            }}>
              <Text className="text-sm font-medium text-brand-600 dark:text-brand-400">
                {strings('auth.forgotPassword')}
              </Text>
            </Pressable>
          </View>

          {error ? (
            <View className="mt-4 rounded-2xl bg-red-50 px-4 py-3 dark:bg-red-950/40">
              <Text className="text-sm text-red-700 dark:text-red-300">{error}</Text>
            </View>
          ) : null}

          <View className="mt-6">
            <AuthButton
              label={strings('profile.signIn')}
              onPress={handleSignIn}
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
            <Text className="text-sm text-ink-700 dark:text-ink-200">{strings('auth.noAccount')}</Text>
            <Link href="/auth/register" asChild>
              <Pressable>
                <Text className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {strings('auth.createOne')}
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ForgotPasswordModal
        visible={forgotOpen}
        initialEmail={email}
        loading={isLoading}
        error={error}
        onClose={() => setForgotOpen(false)}
        onSubmit={resetPassword}
      />
    </SafeAreaView>
  );
}
