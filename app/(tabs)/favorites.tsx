import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArabicText } from '@/components/ArabicText';
import { useTabScreenPadding } from '@/hooks/useTabScreenPadding';
import { useStrings } from '@/lib/i18n';
import { useFavoritesStore } from '@/stores/favoritesStore';

export default function FavoritesScreen() {
  const strings = useStrings();
  const router = useRouter();
  const bottomPad = useTabScreenPadding();
  const favorites = useFavoritesStore((s) => s.favorites);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['top']}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => `${item.surah}:${item.ayah}`}
        contentContainerClassName="px-5 pt-2"
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-3xl font-bold text-ink-900 dark:text-ink-50">
              {strings('favorites.title')}
            </Text>
            <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
              {favorites.length === 1
                ? strings('favorites.countOne', { count: favorites.length })
                : strings('favorites.countMany', { count: favorites.length })}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center rounded-2xl bg-white px-6 py-12 dark:bg-ink-800">
            <FontAwesome name="star-o" size={32} color="#94a3b8" />
            <Text className="mt-4 text-center text-base font-medium text-ink-900 dark:text-ink-50">
              {strings('favorites.emptyTitle')}
            </Text>
            <Text className="mt-2 text-center text-sm text-ink-700 dark:text-ink-200">
              {strings('favorites.emptyBody')}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <Pressable
            className="rounded-2xl bg-white p-4 dark:bg-ink-800"
            onPress={() =>
              router.push({
                pathname: '/reader/[surahId]',
                params: { surahId: String(item.surah) },
              })
            }>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                {item.surahName} {item.surah}:{item.ayah}
              </Text>
              <Pressable hitSlop={8} onPress={() => removeFavorite(item.surah, item.ayah)}>
                <FontAwesome name="star" size={16} color="#f59e0b" />
              </Pressable>
            </View>
            <ArabicText variant="preview" numberOfLines={2}>
              {item.arabicPreview}
            </ArabicText>
            {item.translationPreview ? (
              <Text className="mt-2 text-sm text-ink-700 dark:text-ink-200" numberOfLines={2}>
                {item.translationPreview}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
