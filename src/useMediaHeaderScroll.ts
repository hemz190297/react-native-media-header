import { useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import { resolveConfig } from './config';
import type { MediaHeaderConfig, MediaHeaderConfigInput } from './types';

export interface MediaHeaderCurve {
  /** Pull-down zoom (anchored at the bottom edge) + scroll-up parallax. Applied by `MediaHeader`. */
  headerStyle: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  /** 0 → `blur.scrollBlurMaxOpacity` over the first `blurRampFraction × mediaHeight` points. */
  blurOpacity: Animated.AnimatedInterpolation<number>;
  /** 1 → `1 − min(1, chromeFadeMultiplier)`, `chromeFadeMultiplier` times faster than the blur — dots, scrim, accessory. */
  chromeOpacity: Animated.AnimatedInterpolation<number>;
}

export interface MediaHeaderScroll extends MediaHeaderCurve {
  /** Vertical content offset of your scroll view. */
  scrollY: Animated.Value;
  /** Pass to `Animated.ScrollView` / `Animated.FlatList` `onScroll` (native driver). */
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Pass alongside `onScroll` so every frame reports. */
  scrollEventThrottle: number;
  /** The resolved configuration the curve was built from. `MediaHeader` reads it too. */
  config: MediaHeaderConfig;
}

/**
 * Builds the PlaceView scroll curve for a `scrollY` value. `useMediaHeaderScroll` calls this;
 * use it directly to drive your own view from an existing `Animated.Value`.
 *
 * - **Pull down** (offset < 0): scale `1 + |y| / mediaHeight`, translated so the bottom edge stays
 *   welded to the content below. Blur stays 0.
 * - **Scroll up** (offset ≥ 0): translate by `y × parallax` (drifts slower than the content) and
 *   blur 0 → 1 over the first `blurRampFraction × mediaHeight` points.
 */
export function buildScrollCurve(scrollY: Animated.Value, config: MediaHeaderConfig): MediaHeaderCurve {
  const H = Math.max(config.mediaHeight, 1);
  const { parallax, blurRampFraction, zoomsOnPullDown, blursOnScrollUp } = config.scrollEffect;
  const ramp = Math.max(H * blurRampFraction, 1);

  // s = 1 + (-y)/H → linear through (−H, 2) and (0, 1); extend left, clamp right.
  const scale = zoomsOnPullDown
    ? scrollY.interpolate({
        inputRange: [-H, 0],
        outputRange: [2, 1],
        extrapolateLeft: 'extend',
        extrapolateRight: 'clamp',
      })
    : 1;

  // Pull-down: −(s−1)·H/2 = y/2 (bottom-anchored zoom). Scroll-up: y·parallax.
  const translateY = scrollY.interpolate({
    inputRange: [-H, 0, H],
    outputRange: [zoomsOnPullDown ? -H / 2 : 0, 0, H * parallax],
    extrapolateLeft: zoomsOnPullDown ? 'extend' : 'clamp',
    extrapolateRight: 'extend',
  });

  const blurOpacity = scrollY.interpolate({
    inputRange: [0, ramp],
    outputRange: [0, blursOnScrollUp ? clamp01(config.blur.scrollBlurMaxOpacity) : 0],
    extrapolate: 'clamp',
  });

  // chrome = 1 − min(1, a × multiplier) with a = min(1, y / ramp) — same as the Swift original:
  // reaches 0 at ramp / multiplier when multiplier ≥ 1, floors at 1 − multiplier otherwise.
  const mult = Math.max(config.chromeFadeMultiplier, 0);
  const chromeEnd = mult > 0 ? Math.min(ramp, ramp / mult) : ramp;
  const chromeMin = blursOnScrollUp ? 1 - Math.min(1, mult) : 1;
  const chromeOpacity = scrollY.interpolate({
    inputRange: [0, chromeEnd],
    outputRange: [1, chromeMin],
    extrapolate: 'clamp',
  });

  return {
    headerStyle: { transform: [{ translateY }, { scale }] },
    blurOpacity,
    chromeOpacity,
  };
}

/**
 * The scroll curve + the `onScroll` handler that feeds it, on the native driver.
 *
 * ```tsx
 * const scroll = useMediaHeaderScroll({ mediaHeight: 420 });
 * <Animated.ScrollView onScroll={scroll.onScroll} scrollEventThrottle={scroll.scrollEventThrottle}>
 *   <MediaHeader scroll={scroll} items={photos} />
 *   <View style={{ marginTop: -20 }}>…your content, transparent background…</View>
 * </Animated.ScrollView>
 * ```
 *
 * The config is compared by content, so an inline object literal is fine.
 */
export function useMediaHeaderScroll(input?: MediaHeaderConfigInput): MediaHeaderScroll {
  const key = configKey(input);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => resolveConfig(input), [key]);
  const scrollY = useRef(new Animated.Value(0)).current;

  return useMemo(() => {
    const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: true,
    });
    return {
      ...buildScrollCurve(scrollY, config),
      scrollY,
      onScroll,
      scrollEventThrottle: 16,
      config,
    };
  }, [config, scrollY]);
}

/** Content key for a config input: functions and React elements are matched by presence, not identity. */
export function configKey(input?: MediaHeaderConfigInput): string {
  if (!input) return '';
  return JSON.stringify(input, (_k, v: unknown) => {
    if (typeof v === 'function') return '[fn]';
    if (typeof v === 'object' && v !== null && '$$typeof' in (v as object)) return '[element]';
    return v;
  });
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
