import { ScrollView, type ScrollViewProps } from 'react-native';

import { useTabScreenPadding } from '@/hooks/useTabScreenPadding';

type TabScrollViewProps = ScrollViewProps & {
  horizontalPadding?: boolean;
};

export function TabScrollView({
  horizontalPadding = true,
  contentContainerStyle,
  contentContainerClassName,
  ...props
}: TabScrollViewProps) {
  const bottomPad = useTabScreenPadding();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      {...props}
      contentContainerClassName={`${horizontalPadding ? 'px-5 pt-2' : 'pt-2'} ${contentContainerClassName ?? ''}`}
      contentContainerStyle={[{ paddingBottom: bottomPad }, contentContainerStyle]}
    />
  );
}
