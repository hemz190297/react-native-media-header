import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { BlurComponent } from './types';

export interface MediaHeaderTopBlurProps {
  /** `expo-blur`'s `BlurView` (or compatible). Without it the layers become a dark tint. */
  BlurComponent?: BlurComponent;
  /** Total height — status bar + your floating buttons + ~20 of tail. Defaults to 120. */
  height?: number;
  /** Bands used to fake the gradient mask. More = smoother, slightly more GPU. */
  layers?: number;
  /** Blur strength at the very top; each band fades toward the bottom edge. */
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  fallbackColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Optional fixed "header blur": a progressive blur pinned to the top of the *screen* (not the
 * scroll content), so the photo softens under the status bar and floating buttons as the content
 * scrolls beneath. Strongest at the very top, invisible at the bottom edge.
 *
 * UIKit masks one blur view with a gradient; React Native has no equivalent, so this stacks
 * equal-height bands whose opacity follows a smooth curve. The accumulated result is a ramp with
 * no hard edge — raise `layers` if you can still see banding on a very smooth photo.
 *
 * Place it above the scroll view, below your buttons; it never takes touches.
 */
export const MediaHeaderTopBlur = memo(function MediaHeaderTopBlur({
  BlurComponent,
  height = 120,
  layers = 8,
  intensity = 22,
  tint = 'dark',
  fallbackColor = 'rgba(0,0,0,0.35)',
  style,
}: MediaHeaderTopBlurProps) {
  const count = Math.max(layers, 1);

  const bands = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        // Cosine ease: full strength at the top, 0 at the bottom edge — no visible seam.
        const t = count === 1 ? 0 : i / (count - 1);
        const opacity = (1 + Math.cos(Math.PI * t)) / 2;
        return { top: (height / count) * i, height: height / count + 1, opacity };
      }),
    [count, height],
  );

  return (
    <View pointerEvents="none" style={[styles.container, { height }, style]}>
      {bands.map((band, i) => {
        const bandStyle: ViewStyle = {
          position: 'absolute',
          top: band.top,
          left: 0,
          right: 0,
          height: band.height,
          opacity: band.opacity,
        };
        return BlurComponent ? (
          <View key={i} style={bandStyle}>
            <BlurComponent intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
          </View>
        ) : (
          <View key={i} style={[bandStyle, { backgroundColor: fallbackColor }]} />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
});
