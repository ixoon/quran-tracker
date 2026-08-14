import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_HEIGHT = 56;

/** Bottom padding so scroll content and buttons clear tab bar + system nav. */
export function useTabScreenPadding(extra = 12) {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + insets.bottom + extra;
}
