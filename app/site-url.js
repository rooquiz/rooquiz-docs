// Canonical origin of the deployed docs site, used by the metadata routes
// (robots.txt, sitemap.xml) which both need absolute URLs.
export const SITE_URL = 'https://docs.rooquiz.com'

// Locales, mirroring `i18n` in next.config.mjs. The default one is the locale the
// bare root `/` falls back to (see functions/index.js).
export const LOCALES = ['en', 'zh']
export const DEFAULT_LOCALE = 'en'
