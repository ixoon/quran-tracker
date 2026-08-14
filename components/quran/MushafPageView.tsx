import { Pressable, Text, View } from 'react-native';

import { ArabicText } from '@/components/ArabicText';
import type { Ayah, PageAyah, PageContentMode } from '@/lib/quran-types';

type MushafPageAyah = Ayah & {
  surahNumber?: number;
  surahName?: string;
};

type MushafPageViewProps = {
  pageNumber: number;
  juz: number;
  ayahs: MushafPageAyah[];
  contentMode: PageContentMode;
  compact?: boolean;
  isAyahActive?: (ayah: MushafPageAyah) => boolean;
  onAyahPress?: (ayah: MushafPageAyah) => void;
};

function toArabicNumeral(n: number): string {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}

function AyahMarker({ number, isActive }: { number: number; isActive?: boolean }) {
  return (
    <Text
      className={isActive ? 'text-brand-700 dark:text-brand-300' : 'text-brand-600 dark:text-brand-400'}
      style={{ fontSize: 14, fontWeight: isActive ? '700' : '400' }}>
      {' '}۝{toArabicNumeral(number)}
    </Text>
  );
}

function AyahText({
  ayah,
  isActive,
  onPress,
}: {
  ayah: MushafPageAyah;
  isActive: boolean;
  onPress?: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      suppressHighlighting={false}
      style={
        isActive
          ? { backgroundColor: 'rgba(22, 163, 74, 0.18)', borderRadius: 4 }
          : undefined
      }>
      {ayah.text}
      <AyahMarker number={ayah.numberInSurah} isActive={isActive} />
      {' '}
    </Text>
  );
}

function SurahHeader({ name }: { name: string }) {
  return (
    <View className="my-4 items-center">
      <View className="h-px w-full bg-brand-200 dark:bg-brand-800" />
      <ArabicText variant="surahTitle" className="my-3 text-brand-700 dark:text-brand-300">
        {name}
      </ArabicText>
      <View className="h-px w-full bg-brand-200 dark:bg-brand-800" />
    </View>
  );
}

function ArabicFlow({
  ayahs,
  isAyahActive,
  onAyahPress,
}: {
  ayahs: MushafPageAyah[];
  isAyahActive?: (ayah: MushafPageAyah) => boolean;
  onAyahPress?: (ayah: MushafPageAyah) => void;
}) {
  type Segment = { surahName?: string; ayahs: MushafPageAyah[] };
  const segments: Segment[] = [];

  for (const ayah of ayahs) {
    const pageAyah = ayah as PageAyah;
    const last = segments[segments.length - 1];

    if (ayah.numberInSurah === 1 && pageAyah.surahName) {
      segments.push({ surahName: pageAyah.surahName, ayahs: [ayah] });
    } else if (last) {
      last.ayahs.push(ayah);
    } else {
      segments.push({ ayahs: [ayah] });
    }
  }

  return (
    <View className="gap-1">
      {segments.map((segment, index) => (
        <View key={`seg-${index}`}>
          {segment.surahName ? <SurahHeader name={segment.surahName} /> : null}
          <ArabicText variant="mushafPage">
            {segment.ayahs.map((ayah) => (
              <AyahText
                key={ayah.number}
                ayah={ayah}
                isActive={isAyahActive?.(ayah) ?? false}
                onPress={onAyahPress ? () => onAyahPress(ayah) : undefined}
              />
            ))}
          </ArabicText>
        </View>
      ))}
    </View>
  );
}

export function MushafPageView({
  pageNumber,
  juz,
  ayahs,
  contentMode,
  compact = false,
  isAyahActive,
  onAyahPress,
}: MushafPageViewProps) {
  const showArabic = contentMode === 'arabic' || contentMode === 'both';
  const showTranslation = contentMode === 'translation' || contentMode === 'both';

  return (
    <View
      className={`overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 ${
        compact ? 'px-4 py-5' : 'min-h-[480px] px-5 py-6'
      }`}>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xs font-medium uppercase tracking-wide text-amber-800/70 dark:text-amber-200/70">
          Juz {juz}
        </Text>
        <Text className="text-xs font-medium uppercase tracking-wide text-amber-800/70 dark:text-amber-200/70">
          Page {pageNumber}
        </Text>
      </View>

      {showArabic ? (
        <ArabicFlow ayahs={ayahs} isAyahActive={isAyahActive} onAyahPress={onAyahPress} />
      ) : null}

      {showTranslation ? (
        <View className={showArabic ? 'mt-6 border-t border-amber-200/60 pt-5 dark:border-amber-900/40' : ''}>
          {ayahs.map((ayah, index) => {
            if (!ayah.translation) return null;
            const pageAyah = ayah as PageAyah;
            const isSurahStart = ayah.numberInSurah === 1;
            const prevSurah =
              index > 0 ? (ayahs[index - 1] as PageAyah).surahNumber : undefined;
            const showHeader =
              isSurahStart && pageAyah.surahName && pageAyah.surahNumber !== prevSurah;

            return (
              <Pressable
                key={`tr-${ayah.number}`}
                className={`mb-4 rounded-xl px-2 py-1 ${
                  isAyahActive?.(ayah)
                    ? 'bg-brand-100 dark:bg-brand-900/40'
                    : ''
                }`}
                disabled={!onAyahPress}
                onPress={onAyahPress ? () => onAyahPress(ayah) : undefined}>
                {showHeader && !showArabic ? (
                  <Text className="mb-2 text-center text-sm font-semibold text-brand-700 dark:text-brand-300">
                    {pageAyah.surahName}
                  </Text>
                ) : null}
                <Text className="text-xs font-medium text-ink-500 dark:text-ink-400">
                  {pageAyah.surahNumber ?? ''}:{ayah.numberInSurah}
                </Text>
                <Text className="mt-1 text-base leading-7 text-ink-800 dark:text-ink-100">
                  {ayah.translation}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View className="mt-6 items-center">
        <Text className="text-sm font-semibold text-amber-900/60 dark:text-amber-100/60">
          {toArabicNumeral(pageNumber)}
        </Text>
      </View>
    </View>
  );
}
