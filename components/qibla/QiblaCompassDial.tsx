import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { useColorScheme } from '@/components/useColorScheme';

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = CENTER - 28;

type QiblaCompassDialProps = {
  heading: number | null;
  qiblaBearing: number;
  aligned: boolean;
  isCompassAvailable: boolean;
};

function tickLine(deg: number, inner: number, outer: number, stroke: string, width = 1.5) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return (
    <Line
      key={deg}
      x1={CENTER + inner * Math.cos(rad)}
      y1={CENTER + inner * Math.sin(rad)}
      x2={CENTER + outer * Math.cos(rad)}
      y2={CENTER + outer * Math.sin(rad)}
      stroke={stroke}
      strokeWidth={width}
    />
  );
}

function qiblaArrowPoints(bearing: number, length: number) {
  const rad = ((bearing - 90) * Math.PI) / 180;
  const tipX = CENTER + length * Math.cos(rad);
  const tipY = CENTER + length * Math.sin(rad);
  const baseRad1 = ((bearing - 90 + 140) * Math.PI) / 180;
  const baseRad2 = ((bearing - 90 - 140) * Math.PI) / 180;
  const baseDist = 18;
  return `${tipX},${tipY} ${CENTER + baseDist * Math.cos(baseRad1)},${CENTER + baseDist * Math.sin(baseRad1)} ${CENTER + baseDist * Math.cos(baseRad2)},${CENTER + baseDist * Math.sin(baseRad2)}`;
}

export function QiblaCompassDial({
  heading,
  qiblaBearing,
  aligned,
  isCompassAvailable,
}: QiblaCompassDialProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ringStroke = isDark ? '#475569' : '#cbd5e1';
  const tickColor = isDark ? '#64748b' : '#94a3b8';
  const labelColor = isDark ? '#94a3b8' : '#64748b';

  const rotation = useSharedValue(0);

  useEffect(() => {
    if (heading !== null) {
      rotation.value = withSpring(-heading, { damping: 20, stiffness: 180, mass: 0.4 });
    }
  }, [heading, rotation]);

  const roseStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const qiblaRad = ((qiblaBearing - 90) * Math.PI) / 180;
  const kaabaDotX = CENTER + (RADIUS - 44) * Math.cos(qiblaRad);
  const kaabaDotY = CENTER + (RADIUS - 44) * Math.sin(qiblaRad);

  return (
    <View className="items-center">
      <View style={{ width: SIZE, height: SIZE }}>
        {/* Fixed phone-direction indicator at top */}
        <View className="absolute z-10 items-center" style={{ width: SIZE, top: 0 }}>
          <View className="h-0 w-0 border-x-[9px] border-t-[14px] border-x-transparent border-t-brand-600" />
          <View className="mt-0.5 bg-brand-600" style={{ width: 2, height: 12 }} />
        </View>

        <Animated.View style={roseStyle}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={ringStroke}
              strokeWidth={2}
              fill={isDark ? '#0f172a' : '#f8fafc'}
            />

            {Array.from({ length: 72 }, (_, i) => i * 5).map((deg) =>
              tickLine(
                deg,
                RADIUS - (deg % 90 === 0 ? 18 : deg % 30 === 0 ? 12 : 6),
                RADIUS - 2,
                tickColor,
                deg % 90 === 0 ? 2 : 1,
              ),
            )}

            {(['N', 'E', 'S', 'W'] as const).map((label, i) => {
              const deg = i * 90;
              const rad = ((deg - 90) * Math.PI) / 180;
              const x = CENTER + (RADIUS - 32) * Math.cos(rad);
              const y = CENTER + (RADIUS - 32) * Math.sin(rad);
              return (
                <SvgText
                  key={label}
                  x={x}
                  y={y + 4}
                  fill={label === 'N' ? '#ef4444' : labelColor}
                  fontSize={label === 'N' ? 14 : 12}
                  fontWeight="700"
                  textAnchor="middle">
                  {label}
                </SvgText>
              );
            })}

            <Polygon
              points={qiblaArrowPoints(qiblaBearing, RADIUS - 36)}
              fill={aligned ? '#16a34a' : '#15803d'}
            />
            <Circle cx={kaabaDotX} cy={kaabaDotY} r={6} fill={aligned ? '#16a34a' : '#15803d'} />
          </Svg>
        </Animated.View>

        <View
          pointerEvents="none"
          className="absolute items-center justify-center"
          style={{ width: SIZE, height: SIZE }}>
          <View
            className={`rounded-full border-2 ${aligned ? 'border-brand-500 bg-brand-100' : 'border-ink-300 bg-white dark:border-ink-600 dark:bg-ink-700'}`}
            style={{ width: 16, height: 16 }}
          />
        </View>
      </View>

      {!isCompassAvailable ? (
        <Text className="mt-2 text-center text-xs text-ink-700 dark:text-ink-200">
          Compass sensor unavailable — showing Qibla bearing only
        </Text>
      ) : heading === null ? (
        <Text className="mt-2 text-center text-xs text-ink-700 dark:text-ink-200">
          Calibrating compass… move phone in a figure-8
        </Text>
      ) : null}
    </View>
  );
}
