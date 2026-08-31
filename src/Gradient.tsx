import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { FadeStop, GradientComponent } from './types';
import { withAlpha } from './color';

interface Props {
  /** Base colour; each stop applies its alpha to it. */
  color: string;
  /** Top → bottom. */
  stops: FadeStop[];
  Component?: GradientComponent;
  style?: StyleProp<ViewStyle>;
}

/**
 * Vertical alpha gradient of one colour. Uses the injected gradient component when there is one;
 * otherwise approximates it with stacked bands (fine for scrims and fades, invisible at rest).
 */
export const Gradient = memo(function Gradient({ color, stops, Component, style }: Props) {
  if (Component) {
    return (
      <Component
        pointerEvents="none"
        colors={stops.map((s) => withAlpha(color, s.alpha))}
        locations={stops.map((s) => s.location)}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={style}
      />
    );
  }

  // Fallback: 12 bands, alpha linearly interpolated between the stops.
  const bands = 12;
  return (
    <View pointerEvents="none" style={[styles.column, style]}>
      {Array.from({ length: bands }, (_, i) => {
        const t = (i + 0.5) / bands;
        return (
          <View key={i} style={{ flex: 1, backgroundColor: withAlpha(color, alphaAt(stops, t)) }} />
        );
      })}
    </View>
  );
});

function alphaAt(stops: FadeStop[], t: number): number {
  if (stops.length === 0) return 0;
  const first = stops[0]!;
  const last = stops[stops.length - 1]!;
  if (t <= first.location) return first.alpha;
  if (t >= last.location) return last.alpha;
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]!;
    const b = stops[i]!;
    if (t <= b.location) {
      const span = b.location - a.location || 1;
      return a.alpha + ((t - a.location) / span) * (b.alpha - a.alpha);
    }
  }
  return last.alpha;
}

const styles = StyleSheet.create({
  column: { flexDirection: 'column' },
});
