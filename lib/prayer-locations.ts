import type { PrayerCalculationMethodId } from '@/lib/prayer-methods';
import { VAKTIJA_CITIES } from '@/lib/vaktija-cities';

export type PrayerLocationSource = 'vaktija' | 'kosovo-official' | 'aladhan';

export type PrayerLocation = {
  id: number;
  name: string;
  country: string;
  /** Group shown in city picker */
  region: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  source: PrayerLocationSource;
  /** Official vaktija.ba location id (BiH + Sandžak only) */
  vaktijaId?: number;
  /** BIK Kosovo city offset key from official takvim metadata */
  bikOffsetKey?: string;
  /** Per-city minute correction for Aladhan tune parameter */
  minuteOffset?: number;
  /** Suggested calculation method for Aladhan locations */
  preferredMethod?: PrayerCalculationMethodId;
};

type CitySeed = Omit<PrayerLocation, 'id' | 'source'> & {
  source?: PrayerLocationSource;
  vaktijaId?: number;
};

/** Approximate coordinates for vaktija locations (used for Qibla fallback). */
const VAKTIJA_COORDS: Record<string, { lat: number; lng: number }> = {
  Sarajevo: { lat: 43.8563, lng: 18.4131 },
  'Banja Luka': { lat: 44.7722, lng: 17.191 },
  Tuzla: { lat: 44.5384, lng: 18.6763 },
  Mostar: { lat: 43.3438, lng: 17.8078 },
  Zenica: { lat: 44.2017, lng: 17.9036 },
  Bijeljina: { lat: 44.7568, lng: 19.2144 },
  Brčko: { lat: 44.8694, lng: 18.8103 },
  Travnik: { lat: 44.2264, lng: 17.6597 },
  'Novi Pazar': { lat: 43.1367, lng: 20.5122 },
  'Bijelo Polje': { lat: 43.0381, lng: 19.7478 },
};

function vaktijaLocations(): PrayerLocation[] {
  return VAKTIJA_CITIES.map((city) => {
    const coords = VAKTIJA_COORDS[city.name];
    const isSandzak = city.region === 'Sandžak';

    return {
      id: city.id,
      name: city.name,
      country: isSandzak ? 'Serbia / Montenegro' : 'Bosnia & Herzegovina',
      region: isSandzak ? 'Sandžak' : 'Bosnia & Herzegovina',
      latitude: coords?.lat ?? 43.9,
      longitude: coords?.lng ?? 17.7,
      timeZone: city.timeZone,
      source: 'vaktija' as const,
      vaktijaId: city.id,
    };
  });
}

/** Kosovo — official BIK takvim via kohet-e-namazit-kosove JSON API. */
const KOSOVO_CITIES: CitySeed[] = [
  { name: 'Pristina', country: 'Kosovo', region: 'Kosovo', latitude: 42.6629, longitude: 21.1655, timeZone: 'Europe/Belgrade', source: 'kosovo-official', bikOffsetKey: 'Prishtina' },
  { name: 'Prizren', country: 'Kosovo', region: 'Kosovo', latitude: 42.2139, longitude: 20.7397, timeZone: 'Europe/Belgrade', source: 'kosovo-official' },
  { name: 'Peja', country: 'Kosovo', region: 'Kosovo', latitude: 42.6592, longitude: 20.2883, timeZone: 'Europe/Belgrade', source: 'kosovo-official' },
  { name: 'Gjakova', country: 'Kosovo', region: 'Kosovo', latitude: 42.3803, longitude: 20.4308, timeZone: 'Europe/Belgrade', source: 'kosovo-official' },
  { name: 'Mitrovica', country: 'Kosovo', region: 'Kosovo', latitude: 42.8833, longitude: 20.8667, timeZone: 'Europe/Belgrade', source: 'kosovo-official' },
  { name: 'Ferizaj', country: 'Kosovo', region: 'Kosovo', latitude: 42.3709, longitude: 21.1553, timeZone: 'Europe/Belgrade', source: 'kosovo-official', bikOffsetKey: 'Ferizaj' },
  { name: 'Gjilan', country: 'Kosovo', region: 'Kosovo', latitude: 42.4635, longitude: 21.4695, timeZone: 'Europe/Belgrade', source: 'kosovo-official', bikOffsetKey: 'Gjilan' },
  { name: 'Podujeva', country: 'Kosovo', region: 'Kosovo', latitude: 42.9111, longitude: 21.1958, timeZone: 'Europe/Belgrade', source: 'kosovo-official', bikOffsetKey: 'Podujeva' },
  { name: 'Vushtrri', country: 'Kosovo', region: 'Kosovo', latitude: 42.8231, longitude: 20.9675, timeZone: 'Europe/Belgrade', source: 'kosovo-official', bikOffsetKey: 'Vushtrri' },
  { name: 'Suhareka', country: 'Kosovo', region: 'Kosovo', latitude: 42.3583, longitude: 20.8253, timeZone: 'Europe/Belgrade', source: 'kosovo-official', bikOffsetKey: 'Sharri' },
  { name: 'Rahovec', country: 'Kosovo', region: 'Kosovo', latitude: 42.3994, longitude: 20.6547, timeZone: 'Europe/Belgrade', source: 'kosovo-official' },
  { name: 'Lipjan', country: 'Kosovo', region: 'Kosovo', latitude: 42.5239, longitude: 21.1258, timeZone: 'Europe/Belgrade', source: 'kosovo-official' },
  { name: 'Kamenica', country: 'Kosovo', region: 'Kosovo', latitude: 42.5781, longitude: 21.5803, timeZone: 'Europe/Belgrade', source: 'kosovo-official' },
  { name: 'Deçan', country: 'Kosovo', region: 'Kosovo', latitude: 42.5403, longitude: 20.2883, timeZone: 'Europe/Belgrade', source: 'kosovo-official' },
  { name: 'Presheva', country: 'Kosovo', region: 'Kosovo', latitude: 42.3967, longitude: 21.65, timeZone: 'Europe/Belgrade', source: 'kosovo-official', bikOffsetKey: 'Presheva' },
];

const SERBIA_CITIES: CitySeed[] = [
  { name: 'Belgrade', country: 'Serbia', region: 'Serbia', latitude: 44.7866, longitude: 20.4489, timeZone: 'Europe/Belgrade' },
  { name: 'Novi Sad', country: 'Serbia', region: 'Serbia', latitude: 45.2671, longitude: 19.8335, timeZone: 'Europe/Belgrade' },
  { name: 'Niš', country: 'Serbia', region: 'Serbia', latitude: 43.3209, longitude: 21.8958, timeZone: 'Europe/Belgrade' },
  { name: 'Kragujevac', country: 'Serbia', region: 'Serbia', latitude: 44.0128, longitude: 20.9114, timeZone: 'Europe/Belgrade' },
  { name: 'Subotica', country: 'Serbia', region: 'Serbia', latitude: 46.1009, longitude: 19.6688, timeZone: 'Europe/Belgrade' },
  { name: 'Zrenjanin', country: 'Serbia', region: 'Serbia', latitude: 45.3836, longitude: 20.3819, timeZone: 'Europe/Belgrade' },
  { name: 'Pančevo', country: 'Serbia', region: 'Serbia', latitude: 44.8708, longitude: 20.6403, timeZone: 'Europe/Belgrade' },
  { name: 'Čačak', country: 'Serbia', region: 'Serbia', latitude: 43.8914, longitude: 20.3497, timeZone: 'Europe/Belgrade' },
  { name: 'Kraljevo', country: 'Serbia', region: 'Serbia', latitude: 43.7258, longitude: 20.6894, timeZone: 'Europe/Belgrade' },
  { name: 'Leskovac', country: 'Serbia', region: 'Serbia', latitude: 42.9981, longitude: 21.9461, timeZone: 'Europe/Belgrade' },
  { name: 'Užice', country: 'Serbia', region: 'Serbia', latitude: 43.8586, longitude: 19.8428, timeZone: 'Europe/Belgrade' },
  { name: 'Vranje', country: 'Serbia', region: 'Serbia', latitude: 42.5514, longitude: 21.9003, timeZone: 'Europe/Belgrade' },
  { name: 'Šabac', country: 'Serbia', region: 'Serbia', latitude: 44.7536, longitude: 19.6906, timeZone: 'Europe/Belgrade' },
  { name: 'Smederevo', country: 'Serbia', region: 'Serbia', latitude: 44.365, longitude: 20.9272, timeZone: 'Europe/Belgrade' },
];

const MONTENEGRO_CITIES: CitySeed[] = [
  { name: 'Podgorica', country: 'Montenegro', region: 'Montenegro', latitude: 42.4304, longitude: 19.2594, timeZone: 'Europe/Podgorica' },
  { name: 'Nikšić', country: 'Montenegro', region: 'Montenegro', latitude: 42.7731, longitude: 18.9444, timeZone: 'Europe/Podgorica' },
  { name: 'Bar', country: 'Montenegro', region: 'Montenegro', latitude: 42.0942, longitude: 19.1006, timeZone: 'Europe/Podgorica' },
  { name: 'Ulcinj', country: 'Montenegro', region: 'Montenegro', latitude: 41.9311, longitude: 19.205, timeZone: 'Europe/Podgorica' },
  { name: 'Rožaje', country: 'Montenegro', region: 'Montenegro', latitude: 42.8333, longitude: 20.1667, timeZone: 'Europe/Podgorica' },
];

const NORTH_MACEDONIA_CITIES: CitySeed[] = [
  { name: 'Skopje', country: 'North Macedonia', region: 'North Macedonia', latitude: 41.9973, longitude: 21.428, timeZone: 'Europe/Skopje' },
  { name: 'Tetovo', country: 'North Macedonia', region: 'North Macedonia', latitude: 42.0106, longitude: 20.9714, timeZone: 'Europe/Skopje' },
  { name: 'Gostivar', country: 'North Macedonia', region: 'North Macedonia', latitude: 41.8, longitude: 20.9083, timeZone: 'Europe/Skopje' },
  { name: 'Kumanovo', country: 'North Macedonia', region: 'North Macedonia', latitude: 42.1322, longitude: 21.7144, timeZone: 'Europe/Skopje' },
  { name: 'Bitola', country: 'North Macedonia', region: 'North Macedonia', latitude: 41.0311, longitude: 21.3403, timeZone: 'Europe/Skopje' },
];

const ALBANIA_CITIES: CitySeed[] = [
  { name: 'Tirana', country: 'Albania', region: 'Albania', latitude: 41.3275, longitude: 19.8187, timeZone: 'Europe/Tirane' },
  { name: 'Durrës', country: 'Albania', region: 'Albania', latitude: 41.3231, longitude: 19.4414, timeZone: 'Europe/Tirane' },
  { name: 'Shkodër', country: 'Albania', region: 'Albania', latitude: 42.0683, longitude: 19.5126, timeZone: 'Europe/Tirane' },
  { name: 'Elbasan', country: 'Albania', region: 'Albania', latitude: 41.1125, longitude: 20.0822, timeZone: 'Europe/Tirane' },
  { name: 'Prizren', country: 'Albania', region: 'Albania', latitude: 42.2139, longitude: 20.7397, timeZone: 'Europe/Tirane' },
];

const CROATIA_CITIES: CitySeed[] = [
  { name: 'Zagreb', country: 'Croatia', region: 'Croatia', latitude: 45.815, longitude: 15.9819, timeZone: 'Europe/Zagreb' },
  { name: 'Rijeka', country: 'Croatia', region: 'Croatia', latitude: 45.3271, longitude: 14.4422, timeZone: 'Europe/Zagreb' },
  { name: 'Split', country: 'Croatia', region: 'Croatia', latitude: 43.5081, longitude: 16.4402, timeZone: 'Europe/Zagreb' },
  { name: 'Osijek', country: 'Croatia', region: 'Croatia', latitude: 45.555, longitude: 18.6958, timeZone: 'Europe/Zagreb' },
  { name: 'Slavonski Brod', country: 'Croatia', region: 'Croatia', latitude: 45.1603, longitude: 18.0156, timeZone: 'Europe/Zagreb' },
];

const SLOVENIA_CITIES: CitySeed[] = [
  { name: 'Ljubljana', country: 'Slovenia', region: 'Slovenia', latitude: 46.0569, longitude: 14.5058, timeZone: 'Europe/Ljubljana' },
  { name: 'Maribor', country: 'Slovenia', region: 'Slovenia', latitude: 46.5547, longitude: 15.6459, timeZone: 'Europe/Ljubljana' },
];

const EUROPE_CITIES: CitySeed[] = [
  { name: 'Berlin', country: 'Germany', region: 'Europe', latitude: 52.52, longitude: 13.405, timeZone: 'Europe/Berlin' },
  { name: 'Munich', country: 'Germany', region: 'Europe', latitude: 48.1351, longitude: 11.582, timeZone: 'Europe/Berlin' },
  { name: 'Frankfurt', country: 'Germany', region: 'Europe', latitude: 50.1109, longitude: 8.6821, timeZone: 'Europe/Berlin' },
  { name: 'Cologne', country: 'Germany', region: 'Europe', latitude: 50.9375, longitude: 6.9603, timeZone: 'Europe/Berlin' },
  { name: 'Hamburg', country: 'Germany', region: 'Europe', latitude: 53.5511, longitude: 9.9937, timeZone: 'Europe/Berlin' },
  { name: 'Stuttgart', country: 'Germany', region: 'Europe', latitude: 48.7758, longitude: 9.1829, timeZone: 'Europe/Berlin' },
  { name: 'Vienna', country: 'Austria', region: 'Europe', latitude: 48.2082, longitude: 16.3738, timeZone: 'Europe/Vienna' },
  { name: 'Graz', country: 'Austria', region: 'Europe', latitude: 47.0707, longitude: 15.4395, timeZone: 'Europe/Vienna' },
  { name: 'Zurich', country: 'Switzerland', region: 'Europe', latitude: 47.3769, longitude: 8.5417, timeZone: 'Europe/Zurich' },
  { name: 'Geneva', country: 'Switzerland', region: 'Europe', latitude: 46.2044, longitude: 6.1432, timeZone: 'Europe/Zurich' },
  { name: 'Bern', country: 'Switzerland', region: 'Europe', latitude: 46.948, longitude: 7.4474, timeZone: 'Europe/Zurich' },
  { name: 'Paris', country: 'France', region: 'Europe', latitude: 48.8566, longitude: 2.3522, timeZone: 'Europe/Paris' },
  { name: 'Lyon', country: 'France', region: 'Europe', latitude: 45.764, longitude: 4.8357, timeZone: 'Europe/Paris' },
  { name: 'Marseille', country: 'France', region: 'Europe', latitude: 43.2965, longitude: 5.3698, timeZone: 'Europe/Paris' },
  { name: 'London', country: 'United Kingdom', region: 'Europe', latitude: 51.5074, longitude: -0.1278, timeZone: 'Europe/London', preferredMethod: 'moonsightingCommittee' },
  { name: 'Birmingham', country: 'United Kingdom', region: 'Europe', latitude: 52.4862, longitude: -1.8904, timeZone: 'Europe/London', preferredMethod: 'moonsightingCommittee' },
  { name: 'Manchester', country: 'United Kingdom', region: 'Europe', latitude: 53.4808, longitude: -2.2426, timeZone: 'Europe/London', preferredMethod: 'moonsightingCommittee' },
  { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', latitude: 52.3676, longitude: 4.9041, timeZone: 'Europe/Amsterdam' },
  { name: 'Rotterdam', country: 'Netherlands', region: 'Europe', latitude: 51.9244, longitude: 4.4777, timeZone: 'Europe/Amsterdam' },
  { name: 'Brussels', country: 'Belgium', region: 'Europe', latitude: 50.8503, longitude: 4.3517, timeZone: 'Europe/Brussels' },
  { name: 'Antwerp', country: 'Belgium', region: 'Europe', latitude: 51.2194, longitude: 4.4025, timeZone: 'Europe/Brussels' },
  { name: 'Stockholm', country: 'Sweden', region: 'Europe', latitude: 59.3293, longitude: 18.0686, timeZone: 'Europe/Stockholm', preferredMethod: 'moonsightingCommittee' },
  { name: 'Malmö', country: 'Sweden', region: 'Europe', latitude: 55.605, longitude: 13.0038, timeZone: 'Europe/Stockholm' },
  { name: 'Oslo', country: 'Norway', region: 'Europe', latitude: 59.9139, longitude: 10.7522, timeZone: 'Europe/Oslo', preferredMethod: 'moonsightingCommittee' },
  { name: 'Copenhagen', country: 'Denmark', region: 'Europe', latitude: 55.6761, longitude: 12.5683, timeZone: 'Europe/Copenhagen' },
  { name: 'Helsinki', country: 'Finland', region: 'Europe', latitude: 60.1699, longitude: 24.9384, timeZone: 'Europe/Helsinki' },
  { name: 'Rome', country: 'Italy', region: 'Europe', latitude: 41.9028, longitude: 12.4964, timeZone: 'Europe/Rome' },
  { name: 'Milan', country: 'Italy', region: 'Europe', latitude: 45.4642, longitude: 9.19, timeZone: 'Europe/Rome' },
  { name: 'Madrid', country: 'Spain', region: 'Europe', latitude: 40.4168, longitude: -3.7038, timeZone: 'Europe/Madrid' },
  { name: 'Barcelona', country: 'Spain', region: 'Europe', latitude: 41.3874, longitude: 2.1686, timeZone: 'Europe/Madrid' },
  { name: 'Istanbul', country: 'Turkey', region: 'Europe', latitude: 41.0082, longitude: 28.9784, timeZone: 'Europe/Istanbul', preferredMethod: 'turkey' },
  { name: 'Ankara', country: 'Turkey', region: 'Europe', latitude: 39.9334, longitude: 32.8597, timeZone: 'Europe/Istanbul', preferredMethod: 'turkey' },
  { name: 'Izmir', country: 'Turkey', region: 'Europe', latitude: 38.4237, longitude: 27.1428, timeZone: 'Europe/Istanbul', preferredMethod: 'turkey' },
  { name: 'Bursa', country: 'Turkey', region: 'Europe', latitude: 40.1885, longitude: 29.061, timeZone: 'Europe/Istanbul', preferredMethod: 'turkey' },
  { name: 'Prague', country: 'Czechia', region: 'Europe', latitude: 50.0755, longitude: 14.4378, timeZone: 'Europe/Prague' },
  { name: 'Warsaw', country: 'Poland', region: 'Europe', latitude: 52.2297, longitude: 21.0122, timeZone: 'Europe/Warsaw' },
  { name: 'Budapest', country: 'Hungary', region: 'Europe', latitude: 47.4979, longitude: 19.0402, timeZone: 'Europe/Budapest' },
  { name: 'Athens', country: 'Greece', region: 'Europe', latitude: 37.9838, longitude: 23.7275, timeZone: 'Europe/Athens' },
  { name: 'Thessaloniki', country: 'Greece', region: 'Europe', latitude: 40.6401, longitude: 22.9444, timeZone: 'Europe/Athens' },
  { name: 'Dublin', country: 'Ireland', region: 'Europe', latitude: 53.3498, longitude: -6.2603, timeZone: 'Europe/Dublin', preferredMethod: 'moonsightingCommittee' },
  { name: 'Lisbon', country: 'Portugal', region: 'Europe', latitude: 38.7223, longitude: -9.1393, timeZone: 'Europe/Lisbon' },
];

const REGION_ORDER = [
  'Bosnia & Herzegovina',
  'Sandžak',
  'Kosovo',
  'Serbia',
  'Montenegro',
  'North Macedonia',
  'Albania',
  'Croatia',
  'Slovenia',
  'Europe',
] as const;

let nextCalculatedId = 1000;

function seedToLocation(seed: CitySeed): PrayerLocation {
  return {
    ...seed,
    id: nextCalculatedId++,
    source: seed.source ?? 'aladhan',
  };
}

const CALCULATED_LOCATIONS: PrayerLocation[] = [
  ...KOSOVO_CITIES,
  ...SERBIA_CITIES,
  ...MONTENEGRO_CITIES,
  ...NORTH_MACEDONIA_CITIES,
  ...ALBANIA_CITIES,
  ...CROATIA_CITIES,
  ...SLOVENIA_CITIES,
  ...EUROPE_CITIES,
].map(seedToLocation);

export const PRAYER_LOCATIONS: PrayerLocation[] = [
  ...vaktijaLocations(),
  ...CALCULATED_LOCATIONS,
];

export const PRAYER_REGIONS = REGION_ORDER.filter((region) =>
  PRAYER_LOCATIONS.some((loc) => loc.region === region),
);

export function getPrayerLocationById(id: number | null | undefined): PrayerLocation | undefined {
  if (id === null || id === undefined) return undefined;
  return PRAYER_LOCATIONS.find((loc) => loc.id === id);
}

export function searchPrayerLocations(query: string): PrayerLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return PRAYER_LOCATIONS;

  return PRAYER_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.country.toLowerCase().includes(q) ||
      loc.region.toLowerCase().includes(q),
  );
}

export function groupLocationsByRegion(locations: PrayerLocation[]): Map<string, PrayerLocation[]> {
  const grouped = new Map<string, PrayerLocation[]>();

  for (const region of REGION_ORDER) {
    const items = locations.filter((loc) => loc.region === region);
    if (items.length > 0) grouped.set(region, items);
  }

  return grouped;
}

/** Map legacy string city ids from early app versions to location ids. */
export const LEGACY_CITY_ID_MAP: Record<string, number> = {
  sarajevo: 77,
  'banja-luka': 1,
  tuzla: 95,
  mostar: 62,
  zenica: 103,
  bijeljina: 3,
  brcko: 14,
  travnik: 93,
  'banja luka': 1,
  pristina: 1000,
  prizren: 1001,
  belgrade: 1015,
};

export function resolveLocationId(stored: string | number | null): number | null {
  if (stored === null) return null;
  if (typeof stored === 'number') return stored;
  const parsed = Number.parseInt(stored, 10);
  if (!Number.isNaN(parsed)) return parsed;
  return LEGACY_CITY_ID_MAP[stored.toLowerCase()] ?? null;
}
