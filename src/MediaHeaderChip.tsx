import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType, StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface MediaHeaderChipStyle {
  /** Text style — font, size, weight, colour. */
  text?: StyleProp<TextStyle>;
  /** Diameter of each icon. */
  iconSize?: number;
  /** How much consecutive icons overlap. `0` = side by side. */
  iconOverlap?: number;
  /** `undefined` = circle. */
  iconBorderRadius?: number;
  iconTintColor?: string;
  iconBorderWidth?: number;
  iconBorderColor?: string;
  /** Gap between the icon stack and the text. */
  iconTextSpacing?: number;
  backgroundColor?: string;
  borderRadius?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
}

export interface MediaHeaderChipProps {
  icons?: ImageSourcePropType[];
  title: string;
  style?: MediaHeaderChipStyle;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Icon(s) + short text, sized to fit — the ready-made accessory for `MediaHeader`'s `accessory`
 * prop. Defaults: bare white text with overlapping circular icons, no background.
 */
export const MediaHeaderChip = memo(function MediaHeaderChip({
  icons = [],
  title,
  style = {},
  containerStyle,
}: MediaHeaderChipProps) {
  const size = style.iconSize ?? 20;
  const step = Math.max(size - (style.iconOverlap ?? 2), 0);
  const radius = style.iconBorderRadius ?? size / 2;
  const stackWidth = icons.length === 0 ? 0 : size + (icons.length - 1) * step;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: style.backgroundColor ?? 'transparent',
          borderRadius: style.borderRadius ?? 0,
          paddingVertical: style.paddingVertical ?? 5,
          paddingHorizontal: style.paddingHorizontal ?? 0,
        },
        containerStyle,
      ]}
    >
      {icons.length > 0 && (
        <View style={{ width: stackWidth, height: size, marginRight: style.iconTextSpacing ?? 6 }}>
          {icons.map((source, index) => (
            <Image
              key={index}
              source={source}
              resizeMode="cover"
              style={{
                position: 'absolute',
                left: index * step,
                width: size,
                height: size,
                borderRadius: radius,
                borderWidth: style.iconBorderWidth ?? 0,
                borderColor: style.iconBorderColor ?? 'transparent',
                tintColor: style.iconTintColor,
                zIndex: icons.length - index, // earlier icons sit on top
              }}
            />
          ))}
        </View>
      )}
      <Text style={[styles.text, style.text]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  text: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});
