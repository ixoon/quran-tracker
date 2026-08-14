import type { StringKey } from '@/lib/i18n/types';

export const GUEST_CAPABILITY_KEYS = [
  'auth.guestCapProgress',
  'auth.guestCapGoal',
  'auth.guestCapRead',
  'auth.guestCapFavorites',
  'auth.guestCapPrayer',
  'auth.guestCapTheme',
] as const satisfies readonly StringKey[];

export const GUEST_LIMITATION_KEYS = [
  'auth.guestLimNoSync',
  'auth.guestLimLocal',
  'auth.guestLimSignIn',
] as const satisfies readonly StringKey[];

export function getGuestCapabilities(t: (key: StringKey) => string): string[] {
  return GUEST_CAPABILITY_KEYS.map((key) => t(key));
}

export function getGuestLimitations(t: (key: StringKey) => string): string[] {
  return GUEST_LIMITATION_KEYS.map((key) => t(key));
}
