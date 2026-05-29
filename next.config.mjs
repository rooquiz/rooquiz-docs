import nextra from 'nextra'

const withNextra = nextra({
  // Bake the locale prefix (/zh, /en) into every page-map link. Without middleware
  // (static export) there is nothing to rewrite links at request time, so links must
  // carry the locale themselves — otherwise they 404 (e.g. /getting-started/account
  // instead of /zh/getting-started/account).
  unstable_shouldAddLocaleToLinks: true
})

// Export the final Next.js config with Nextra included.
// `output: 'export'` produces a fully static site under `out/` for Cloudflare Pages.
// The `i18n` block is consumed by Nextra to learn the locale list (zh/en) and is
// stripped before Next.js sees it, so it does NOT conflict with `output: 'export'`.
// Locale routing is handled by the `[lang]` segment + generateStaticParams, not by
// middleware — middleware is unsupported in static export.
export default withNextra({
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh'
  },
  output: 'export',
  images: {
    unoptimized: true
  }
})
