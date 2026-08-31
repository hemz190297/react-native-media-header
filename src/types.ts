import type { ComponentType, ReactNode } from 'react';
import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';

/** One page of the header. */
export interface MediaHeaderItem {
  /** Remote (`{ uri }`) or bundled (`require(...)`) image. */
  source: ImageSourcePropType;
  /** BlurHash for a placeholder — forwarded to `renderImage`; the default `Image` ignores it. */
  blurhash?: string;
  /** Shows the video badge over the page. */
  isVideo?: boolean;
  /** Stable key; defaults to the index. */
  key?: string;
}

// MARK: - Injected components

/**
 * Shape of `expo-blur`'s `BlurView` and `@react-native-community/blur`-style views.
 * `tint` is typed loosely on purpose: class components are checked invariantly, so a
 * library-specific union here would reject `BlurView` itself. Values passed: `'light' | 'dark' | 'default'`.
 */
export interface BlurComponentProps {
  intensity?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tint?: any;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * Shape of `expo-linear-gradient` / `react-native-linear-gradient`. Same loose typing as above:
 * `colors` is a `string[]` of at least two entries, `locations` a matching `number[]`.
 */
export interface GradientComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locations?: any;
  /** `{ x, y }` — loose for the same reason (`expo-linear-gradient` also allows `null` / tuples). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  start?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  end?: any;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
}

export interface RenderImageParams {
  item: MediaHeaderItem;
  index: number;
  /** Fills the page; apply it (or merge it) on your image. */
  style: StyleProp<ImageStyle>;
  /** `config.slide.resizeMode` — map it to your component's prop (`contentFit` on expo-image). */
  resizeMode: 'cover' | 'contain' | 'stretch' | 'center';
  /** Call when the full image is displayed so colour extraction can run. */
  onLoad: () => void;
}

// MARK: - Configuration

export interface ScrollEffectConfig {
  /** Scroll-up parallax. `1` keeps the image pinned, `0` scrolls it 1:1 with the content. */
  parallax: number;
  /** Fraction of `mediaHeight` scrolled up before the blur reaches 100 %. */
  blurRampFraction: number;
  /** Pull-down scales the image up, anchored at its bottom edge. */
  zoomsOnPullDown: boolean;
  /** Scroll-up blurs the image. `false` keeps the parallax only. */
  blursOnScrollUp: boolean;
}

export interface BlurConfig {
  /** `intensity` handed to `BlurComponent` for the full-cover scroll blur. */
  scrollBlurIntensity: number;
  scrollBlurTint: 'light' | 'dark' | 'default';
  /** Cap on the scroll blur's opacity at full scroll. */
  scrollBlurMaxOpacity: number;
  /**
   * Resting frosted band across the bottom, behind the dots / accessory. Off by default: RN has no
   * gradient mask for blur views, so the band's top edge is visible (softened by `bottomBlurLayers`).
   */
  showsBottomBlur: boolean;
  bottomBlurIntensity: number;
  bottomBlurTint: 'light' | 'dark' | 'default';
  /** Height of the band as a fraction of the header height. */
  bottomBlurHeightFraction: number;
  /** Stacked layers of decreasing height so the band fades in instead of starting with a hard edge. */
  bottomBlurLayers: number;
  /** Used instead of a blur when no `BlurComponent` is provided. */
  fallbackColor: string;
}

export interface ScrimConfig {
  hidden: boolean;
  color: string;
  /** Opacity of `color` at the very bottom of the scrim. */
  maxOpacity: number;
  heightFraction: number;
}

export interface FadeStop {
  /** 0 = top of the fade, 1 = bottom edge of the header. */
  location: number;
  /** Opacity of the blend colour at this location. */
  alpha: number;
}

export interface BottomFadeConfig {
  hidden: boolean;
  heightFraction: number;
  stops: FadeStop[];
  /** Cross-fade duration (ms) when the blend colour changes. */
  animationDuration: number;
}

export interface PageIndicatorConfig {
  hidden: boolean;
  hidesForSinglePage: boolean;
  alignment: 'leading' | 'center' | 'trailing';
  horizontalInset: number;
  /** Distance from the header's bottom edge to the dots' bottom. */
  bottomInset: number;
  /** Height of the dots' layout box. */
  height: number;
  maxDots: number;
  activeDiameter: number;
  neighborDiameter: number;
  edgeDiameter: number;
  spacing: number;
  activeColor: string;
  neighborColor: string;
  edgeColor: string;
  animationDuration: number;
}

export interface SlideConfig {
  /** Behind the image until it lands. */
  placeholderBackgroundColor: string;
  resizeMode: 'cover' | 'contain' | 'stretch' | 'center';
  /** Fade-in (ms) when a remote image lands. `0` disables. */
  transitionDuration: number;
  /** Custom badge for `isVideo` pages. `null` shows nothing; `undefined` uses the default. */
  videoBadge?: ReactNode | null;
  videoBadgeSize: number;
  videoBadgeColor: string;
}

export type BackgroundSource = 'dominant' | 'fixed' | 'random' | 'none';

export interface BackgroundConfig {
  /**
   * Where the page background colour comes from:
   * - `dominant` — from `getDominantColor(item)` (you inject it), through `transform`
   * - `fixed` — `fixedColor`
   * - `random` — a random colour per page (from `palette`, or a random hue through `transform`)
   * - `none` — nothing reported; the blend colour is whatever you set with `blendColor`
   */
  source: BackgroundSource;
  fixedColor: string;
  palette?: string[];
  /** Maps a raw colour (dominant / random hue) to the reported colour. */
  transform: (color: string) => string;
  /** Feed the reported colour into the bottom fade automatically. */
  blendsAutomatically: boolean;
}

export interface AccessoryConfig {
  /** `oppositePageIndicator` = trailing when the dots are leading / centred, leading when trailing. */
  placement: 'oppositePageIndicator' | 'leading' | 'trailing';
  horizontalInset: number;
  /** Positive moves the accessory down from the dots' centre line. */
  verticalOffset: number;
  gapFromPageIndicator: number;
  /** Fade with the dots / scrim as the header blurs. */
  fadesWithChrome: boolean;
}

/** Every knob. `defaultConfig` reproduces the Eighty Days PlaceView header. */
export interface MediaHeaderConfig {
  /** Resting height of the header; the effect curve is relative to it. */
  mediaHeight: number;
  /** Dots / scrim / accessory fade out this many times faster than the blur ramps in. */
  chromeFadeMultiplier: number;
  /** `false` shows only the first item, no swiping. */
  isPagingEnabled: boolean;
  bouncesHorizontally: boolean;
  scrollEffect: ScrollEffectConfig;
  blur: BlurConfig;
  scrim: ScrimConfig;
  bottomFade: BottomFadeConfig;
  pageIndicator: PageIndicatorConfig;
  slide: SlideConfig;
  background: BackgroundConfig;
  accessory: AccessoryConfig;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: never[]) => unknown
    ? T[K]
    : T[K] extends readonly unknown[]
      ? T[K]
      : T[K] extends object
        ? DeepPartial<T[K]>
        : T[K];
};

/** Partial overrides merged over `defaultConfig`. */
export type MediaHeaderConfigInput = DeepPartial<MediaHeaderConfig>;

export type BlurComponent = ComponentType<BlurComponentProps>;
export type GradientComponent = ComponentType<GradientComponentProps>;
