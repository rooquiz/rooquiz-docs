import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

// Static export: generated once at build time into `out/robots.txt`.
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Pagefind's search index (binary fragments + JSON shards). Only the
        // visitor's browser needs it, and only once they type in the search box,
        // so crawling it is pure waste. Nothing else here is private — no other
        // disallow rules, and none for AI crawlers either: docs are exactly what
        // we want assistants to read and cite.
        disallow: ['/_pagefind/']
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  }
}
