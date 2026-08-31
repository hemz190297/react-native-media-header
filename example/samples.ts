import type { MediaHeaderItem } from 'react-native-media-header';

/** Bundled photos (Unsplash). One is flagged as video to show the badge. */
export const photos: MediaHeaderItem[] = [
  { key: '1', source: require('./assets/samples/sample-1.jpg') },
  { key: '2', source: require('./assets/samples/sample-2.jpg') },
  { key: '3', source: require('./assets/samples/sample-3.jpg'), isVideo: true },
  { key: '4', source: require('./assets/samples/sample-4.jpg') },
  { key: '5', source: require('./assets/samples/sample-5.jpg') },
  { key: '6', source: require('./assets/samples/sample-6.jpg') },
];

/**
 * Average colour of each photo, precomputed so the demo runs in Expo Go (which has no native
 * colour extraction). In an app, return this from `react-native-image-colors` or your backend.
 */
const averageColors = ['#736f85', '#676450', '#749c9c', '#707471', '#655e3f', '#706364'];

export async function getDominantColor(_item: MediaHeaderItem, index: number): Promise<string | undefined> {
  return averageColors[index];
}
