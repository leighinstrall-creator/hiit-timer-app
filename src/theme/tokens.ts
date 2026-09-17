/**
 * Design tokens for the HIIT Timer.
 *
 * This file is the ONLY permitted source of style values in the app. Components
 * must reference tokens by their semantic name so the mapping back to Figma
 * stays legible; no component may inline a hex colour, font size, weight,
 * spacing value, radius or shadow.
 *
 * Figma file: EPaud18kec9EhlTM2euWjr
 * Style guide frame: node 7:147
 *
 * The variable collection exposes a SINGLE mode, so there is no light/dark
 * split to wire up. Phase colour comes from `color.state.*`, not from the
 * system colour scheme.
 */

// ---------------------------------------------------------------------------
// Generated from Figma variables
// ---------------------------------------------------------------------------

/** `color/*` */
export const color = {
  action: {
    /** `color/action/inverse` */
    inverse: '#CCFF00',
    /** `color/action/primary` */
    primary: '#000000',
  },
  background: {
    /** `color/background/inverse` */
    inverse: '#000000',
    /** `color/background/overlay` — #FFFFFF @ 20% */
    overlay: '#FFFFFF33',
    /** `color/background/primary` */
    primary: '#FFFFFF',
  },
  icon: {
    /** `color/icon/inverse` */
    inverse: '#FFFFFF',
    /** `color/icon/primary` */
    primary: '#000000',
  },
  state: {
    /** `color/state/cooldown` */
    cooldown: '#00FFFF',
    /** `color/state/done` */
    done: '#39FF14',
    /** `color/state/exercise` */
    exercise: '#FF355E',
    /** `color/state/rest` */
    rest: '#CCFF00',
    /** `color/state/rest-subtle` — #CCFF00 @ 8% */
    restSubtle: '#CCFF0014',
  },
  text: {
    /** `color/text/inverse` */
    inverse: '#FFFFFF',
    /** `color/text/primary` */
    primary: '#000000',
    /** `color/text/secondary` */
    secondary: '#9B9B9B',
    /** `color/text/tertiary` */
    tertiary: '#CCFF00',
  },
} as const;

/**
 * `spacing/*` — keyed by the Figma variable's own name, so `spacing[16]` reads
 * back as `spacing/16`.
 */
export const spacing = {
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  16: 16,
  20: 20,
  22: 22,
  24: 24,
  32: 32,
  40: 40,
  42: 42,
  60: 60,
  80: 80,
} as const;

/**
 * `font/family/mono` — JetBrains Mono.
 *
 * React Native selects a concrete font file rather than synthesising weight, so
 * the single Figma family variable resolves to one loaded family per weight.
 */
export const fontFamily = {
  mono: {
    /** `font/family/mono` + `font/weight/regular` */
    regular: 'JetBrainsMono_400Regular',
    /** `font/family/mono` + `font/weight/bold` */
    bold: 'JetBrainsMono_700Bold',
  },
} as const;

/** `font/weight/*` */
export const fontWeight = {
  /** `font/weight/regular` */
  regular: '400',
  /** `font/weight/bold` */
  bold: '700',
} as const;

/** `font/size/*` */
export const fontSize = {
  14: 14,
  18: 18,
  28: 28,
  36: 36,
  42: 42,
  48: 48,
  120: 120,
} as const;

/** `font/line-height/*` — styles with "auto" line height omit the property. */
export const lineHeight = {
  26: 26,
  54: 54,
} as const;

/**
 * `font/letter-spacing/*`
 *
 * The Figma style-guide captions annotate these as percentages, but the
 * variables resolve to raw point values (`-5` renders as `-5px`). The resolved
 * point value is what the design renders, so that is what is used here.
 */
export const letterSpacing = {
  /** `font/letter-spacing/neg-5` */
  neg5: -5,
  /** `font/letter-spacing/1` */
  1: 1,
  /** `font/letter-spacing/2` */
  2: 2,
} as const;

// ---------------------------------------------------------------------------
// DERIVED FROM DESIGN — NOT IN FIGMA VARIABLES
//
// These values appear in the screens but have no variable in the collection.
// They are recorded here, with their source node, rather than inlined in
// components, so the gap stays auditable and can be promoted into Figma later.
// Nothing outside this block may introduce a value absent from the variables.
// ---------------------------------------------------------------------------

/** Fixed sizes measured from the design frames. */
export const size = {
  /** Primary action button height — node 0:207 */
  actionButtonHeight: 58,
  /** Navigation header height on the picker screens — node 0:361 */
  navHeaderHeight: 64,
  /** Settings row icon container — node 0:86 */
  iconContainer: 42,
  /** Header action icon — node 4:76 */
  iconLarge: 32,
  /** Standard icon — node 0:208 */
  icon: 24,
  /** Status-bar glyph — node 0:215 */
  iconSmall: 20,
  /** Picker active-row highlight height — node 0:396 */
  pickerActiveRowHeight: 72,
  /** Info-row value column width — node 0:200 */
  statValueColumnWidth: 99,
  /** Success check mark — node 0:315 */
  successIcon: 64,
  /** Minimum accessible touch target (WCAG 2.5.5 / platform HIG). */
  minTouchTarget: 44,
} as const;

/** Opacity steps used on the picker drum — nodes 0:372, 0:374. */
export const opacity = {
  /** Rows two positions from the selection. */
  drumFar: 0.15,
  /** Rows adjacent to the selection. */
  drumNear: 0.45,
  /** Pressed feedback on action controls. */
  pressed: 0.7,
  /** Disabled controls. */
  disabled: 0.45,
} as const;

/** Border widths — node 0:396. */
export const borderWidth = {
  /** Picker active-row highlight, top and bottom only. */
  pickerActiveRow: 2,
} as const;
