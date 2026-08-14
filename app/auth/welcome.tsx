import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/AuthButton';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { getGuestCapabilities, useStrings } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const strings = useStrings();
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const error = useAuthStore((s) => s.error);
  const guestCapabilities = getGuestCapabilities(strings);

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-6 pb-8 pt-10"
        showsVerticalScrollIndicator={false}>
        <View className="mb-8 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-3xl bg-brand-100 dark:bg-brand-900/40">
            <FontAwesome name="book" size={28} color="#16a34a" />
          </View>
          <Text className="text-center text-3xl font-bold text-ink-900 dark:text-ink-50">
            {strings('home.title')}
          </Text>
          <Text className="mt-3 text-center text-base text-ink-700 dark:text-ink-200">
            {strings('auth.welcomeSubtitle')}
          </Text>
        </View>

        <View className="rounded-3xl bg-white p-5 dark:bg-ink-800">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {strings('auth.guestMode')}
          </Text>
          <Text className="mt-2 text-sm text-ink-700 dark:text-ink-200">
            {strings('auth.guestModeDesc')}
          </Text>

          <View className="mt-4 gap-2">
            {guestCapabilities.map((item) => (
              <View key={item} className="flex-row items-start gap-2">
                <FontAwesome name="check" size={12} color="#16a34a" style={{ marginTop: 3 }} />
                <Text className="flex-1 text-sm text-ink-700 dark:text-ink-200">{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-6 gap-3">
          <AuthButton label={strings('auth.continueAsGuest')} onPress={handleGuest} />
          <AuthButton
            label={strings('profile.signIn')}
            onPress={() => router.push('/auth/login')}
            variant="secondary"
          />
          <AuthButton
            label={strings('profile.createAccount')}
            onPress={() => router.push('/auth/register')}
            variant="ghost"
          />
        </View>

        <View className="my-6 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
          <Text className="text-xs text-ink-700 dark:text-ink-200">{strings('common.or')}</Text>
          <View className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
        </View>

        {error ? (
          <View className="mb-4 rounded-2xl bg-red-50 px-4 py-3 dark:bg-red-950/40">
            <Text className="text-sm text-red-700 dark:text-red-300">{error}</Text>
          </View>
        ) : null}

        <GoogleSignInButton onSuccess={() => router.replace('/(tabs)')} />
      </ScrollView>
    </SafeAreaView>
  );
}
