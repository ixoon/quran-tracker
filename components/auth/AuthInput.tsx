import { Text, TextInput, View } from 'react-native';

type AuthInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  autoComplete?: 'email' | 'password' | 'password-new' | 'name';
  editable?: boolean;
};

export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoComplete,
  editable = true,
}: AuthInputProps) {
  return (
    <View>
      <Text className="mb-2 text-sm font-medium text-ink-700 dark:text-ink-200">{label}</Text>
      <TextInput
        className="rounded-2xl border border-ink-200 bg-white px-4 py-3.5 text-base text-ink-900 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        editable={editable}
      />
    </View>
  );
}
