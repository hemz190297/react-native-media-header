import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MediaHeader,
  MediaHeaderChip,
  MediaHeaderTopBlur,
  useMediaHeaderScroll,
} from 'react-native-media-header';
import type { MediaHeaderRef } from 'react-native-media-header';
import { getDominantColor, photos } from './samples';

/** `EXPO_PUBLIC_AUTO_TOUR=1 npx expo start` plays the scripted sequence used for the README recording. */
const AUTO_TOUR = process.env.EXPO_PUBLIC_AUTO_TOUR === '1';

/**
 * Minimal showcase, laid out the way a detail screen does it:
 * - `MediaHeader` at the top of a vertical scroll view (photos, dots, a chip)
 * - transparent content (title + description) that scrolls up over it
 * - `useMediaHeaderScroll` drives the parallax + blur on scroll-up, zoom on pull-down
 * - `MediaHeaderTopBlur` pinned to the screen top so the photo softens under the status bar
 *
 * Every piece is optional. All knobs: pass a config to `useMediaHeaderScroll` — defaults shown.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <Screen />
    </SafeAreaProvider>
  );
}

const CARD_OVERLAP = 20; // content rides up over the header's bottom edge

function Screen() {
  const insets = useSafeAreaInsets();
  const [background, setBackground] = useState('#000000');

  // Defaults = the Eighty Days PlaceView look. Try:
  // useMediaHeaderScroll({ mediaHeight: 380, scrollEffect: { parallax: 0.5 }, pageIndicator: { alignment: 'center' } })
  const scroll = useMediaHeaderScroll();

  const scrollRef = useRef<ScrollView>(null);
  const headerRef = useRef<MediaHeaderRef>(null);
  useAutoTour(scrollRef, headerRef);

  return (
    <View style={[styles.screen, { backgroundColor: background }]}>
      <StatusBar style="light" />

      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scroll.onScroll}
        scrollEventThrottle={scroll.scrollEventThrottle}
        contentInsetAdjustmentBehavior="never" // let the photo bleed under the status bar
        contentContainerStyle={{ minHeight: 2000, paddingBottom: insets.bottom + 24 }}
      >
        <MediaHeader
          ref={headerRef}
          scroll={scroll}
          items={photos}
          BlurComponent={BlurView}
          GradientComponent={LinearGradient}
          getDominantColor={getDominantColor}
          onBackgroundColorChange={setBackground}
          accessory={
            <MediaHeaderChip
              title={`${photos.length} PHOTOS`}
              style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 15, paddingVertical: 7, paddingHorizontal: 12 }}
            />
          }
          // onItemPress={(index) => …}   // e.g. open a fullscreen viewer
          // onPageChange={(index, count) => …}
        />

        {/* Transparent on purpose: the blurring photo stays visible behind the text as it rises. */}
        <View style={styles.content}>
          <Text style={styles.title}>react-native-media-header</Text>
          <Text style={styles.subtitle}>
            Scroll up — the photo drifts and blurs while the dots and chip fade. Pull down — it zooms.
            Swipe the photo to page.
          </Text>
        </View>
      </Animated.ScrollView>

      {/* Fixed to the screen, not the content: strongest at the very top, sharp at its bottom edge. */}
      <MediaHeaderTopBlur BlurComponent={BlurView} height={insets.top + 64} layers={2} tint="light" intensity={14} />
    </View>
  );
}

/** Swipe two pages → scroll up into the blur → back → pull-down zoom → next page. Recording only. */
function useAutoTour(scrollRef: RefObject<ScrollView | null>, headerRef: RefObject<MediaHeaderRef | null>) {
  useEffect(() => {
    if (!AUTO_TOUR) return;
    const at = (ms: number, fn: () => void) => setTimeout(fn, ms);
    const timers = [
      at(1500, () => headerRef.current?.scrollToPage(1, true)),
      at(2900, () => headerRef.current?.scrollToPage(2, true)),
      at(4300, () => scrollRef.current?.scrollTo({ y: 320, animated: true })),
      at(6900, () => scrollRef.current?.scrollTo({ y: 0, animated: true })),
      at(8500, () => scrollRef.current?.scrollTo({ y: -130, animated: true })),
      at(9100, () => scrollRef.current?.scrollTo({ y: 0, animated: true })),
      at(10300, () => headerRef.current?.scrollToPage(3, true)),
    ];
    return () => timers.forEach(clearTimeout);
  }, [scrollRef, headerRef]);
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { marginTop: -CARD_OVERLAP, paddingHorizontal: 20 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 8, lineHeight: 22 },
});
