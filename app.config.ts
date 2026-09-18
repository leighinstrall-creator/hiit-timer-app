import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Dynamic layer over `app.json`.
 *
 * The only thing this adds is the web base path. A GitHub Pages project site
 * is served from a sub-path (`/hiit-timer-app/`), and Expo takes that from the
 * config rather than an environment variable of its own — this CLI version
 * reads `baseUrl` only via `getBaseUrlFromExpoConfig`.
 *
 * Reading it from `PAGES_BASE_URL` keeps local development untouched: unset
 * means an empty base path, which is the default behaviour.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  // `name` and `slug` come from app.json, which the context has already merged.
  name: config.name ?? 'HIIT Timer',
  slug: config.slug ?? 'hiit-timer-app',
  experiments: {
    ...config.experiments,
    baseUrl: process.env.PAGES_BASE_URL ?? '',
  },
});
