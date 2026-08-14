import {
  CalculationMethod,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  type CalculationParameters,
} from 'adhan';

/** Calculation presets — Hanafi Asr is applied to all Balkan/Europe defaults. */
export type PrayerCalculationMethodId =
  | 'muslimWorldLeague'
  | 'turkey'
  | 'karachi'
  | 'egyptian'
  | 'moonsightingCommittee'
  | 'bikKosovo';

export type PrayerMethodOption = {
  id: PrayerCalculationMethodId;
  label: string;
  description: string;
};

export const PRAYER_METHOD_OPTIONS: PrayerMethodOption[] = [
  {
    id: 'muslimWorldLeague',
    label: 'Muslim World League',
    description: 'Fajr 18°, Isha 17° — widely used across Europe',
  },
  {
    id: 'bikKosovo',
    label: 'Islamic Community of Kosovo (BIK)',
    description: 'Official Kosovo method with temkin (Fajr 18°, Isha 17°, +6 min)',
  },
  {
    id: 'turkey',
    label: 'Diyanet (Turkey)',
    description: 'Turkish Presidency of Religious Affairs method',
  },
  {
    id: 'karachi',
    label: 'University of Islamic Sciences, Karachi',
    description: 'Standard Fajr and Isha at 18°',
  },
  {
    id: 'egyptian',
    label: 'Egyptian General Authority',
    description: 'Fajr 19.5°, Isha 17.5°',
  },
  {
    id: 'moonsightingCommittee',
    label: 'Moonsighting Committee',
    description: 'Recommended for high latitudes (UK, Scandinavia)',
  },
];

const BIK_TEMKIN_MINUTES = 6;

export function buildCalculationParameters(
  methodId: PrayerCalculationMethodId,
  latitude: number,
  longitude: number,
  minuteOffset = 0,
): CalculationParameters {
  let params: CalculationParameters;

  switch (methodId) {
    case 'bikKosovo':
      params = CalculationMethod.Other();
      params.fajrAngle = 18;
      params.ishaAngle = 17;
      break;
    case 'turkey':
      params = CalculationMethod.Turkey();
      break;
    case 'karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'moonsightingCommittee':
      params = CalculationMethod.MoonsightingCommittee();
      break;
    case 'muslimWorldLeague':
    default:
      params = CalculationMethod.MuslimWorldLeague();
      break;
  }

  params.madhab = Madhab.Hanafi;
  params.highLatitudeRule = HighLatitudeRule.recommended(
    new Coordinates(latitude, longitude),
  );

  if (methodId === 'bikKosovo') {
    params.adjustments.fajr = BIK_TEMKIN_MINUTES + minuteOffset;
    params.adjustments.sunrise = minuteOffset;
    params.adjustments.dhuhr = minuteOffset;
    params.adjustments.asr = minuteOffset;
    params.adjustments.maghrib = minuteOffset;
    params.adjustments.isha = BIK_TEMKIN_MINUTES + minuteOffset;
  } else if (minuteOffset !== 0) {
    params.adjustments.fajr = minuteOffset;
    params.adjustments.sunrise = minuteOffset;
    params.adjustments.dhuhr = minuteOffset;
    params.adjustments.asr = minuteOffset;
    params.adjustments.maghrib = minuteOffset;
    params.adjustments.isha = minuteOffset;
  }

  return params;
}

export function resolveMethodForLocation(
  region: string,
  preferredMethod?: PrayerCalculationMethodId,
): PrayerCalculationMethodId {
  if (preferredMethod) return preferredMethod;
  return 'muslimWorldLeague';
}
