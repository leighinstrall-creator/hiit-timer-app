import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ICON_SOURCES, type IconName } from './iconSources';

interface IconProps {
  readonly name: IconName;
  /** Rendered width, from `size.*`. Height follows the glyph's aspect ratio. */
  readonly size: number;
  /** Glyph colour, from `color.icon.*` or `color.text.*`. */
  readonly color: string;
}

/**
 * Renders one of the vector icons exported from the Figma file.
 *
 * The exports route their fills and strokes through `currentColor`, which the
 * `color` prop resolves, so a single export serves both the light and dark
 * treatments.
 *
 * Icons are decorative here: every one sits inside a control that already
 * carries its own accessibility label, so announcing the glyph as well would
 * just double up.
 */
export function Icon({ name, size, color }: IconProps) {
  const source = ICON_SOURCES[name];
  const height = (size * source.height) / source.width;

  // The accessibility props belong on a wrapping view: react-native-svg
  // forwards unknown props straight to the DOM on web.
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <SvgXml xml={source.xml} width={size} height={height} color={color} />
    </View>
  );
}
