# react-native-media-header

<p align="center">
  <img src="https://raw.githubusercontent.com/hemz190297/react-native-media-header/main/docs/demo.gif" width="300" alt="react-native-media-header demo — swipe, scroll-up blur + parallax, pull-down zoom, background colour following the photo">
</p>

A media header for detail screens: a paging photo carousel with the overlays that let content
scroll up over it — a scroll-linked blur, a scrim behind the page dots, a colour blend into the
page background — plus the pull-down zoom / scroll-up parallax curve that drives it, an optional
fixed blur under the status bar, and a ready-made chip for the corner slot.

**Zero dependencies.** Runs on the core `Animated` API with the native driver — no Reanimated,
no babel plugin. Blur, gradient, image and colour-extraction components are *injected*, so it
works in Expo Go, bare RN, iOS and Android. (Pull-down zoom is iOS-only: Android clamps the
scroll offset at 0; the parallax and blur work everywhere.)

React Native port of [MediaHeaderKit](https://github.com/hemz190297/MediaHeaderKit) (Swift).

## Install

```bash
npm install react-native-media-header
# optional, for real blur / gradients / blurhash / dominant colour:
npx expo install expo-blur expo-linear-gradient expo-image
npm install react-native-image-colors
```

## Use

```tsx
import { useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MediaHeader, MediaHeaderChip, useMediaHeaderScroll } from 'react-native-media-header';

type Photo = { url: string; isVideo?: boolean };

export function PlaceScreen({ photos }: { photos: Photo[] }) {
  const scroll = useMediaHeaderScroll();          // useMediaHeaderScroll({ mediaHeight: 400, … })
  const [bg, setBg] = useState('#000000');

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <Animated.ScrollView
        onScroll={scroll.onScroll}
        scrollEventThrottle={scroll.scrollEventThrottle}
        contentInsetAdjustmentBehavior="never"     // let the photo bleed under the status bar
      >
        <MediaHeader
          scroll={scroll}
          items={photos.map((p) => ({ source: { uri: p.url }, isVideo: p.isVideo }))}
          BlurComponent={BlurView}
          GradientComponent={LinearGradient}
          accessory={<MediaHeaderChip title={`${photos.length} PHOTOS`} />}
          onBackgroundColorChange={setBg}          // see "Background colour" below
          onItemPress={(index) => console.log('open viewer at', index)}
        />
        {/* Your content — transparent, overlapping the header's bottom edge by 20. */}
        <View style={{ marginTop: -20, paddingHorizontal: 20 }}>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800' }}>Title</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
```

Content that scrolls over the header should have a transparent background so the blurring photo
stays visible behind it. `items` is compared by content (`key`, else the image URI), so building the
array inline is fine.

Everything is optional: omit `scroll` for a static header, omit `BlurComponent` / `GradientComponent`
(you get tinted overlays / banded gradients), omit the accessory, or turn any overlay off in the config.

### Background colour

The header reports a colour for the page through `onBackgroundColorChange`. Where it comes from
is `config.background.source`:

| source | needs | reports |
|---|---|---|
| `'dominant'` (default) | a `getDominantColor` prop | the photo's average colour, through `background.transform` |
| `'fixed'` | — | `background.fixedColor` |
| `'random'` | — | a random colour per page (`background.palette` or a random hue through `transform`) |
| `'none'` | — | nothing |

With `'dominant'` and no `getDominantColor`, nothing is reported. Inject an extractor:

```tsx
import { getColors } from 'react-native-image-colors';

<MediaHeader
  items={photos.map((p) => ({ source: { uri: p.url } }))}
  getDominantColor={async (_item, index) => {
    const c = await getColors(photos[index].url, { fallback: '#000000', cache: true, key: photos[index].url });
    return c.platform === 'android' ? c.dominant : c.platform === 'ios' ? c.background : c.dominant;
  }}
  onBackgroundColorChange={setBg}
/>
```

…or return it from your backend (`getDominantColor={async (_item, i) => photos[i].averageColor}`).
The default `transform` (`readableBackground`) darkens and desaturates so light text stays readable;
the reported colour is fed into the header's own bottom fade automatically.

### Blurhash placeholders

Inject `expo-image`:

```tsx
import { Image } from 'expo-image';

<MediaHeader
  renderImage={({ item, style, resizeMode, onLoad }) => (
    <Image source={item.source} placeholder={{ blurhash: item.blurhash }} contentFit={resizeMode} style={style} onLoad={onLoad} />
  )}
/>
```

### Top header blur (optional)

A fixed progressive blur under the status bar / floating nav buttons. Sits *outside* the scroll view:

```tsx
<MediaHeaderTopBlur BlurComponent={BlurView} height={insets.top + 64} />
```

### Chip / accessory slot (optional)

```tsx
<MediaHeader
  accessory={<MediaHeaderChip icons={[instagramIcon, youtubeIcon]} title="12 SOURCES" style={{ iconSize: 20 }} />}
  onAccessoryPress={() => scrollToSources()}
/>
```

`MediaHeaderChip` style: `text`, `iconSize`, `iconOverlap`, `iconBorderRadius`, `iconTintColor`,
`iconBorderWidth/Color`, `iconTextSpacing`, `backgroundColor`, `borderRadius`, `paddingVertical/Horizontal`.
Where it sits: `config.accessory.placement` / `horizontalInset` / `verticalOffset`; whether it fades
with the dots: `config.accessory.fadesWithChrome`.

### Jumping to a page

```tsx
const header = useRef<MediaHeaderRef>(null);
<MediaHeader ref={header} … />
header.current?.scrollToPage(2);          // safe before the first layout — lands once measured
```

## Configure

One config object, passed to `useMediaHeaderScroll` and/or `MediaHeader`'s `config` prop (merged
over the hook's). Defaults reproduce the Eighty Days look — see `defaultConfig`. Inline literals are
fine; configs are compared by content.

```ts
const scroll = useMediaHeaderScroll({
  mediaHeight: 380,
  scrollEffect: { parallax: 0.5, blurRampFraction: 0.6 },
  blur: { scrollBlurIntensity: 80, scrollBlurMaxOpacity: 0.8 },
  pageIndicator: { alignment: 'center', activeColor: '#FFD60A' },
  background: { source: 'random' },
  scrim: { hidden: true },
});
```

| Section | Knobs |
|---|---|
| root | `mediaHeight`, `chromeFadeMultiplier`, `isPagingEnabled`, `bouncesHorizontally` |
| `scrollEffect` | `parallax`, `blurRampFraction`, `zoomsOnPullDown`, `blursOnScrollUp` |
| `blur` | `scrollBlurIntensity`, `scrollBlurTint`, `scrollBlurMaxOpacity`, `showsBottomBlur`, `bottomBlurIntensity`, `bottomBlurTint`, `bottomBlurHeightFraction`, `bottomBlurLayers`, `fallbackColor` |
| `scrim` | `hidden`, `color`, `maxOpacity`, `heightFraction` |
| `bottomFade` | `hidden`, `heightFraction`, `stops`, `animationDuration` |
| `pageIndicator` | `hidden`, `hidesForSinglePage`, `alignment`, `horizontalInset`, `bottomInset`, `height`, `maxDots`, `activeDiameter`, `neighborDiameter`, `edgeDiameter`, `spacing`, `activeColor`, `neighborColor`, `edgeColor`, `animationDuration` |
| `slide` | `placeholderBackgroundColor`, `resizeMode`, `transitionDuration`, `videoBadge`, `videoBadgeSize`, `videoBadgeColor` |
| `background` | `source`, `fixedColor`, `palette`, `transform`, `blendsAutomatically` |
| `accessory` | `placement`, `horizontalInset`, `verticalOffset`, `gapFromPageIndicator`, `fadesWithChrome` |

`showsBottomBlur` is off by default on RN: there is no gradient mask for blur views, so the frosted
band's top edge is visible. The scrim + bottom fade carry legibility instead.

## Pieces you can use on their own

- `useMediaHeaderScroll` / `buildScrollCurve(scrollY, config)` — the curve: `headerStyle`, `blurOpacity`, `chromeOpacity`. Drive any view with it.
- `MediaHeaderTopBlur`, `MediaHeaderChip`.
- `MediaHeaderPageDots` — `{ total, current, style: PageIndicatorConfig }` (use `defaultConfig.pageIndicator` as a base).
- `readableBackground(color)` — the default colour transform.

## Example

`example/` is an Expo app: `cd example && npm install && npx expo start`, open in Expo Go.
`EXPO_PUBLIC_AUTO_TOUR=1 npx expo start` plays the scripted sequence from the GIF.

## License

MIT · Sample photos in the example: [Unsplash](https://unsplash.com)
