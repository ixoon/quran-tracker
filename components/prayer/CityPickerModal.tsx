import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useStrings } from '@/lib/i18n';
import {
  groupLocationsByRegion,
  PRAYER_REGIONS,
  searchPrayerLocations,
  type PrayerLocation,
} from '@/lib/prayer-locations';

type CityPickerModalProps = {
  visible: boolean;
  selectedCityId: number | null;
  onClose: () => void;
  onSelect: (location: PrayerLocation) => void;
};

export function CityPickerModal({
  visible,
  selectedCityId,
  onClose,
  onSelect,
}: CityPickerModalProps) {
  const strings = useStrings();
  const [query, setQuery] = useState('');

  const cities = searchPrayerLocations(query);
  const grouped = useMemo(() => groupLocationsByRegion(cities), [cities]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="max-h-[85%] rounded-t-3xl bg-ink-50 dark:bg-ink-900"
          onPress={(e) => e.stopPropagation()}>
          <View className="items-center py-3">
            <View className="h-1 w-10 rounded-full bg-ink-200 dark:bg-ink-700" />
          </View>

          <View className="px-5 pb-3">
            <Text className="text-xl font-bold text-ink-900 dark:text-ink-50">
              {strings('prayer.selectCityBtn')}
            </Text>
            <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
              {strings('prayer.cityModalSubtitle')}
            </Text>
            <View className="mt-4 flex-row items-center rounded-2xl border border-ink-200 bg-white px-4 dark:border-ink-700 dark:bg-ink-800">
              <FontAwesome name="search" size={16} color="#94a3b8" />
              <TextInput
                className="ml-3 flex-1 py-3 text-base text-ink-900 dark:text-ink-50"
                placeholder={strings('prayer.citySearchPlaceholder')}
                placeholderTextColor="#94a3b8"
                value={query}
                onChangeText={setQuery}
              />
            </View>
          </View>

          <ScrollView className="px-5 pb-8" keyboardShouldPersistTaps="handled">
            {query
              ? cities.map((location) => (
                  <LocationRow
                    key={location.id}
                    location={location}
                    selected={location.id === selectedCityId}
                    onSelect={onSelect}
                    onClose={onClose}
                    clearQuery={() => setQuery('')}
                  />
                ))
              : PRAYER_REGIONS.map((region) => {
                  const items = grouped.get(region);
                  if (!items?.length) return null;

                  return (
                    <View key={region} className="mb-4">
                      <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200">
                        {region}
                      </Text>
                      {items.map((location) => (
                        <LocationRow
                          key={location.id}
                          location={location}
                          selected={location.id === selectedCityId}
                          onSelect={onSelect}
                          onClose={onClose}
                          clearQuery={() => setQuery('')}
                        />
                      ))}
                    </View>
                  );
                })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function LocationRow({
  location,
  selected,
  onSelect,
  onClose,
  clearQuery,
}: {
  location: PrayerLocation;
  selected: boolean;
  onSelect: (location: PrayerLocation) => void;
  onClose: () => void;
  clearQuery: () => void;
}) {
  const strings = useStrings();

  const subtitle =
    location.source === 'vaktija'
      ? strings('prayer.officialVaktija', { country: location.country })
      : location.source === 'kosovo-official'
        ? strings('prayer.officialBik', { country: location.country })
        : location.country;

  return (
    <Pressable
      className={`mb-2 rounded-2xl px-4 py-4 ${
        selected ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-white dark:bg-ink-800'
      }`}
      onPress={() => {
        onSelect(location);
        onClose();
        clearQuery();
      }}>
      <Text
        className={`text-base font-semibold ${
          selected ? 'text-brand-700 dark:text-brand-300' : 'text-ink-900 dark:text-ink-50'
        }`}>
        {location.name}
      </Text>
      <Text className="mt-0.5 text-sm text-ink-700 dark:text-ink-200">{subtitle}</Text>
    </Pressable>
  );
}
