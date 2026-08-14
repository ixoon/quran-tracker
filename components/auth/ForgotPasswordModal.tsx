import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { useStrings } from '@/lib/i18n';

type ForgotPasswordModalProps = {
  visible: boolean;
  initialEmail?: string;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
};

export function ForgotPasswordModal({
  visible,
  initialEmail = '',
  loading = false,
  error = null,
  onClose,
  onSubmit,
}: ForgotPasswordModalProps) {
  const strings = useStrings();
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (visible) {
      setEmail(initialEmail);
      setSent(false);
    }
  }, [visible, initialEmail]);

  const handleSubmit = async () => {
    if (email.trim().length === 0) return;
    try {
      await onSubmit(email);
      setSent(true);
    } catch {
      // Parent handles error display
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-white px-5 pb-8 pt-5 dark:bg-ink-800"
          onPress={(e) => e.stopPropagation()}>
          <Text className="text-lg font-semibold text-ink-900 dark:text-ink-50">
            {strings('auth.resetPasswordTitle')}
          </Text>

          {sent ? (
            <Text className="mt-3 text-sm leading-6 text-ink-700 dark:text-ink-200">
              {strings('auth.resetPasswordSent', { email: email.trim() })}
            </Text>
          ) : (
            <>
              <Text className="mt-2 text-sm leading-6 text-ink-700 dark:text-ink-200">
                {strings('auth.resetPasswordBody')}
              </Text>
              <View className="mt-4">
                <AuthInput
                  label={strings('common.email')}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
              {error ? (
                <View className="mt-4 rounded-2xl bg-red-50 px-4 py-3 dark:bg-red-950/40">
                  <Text className="text-sm text-red-700 dark:text-red-300">{error}</Text>
                </View>
              ) : null}
            </>
          )}

          <View className="mt-6 gap-3">
            {sent ? (
              <AuthButton label={strings('common.close')} onPress={onClose} />
            ) : (
              <>
                <AuthButton
                  label={strings('auth.sendResetLink')}
                  onPress={() => void handleSubmit()}
                  loading={loading}
                  disabled={email.trim().length === 0}
                />
                <AuthButton label={strings('common.cancel')} onPress={onClose} variant="ghost" />
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
