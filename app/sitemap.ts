import type { MetadataRoute } from 'next'
import { source } from '@/lib/source'
import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n'
import { SITE_URL } from './site-url'

// Static export: generated once at build time into `out/sitemap.xml`.
export const dynamic = 'force-static'

function pageUrl(locale: string, segments: string[]) {
  return [SITE_URL, locale, ...segments].join('/')
}

export default function sitemap(): MetadataRoute.Sitemap {
  // The exact helper the MDX catch-all route uses for its static params, so the
  // sitemap cannot drift from the pages that actually get exported.
  const params = source.generateParams('slug', 'lang')

  // Locale-less route -> the locales that actually have that page. The en and zh
  // trees are meant to mirror each other, but a page can legitimately live in only
  // one of them, and an hreflang link must never point at a URL that 404s.
  const routes = new Map<string, { segments: string[]; locales: Set<string> }>()
  for (const { lang, slug } of params) {
    if (!(LOCALES as readonly string[]).includes(lang)) continue
    // The locale index page comes back as [] (or ['']) — drop empty segments so it
    // maps to `/en` rather than `/en/`.
    const segments = (slug ?? []).filter(Boolean)
    const route = segments.join('/')
    const known = routes.get(route)
    if (known) known.locales.add(lang)
    else routes.set(route, { segments, locales: new Set([lang]) })
  }

  // No `lastModified`: file mtimes are the CI checkout time, and the shallow clone
  // has no per-file git history to read a real date from. A made-up date is worse
  // than none — search engines discount lastmod they catch being wrong.
  return [...routes.keys()].sort().flatMap((route) => {
    const { segments, locales } = routes.get(route)!
    const languages: Record<string, string> = {}
    for (const locale of LOCALES) {
      if (locales.has(locale)) languages[locale] = pageUrl(locale, segments)
    }
    // `/` picks a locale from Accept-Language (functions/index.js), so the default
    // locale is what a visitor with no language match ends up on.
    if (languages[DEFAULT_LOCALE]) languages['x-default'] = languages[DEFAULT_LOCALE]

    // One entry per locale, each carrying the full alternate set (including itself)
    // — that is what makes an hreflang cluster valid.
    return [...locales].sort().map((locale) => ({
      url: pageUrl(locale, segments),
      alternates: { languages }
    }))
  })
}
