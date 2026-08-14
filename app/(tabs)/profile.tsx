import FontAwesome from '@expo/vector-icons/FontAwesome';
import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TabScrollView } from '@/components/TabScrollView';
import { DeleteAccountModal } from '@/components/auth/DeleteAccountModal';
import { AuthButton } from '@/components/auth/AuthButton';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { LanguagePickerModal } from '@/components/settings/LanguagePickerModal';
import { ThemePickerModal } from '@/components/settings/ThemePickerModal';
import { confirmDestructive } from '@/lib/confirm';
import { PRIVACY_POLICY_URL } from '@/lib/constants';
import { getGuestCapabilities, getGuestLimitations, languageLabel, useStrings } from '@/lib/i18n';
import type { AppTheme } from '@/lib/i18n/types';
import { describeZikrSchedule, zikrNotificationsAvailable } from '@/lib/zikrNotifications';
import { isAuthenticated, useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-5">
      <Text className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl bg-white dark:bg-ink-800">{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  destructive,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const content = (
    <View className="flex-row items-center gap-3 px-5 py-4">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
        <FontAwesome name={icon} size={16} color={destructive ? '#dc2626' : '#16a34a'} />
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-medium ${
            destructive ? 'text-red-600 dark:text-red-400' : 'text-ink-900 dark:text-ink-50'
          }`}>
          {label}
        </Text>
        {value ? (
          <Text
            className="mt-0.5 text-xs text-ink-700 dark:text-ink-200"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}>
            {value}
          </Text>
        ) : null}
      </View>
      {onPress ? <FontAwesome name="chevron-right" size={12} color="#94a3b8" /> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable className="active:opacity-70" onPress={onPress}>
      {content}
    </Pressable>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  value,
  disabled,
  onValueChange,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-3 px-5 py-4">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
        <FontAwesome name={icon} size={16} color="#16a34a" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-ink-900 dark:text-ink-50">{label}</Text>
        <Text className="mt-0.5 text-sm text-ink-700 dark:text-ink-200">{description}</Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: '#cbd5e1', true: '#86efac' }}
        thumbColor={value ? '#16a34a' : '#f8fafc'}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const strings = useStrings();
  const { user, session, isGuest, isLoading, signOut, deleteAccount, resetPassword, error, clearError } =
    useAuthStore();
  const signedIn = isAuthenticated({ session, isGuest });

  const appLanguage = useSettingsStore((s) => s.appLanguage);
  const theme = useSettingsStore((s) => s.theme);
  const morningZikrNotifications = useSettingsStore((s) => s.morningZikrNotifications);
  const eveningZikrNotifications = useSettingsStore((s) => s.eveningZikrNotifications);
  const morningZikrHour = useSettingsStore((s) => s.morningZikrHour);
  const morningZikrMinute = useSettingsStore((s) => s.morningZikrMinute);
  const eveningZikrHour = useSettingsStore((s) => s.eveningZikrHour);
  const eveningZikrMinute = useSettingsStore((s) => s.eveningZikrMinute);
  const setMorningZikrNotifications = useSettingsStore((s) => s.setMorningZikrNotifications);
  const setEveningZikrNotifications = useSettingsStore((s) => s.setEveningZikrNotifications);

  const [languageOpen, setLanguageOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const hasEmailIdentity =
    user?.identities?.some((identity) => identity.provider === 'email') ?? false;

  const themeLabel = (value: AppTheme) => {
    if (value === 'system') return strings('profile.themeSystem');
    if (value === 'light') return strings('profile.themeLight');
    return strings('profile.themeDark');
  };

  const zikrTimes = describeZikrSchedule({
    morningEnabled: morningZikrNotifications,
    eveningEnabled: eveningZikrNotifications,
    morningHour: morningZikrHour,
    morningMinute: morningZikrMinute,
    eveningHour: eveningZikrHour,
    eveningMinute: eveningZikrMinute,
  });

  const zikrNotifySupported = zikrNotificationsAvailable();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleOpenPrivacyPolicy = () => {
    void Linking.openURL(PRIVACY_POLICY_URL);
  };

  const handleSignOut = () => {
    confirmDestructive(
      strings('profile.signOutConfirmTitle'),
      strings('profile.signOutConfirmBody'),
      strings('profile.signOut'),
      async () => {
        await signOut();
        router.replace('/(tabs)');
      },
      strings('common.cancel'),
    );
  };

  const handleDeleteAccount = async (password?: string) => {
    try {
      await deleteAccount(password);
      setDeleteOpen(false);
      router.replace('/(tabs)');
    } catch {
      // Error stored in auth store
    }
  };

  const guestCapabilities = getGuestCapabilities(strings);
  const guestLimitations = getGuestLimitations(strings);

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['top']}>
      <TabScrollView className="flex-1">
        <Text className="text-3xl font-bold text-ink-900 dark:text-ink-50">{strings('profile.title')}</Text>
        <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">{strings('profile.subtitle')}</Text>

        <View className="mt-6 rounded-3xl bg-white p-5 dark:bg-ink-800">
          <View className="flex-row items-center gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
              <FontAwesome
                name={signedIn ? 'user' : 'user-o'}
                size={24}
                color="#16a34a"
              />
            </View>
            <View className="min-w-0 flex-1">
              <Text
                className="text-base font-semibold text-ink-900 dark:text-ink-50"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}>
                {signedIn ? user?.email ?? strings('profile.signedIn') : strings('profile.guest')}
              </Text>
              <Text className="mt-0.5 text-sm text-ink-700 dark:text-ink-200">
                {signedIn ? strings('profile.cloudSync') : strings('profile.localOnly')}
              </Text>
            </View>
            <View
              className={`rounded-full px-3 py-1 ${
                signedIn ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-ink-100 dark:bg-ink-700'
              }`}>
              <Text
                className={`text-xs font-semibold ${
                  signedIn ? 'text-brand-700 dark:text-brand-300' : 'text-ink-700 dark:text-ink-200'
                }`}>
                {signedIn ? strings('profile.account') : strings('profile.guest')}
              </Text>
            </View>
          </View>
        </View>

        {!signedIn && (
          <View className="mt-5 rounded-3xl bg-white p-5 dark:bg-ink-800">
            <Text className="text-sm font-semibold text-ink-900 dark:text-ink-50">
              {strings('profile.guestCanDo')}
            </Text>
            <View className="mt-3 gap-2">
              {guestCapabilities.map((item) => (
                <View key={item} className="flex-row items-start gap-2">
                  <FontAwesome name="check" size={12} color="#16a34a" style={{ marginTop: 3 }} />
                  <Text className="flex-1 text-sm text-ink-700 dark:text-ink-200">{item}</Text>
                </View>
              ))}
            </View>
            <View className="mt-4 gap-2 border-t border-ink-100 pt-4 dark:border-ink-700">
              {guestLimitations.map((item) => (
                <View key={item} className="flex-row items-start gap-2">
                  <FontAwesome name="minus" size={12} color="#94a3b8" style={{ marginTop: 3 }} />
                  <Text className="flex-1 text-sm text-ink-700 dark:text-ink-200">{item}</Text>
                </View>
              ))}
            </View>

            <View className="mt-5 gap-3">
              <AuthButton label={strings('profile.signIn')} onPress={() => router.push('/auth/login')} />
              <AuthButton
                label={strings('profile.createAccount')}
                onPress={() => router.push('/auth/register')}
                variant="secondary"
              />
            </View>
          </View>
        )}

        <Section title={strings('profile.account')}>
          {signedIn ? (
            <>
              <Row icon="envelope-o" label={strings('common.email')} value={user?.email ?? undefined} />
              {hasEmailIdentity ? (
                <>
                  <View className="h-px bg-ink-100 dark:bg-ink-700" />
                  <Row
                    icon="lock"
                    label={strings('profile.resetPassword')}
                    value={strings('profile.resetPasswordHint')}
                    onPress={() => {
                      clearError();
                      setForgotOpen(true);
                    }}
                  />
                </>
              ) : null}
              <View className="h-px bg-ink-100 dark:bg-ink-700" />
              <Row icon="sign-out" label={strings('profile.signOut')} onPress={handleSignOut} destructive />
              <View className="h-px bg-ink-100 dark:bg-ink-700" />
              <Row
                icon="trash"
                label={strings('auth.deleteAccount')}
                onPress={() => setDeleteOpen(true)}
                destructive
              />
            </>
          ) : (
            <Row
              icon="cloud-upload"
              label={strings('profile.backUpProgress')}
              value={strings('profile.backUpHint')}
              onPress={() => router.push('/auth/register')}
            />
          )}
        </Section>

        <Section title={strings('profile.notifications')}>
          <ToggleRow
            icon="sun-o"
            label={strings('profile.morningZikr')}
            description={
              zikrNotifySupported
                ? strings('profile.dailyReminderAt', { time: zikrTimes.morning })
                : strings('profile.zikrExpoGo')
            }
            value={morningZikrNotifications}
            disabled={!zikrNotifySupported}
            onValueChange={(enabled) => {
              void setMorningZikrNotifications(enabled);
            }}
          />
          <View className="h-px bg-ink-100 dark:bg-ink-700" />
          <ToggleRow
            icon="moon-o"
            label={strings('profile.eveningZikr')}
            description={
              zikrNotifySupported
                ? strings('profile.dailyReminderAt', { time: zikrTimes.evening })
                : strings('profile.zikrExpoGo')
            }
            value={eveningZikrNotifications}
            disabled={!zikrNotifySupported}
            onValueChange={(enabled) => {
              void setEveningZikrNotifications(enabled);
            }}
          />
        </Section>

        <Section title={strings('profile.app')}>
          <Row
            icon="globe"
            label={strings('profile.language')}
            value={languageLabel(appLanguage)}
            onPress={() => setLanguageOpen(true)}
          />
          <View className="h-px bg-ink-100 dark:bg-ink-700" />
          <Row
            icon="moon-o"
            label={strings('profile.theme')}
            value={themeLabel(theme)}
            onPress={() => setThemeOpen(true)}
          />
          <View className="h-px bg-ink-100 dark:bg-ink-700" />
          <Link href="/goal" asChild>
            <Pressable>
              <Row icon="flag" label={strings('profile.khatmaGoal')} value={strings('profile.khatmaGoalHint')} />
            </Pressable>
          </Link>
        </Section>

        <Section title={strings('profile.about')}>
          <Row
            icon="info-circle"
            label="Quran Tracker"
            value={strings('profile.versionLabel', { version: appVersion })}
          />
          <View className="h-px bg-ink-100 dark:bg-ink-700" />
          <Row
            icon="file-text-o"
            label={strings('profile.privacyPolicy')}
            value={strings('profile.privacyPolicyHint')}
            onPress={handleOpenPrivacyPolicy}
          />
        </Section>

        {isLoading ? (
          <Text className="mt-4 text-center text-xs text-ink-700 dark:text-ink-200">
            {strings('profile.updatingAccount')}
          </Text>
        ) : null}
      </TabScrollView>

      <DeleteAccountModal
        visible={deleteOpen}
        requiresPassword={hasEmailIdentity}
        loading={isLoading}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
      />

      <ForgotPasswordModal
        visible={forgotOpen}
        initialEmail={user?.email ?? ''}
        loading={isLoading}
        error={error}
        onClose={() => setForgotOpen(false)}
        onSubmit={resetPassword}
      />

      <LanguagePickerModal visible={languageOpen} onClose={() => setLanguageOpen(false)} />
      <ThemePickerModal visible={themeOpen} onClose={() => setThemeOpen(false)} />
    </SafeAreaView>
  );
}
