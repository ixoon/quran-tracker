import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { useStrings } from '@/lib/i18n';

type DeleteAccountModalProps = {
  visible: boolean;
  requiresPassword: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (password?: string) => void;
};

export function DeleteAccountModal({
  visible,
  requiresPassword,
  loading = false,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const strings = useStrings();
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!visible) setPassword('');
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-white px-5 pb-8 pt-5 dark:bg-ink-800"
          onPress={(e) => e.stopPropagation()}>
          <Text className="text-lg font-semibold text-red-600 dark:text-red-400">
            {strings('auth.deleteAccountTitle')}
          </Text>
          <Text className="mt-2 text-sm leading-6 text-ink-700 dark:text-ink-200">
            {requiresPassword
              ? strings('auth.deleteAccountBodyPassword')
              : strings('auth.deleteAccountBody')}
          </Text>

          {requiresPassword ? (
            <View className="mt-4">
              <AuthInput
                label={strings('common.password')}
                value={password}
                onChangeText={setPassword}
                placeholder={strings('auth.passwordPlaceholder')}
                secureTextEntry
                autoComplete="password"
              />
            </View>
          ) : null}

          <View className="mt-6 gap-3">
            <AuthButton
              label={strings('auth.deleteAccountConfirm')}
              onPress={() => onConfirm(requiresPassword ? password : undefined)}
              loading={loading}
              disabled={requiresPassword && password.length < 6}
              variant="secondary"
            />
            <AuthButton label={strings('common.cancel')} onPress={onClose} variant="ghost" />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
