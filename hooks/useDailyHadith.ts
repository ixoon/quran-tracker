import { useEffect, useState } from 'react';

import { fetchDailyHadith, type DailyHadith } from '@/lib/hadith-api';
import type { AppLanguage } from '@/lib/i18n/types';
import { isOnline } from '@/lib/network';

export function useDailyHadith(appLanguage: AppLanguage) {
  const [hadith, setHadith] = useState<DailyHadith | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const online = await isOnline();
      if (!online) {
        if (!cancelled) {
          setHadith(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchDailyHadith(appLanguage);
        if (!cancelled) setHadith(data);
      } catch {
        if (!cancelled) setHadith(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [appLanguage]);

  return { hadith, loading };
}
