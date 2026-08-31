import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { BlurComponent } from './types';

export interface MediaHeaderTopBlurProps {
  /** `expo-blur`'s `BlurView` (or compatible). Without it the layers become a dark tint. */
  BlurComponent?: BlurComponent;
  /** Total height — status bar + your floating buttons + ~20 of tail. */
  height: number;
  /** Stacked blur passes; more = stronger ramp toward the top. */
  layers?: number;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  fallbackColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Optional fixed "header blur": a progressive blur pinned to the top of the *screen* (not the
 * scroll content), so the photo softens under the status bar and floating buttons as the content
 * scrolls beneath. Stacked layers of decreasing height: strongest at the very top, sharp at the
 * bottom edge. Place it above the scroll view, below your buttons, `pointerEvents="none"`.
 */
export const MediaHeaderTopBlur = memo(function MediaHeaderTopBlur({
  BlurComponent,
  height,
  layers = 3,
  intensity = 20,
  tint = 'dark',
  fallbackColor = 'rgba(0,0,0,0.35)',
  style,
}: MediaHeaderTopBlurProps) {
  const count = Math.max(layers, 1);
  return (
    <View pointerEvents="none" style={[styles.container, { height }, style]}>
      {Array.from({ length: count }, (_, i) => {
        const layerHeight = height * (1 - i / count);
        const layerStyle: ViewStyle = { position: 'absolute', top: 0, left: 0, right: 0, height: layerHeight };
        return BlurComponent ? (
          <BlurComponent key={i} intensity={intensity} tint={tint} style={layerStyle} />
        ) : (
          <View key={i} style={[layerStyle, { backgroundColor: fallbackColor, opacity: 1 / count }]} />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0 },
});
