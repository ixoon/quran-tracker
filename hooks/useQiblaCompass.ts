import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { calculateQiblaBearing, headingDelta, isFacingQibla } from '@/lib/qibla';

type QiblaError = 'permission' | 'location';

type QiblaCompassState = {
  heading: number | null;
  qiblaBearing: number | null;
  relativeAngle: number | null;
  aligned: boolean;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  isLoading: boolean;
  error: QiblaError | null;
  isCompassAvailable: boolean;
  refresh: () => Promise<void>;
};

function magnetometerHeading(x: number, y: number): number {
  if (Platform.OS === 'ios') {
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    return (90 - angle + 360) % 360;
  }

  const angle = Math.atan2(-x, y) * (180 / Math.PI);
  return (angle + 360) % 360;
}

export function useQiblaCompass(): QiblaCompassState {
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<QiblaError | null>(null);
  const [isCompassAvailable, setIsCompassAvailable] = useState(false);
  const [locationReady, setLocationReady] = useState(false);

  const loadLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLocationReady(false);
    setHeading(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('permission');
        setIsLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude: lat, longitude: lng } = position.coords;
      setLatitude(lat);
      setLongitude(lng);
      setQiblaBearing(calculateQiblaBearing(lat, lng));
      setLocationReady(true);

      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (place) {
          const label = [place.city, place.region, place.country].filter(Boolean).join(', ');
          setLocationLabel(label || null);
        }
      } catch {
        setLocationLabel(null);
      }
    } catch {
      setError('location');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    if (!locationReady) return;

    let headingSub: Location.LocationSubscription | null = null;
    let magnetSub: { remove: () => void } | null = null;
    let mounted = true;

    async function startCompass() {
      if (Platform.OS === 'web') {
        if (mounted) setIsCompassAvailable(false);
        return;
      }

      try {
        headingSub = await Location.watchHeadingAsync((data) => {
          const next =
            data.trueHeading >= 0
              ? data.trueHeading
              : data.magHeading >= 0
                ? data.magHeading
                : null;
          if (mounted && next !== null && Number.isFinite(next)) {
            setHeading((next + 360) % 360);
          }
        });
        if (mounted) setIsCompassAvailable(true);
        return;
      } catch {
        // Fall back to raw magnetometer below.
      }

      try {
        const magnetAvailable = await Magnetometer.isAvailableAsync();
        if (!magnetAvailable) {
          if (mounted) setIsCompassAvailable(false);
          return;
        }

        if (mounted) setIsCompassAvailable(true);
        Magnetometer.setUpdateInterval(50);
        magnetSub = Magnetometer.addListener(({ x, y }) => {
          if (mounted) setHeading(magnetometerHeading(x, y));
        });
      } catch {
        if (mounted) setIsCompassAvailable(false);
      }
    }

    void startCompass();

    return () => {
      mounted = false;
      headingSub?.remove();
      magnetSub?.remove();
    };
  }, [locationReady]);

  const relativeAngle =
    heading !== null && qiblaBearing !== null ? headingDelta(heading, qiblaBearing) : null;

  const aligned =
    heading !== null && qiblaBearing !== null
      ? isFacingQibla(heading, qiblaBearing)
      : false;

  return {
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
    refresh: loadLocation,
  };
}
