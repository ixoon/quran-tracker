import { Text, TextProps } from 'react-native';

import {
  ARABIC_FONT_FAMILY,
  arabicTypography,
  type ArabicTextVariant,
} from '@/lib/typography';

type ArabicTextProps = TextProps & {
  variant?: ArabicTextVariant;
  className?: string;
};

export function ArabicText({
  variant = 'ayah',
  style,
  className,
  ...props
}: ArabicTextProps) {
  const scale = arabicTypography[variant];

  return (
    <Text
      {...props}
      className={`text-right text-ink-900 dark:text-ink-50 ${className ?? ''}`}
      style={[
        {
          fontFamily: ARABIC_FONT_FAMILY,
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          writingDirection: 'rtl',
        },
        style,
      ]}
    />
  );
}
