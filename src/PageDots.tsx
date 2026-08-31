import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import type { PageIndicatorConfig } from './types';

interface Props {
  total: number;
  current: number;
  style: PageIndicatorConfig;
  onLayout?: (e: LayoutChangeEvent) => void;
}

/**
 * Sliding-window dots (Instagram-style): at most `maxDots` visible. The active page and its
 * in-window neighbour keep their full diameters and differ only in colour; a window edge with
 * more pages beyond it shrinks to `edgeDiameter`.
 */
export const PageDots = memo(function PageDots({ total, current, style, onLayout }: Props) {
  const maxDots = Math.max(style.maxDots, 1);
  const visible = Math.min(total, maxDots);
  const start = total <= maxDots ? 0 : Math.max(0, Math.min(current - Math.floor(maxDots / 2), total - maxDots));

  const slots = useMemo(() => Array.from({ length: maxDots }, (_, i) => i), [maxDots]);

  return (
    <View
      onLayout={onLayout}
      style={{
        height: style.height,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {slots.map((slot) => {
        const page = start + slot;
        const isActive = page === current;
        const moreBefore = slot === 0 && start > 0;
        const moreAfter = slot === visible - 1 && start + visible < total;
        let diameter = style.neighborDiameter;
        let color = style.neighborColor;
        if (isActive) {
          diameter = style.activeDiameter;
          color = style.activeColor;
        } else if (moreBefore || moreAfter) {
          diameter = style.edgeDiameter;
          color = style.edgeColor;
        }
        return (
          <Dot
            key={slot}
            visible={slot < visible}
            slotSize={style.activeDiameter}
            diameter={diameter}
            color={color}
            spacing={slot < visible - 1 ? style.spacing : 0}
            duration={style.animationDuration}
          />
        );
      })}
    </View>
  );
});

interface DotProps {
  visible: boolean;
  /** Every slot is an active-diameter cell so dot size never shifts the rhythm. */
  slotSize: number;
  diameter: number;
  color: string;
  spacing: number;
  duration: number;
}

function Dot({ visible, slotSize, diameter, color, spacing, duration }: DotProps) {
  const scale = useRef(new Animated.Value(diameter / Math.max(slotSize, 1))).current;
  useEffect(() => {
    Animated.timing(scale, {
      toValue: diameter / Math.max(slotSize, 1),
      duration,
      useNativeDriver: true,
    }).start();
  }, [diameter, slotSize, duration, scale]);

  if (!visible) return null;
  return (
    <View style={{ width: slotSize, height: slotSize, marginRight: spacing }}>
      <Animated.View
        style={{
          width: slotSize,
          height: slotSize,
          borderRadius: slotSize / 2,
          backgroundColor: color,
          transform: [{ scale }],
        }}
      />
    </View>
  );
}
