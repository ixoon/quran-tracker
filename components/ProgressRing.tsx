import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type ProgressRingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
};

export function ProgressRing({ progress, size = 160, strokeWidth = 12 }: ProgressRingProps) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <G transform={`rotate(-90 ${center} ${center})`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#16a34a"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </View>
  );
}
