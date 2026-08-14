import { ActivityIndicator, Pressable, Text } from 'react-native';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: AuthButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      className={`rounded-2xl py-4 ${
        isPrimary
          ? 'bg-brand-600'
          : isSecondary
            ? 'border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800'
            : 'bg-transparent'
      } ${disabled || loading ? 'opacity-60' : ''}`}
      disabled={disabled || loading}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#ffffff' : '#16a34a'} />
      ) : (
        <Text
          className={`text-center text-base font-semibold ${
            isPrimary
              ? 'text-white'
              : isGhost
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-ink-900 dark:text-ink-50'
          }`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
