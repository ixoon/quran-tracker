/** Kaaba coordinates (Makkah) */
export const KAABA_LAT = 21.422487;
export const KAABA_LNG = 39.826206;

export type GeoCoordinate = {
  latitude: number;
  longitude: number;
};

export function getQiblaLineCoordinates(lat: number, lng: number): {
  user: GeoCoordinate;
  kaaba: GeoCoordinate;
} {
  return {
    user: { latitude: lat, longitude: lng },
    kaaba: { latitude: KAABA_LAT, longitude: KAABA_LNG },
  };
}

/** Map region centered between two points with padding. */
export function getRegionForCoordinates(
  a: GeoCoordinate,
  b: GeoCoordinate,
  paddingFactor = 1.35,
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  const minLat = Math.min(a.latitude, b.latitude);
  const maxLat = Math.max(a.latitude, b.latitude);
  const minLng = Math.min(a.longitude, b.longitude);
  const maxLng = Math.max(a.longitude, b.longitude);

  const latitudeDelta = Math.max((maxLat - minLat) * paddingFactor, 0.5);
  const longitudeDelta = Math.max((maxLng - minLng) * paddingFactor, 0.5);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta,
    longitudeDelta,
  };
}

/** Bearing from user location to Kaaba, 0–360° clockwise from true north. */
export function calculateQiblaBearing(lat: number, lng: number): number {
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (KAABA_LAT * Math.PI) / 180;
  const deltaLambda = ((KAABA_LNG - lng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}

/** Smallest signed difference between two headings (-180 to 180). */
export function headingDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

export function isFacingQibla(heading: number, qiblaBearing: number, tolerance = 8): boolean {
  return Math.abs(headingDelta(heading, qiblaBearing)) <= tolerance;
}
