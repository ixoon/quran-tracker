/** Official IZ BiH / Sandžak locations — index matches api.vaktija.ba/vaktija/v1/{id} */
export const VAKTIJA_LOCATION_NAMES = [
  'Banovići',
  'Banja Luka',
  'Bihać',
  'Bijeljina',
  'Bileća',
  'Bosanski Brod',
  'Bosanska Dubica',
  'Bosanska Gradiška',
  'Bosansko Grahovo',
  'Bosanska Krupa',
  'Bosanski Novi',
  'Bosanski Petrovac',
  'Bosanski Šamac',
  'Bratunac',
  'Brčko',
  'Breza',
  'Bugojno',
  'Busovača',
  'Bužim',
  'Cazin',
  'Čajniče',
  'Čapljina',
  'Čelić',
  'Čelinac',
  'Čitluk',
  'Derventa',
  'Doboj',
  'Donji Vakuf',
  'Drvar',
  'Foča',
  'Fojnica',
  'Gacko',
  'Glamoč',
  'Goražde',
  'Gornji Vakuf',
  'Gračanica',
  'Gradačac',
  'Grude',
  'Hadžići',
  'Han-Pijesak',
  'Hlivno',
  'Ilijaš',
  'Jablanica',
  'Jajce',
  'Kakanj',
  'Kalesija',
  'Kalinovik',
  'Kiseljak',
  'Kladanj',
  'Ključ',
  'Konjic',
  'Kotor-Varoš',
  'Kreševo',
  'Kupres',
  'Laktaši',
  'Lopare',
  'Lukavac',
  'Ljubinje',
  'Ljubuški',
  'Maglaj',
  'Modriča',
  'Mostar',
  'Mrkonjić-Grad',
  'Neum',
  'Nevesinje',
  'Novi Travnik',
  'Odžak',
  'Olovo',
  'Orašje',
  'Pale',
  'Posušje',
  'Prijedor',
  'Prnjavor',
  'Prozor',
  'Rogatica',
  'Rudo',
  'Sanski Most',
  'Sarajevo',
  'Skender-Vakuf',
  'Sokolac',
  'Srbac',
  'Srebrenica',
  'Srebrenik',
  'Stolac',
  'Šekovići',
  'Šipovo',
  'Široki Brijeg',
  'Teslić',
  'Tešanj',
  'Tomislav-Grad',
  'Travnik',
  'Trebinje',
  'Trnovo',
  'Tuzla',
  'Ugljevik',
  'Vareš',
  'Velika Kladuša',
  'Visoko',
  'Višegrad',
  'Vitez',
  'Vlasenica',
  'Zavidovići',
  'Zenica',
  'Zvornik',
  'Žepa',
  'Žepče',
  'Živinice',
  'Bijelo Polje',
  'Gusinje',
  'Nova Varoš',
  'Novi Pazar',
  'Plav',
  'Pljevlja',
  'Priboj',
  'Prijepolje',
  'Rožaje',
  'Sjenica',
  'Tutin',
] as const;

/** Sandžak locations use Belgrade timezone; BiH uses Sarajevo. */
const SANDZAK_START_ID = 107;

export type VaktijaCity = {
  id: number;
  name: string;
  region: 'BiH' | 'Sandžak';
  timeZone: string;
};

export const VAKTIJA_CITIES: VaktijaCity[] = VAKTIJA_LOCATION_NAMES.map((name, id) => ({
  id,
  name,
  region: id >= SANDZAK_START_ID ? 'Sandžak' : 'BiH',
  timeZone: id >= SANDZAK_START_ID ? 'Europe/Belgrade' : 'Europe/Sarajevo',
}));

export function getVaktijaCityById(id: number | null | undefined): VaktijaCity | undefined {
  if (id === null || id === undefined) return undefined;
  return VAKTIJA_CITIES.find((city) => city.id === id);
}

export function searchVaktijaCities(query: string): VaktijaCity[] {
  const q = query.trim().toLowerCase();
  if (!q) return VAKTIJA_CITIES;

  return VAKTIJA_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(q) ||
      city.region.toLowerCase().includes(q),
  );
}

/** Map legacy string city ids from early app versions to vaktija ids. */
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
};

export function resolveCityId(stored: string | number | null): number | null {
  if (stored === null) return null;
  if (typeof stored === 'number') return stored;
  const parsed = Number.parseInt(stored, 10);
  if (!Number.isNaN(parsed)) return parsed;
  return LEGACY_CITY_ID_MAP[stored.toLowerCase()] ?? null;
}
