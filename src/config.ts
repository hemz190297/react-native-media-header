import type { MediaHeaderConfig, MediaHeaderConfigInput } from './types';
import { readableBackground } from './color';

/** The Eighty Days PlaceView look. Every value can be overridden per header. */
export const defaultConfig: MediaHeaderConfig = {
  mediaHeight: 460,
  chromeFadeMultiplier: 1.8,
  isPagingEnabled: true,
  bouncesHorizontally: true,
  scrollEffect: {
    parallax: 0.7,
    blurRampFraction: 0.45,
    zoomsOnPullDown: true,
    blursOnScrollUp: true,
  },
  blur: {
    scrollBlurIntensity: 60,
    scrollBlurTint: 'dark',
    scrollBlurMaxOpacity: 1,
    // Off by default here (unlike the Swift original): without a gradient mask the stacked
    // blur layers show a visible top edge. The scrim + bottom fade carry legibility instead.
    showsBottomBlur: false,
    bottomBlurIntensity: 18,
    bottomBlurTint: 'dark',
    bottomBlurHeightFraction: 0.34,
    bottomBlurLayers: 3,
    fallbackColor: 'rgba(0,0,0,0.55)',
  },
  scrim: {
    hidden: false,
    color: '#000000',
    maxOpacity: 0.45,
    heightFraction: 0.34,
  },
  bottomFade: {
    hidden: false,
    heightFraction: 0.2,
    stops: [
      { location: 0, alpha: 0 },
      { location: 0.45, alpha: 0.25 },
      { location: 0.85, alpha: 0.65 },
      { location: 1, alpha: 1 },
    ],
    animationDuration: 500,
  },
  pageIndicator: {
    hidden: false,
    hidesForSinglePage: true,
    alignment: 'leading',
    horizontalInset: 20,
    bottomInset: 48,
    height: 16,
    maxDots: 3,
    activeDiameter: 8,
    neighborDiameter: 8,
    edgeDiameter: 4,
    spacing: 6,
    activeColor: '#FFFFFF',
    neighborColor: 'rgba(255,255,255,0.5)',
    edgeColor: 'rgba(255,255,255,0.32)',
    animationDuration: 250,
  },
  slide: {
    placeholderBackgroundColor: '#1F1F1F',
    resizeMode: 'cover',
    transitionDuration: 250,
    videoBadge: undefined,
    videoBadgeSize: 54,
    videoBadgeColor: 'rgba(255,255,255,0.9)',
  },
  background: {
    source: 'dominant',
    fixedColor: '#000000',
    palette: undefined,
    transform: readableBackground,
    blendsAutomatically: true,
  },
  accessory: {
    placement: 'oppositePageIndicator',
    horizontalInset: 20,
    verticalOffset: 0,
    gapFromPageIndicator: 12,
    fadesWithChrome: true,
  },
};

/** Deep-merges `input` over `defaultConfig` (arrays and functions replace, objects merge). */
export function resolveConfig(input?: MediaHeaderConfigInput): MediaHeaderConfig {
  if (!input) return defaultConfig;
  const out: Record<string, unknown> = { ...defaultConfig };
  for (const key of Object.keys(input) as (keyof MediaHeaderConfig)[]) {
    const value = input[key];
    if (value === undefined) continue;
    const base = defaultConfig[key];
    if (isPlainObject(base) && isPlainObject(value)) {
      out[key] = { ...(base as object), ...(value as object) };
    } else {
      out[key] = value;
    }
  }
  return out as unknown as MediaHeaderConfig;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
