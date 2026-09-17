/**
 * Vector icons exported from the Figma file.
 *
 * Exported as SVG strings via the Figma plugin bridge, verbatim except that
 * baked-in `fill`/`stroke` colours are routed through `currentColor` so one
 * export serves every screen and takes its colour from a token at the call
 * site. Intrinsic dimensions are recorded so non-square glyphs keep their
 * aspect ratio.
 */

export interface IconSource {
  readonly xml: string;
  readonly width: number;
  readonly height: number;
}

export const ICON_SOURCES = {
  /** node 0:208 — pause bars on the timer screens' primary action. */
  pause: {
    xml: "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M20 20C20 21.1046 19.1046 22 18 22H15C13.8954 22 13 21.1046 13 20V4C13 2.89543 13.8954 2 15 2H18C19.1046 2 20 2.89543 20 4V20Z\" fill=\"currentColor\"/>\n<path d=\"M11 20C11 21.1046 10.1046 22 9 22H6C4.89543 22 4 21.1046 4 20V4C4 2.89543 4.89543 2 6 2H9C10.1046 2 11 2.89543 11 4V20Z\" fill=\"currentColor\"/>\n</svg>",
    width: 24,
    height: 24,
  },
  /** node 0:45 — play triangle on the intro's primary action. */
  play: {
    xml: "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.00977 1.99941C7.53759 2.0012 8.05582 2.14257 8.51172 2.40859L20.5059 9.40468C20.96 9.66819 21.3384 10.0465 21.6006 10.5014C21.8628 10.9562 22.0005 11.4724 22.001 11.9975C22.0014 12.5225 21.864 13.0383 21.6025 13.4935C21.3738 13.892 21.0573 14.2319 20.6777 14.4877L20.5117 14.5922L8.51172 21.5922C8.0559 21.8581 7.53746 21.9986 7.00977 22.0004C6.48212 22.0021 5.9634 21.8647 5.50586 21.6019C5.04822 21.339 4.66767 20.9601 4.40332 20.5033C4.13896 20.0464 3.99984 19.5273 4 18.9994V5.00038C3.99984 4.47266 4.1391 3.95426 4.40332 3.49745C4.66768 3.04056 5.04815 2.66078 5.50586 2.39784C5.96338 2.13508 6.48216 1.99769 7.00977 1.99941Z\" fill=\"currentColor\"/>\n</svg>",
    width: 24,
    height: 24,
  },
  /** node 4:76 — settings entry point in every screen header. The
   * Settings screen's own header glyph (node 0:73) is this same vector, so it
   * is reused there tinted with `color/icon/inverse`. */
  filter: {
    xml: "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M13.3333 6.66667H4\" stroke=\"currentColor\" stroke-width=\"2.66667\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M16 25.3333H4\" stroke=\"currentColor\" stroke-width=\"2.66667\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M18.6667 4V9.33333\" stroke=\"currentColor\" stroke-width=\"2.66667\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M21.3333 22.6667V28\" stroke=\"currentColor\" stroke-width=\"2.66667\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M28 16H16\" stroke=\"currentColor\" stroke-width=\"2.66667\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M28 25.3333H21.3333\" stroke=\"currentColor\" stroke-width=\"2.66667\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M28 6.66667H18.6667\" stroke=\"currentColor\" stroke-width=\"2.66667\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M10.6667 13.3333V18.6667\" stroke=\"currentColor\" stroke-width=\"2.66667\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M10.6667 16H4\" stroke=\"currentColor\" stroke-width=\"2.66667\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>",
    width: 32,
    height: 32,
  },
  /** node 0:88 — duration settings row. The only non-square glyph. */
  timer: {
    xml: "<svg width=\"18\" height=\"22\" viewBox=\"0 0 18 22\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7 1H11\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M9 21C13.4183 21 17 17.4183 17 13C17 8.58172 13.4183 5 9 5C4.58172 5 1 8.58172 1 13C1 17.4183 4.58172 21 9 21Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M9 13L12 10\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>",
    width: 18,
    height: 22,
  },
  /** node 0:136 — count settings row. */
  number: {
    xml: "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M4 9H20\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M4 15H20\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M10 3L8 21\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M16 3L14 21\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>",
    width: 24,
    height: 24,
  },
  /** node 0:95 — settings row disclosure. */
  chevronRight: {
    xml: "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M9 18L15 12L9 6\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>",
    width: 24,
    height: 24,
  },
  /** node 0:363 — picker back control. */
  chevronLeft: {
    xml: "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M15 6L9 12L15 18\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>",
    width: 24,
    height: 24,
  },
  /** node 0:315 — success mark on the complete screen. */
  success: {
    xml: "<svg width=\"64\" height=\"64\" viewBox=\"0 0 64 64\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M58.136 26.6667C59.3539 32.6435 58.4859 38.8571 55.677 44.2715C52.868 49.6858 48.2877 53.9735 42.7001 56.4195C37.1124 58.8656 30.855 59.3221 24.9715 57.713C19.0879 56.1039 13.9339 52.5264 10.3688 47.5771C6.80365 42.6279 5.04301 36.606 5.38046 30.5157C5.7179 24.4254 8.13303 18.6349 12.2231 14.1098C16.3131 9.58467 21.8309 6.59848 27.8562 5.64921C33.8815 4.69994 40.0501 5.84496 45.3334 8.89334\" stroke=\"currentColor\" stroke-width=\"5.33333\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path d=\"M24 29.3333L32 37.3333L58.6667 10.6667\" stroke=\"currentColor\" stroke-width=\"5.33333\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>",
    width: 64,
    height: 64,
  },
} as const satisfies Record<string, IconSource>;

export type IconName = keyof typeof ICON_SOURCES;
