import { source } from './source'
import { DEFAULT_LOCALE, LOCALES, langTag } from './i18n'
import { SITE_URL } from './site-url'

export function pageUrl(locale: string, segments: string[]) {
  return [SITE_URL, locale, ...segments].join('/')
}

type Route = { segments: string[]; locales: Set<string> }

let cached: Map<string, Route> | null = null

/**
 * Locale-less route -> the locales that actually have that page, keyed by the
 * joined slug (`''` for a locale index, `'editor/logic'` for a page).
 *
 * Built from the exact helper the MDX catch-all route uses for its static params,
 * so neither the sitemap nor a page's hreflang set can drift from the pages that
 * really get exported. The locale trees are meant to mirror each other, but a
 * page can legitimately live in only one of them, and an hreflang link must never
 * point at a URL that 404s.
 *
 * Memoised: every one of the ~486 pages asks for its own alternates at build time.
 */
export function routes(): Map<string, Route> {
  if (cached) return cached

  const map = new Map<string, Route>()
  for (const { lang, slug } of source.generateParams('slug', 'lang')) {
    if (!(LOCALES as readonly string[]).includes(lang)) continue
    // The locale index page comes back as [] (or ['']) — drop empty segments so it
    // maps to `/en` rather than `/en/`.
    const segments = (slug ?? []).filter(Boolean)
    const route = segments.join('/')
    const known = map.get(route)
    if (known) known.locales.add(lang)
    else map.set(route, { segments, locales: new Set([lang]) })
  }

  cached = map
  return map
}

/**
 * The hreflang cluster for one route: every locale that has the page, including
 * the one being rendered, plus x-default. Returns an empty object for a route
 * that is not part of the docs tree (the 404 page), so no bogus alternate is
 * emitted for it.
 */
export function languagesFor(segments: string[]): Record<string, string> {
  const route = routes().get(segments.join('/'))
  if (!route) return {}

  const languages: Record<string, string> = {}
  for (const locale of LOCALES) {
    // Keyed by BCP 47 tag (`zh` -> `zh-CN`), not the URL segment.
    if (route.locales.has(locale)) languages[langTag(locale)] = pageUrl(locale, route.segments)
  }
  // `/` picks a locale from Accept-Language (functions/index.js), so the default
  // locale is what a visitor with no language match ends up on.
  const fallback = languages[langTag(DEFAULT_LOCALE)]
  if (fallback) languages['x-default'] = fallback

  return languages
}
