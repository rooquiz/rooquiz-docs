import type { MetadataRoute } from 'next'
import { languagesFor, pageUrl, routes } from '@/lib/alternates'

// Static export: generated once at build time into `out/sitemap.xml`.
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  // `routes()` is the same map the pages use for their canonical/hreflang tags,
  // so the sitemap and the page markup cannot disagree about which locales a
  // page exists in.
  const all = routes()

  // No `lastModified`: file mtimes are the CI checkout time, and the shallow clone
  // has no per-file git history to read a real date from. A made-up date is worse
  // than none — search engines discount lastmod they catch being wrong.
  return [...all.keys()].sort().flatMap((route) => {
    const { segments, locales } = all.get(route)!
    const languages = languagesFor(segments)

    // One entry per locale, each carrying the full alternate set (including itself)
    // — that is what makes an hreflang cluster valid.
    return [...locales].sort().map((locale) => ({
      url: pageUrl(locale, segments),
      alternates: { languages }
    }))
  })
}
