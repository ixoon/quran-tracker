import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { QiblaCompassDial } from '@/components/qibla/QiblaCompassDial';
import { useQiblaCompass } from '@/hooks/useQiblaCompass';
import { useStrings } from '@/lib/i18n';

type QiblaCompassProps = {
  compact?: boolean;
};

export function QiblaCompass({ compact = false }: QiblaCompassProps) {
  const strings = useStrings();
  const {
    heading,
    qiblaBearing,
    relativeAngle,
    aligned,
    latitude,
    longitude,
    locationLabel,
    isLoading,
    error,
    isCompassAvailable,
    refresh,
  } = useQiblaCompass();

  const errorMessage =
    error === 'permission'
      ? strings('qibla.errorPermission')
      : error === 'location'
        ? strings('qibla.errorLocation')
        : null;

  const rotationHint =
    aligned
      ? strings('qibla.facingQibla')
      : isCompassAvailable && relativeAngle !== null
        ? relativeAngle > 0
          ? strings('qibla.rotateRight', { degrees: Math.abs(Math.round(relativeAngle)) })
          : strings('qibla.rotateLeft', { degrees: Math.abs(Math.round(relativeAngle)) })
        : strings('qibla.holdFlat');

  return (
    <View className={`rounded-3xl bg-white dark:bg-ink-800 ${compact ? 'p-4' : 'p-5'}`}>
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-semibold text-ink-900 dark:text-ink-50">
            {strings('qibla.title')}
          </Text>
          <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">
            {locationLabel ?? strings('qibla.usingLocation')}
          </Text>
        </View>
        {qiblaBearing !== null ? (
          <View
            className={`rounded-full px-3 py-1 ${
              aligned ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-ink-100 dark:bg-ink-700'
            }`}>
            <Text
              className={`text-xs font-semibold ${
                aligned ? 'text-brand-700 dark:text-brand-300' : 'text-ink-700 dark:text-ink-200'
              }`}>
              {aligned ? strings('qibla.aligned') : `${Math.round(qiblaBearing)}°`}
            </Text>
          </View>
        ) : null}
      </View>

      {isLoading ? (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-3 text-sm text-ink-700 dark:text-ink-200">
            {strings('qibla.findingLocation')}
          </Text>
        </View>
      ) : errorMessage ? (
        <View className="items-center py-8">
          <Text className="text-center text-sm text-red-600 dark:text-red-400">{errorMessage}</Text>
          <Pressable className="mt-4 rounded-2xl bg-brand-600 px-5 py-3" onPress={() => void refresh()}>
            <Text className="font-semibold text-white">{strings('common.tryAgain')}</Text>
          </Pressable>
        </View>
      ) : latitude !== null && longitude !== null && qiblaBearing !== null ? (
        <>
          <QiblaCompassDial
            heading={heading}
            qiblaBearing={qiblaBearing}
            aligned={aligned}
            isCompassAvailable={isCompassAvailable}
          />

          <Text className="mt-4 text-center text-sm text-ink-700 dark:text-ink-200">
            {rotationHint}
          </Text>

          {qiblaBearing !== null ? (
            <Text className="mt-1 text-center text-xs text-ink-700 dark:text-ink-200">
              {strings('qibla.bearingFromNorth', { bearing: Math.round(qiblaBearing) })}
              {heading !== null
                ? ` · ${strings('qibla.facingDegrees', { heading: Math.round(heading) })}`
                : ''}
            </Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
