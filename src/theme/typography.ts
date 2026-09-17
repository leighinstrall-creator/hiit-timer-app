import type { TextStyle } from 'react-native';

import { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight } from './tokens';

/**
 * `typography/*` — composite text styles, built from the font primitives in
 * `tokens.ts`. These mirror the Figma typography variables one-for-one.
 *
 * Styles whose Figma line height is "auto" deliberately omit `lineHeight` so
 * the platform resolves it from the font metrics; only `body/*` and
 * `display/complete` pin an explicit value, matching the design.
 */
export const typography = {
  display: {
    /** `typography/display/timer` — Bold 120 / auto / -5 */
    timer: {
      fontFamily: fontFamily.mono.bold,
      fontWeight: fontWeight.bold,
      fontSize: fontSize[120],
      letterSpacing: letterSpacing.neg5,
    },
    /** `typography/display/complete` — Regular 48 / 54 / 0 */
    complete: {
      fontFamily: fontFamily.mono.regular,
      fontWeight: fontWeight.regular,
      fontSize: fontSize[48],
      lineHeight: lineHeight[54],
    },
  },
  heading: {
    /** `typography/heading/screen-title` — Bold 18 / auto / 1 */
    screenTitle: {
      fontFamily: fontFamily.mono.bold,
      fontWeight: fontWeight.bold,
      fontSize: fontSize[18],
      letterSpacing: letterSpacing[1],
    },
    /** `typography/heading/subtitle` — Regular 42 / auto / 0 */
    subtitle: {
      fontFamily: fontFamily.mono.regular,
      fontWeight: fontWeight.regular,
      fontSize: fontSize[42],
    },
  },
  value: {
    /** `typography/value/picker-selected` — Bold 48 / auto / 0 */
    pickerSelected: {
      fontFamily: fontFamily.mono.bold,
      fontWeight: fontWeight.bold,
      fontSize: fontSize[48],
    },
    /** `typography/value/picker` — Regular 36 / auto / 0 */
    picker: {
      fontFamily: fontFamily.mono.regular,
      fontWeight: fontWeight.regular,
      fontSize: fontSize[36],
    },
    /** `typography/value/stat` — Bold 28 / auto / 0 */
    stat: {
      fontFamily: fontFamily.mono.bold,
      fontWeight: fontWeight.bold,
      fontSize: fontSize[28],
    },
    /** `typography/value/inline-bold` — Bold 18 / auto / 0 */
    inlineBold: {
      fontFamily: fontFamily.mono.bold,
      fontWeight: fontWeight.bold,
      fontSize: fontSize[18],
    },
  },
  label: {
    /** `typography/label/stat` — Regular 28 / auto / 0 */
    stat: {
      fontFamily: fontFamily.mono.regular,
      fontWeight: fontWeight.regular,
      fontSize: fontSize[28],
    },
    /** `typography/label/inline` — Regular 18 / auto / 0 */
    inline: {
      fontFamily: fontFamily.mono.regular,
      fontWeight: fontWeight.regular,
      fontSize: fontSize[18],
    },
    /** `typography/label/button` — Bold 18 / auto / 2 */
    button: {
      fontFamily: fontFamily.mono.bold,
      fontWeight: fontWeight.bold,
      fontSize: fontSize[18],
      letterSpacing: letterSpacing[2],
    },
    /** `typography/label/caption` — Bold 14 / auto / 2 */
    caption: {
      fontFamily: fontFamily.mono.bold,
      fontWeight: fontWeight.bold,
      fontSize: fontSize[14],
      letterSpacing: letterSpacing[2],
    },
    /**
     * `typography/label/status-bar` — Bold 14 / auto / 0
     *
     * Retained for completeness. The status bar in the Figma frames is a mock;
     * the app renders the real platform status bar, so this style is unused.
     */
    statusBar: {
      fontFamily: fontFamily.mono.bold,
      fontWeight: fontWeight.bold,
      fontSize: fontSize[14],
    },
  },
  body: {
    /** `typography/body/medium` — Regular 18 / 26 / 0 */
    medium: {
      fontFamily: fontFamily.mono.regular,
      fontWeight: fontWeight.regular,
      fontSize: fontSize[18],
      lineHeight: lineHeight[26],
    },
    /** `typography/body/small` — Regular 14 / 26 / 0 */
    small: {
      fontFamily: fontFamily.mono.regular,
      fontWeight: fontWeight.regular,
      fontSize: fontSize[14],
      lineHeight: lineHeight[26],
    },
  },
  /** `typography/separator` — Bold 36 / auto / 0 */
  separator: {
    fontFamily: fontFamily.mono.bold,
    fontWeight: fontWeight.bold,
    fontSize: fontSize[36],
  },
} as const satisfies Record<string, TextStyle | Record<string, TextStyle>>;
