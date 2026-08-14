import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type AudioPlayerBarProps = {
  surahName: string;
  activeAyah: number | null;
  isPlaying: boolean;
  isLoading: boolean;
  reciterLabel: string;
  subtitle?: string;
  onTogglePlay: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
};

export function AudioPlayerBar({
  surahName,
  activeAyah,
  isPlaying,
  isLoading,
  reciterLabel,
  subtitle,
  onTogglePlay,
  onStop,
  onOpenSettings,
}: AudioPlayerBarProps) {
  const detail =
    subtitle ??
    (activeAyah ? `Ayah ${activeAyah}` : 'Tap play or an ayah') + ` · ${reciterLabel}`;

  return (
    <View className="border-t border-ink-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800">
      <View className="flex-row items-center gap-3">
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-full bg-brand-600"
          disabled={isLoading}
          onPress={onTogglePlay}>
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <FontAwesome name={isPlaying ? 'pause' : 'play'} size={16} color="#ffffff" />
          )}
        </Pressable>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-ink-900 dark:text-ink-50">{surahName}</Text>
          <Text className="text-xs text-ink-700 dark:text-ink-200">{detail}</Text>
        </View>

        <Pressable className="h-9 w-9 items-center justify-center" onPress={onStop}>
          <FontAwesome name="stop" size={14} color="#94a3b8" />
        </Pressable>

        <Pressable className="h-9 w-9 items-center justify-center" onPress={onOpenSettings}>
          <FontAwesome name="cog" size={16} color="#64748b" />
        </Pressable>
      </View>
    </View>
  );
}
